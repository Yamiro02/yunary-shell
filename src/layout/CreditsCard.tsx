import type { JSX } from 'react';
import { Icon, Progress, Skeleton } from '@yunary/ds';
import { fr } from '../i18n/fr';
import { formatDateCourte } from '../lib/format';

/** Ce que la carte affiche — dérivé de `useCredits` par `AppLayout`, ou des fixtures de la démo. */
export interface CreditsView {
  remaining: number;
  /** Allocation de la formule — `null` = inconnue → barre pleine. */
  total: number | null;
  periodEnd: string | null;
}

export interface CreditsCardProps {
  /** `undefined` = chargement · `null` = solde indisponible (compte pas provisionné). */
  credits: CreditsView | null | undefined;
}

/** Carte crédits de la sidebar (maquette HubSidebar) : solde, barre, date de recharge. */
export function CreditsCard({ credits }: CreditsCardProps): JSX.Element {
  return (
    <div className="flex flex-col gap-space-2 rounded-md bg-accent px-space-4 py-space-3">
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
      <Progress
        value={credits ? credits.remaining : 0}
        max={credits?.total ?? Math.max(credits?.remaining ?? 0, 1)}
        label={fr.layout.creditsLeft(credits?.remaining ?? 0)}
        className="bg-card"
      />
      {credits?.periodEnd ? (
        <span className="text-caption font-medium text-text-muted">{fr.layout.creditsResetOn(formatDateCourte(credits.periodEnd))}</span>
      ) : null}
    </div>
  );
}
