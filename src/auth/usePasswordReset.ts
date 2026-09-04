import { getSupabase } from '../lib/supabase';
import { getShellConfig } from '../config';

/**
 * Réinitialisation de mot de passe en deux temps : l'e-mail (A3 → A4), puis le nouveau
 * mot de passe sur `${hubUrl}/reset` où le lien établit une session de recovery.
 * PKCE oblige, le lien doit s'ouvrir dans le navigateur qui l'a demandé — sinon
 * `getErrorMessage` rend « lien invalide ou expiré » et la page renvoie vers A3.
 */
export function usePasswordReset() {
  async function requestReset(email: string): Promise<void> {
    const { hubUrl } = getShellConfig();
    const { error } = await getSupabase().auth.resetPasswordForEmail(email, { redirectTo: `${hubUrl}/reset` });
    if (error) throw error;
  }

  async function updatePassword(password: string): Promise<void> {
    const { error } = await getSupabase().auth.updateUser({ password });
    if (error) throw error;
  }

  return { requestReset, updatePassword };
}
