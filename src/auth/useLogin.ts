import { getSupabase } from '../lib/supabase';
import { getShellConfig } from '../config';

export type OAuthProvider = 'google' | 'apple';

/**
 * Connexion — appels isolés des composants (pattern front-auth-routing). Flux WEB seul :
 * les pages d'auth sont montées par le Hub, qui n'a pas de Capacitor. Le retour OAuth
 * atterrit sur `${hubUrl}/login?next=…` : la page de connexion voit la session et redirige.
 */
export function useLogin() {
  async function signInWithEmail(email: string, password: string): Promise<void> {
    const { error } = await getSupabase().auth.signInWithPassword({ email, password });
    if (error) throw error;
  }

  async function signInWithOAuth(provider: OAuthProvider, next: string | null): Promise<void> {
    const { hubUrl } = getShellConfig();
    const redirectTo = next ? `${hubUrl}/login?next=${encodeURIComponent(next)}` : `${hubUrl}/login`;
    const { error } = await getSupabase().auth.signInWithOAuth({ provider, options: { redirectTo } });
    if (error) throw error;
    /* Redirection pleine page imminente : l'appelant garde son état « loading ». */
  }

  return { signInWithEmail, signInWithOAuth };
}
