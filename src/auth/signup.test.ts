import { beforeAll, describe, expect, it } from 'vitest';
import { configureShell } from '../config';
import { resolveAfterAuth, withNextParam } from '../lib/afterAuth';
import { signupNextStep } from './useSignup';

const HUB = 'https://app.yunary.com';
const AUTHORIZE = `${HUB}/autoriser?authorization_id=abc-123`;

beforeAll(() => {
  configureShell({ supabaseUrl: 'https://demo.invalid', supabasePublishableKey: 'sb_publishable_test', hubUrl: HUB });
});

describe('inscription sans confirmation par e-mail (0.4.1)', () => {
  it('session renvoyée → on enchaîne (redirect) ; pas de session → « Vérifie ta boîte mail » en secours', () => {
    expect(signupNextStep(true)).toBe('redirect');
    expect(signupNextStep(false)).toBe('confirm');
  });

  it('e-mail : juste inscrit, venu de Claude → /autoriser avant l’onboarding', () => {
    expect(resolveAfterAuth({ next: AUTHORIZE, onboardingCompleted: false, hubUrl: HUB })).toEqual({ type: 'url', url: AUTHORIZE });
    /* Sans attendre le profil (il vient d'être créé par le trigger). */
    expect(resolveAfterAuth({ next: AUTHORIZE, onboardingCompleted: null, hubUrl: HUB })).toEqual({ type: 'url', url: AUTHORIZE });
  });

  it('e-mail : juste inscrit, sans next → l’onboarding', () => {
    expect(resolveAfterAuth({ next: null, onboardingCompleted: false, hubUrl: HUB })).toEqual({ type: 'route', path: '/onboarding' });
  });

  it('Google / Apple : le retour OAuth porte next sur /login, la même règle s’applique', () => {
    const back = new URL(withNextParam(`${HUB}/login`, AUTHORIZE));
    back.searchParams.set('code', 'pkce-code');
    const next = back.searchParams.get('next');
    expect(resolveAfterAuth({ next, onboardingCompleted: false, hubUrl: HUB })).toEqual({ type: 'url', url: AUTHORIZE });
  });
});
