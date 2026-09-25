import { getSupabase } from '../lib/supabase';
import { getShellConfig } from '../config';
import { withNextParam } from '../lib/afterAuth';

/** Ce qui suit une inscription par e-mail : `redirect` (session ouverte) ou `confirm` (e-mail à confirmer). */
export type SignupNextStep = 'redirect' | 'confirm';

/**
 * La décision après `signUp` : une session renvoyée = compte ouvert tout de suite (« Confirm email » désactivé dans
 * Supabase, réglage de Julien du 25/09/2026) → on enchaîne avec la règle d'après connexion (`resolveAfterAuth`) ;
 * pas de session = confirmation requise → « Vérifie ta boîte mail », en secours seulement.
 */
export function signupNextStep(hasSession: boolean): SignupNextStep {
  return hasSession ? 'redirect' : 'confirm';
}

/**
 * Création de compte e-mail + mot de passe. Confirmation désactivée : la session arrive avec la réponse, le store de
 * session (`useAuth`) la voit, et la page qui monte `useAfterAuthRedirect` redirige selon la règle. Un e-mail déjà pris
 * lève alors « User already registered » (phrase FR dans `getErrorMessage`). Si la confirmation est réactivée, aucune
 * session n'est renvoyée : « vérifie ta boîte mail », et le lien ramène sur `/login?next=…` (`next` survit).
 * L'OAuth ne distingue pas login et signup : `useLogin`.
 */
export function useSignup() {
  async function signUpWithEmail(email: string, password: string, next: string | null = null): Promise<{ next: SignupNextStep; needsConfirmation: boolean }> {
    const { hubUrl } = getShellConfig();
    const { data, error } = await getSupabase().auth.signUp({
      email,
      password,
      options: { emailRedirectTo: withNextParam(`${hubUrl}/login`, next) },
    });
    if (error) throw error;
    const step = signupNextStep(!!data.session);
    return { next: step, needsConfirmation: step === 'confirm' };
  }
  return { signUpWithEmail };
}
