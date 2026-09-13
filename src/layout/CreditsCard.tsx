import type { ElementType, JSX } from 'react';
import { Icon, Progress, Skeleton, cn } from '@yunary/ds';
import { fr } from '../i18n/fr';
import { formatDateCourte } from '../lib/format';

/** Ce que la carte affiche — dérivé de `useCredits` par `AppLayout`, ou des fixtures de la démo. */
export interface CreditsView {
  remaining: number;
  /**
   * Allocation MENSUELLE de la formule — `null` = inconnue → barre pleine ; `0` = Gratuite
   * (13/09/2026 : 50 crédits une fois, jamais rechargés) → pas de barre, pas de date.
   */
  total: number | null;
  /** Date de recharge — `null` pour un gratuit, qui n'est plus rechargé. */
  periodEnd: string | null;
}

export interface CreditsCardProps {
  /** `undefined` = chargement · `null` = solde indisponible (compte pas provisionné). */
  credits: CreditsView | null | undefined;
  /** La cible quand le solde est bas : Paramètres › Abonnement. Sans lui, la carte n'est jamais cliquable. */
  href?: string;
  /** Le lien du routeur (`NavLink`) — `href` lui arrive en `to`. */
  linkAs?: ElementType;
}

/** Abonné : solde sous 20 % de l'allocation mensuelle. Faux sans allocation connue (`null`) ou pour un gratuit (`0`). */
export function isCreditsLow(credits: CreditsView | null | undefined): boolean {
  if (!credits || !credits.total) return false;
  return credits.remaining < credits.total * 0.2;
}

/**
 * La carte mène-t-elle à Paramètres › Abonnement ? Gratuit (`total` 0) : **toujours** — il n'a rien
 * à recharger, sa seule issue est l'abonnement, et à zéro le lien arriverait trop tard (décision
 * Julien, 13/09/2026). Abonné : sous 20 % de l'allocation seulement — la recharge arrive, le lien
 * ne sert qu'en fin de course.
 */
export function shouldLinkCredits(credits: CreditsView | null | undefined): boolean {
  if (!credits) return false;
  return credits.total === 0 || isCreditsLow(credits);
}

/**
 * Carte crédits de la sidebar (maître HubSidebar, 11/09/2026 : 14 / 16 → `space-3` / `space-4`, gap 8, titre display 15,
 * piste sur `--card`) : solde, barre, date de recharge. Gratuit toujours, abonné sous 20 % (`shouldLinkCredits`) : LA MÊME
 * carte devient un lien vers Paramètres › Abonnement — aucun changement de mise en page, juste l'interaction. Gratuite :
 * pas de barre (allocation 0, `max=0` casserait la `Progress`) ni de date de recharge, « Offerts, non renouvelés » à la place.
 */
export function CreditsCard({ credits, href, linkAs }: CreditsCardProps): JSX.Element {
  const low = !!href && shouldLinkCredits(credits);
  const Comp = (low ? (linkAs ?? 'a') : 'div') as ElementType;
  const linkProps = low ? { ...(linkAs ? { to: href } : { href }), 'aria-label': fr.layout.creditsLowLink } : {};
  /* `total` 0 = Gratuite : pas de barre. `null` = inconnu : barre pleine, comme avant. */
  const showBar = credits === undefined || credits === null || credits.total === null || credits.total > 0;
  const isFree = !!credits && credits.total === 0;
  return (
    <Comp
      {...linkProps}
      className={cn(
        'flex flex-col gap-space-2 rounded-md bg-accent px-space-4 py-space-3',
        low && 'text-foreground no-underline transition-colors hover:bg-accent/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
      )}
    >
      <span className="inline-flex items-center gap-space-2 font-display text-control font-(--heading-weight) leading-snug text-foreground">
        <Icon name="zap" size="1rem" className="text-primary fill-current" />
        {credits === undefined ? (
          <Skeleton width="7rem" height="1rem" />
        ) : credits === null ? (
          <span>{fr.layout.creditsUnknown}</span>
        ) : (
          <span>{fr.layout.creditsLeft(credits.remaining)}</span>
        )}
      </span>
      {showBar ? (
        <Progress className="bg-card"
          value={credits ? credits.remaining : 0}
          max={credits?.total || Math.max(credits?.remaining ?? 0, 1)}
          label={fr.layout.creditsLeft(credits?.remaining ?? 0)}
        />
      ) : null}
      {/* « Recharge le… » en `caption` (13 px), comme le libellé de formule de la carte compte — le rendu de la 0.1.8
          (Julien, 11/09/2026 : l'eyebrow ne va pas). Le maître ne dessine pas cette ligne, gardée (08/09/2026).
          Gratuite : « Offerts, non renouvelés » — plus de date, un gratuit n'est plus rechargé (13/09/2026). */}
      {isFree ? (
        <span className="text-caption font-medium text-text-muted">{fr.layout.creditsOffered}</span>
      ) : credits?.periodEnd ? (
        <span className="text-caption font-medium text-text-muted">{fr.layout.creditsResetOn(formatDateCourte(credits.periodEnd))}</span>
      ) : null}
    </Comp>
  );
}
