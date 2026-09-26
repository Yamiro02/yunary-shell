import { useEffect, type JSX, type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Spinner } from '@yunary/ds';
import { useAuth } from './useAuth';
import { useProfile } from '../account/useProfile';
import { getShellConfig } from '../config';
import { buildLoginUrl } from '../lib/next';
import { isExplicitSignOut } from './signOutIntent';

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
 * Non connecté, ou onboarding non terminé → la connexion du hub, avec le CHEMIN courant en `next` (jamais une URL
 * complète, 0.4.2). Après une déconnexion VOULUE (`signOut`), `/login` sans `next` : la reconnexion ne ramène pas sur
 * la page quittée. Même origine que le hub : navigation client ; autre sous-domaine : pleine page.
 */
export function ProtectedRoute({ requireOnboarding = true, children }: ProtectedRouteProps): JSX.Element {
  const { session, loading } = useAuth();
  const profile = useProfile();
  const location = useLocation();
  const { hubUrl } = getShellConfig();
  const isHub = typeof window !== 'undefined' && window.location.origin === hubUrl;

  /* Le chemin courant vient du ROUTEUR, jamais de window.location : le store de session émet deux fois au démarrage,
     et entre les deux `Navigate` a déjà changé l'adresse ; lue dans window, la seconde émission produirait un `next`
     imbriqué (`/login?next=/login?next=…`). */
  const currentPath = `${location.pathname}${location.search}${location.hash}`;
  const needsLogin = !loading && !session;
  const explicit = needsLogin && isExplicitSignOut();
  const loginTarget = explicit ? '/login' : `/login?next=${encodeURIComponent(currentPath)}`;
  const needsOnboarding =
    requireOnboarding && !loading && !!session && profile.isSuccess && !profile.data.onboarding_completed;
  const mustRedirect = needsLogin || needsOnboarding;

  useEffect(() => {
    if (!mustRedirect || isHub) return;
    window.location.replace(needsLogin && explicit ? `${hubUrl}/login` : buildLoginUrl(currentPath));
  }, [mustRedirect, isHub, needsLogin, explicit, hubUrl, currentPath]);

  if (loading) return <PageLoader />;
  if (needsLogin) {
    if (!isHub) return <PageLoader />;
    return <Navigate to={loginTarget} replace />;
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
