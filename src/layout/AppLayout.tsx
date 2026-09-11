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
  /**
   * La route LOCALE de « Mes outils » — l'entrée du pied de nav et le logo y mènent, et l'entrée est
   * active dessus. Défaut `/outils` (chaque outil monte `OutilsPage` dessus) ; le Hub passe `/`.
   */
  toolsHref?: string;
  native?: boolean;
  /** Sans enfants, rend l'`Outlet` du routeur. */
  children?: ReactNode;
}

export interface AppContentProps {
  children?: ReactNode;
  className?: string;
}

/**
 * Les gouttières d'`AppContent`, exportées pour qu'une app n'ait jamais à les recopier.
 *
 * Ce sont **celles de la v1** (`legacy-v1 › AppLayout` : `px-4 pt-6 pb-6 lg:p-6`, décision Julien
 * 11/09/2026) : 16 px de côté et 24 px en haut et en bas en régime tiroir, 24 px partout dès que la
 * sidebar est à demeure. Le vertical ne bouge donc pas, seul l'horizontal passe de `space-4` à
 * `space-5`. Le seuil est **celui de la sidebar au pixel près** — `64.0625rem`, le découpage du DS
 * (`AppShell`), pas le `lg:` de Tailwind (64rem) : un pixel d'écart donnerait, à 1024 px de large
 * exactement, une barre bord à bord trop large et un défilement horizontal.
 *
 * Une barre collante bord à bord (haut de fiche, pied d'un tri) SORT des gouttières avec
 * `APP_BLEED_X` puis y RENTRE pour son contenu avec `APP_GUTTER_X` — sur le même élément ou sur
 * deux. Une page qui commence par une telle barre la veut au ras du haut : `APP_BLEED_TOP` reprend
 * le padding haut d'`AppContent`, sinon la barre flotte 24 px sous le bord tant qu'on n'a pas
 * défilé, puis se colle — deux positions pour un même élément.
 */
/** Rentrer dans les gouttières latérales : ce qu'`AppContent` pose. */
export const APP_GUTTER_X = 'px-space-4 min-[64.0625rem]:px-space-5';
/** Sortir des gouttières latérales : le miroir négatif d'`APP_GUTTER_X`. */
export const APP_BLEED_X = '-mx-space-4 min-[64.0625rem]:-mx-space-5';
/** Coller au haut du contenu : reprend le `pt-space-5` d'`AppContent`. */
export const APP_BLEED_TOP = '-mt-space-5';

/**
 * Le conteneur du contenu d'une app : **pleine largeur, sans plafond** (décision Julien,
 * 11/09/2026 — les artboards Hub et Creator remplissent leur colonne et n'ont aucun `max-width` ;
 * `.page` du DS plafonnait à 70 rem et centrait, il reste au site). Gouttières de la v1 (voir
 * `APP_GUTTER_X`) ; vertical `space-5`. Les plafonds de lecture (`max-w-read`, `max-w-wide`…)
 * restent aux blocs qui en ont besoin, jamais à la page.
 */
export function AppContent({ children, className }: AppContentProps): JSX.Element {
  return <div className={cn('w-full py-space-5', APP_GUTTER_X, className)}>{children}</div>;
}

export interface AppBleedProps {
  children?: ReactNode;
  className?: string;
  /** Colle aussi au haut du contenu (`APP_BLEED_TOP`) : pour une page qui commence par une barre collante. */
  flush?: boolean;
}

/**
 * Un bloc qui sort des gouttières d'`AppContent` — le cas « page entière » : une fiche, un
 * script, un assistant dont la barre haute et le pied sont collants et bord à bord. Ses enfants
 * rentrent dans les gouttières avec `APP_GUTTER_X`. Une seule barre qui sort et rentre sur le
 * même élément compose directement `APP_BLEED_X` + `APP_GUTTER_X`, sans ce wrapper.
 */
export function AppBleed({ children, className, flush = false }: AppBleedProps): JSX.Element {
  return <div className={cn(APP_BLEED_X, flush && APP_BLEED_TOP, className)}>{children}</div>;
}

/**
 * Le squelette d'une app : `AppShell` + `HubSidebar` du DS, tiroir sous 64rem ouvert par
 * une barre haute, contenu dans `AppContent` (pleine largeur). Lit le profil, les crédits et
 * l'abonnement pour alimenter la sidebar — les pages, elles, n'ont rien à refaire.
 */
export function AppLayout({
  tool, items = [], settingsHref = '/parametres', toolsHref = '/outils', native = false, children,
}: AppLayoutProps): JSX.Element {
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
          /* « Mes outils » et le logo naviguent en interne, dans l'outil courant — plus jamais vers le Hub. */
          toolsHref={toolsHref}
          toolsActive={isActive(toolsHref)}
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
