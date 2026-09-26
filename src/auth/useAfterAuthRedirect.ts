import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './useAuth';
import { useProfile } from '../account/useProfile';
import { resolveAfterAuth, type AfterAuthTarget } from '../lib/afterAuth';

/** Suit une cible de `resolveAfterAuth` : URL absolue en pleine page (autre sous-domaine possible), route en navigation client. */
export function followAfterAuth(target: AfterAuthTarget, navigate: (path: string, opts: { replace: boolean }) => void): void {
  if (target.type === 'url') window.location.replace(target.url);
  else navigate(target.path, { replace: true });
}

/**
 * Après connexion (ou session déjà présente sur une page d'auth) : la règle de `resolveAfterAuth`.
 * `next` vers `/autoriser` part dès que la session est là, sans attendre le profil ; le reste
 * attend `onboarding_completed`.
 */
export function useAfterAuthRedirect({ next, onboardingPath = '/onboarding', homePath = '/outils' }: { next: string | null; onboardingPath?: string; homePath?: string }): void {
  const { session } = useAuth();
  const profile = useProfile();
  const navigate = useNavigate();
  const onboardingCompleted = profile.isSuccess ? profile.data.onboarding_completed : null;
  useEffect(() => {
    if (!session) return;
    const target = resolveAfterAuth({ next, onboardingCompleted, onboardingPath, homePath });
    if (target) followAfterAuth(target, navigate);
  }, [session, onboardingCompleted, next, onboardingPath, homePath, navigate]);
}
