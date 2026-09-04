import { signOut } from '../lib/supabase';

/**
 * Déconnexion : `signOut` du client unique → `onAuthStateChange` passe la session à null →
 * `ProtectedRoute` renvoie vers la connexion. Pas de navigation manuelle ici.
 */
export function useLogout() {
  return async (): Promise<void> => {
    await signOut();
  };
}
