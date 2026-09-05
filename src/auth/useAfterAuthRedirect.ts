import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './useAuth';
import { useProfile } from '../account/useProfile';

/**
 * Après connexion (ou session déjà présente sur une page d'auth) : `onboarding_completed`
 * faux → l'onboarding ; sinon `next` s'il est sûr (URL absolue, navigation pleine page
 * puisqu'il peut viser un autre sous-domaine) ; sinon l'accueil.
 */
export function useAfterAuthRedirect({ next, onboardingPath = '/onboarding', homePath = '/' }: { next: string | null; onboardingPath?: string; homePath?: string }): void {
  const { session } = useAuth();
  const profile = useProfile();
  const navigate = useNavigate();
  useEffect(() => {
    if (!session || !profile.isSuccess) return;
    if (!profile.data.onboarding_completed) {
      navigate(onboardingPath, { replace: true });
      return;
    }
    if (next) window.location.replace(next);
    else navigate(homePath, { replace: true });
  }, [session, profile.isSuccess, profile.data, next, onboardingPath, homePath, navigate]);
}
