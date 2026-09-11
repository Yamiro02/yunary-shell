import type { JSX, ReactNode } from 'react';
import { Icon, cn } from '@yunary/ds';

export interface ChoiceChipProps {
  /** `choix` (défaut) : pilule cochable, `aria-pressed` · `ajout` : pilule d'ajout en pointillés, jamais cochée. */
  variant?: 'choix' | 'ajout';
  /** L'état coché — sans objet en `ajout`. */
  selected?: boolean;
  /** Le clic : bascule en `choix`, action d'ajout en `ajout`. */
  onToggle: () => void;
  italic?: boolean;
  disabled?: boolean;
  children: ReactNode;
}

/* Le socle commun des deux variantes : même padding, même police, même rail — donc même hauteur. */
const BASE =
  'inline-flex items-center gap-space-2 rounded-pill border-[1.5px] px-space-4 py-space-2 text-body-sm font-semibold transition-colors duration-[var(--duration-fast)] ease-standard ' +
  'hover:border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-50';

/**
 * Chip cochable — pilule à bordure, coche quand cochée, `aria-pressed`. La maquette (maître)
 * pose une pilule interactive que le DS ne prévoit pas : composée ici aux jetons, manque
 * consigné dans le BACKLOG du DS.
 *
 * `variant="ajout"` (artboard 07 « À propos » : « Autre passion… », « Autre vécu… ») : la même
 * pilule en pointillés 1,5 px `--border`, fond transparent, texte muted, un « + » de 14 px au trait
 * 2,4 à gauche — jamais cochée, pas d'`aria-pressed` : c'est un bouton d'action.
 */
export function ChoiceChip({ variant = 'choix', selected = false, onToggle, italic = false, disabled = false, children }: ChoiceChipProps): JSX.Element {
  if (variant === 'ajout') {
    return (
      <button
        type="button"
        disabled={disabled}
        onClick={onToggle}
        className={cn(BASE, 'border-dashed border-border bg-transparent text-text-muted hover:text-foreground', italic && 'italic')}
      >
        <Icon name="plus" size="0.875rem" strokeWidth={2.4} />
        {children}
      </button>
    );
  }
  return (
    <button
      type="button"
      aria-pressed={selected}
      disabled={disabled}
      onClick={onToggle}
      className={cn(
        /* Artboards B5 et 06 « Ta voix » : pilule à filet 1,5 px (--border, --primary cochée) sur --background,
           14 px semi-gras. Le 1,5 px est une hairline en px, admise comme dans le DS (`border-[1.5px]`). */
        BASE, 'bg-background text-foreground',
        selected ? 'border-primary' : 'border-border',
        italic && 'italic',
      )}
    >
      {selected ? <Icon name="check" strokeWidth={3} size="0.875rem" /> : null}
      {children}
    </button>
  );
}
