import type { JSX, ReactNode } from 'react';
import { Icon, cn } from '@yunary/ds';

export interface ChoiceChipProps {
  selected: boolean;
  onToggle: () => void;
  italic?: boolean;
  disabled?: boolean;
  children: ReactNode;
}

/**
 * Chip cochable — pilule à bordure, coche quand cochée, `aria-pressed`. La maquette (maître)
 * pose une pilule interactive que le DS ne prévoit pas : composée ici aux jetons, manque
 * consigné dans le BACKLOG du DS.
 */
export function ChoiceChip({ selected, onToggle, italic = false, disabled = false, children }: ChoiceChipProps): JSX.Element {
  return (
    <button
      type="button"
      aria-pressed={selected}
      disabled={disabled}
      onClick={onToggle}
      className={cn(
        'inline-flex items-center gap-space-2 rounded-pill border-[1.5px] bg-background px-space-4 py-space-2 text-body-sm font-semibold text-foreground transition-colors duration-[var(--duration-fast)] ease-standard',
        'hover:border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-50',
        selected ? 'border-primary' : 'border-border',
        italic && 'italic',
      )}
    >
      {selected ? <Icon name="check" strokeWidth={3} size="0.875rem" /> : null}
      {children}
    </button>
  );
}
