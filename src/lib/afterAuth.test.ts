import { beforeAll, describe, expect, it } from 'vitest';
import { configureShell } from '../config';
import { AUTHORIZE_PATH, isAuthorizeNext, resolveAfterAuth, withNextParam } from './afterAuth';
import { buildLoginUrl, isSafeNext, readSafeNext, toInternalPath } from './next';

const HUB = 'https://app.yunary.com';
/* Ce que Claude envoie, en chemin interne (0.4.2 : plus jamais d'URL complète en `next`). */
const AUTHORIZE = '/autoriser?authorization_id=abc-123_XYZ%3D%3D&state=a%26b';
const route = (path: string) => ({ type: 'route', path });

beforeAll(() => {
  configureShell({ supabaseUrl: 'https://demo.invalid', supabasePublishableKey: 'sb_publishable_test', hubUrl: HUB });
});

describe('resolveAfterAuth — l’ordre de la recette A4 (27/09/2026)', () => {
  it('après une déconnexion (connexion sans next) → /outils', () => {
    expect(resolveAfterAuth({ next: null, onboardingCompleted: true })).toEqual(route('/outils'));
  });

  it('onboarding pas fini → /onboarding, même avec un lien profond', () => {
    expect(resolveAfterAuth({ next: null, onboardingCompleted: false })).toEqual(route('/onboarding'));
    expect(resolveAfterAuth({ next: '/facturation', onboardingCompleted: false })).toEqual(route('/onboarding'));
  });

  it('lien profond conservé, requête comprise', () => {
    expect(resolveAfterAuth({ next: '/facturation', onboardingCompleted: true })).toEqual(route('/facturation'));
    expect(resolveAfterAuth({ next: '/outils?ajouter=audit', onboardingCompleted: true })).toEqual(route('/outils?ajouter=audit'));
  });

  it('/autoriser passe avant l’onboarding, requête intacte, même avant que le profil soit lu', () => {
    expect(resolveAfterAuth({ next: AUTHORIZE, onboardingCompleted: false })).toEqual(route(AUTHORIZE));
    expect(resolveAfterAuth({ next: AUTHORIZE, onboardingCompleted: null })).toEqual(route(AUTHORIZE));
    expect(resolveAfterAuth({ next: AUTHORIZE, onboardingCompleted: true })).toEqual(route(AUTHORIZE));
  });

  it('attend le profil quand la règle en a besoin', () => {
    expect(resolveAfterAuth({ next: '/facturation', onboardingCompleted: null })).toBeNull();
    expect(resolveAfterAuth({ next: null, onboardingCompleted: null })).toBeNull();
  });

  it('homePath et onboardingPath restent paramétrables', () => {
    expect(resolveAfterAuth({ next: null, onboardingCompleted: true, homePath: '/accueil' })).toEqual(route('/accueil'));
    expect(resolveAfterAuth({ next: null, onboardingCompleted: false, onboardingPath: '/bienvenue' })).toEqual(route('/bienvenue'));
  });
});

describe('next refusé : jamais suivi', () => {
  const refused = [
    'https://evil.com',
    'https://evil.com/autoriser?authorization_id=abc',
    '//evil.com',
    '//evil.com/autoriser',
    '/\\evil.com',
    'https://app.yunary.com/outils',
    'https://app.yunary.com/autoriser?authorization_id=abc',
    'http://app.yunary.com/facturation',
    'javascript:alert(1)',
    'facturation',
    '/outils\u0000',
    '',
  ];
  it.each(refused)('%s', next => {
    expect(isSafeNext(next)).toBe(false);
    expect(readSafeNext(`?next=${encodeURIComponent(next)}`)).toBeNull();
    expect(resolveAfterAuth({ next, onboardingCompleted: false })).toEqual(route('/onboarding'));
    expect(resolveAfterAuth({ next, onboardingCompleted: true })).toEqual(route('/outils'));
  });
});

describe('isAuthorizeNext — chemin exact', () => {
  it('accepte /autoriser, avec ou sans requête', () => {
    expect(isAuthorizeNext(AUTHORIZE)).toBe(true);
    expect(isAuthorizeNext(AUTHORIZE_PATH)).toBe(true);
  });
  it('refuse le reste', () => {
    for (const n of ['/autoriser/autre', '/autoriserx', '/Autoriser', '/regles', 'https://app.yunary.com/autoriser', null]) {
      expect(isAuthorizeNext(n)).toBe(false);
    }
  });
});

describe('chemins internes : écriture et lecture', () => {
  it('buildLoginUrl écrit un CHEMIN en next, jamais une URL complète', () => {
    expect(buildLoginUrl('/facturation?x=1#haut')).toBe(`${HUB}/login?next=${encodeURIComponent('/facturation?x=1#haut')}`);
    expect(buildLoginUrl('https://app.yunary.com/outils?ajouter=audit')).toBe(`${HUB}/login?next=${encodeURIComponent('/outils?ajouter=audit')}`);
  });
  it('toInternalPath réduit une URL complète à son chemin', () => {
    expect(toInternalPath('https://app.yunary.com/autoriser?authorization_id=abc')).toBe('/autoriser?authorization_id=abc');
    expect(toInternalPath('/facturation')).toBe('/facturation');
  });
  it('withNextParam : next survit aux allers-retours (liens, retours OAuth, e-mails), requête intacte', () => {
    for (const base of ['/login', `${HUB}/login`, `${HUB}/reset`]) {
      const url = new URL(withNextParam(base, AUTHORIZE), HUB);
      url.searchParams.set('code', 'pkce-code');
      const read = url.searchParams.get('next');
      expect(read).toBe(AUTHORIZE);
      expect(new URL(read!, HUB).searchParams.get('authorization_id')).toBe('abc-123_XYZ==');
      expect(new URL(read!, HUB).searchParams.get('state')).toBe('a&b');
    }
  });
  it('withNextParam ne double pas un next déjà porté, garde les autres paramètres et le fragment', () => {
    const already = `/inscription?next=${encodeURIComponent(AUTHORIZE)}`;
    expect(withNextParam(already, '/facturation')).toBe(already);
    const url = new URL(withNextParam('/login?x=1#haut', '/facturation'), HUB);
    expect([url.searchParams.get('x'), url.searchParams.get('next'), url.hash]).toEqual(['1', '/facturation', '#haut']);
    expect(withNextParam('/login', null)).toBe('/login');
  });
});
