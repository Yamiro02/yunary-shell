import { useEffect, useState, type JSX, type ReactNode } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { AppShell, Icon, IconButton, Logo, cn } from '@yunary/ds';
import { fr } from '../i18n/fr';
import type { ToolId } from '../config';
import { useProfile } from '../account/useProfile';
import { useCredits } from '../account/useCredits';
import { useSubscription } from '../account/useSubscription';
import { planFor } from '../parametres/plans';
import { initiales } from '../lib/format';
import { HubSidebar, type ShellNavItem } from './HubSidebar';
import type { AccountView } from './AccountCard';
import type { CreditsView } from './CreditsCard';

export interface AppLayoutProps {
  tool: ToolId;
  /** La nav de l'outil. `active` se déduit de la route quand il n'est pas passé. */
  items?: ShellNavItem[];
  settingsHref?: string;
  native?: boolean;
  /** Sans enfants, rend l'`Outlet` du routeur. */
  children?: ReactNode;
}

export interface AppContentProps {
  children?: ReactNode;
  className?: string;
}

/**
 * Le conteneur du contenu d'une app : **pleine largeur, sans plafond** (décision Julien,
 * 11/09/2026 — les artboards Hub et Creator remplissent leur colonne, avec 56 à 64 px de côté et
 * aucun `max-width` ; `.page` du DS plafonnait à 70 rem et centrait, il reste au site). Gouttières
 * sur les paliers du DS : `space-5` (24 px) en régime tiroir, `space-7` (48 px, le palier le plus
 * proche des maquettes) dès que la sidebar est à demeure — le même seuil que le DS, `64.0625rem`.
 * Vertical inchangé : `space-7`. Les plafonds de lecture (`max-w-read`, `max-w-wide`…) restent
 * aux blocs qui en ont besoin, jamais à la page.
 */
export function AppContent({ children, className }: AppContentProps): JSX.Element {
  return <div className={cn('w-full px-space-5 py-space-7 min-[64.0625rem]:px-space-7', className)}>{children}</div>;
}

/**
 * Le squelette d'une app : `AppShell` + `HubSidebar` du DS, tiroir sous 64rem ouvert par
 * une barre haute, contenu dans `AppContent` (pleine largeur). Lit le profil, les crédits et
 * l'abonnement pour alimenter la sidebar — les pages, elles, n'ont rien à refaire.
 */
export function AppLayout({ tool, items = [], settingsHref = '/parametres', native = false, children }: AppLayoutProps): JSX.Element {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const profile = useProfile();
  const credits = useCredits();
  const subscription = useSubscription();

  /* Le tiroir se referme à chaque navigation. */
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  const isActive = (href: string) =>
    href.startsWith('/') && (href === '/' ? location.pathname === '/' : location.pathname.startsWith(href));

  const account: AccountView = {
    name: [profile.data?.prenom, profile.data?.nom].filter(Boolean).join(' ') || profile.data?.email || '',
    initials: initiales(profile.data?.prenom, profile.data?.nom, profile.data?.email),
    avatarUrl: profile.data?.avatar_url ?? null,
    planLabel: fr.layout.planLabel(planFor(subscription.data?.plan).name),
  };

  const creditsView: CreditsView | null | undefined = credits.isPending
    ? undefined
    : credits.data
      ? { remaining: credits.data.creditsRemaining, total: credits.data.creditsTotal, periodEnd: credits.data.periodEnd }
      : null;

  return (
    <AppShell
      sidebar={
        <HubSidebar
          tool={tool}
          items={items.map(it => ({ ...it, active: it.active ?? isActive(it.href) }))}
          settingsHref={settingsHref}
          settingsActive={isActive(settingsHref)}
          /* Dans le Hub, « Mes outils » et le logo naviguent en interne ; ailleurs, en absolu vers le Hub. */
          toolsHref={tool === 'hub' ? '/' : undefined}
          toolsActive={tool === 'hub' && location.pathname === '/'}
          native={native}
          credits={creditsView}
          account={account}
          linkAs={NavLink}
          open={open}
          onClose={() => setOpen(false)}
        />
      }
    >
      {/* Seuil aligné sur celui du DS (tiroir jusqu'à 64rem inclus, bureau dès 64.0625rem) : le `lg:` de
          Tailwind, à 64rem, laissait un pixel sans barre ni tiroir. */}
      <header className="sticky top-0 z-30 flex items-center gap-space-3 border-b border-border bg-secondary px-space-4 py-space-2 min-[64.0625rem]:hidden">
        <IconButton label={fr.layout.openMenu} onClick={() => setOpen(true)}>
          <Icon name="menu" />
        </IconButton>
        <Logo variant="wordmark" height="1.25rem" />
      </header>
      <AppContent>{children ?? <Outlet />}</AppContent>
    </AppShell>
  );
}
