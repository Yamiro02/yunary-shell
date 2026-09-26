import { useNavigate } from 'react-router-dom';
import { signOut } from '../lib/supabase';

/**
 * Déconnexion (Paramètres › « Se déconnecter ») : `signOut` du client unique, qui marque la déconnexion comme voulue,
 * puis `/login` SANS `next` (0.4.2, recette A4) : la reconnexion suit la règle normale (onboarding, sinon `/outils`),
 * jamais un retour sur la page quittée. `ProtectedRoute` fait de même s'il réagit avant la navigation.
 * `options.next` : un `next` interne voulu explicitement (ex. « Pas toi ? » sur `/autoriser`, qui doit y revenir).
 */
export function useLogout() {
  const navigate = useNavigate();
  return async (options: { next?: string } = {}): Promise<void> => {
    await signOut();
    navigate(options.next ? `/login?next=${encodeURIComponent(options.next)}` : '/login', { replace: true });
  };
}
