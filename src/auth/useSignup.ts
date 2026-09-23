import { getSupabase } from '../lib/supabase';
import { getShellConfig } from '../config';
import { withNextParam } from '../lib/afterAuth';

/**
 * Création de compte e-mail + mot de passe. `needsConfirmation` = aucune session renvoyée :
 * confirmation d'e-mail requise, OU e-mail déjà pris (Supabase renvoie un utilisateur
 * factice sans session, anti-énumération). Les deux se traitent pareil côté UI :
 * « vérifie ta boîte mail ». L'OAuth ne distingue pas login et signup : `useLogin`.
 * Le lien de confirmation ramène sur `/login?next=…` : `next` survit à la boîte mail.
 */
export function useSignup() {
  async function signUpWithEmail(email: string, password: string, next: string | null = null): Promise<{ needsConfirmation: boolean }> {
    const { hubUrl } = getShellConfig();
    const { data, error } = await getSupabase().auth.signUp({
      email,
      password,
      options: { emailRedirectTo: withNextParam(`${hubUrl}/login`, next) },
    });
    if (error) throw error;
    return { needsConfirmation: !data.session };
  }
  return { signUpWithEmail };
}
