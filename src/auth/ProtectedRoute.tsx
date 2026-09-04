import { useEffect, type JSX, type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Spinner } from '@yunary/ds';
import { useAuth } from './useAuth';
import { useProfile } from '../account/useProfile';
import { getShellConfig } from '../config';
import { buildLoginUrl } from '../lib/next';

export interface ProtectedRouteProps {
  /** Exiger `onboarding_completed` (défaut). Le Hub le désactive sur ses routes d'onboarding. */
  requireOnboarding?: boolean;
  children: ReactNode;
}

/** Le loader de garde — centré, discret, jamais un « Loading… » brut. */
export function PageLoader(): JSX.Element {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background" role="status" aria-live="polite">
      <Spinner size="lg" />
    </div>
  );
}

/**
 * Non connecté, ou onboarding non terminé → `VITE_HUB_URL/login?next=<url courante>`.
 * Même origine que le Hub : navigation client. Autre sous-domaine : navigation pleine page
 * (la session est partagée par cookie, la page de connexion la verra).
 */
export function ProtectedRoute({ requireOnboarding = true, children }: ProtectedRouteProps): JSX.Element {
  const { session, loading } = useAuth();
  const profile = useProfile();
  const location = useLocation();
  const { hubUrl } = getShellConfig();
  const isHub = typeof window !== 'undefined' && window.location.origin === hubUrl;

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
  const needsLogin = !loading && !session;
  const needsOnboarding =
    requireOnboarding && !loading && !!session && profile.isSuccess && !profile.data.onboarding_completed;
  const mustRedirect = needsLogin || needsOnboarding;

  useEffect(() => {
    if (mustRedirect && !isHub) window.location.replace(buildLoginUrl(currentUrl));
  }, [mustRedirect, isHub, currentUrl]);

  if (loading) return <PageLoader />;
  if (needsLogin) {
    if (!isHub) return <PageLoader />;
    return <Navigate to={`/login?next=${encodeURIComponent(currentUrl)}`} replace state={{ from: location }} />;
  }
  if (requireOnboarding) {
    if (profile.isPending) return <PageLoader />;
    /* Profil illisible (réseau, RLS) : on ne bloque pas, la page hôte montrera son erreur. */
    if (needsOnboarding) {
      if (!isHub) return <PageLoader />;
      return <Navigate to="/onboarding" replace />;
    }
  }
  return <>{children}</>;
}
