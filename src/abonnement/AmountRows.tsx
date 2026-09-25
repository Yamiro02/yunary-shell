import type { JSX, ReactNode } from 'react';
import { Skeleton, cn } from '@yunary/ds';
import { formatEuros } from '../lib/format';

export interface AmountRow {
  /** « À payer aujourd'hui », « Prochain prélèvement le 23/10/2026 ». */
  label: ReactNode;
  /** La légende sous le libellé : « Yunary Audit du 10/10 au 23/10 », « Yunary Analyse 9 € + Yunary Audit 5 € ». */
  caption?: ReactNode;
  /** En centimes, lu dans l'aperçu du back. `null` = pas encore lu (squelette). */
  amountCents: number | null;
  /** La ligne mise en avant (fond `--grad-soft`) : ce qui se passe aujourd'hui. */
  highlight?: boolean;
}

export interface AmountRowsProps {
  rows: AmountRow[];
  className?: string;
}

/**
 * Le tableau de montants des petites modales (artboards Hub-Outils-Activer-Confirmation et
 * Hub-Outils-Reactiver-Confirmation, 25/09/2026) : lignes en filet 1 px sur `--radius-lg`,
 * libellé en gras, légende `text-secondary`, montant en display 700 `heading-sm`. La ligne du jour
 * est mise en avant sur `bg-grad-soft` (utilitaire du DS). 🔒 Aucun montant calculé ici.
 */
export function AmountRows({ rows, className }: AmountRowsProps): JSX.Element {
  return (
    <div className={cn('flex flex-col overflow-hidden rounded-lg border border-border text-body-sm', className)}>
      {rows.map((row, i) => (
        <div
          key={i}
          className={cn(
            'flex items-center justify-between gap-space-4 px-space-4 py-space-4',
            i > 0 && 'border-t border-border',
            row.highlight ? 'bg-grad-soft' : 'bg-background',
          )}
        >
          <span className="flex min-w-0 flex-col gap-space-1">
            <span className="font-bold text-foreground">{row.label}</span>
            {row.caption ? <span className="text-caption text-text-secondary">{row.caption}</span> : null}
          </span>
          {row.amountCents === null ? (
            <Skeleton width="3.5rem" height="1.25rem" />
          ) : (
            <span className="whitespace-nowrap font-display text-heading-sm font-bold text-foreground">{formatEuros(row.amountCents)}</span>
          )}
        </div>
      ))}
    </div>
  );
}
