import { getSupabase } from '../lib/supabase';
import { getShellConfig } from '../config';
import { withNextParam } from '../lib/afterAuth';

/**
 * Réinitialisation de mot de passe en deux temps : l'e-mail (A3 → A4), puis le nouveau
 * mot de passe sur `${hubUrl}/reset` où le lien établit une session de recovery.
 * PKCE oblige, le lien doit s'ouvrir dans le navigateur qui l'a demandé — sinon
 * `getErrorMessage` rend « lien invalide ou expiré » et la page renvoie vers A3. Le lien ramène
 * sur `/reset?next=…` : `next` survit au reset.
 */
export function usePasswordReset() {
  async function requestReset(email: string, next: string | null = null): Promise<void> {
    const { hubUrl } = getShellConfig();
    const { error } = await getSupabase().auth.resetPasswordForEmail(email, { redirectTo: withNextParam(`${hubUrl}/reset`, next) });
    if (error) throw error;
  }

  async function updatePassword(password: string): Promise<void> {
    const { error } = await getSupabase().auth.updateUser({ password });
    if (error) throw error;
  }

  return { requestReset, updatePassword };
}
