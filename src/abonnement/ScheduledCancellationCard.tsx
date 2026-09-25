import type { JSX } from 'react';
import { Badge, Button, Card, Icon, Pastille, cn } from '@yunary/ds';
import { fr } from '../i18n/fr';
import { formatDateNumerique } from '../lib/format';

export interface ScheduledCancellationCardProps {
  /** `subscriptions.current_period_end` : le jour où tout s'arrête. */
  periodEnd: string;
  /** Les outils encore actifs jusque-là (le singulier dit « Ton outil reste actif »). */
  toolCount: number;
  /** « Garder mes outils » → `resume-subscription`. */
  onKeep: () => void;
  keepBusy?: boolean;
  className?: string;
}

/**
 * Résiliation complète programmée (artboard Hub-Facturation-ResiliationProgrammee) : pastille ambre,
 * « Tout s'arrête le 23/10/2026 » + badge « Résiliation programmée », la phrase, et « Garder mes
 * outils ». Pour la page Facturation du hub. Sous 64 rem, le bouton passe sous le texte.
 */
export function ScheduledCancellationCard({ periodEnd, toolCount, onKeep, keepBusy = false, className }: ScheduledCancellationCardProps): JSX.Element {
  const t = fr.paiement.cancellation;
  return (
    <Card className={cn('flex flex-wrap items-center justify-between gap-space-5 px-space-5 py-space-4 shadow-none', className)}>
      <span className="flex min-w-0 flex-1 items-center gap-space-4">
        <Pastille size="carte" tone="amber"><Icon name="calendar" /></Pastille>
        <span className="flex min-w-0 flex-col gap-space-1">
          <span className="flex flex-wrap items-center gap-space-3">
            <span className="text-body font-bold text-foreground">{t.title(formatDateNumerique(periodEnd))}</span>
            <Badge tone="amber" pad="dense">{t.badge}</Badge>
          </span>
          <span className="text-body-sm text-text-muted">{t.body(toolCount)}</span>
        </span>
      </span>
      <Button variant="primary" size="sm" loading={keepBusy} onClick={onKeep} className="flex-none">{t.keep}</Button>
    </Card>
  );
}
