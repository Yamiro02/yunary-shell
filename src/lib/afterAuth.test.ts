import { beforeAll, describe, expect, it } from 'vitest';
import { configureShell } from '../config';
import { AUTHORIZE_PATH, isAuthorizeNext, resolveAfterAuth, withNextParam } from './afterAuth';

const HUB = 'https://app.yunary.com';
/* Ce que Claude envoie, tel que le hub le met en `next` (`window.location.href`). */
const AUTHORIZE = `${HUB}/autoriser?authorization_id=abc-123_XYZ%3D%3D&state=a%26b`;
const OTHER = `${HUB}/regles?outil=analyse`;

beforeAll(() => {
  configureShell({ supabaseUrl: 'https://demo.invalid', supabasePublishableKey: 'sb_publishable_test', hubUrl: HUB });
});

describe('resolveAfterAuth — les quatre priorités', () => {
  it('1. next vers /autoriser passe avant l’onboarding non terminé, requête intacte', () => {
    expect(resolveAfterAuth({ next: AUTHORIZE, onboardingCompleted: false, hubUrl: HUB })).toEqual({ type: 'url', url: AUTHORIZE });
  });

  it('1. next vers /autoriser part même avant que le profil soit lu', () => {
    expect(resolveAfterAuth({ next: AUTHORIZE, onboardingCompleted: null, hubUrl: HUB })).toEqual({ type: 'url', url: AUTHORIZE });
  });

  it('1. next vers /autoriser avec l’onboarding terminé', () => {
    expect(resolveAfterAuth({ next: AUTHORIZE, onboardingCompleted: true, hubUrl: HUB })).toEqual({ type: 'url', url: AUTHORIZE });
  });

  it('2. onboarding pas terminé → /onboarding, même avec un autre next sûr', () => {
    expect(resolveAfterAuth({ next: OTHER, onboardingCompleted: false, hubUrl: HUB })).toEqual({ type: 'route', path: '/onboarding' });
    expect(resolveAfterAuth({ next: null, onboardingCompleted: false, hubUrl: HUB, onboardingPath: '/bienvenue' })).toEqual({ type: 'route', path: '/bienvenue' });
  });

  it('3. onboarding terminé + next sûr → next', () => {
    expect(resolveAfterAuth({ next: OTHER, onboardingCompleted: true, hubUrl: HUB })).toEqual({ type: 'url', url: OTHER });
    const creator = 'https://creator.yunary.com/videos';
    expect(resolveAfterAuth({ next: creator, onboardingCompleted: true, hubUrl: HUB })).toEqual({ type: 'url', url: creator });
  });

  it('4. sans next → /outils par défaut, ou homePath', () => {
    expect(resolveAfterAuth({ next: null, onboardingCompleted: true, hubUrl: HUB })).toEqual({ type: 'route', path: '/outils' });
    expect(resolveAfterAuth({ next: null, onboardingCompleted: true, hubUrl: HUB, homePath: '/accueil' })).toEqual({ type: 'route', path: '/accueil' });
  });

  it('attend le profil quand la règle en a besoin', () => {
    expect(resolveAfterAuth({ next: OTHER, onboardingCompleted: null, hubUrl: HUB })).toBeNull();
    expect(resolveAfterAuth({ next: null, onboardingCompleted: null, hubUrl: HUB })).toBeNull();
  });
});

describe('resolveAfterAuth — next non sûr ignoré', () => {
  const unsafe = [
    'https://evil.com/autoriser?authorization_id=abc',
    'https://app.yunary.com.evil.com/autoriser',
    'http://app.yunary.com/autoriser?authorization_id=abc',
    '/autoriser?authorization_id=abc',
    'javascript:alert(1)',
    '',
  ];
  it.each(unsafe)('%s → jamais suivi', next => {
    expect(resolveAfterAuth({ next, onboardingCompleted: false, hubUrl: HUB })).toEqual({ type: 'route', path: '/onboarding' });
    expect(resolveAfterAuth({ next, onboardingCompleted: true, hubUrl: HUB })).toEqual({ type: 'route', path: '/outils' });
  });
});

describe('isAuthorizeNext — chemin exact, origine du hub', () => {
  it('accepte /autoriser sur le hub, avec ou sans requête', () => {
    expect(isAuthorizeNext(AUTHORIZE, HUB)).toBe(true);
    expect(isAuthorizeNext(`${HUB}${AUTHORIZE_PATH}`, HUB)).toBe(true);
  });
  it('refuse tout ce qui n’est pas exactement /autoriser sur le hub', () => {
    expect(isAuthorizeNext(`${HUB}/autoriser/autre`, HUB)).toBe(false);
    expect(isAuthorizeNext(`${HUB}/autoriserx`, HUB)).toBe(false);
    expect(isAuthorizeNext(`${HUB}/Autoriser`, HUB)).toBe(false);
    expect(isAuthorizeNext('https://creator.yunary.com/autoriser?authorization_id=abc', HUB)).toBe(false);
    expect(isAuthorizeNext(OTHER, HUB)).toBe(false);
    expect(isAuthorizeNext(null, HUB)).toBe(false);
  });
});

describe('withNextParam — next survit aux allers-retours, requête intacte', () => {
  it('ajoute next à une route et à une URL absolue, relu identique', () => {
    for (const base of ['/login', `${HUB}/login`, `${HUB}/reset`]) {
      const href = withNextParam(base, AUTHORIZE);
      const read = new URL(href, HUB).searchParams.get('next');
      expect(read).toBe(AUTHORIZE);
      expect(new URL(read!).searchParams.get('authorization_id')).toBe('abc-123_XYZ==');
      expect(new URL(read!).searchParams.get('state')).toBe('a&b');
    }
  });
  it('ne double pas un next déjà porté par le lien (hub avec son withNext)', () => {
    const already = `/inscription?next=${encodeURIComponent(AUTHORIZE)}`;
    expect(withNextParam(already, OTHER)).toBe(already);
  });
  it('garde les autres paramètres et le fragment', () => {
    const href = withNextParam('/login?x=1#haut', OTHER);
    const url = new URL(href, HUB);
    expect(url.searchParams.get('x')).toBe('1');
    expect(url.searchParams.get('next')).toBe(OTHER);
    expect(url.hash).toBe('#haut');
  });
  it('ne touche à rien sans next', () => {
    expect(withNextParam('/login', null)).toBe('/login');
  });
  it('un retour OAuth / confirmation / reset (Supabase ajoute ?code=) garde next', () => {
    const redirectTo = withNextParam(`${HUB}/login`, AUTHORIZE);
    const back = new URL(redirectTo);
    back.searchParams.set('code', 'pkce-code');
    expect(back.searchParams.get('next')).toBe(AUTHORIZE);
  });
});
