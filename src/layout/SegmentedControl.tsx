import { useId, type JSX, type KeyboardEvent } from 'react';
import { cn } from '@yunary/ds';

/**
 * Choix UNIQUE pleine largeur — niveau de langue, vulgarité. Un `radiogroup`, pas des
 * onglets : la valeur est une donnée, pas une vue. Flèches gauche/droite pour changer,
 * hover / selected / focus-visible aux jetons du DS. Manque DS consigné (BACKLOG.md).
 */
export interface SegmentedOption<V extends string> {
  value: V;
  label: string;
}

export interface SegmentedControlProps<V extends string> {
  options: readonly SegmentedOption<V>[];
  value: V | null;
  onChange: (value: V) => void;
  /** Nom accessible du groupe. */
  label: string;
  disabled?: boolean;
  className?: string;
}

export function SegmentedControl<V extends string>({
  options, value, onChange, label, disabled = false, className,
}: SegmentedControlProps<V>): JSX.Element {
  const id = useId();
  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (disabled) return;
    const delta = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
    if (!delta) return;
    e.preventDefault();
    const next = options[(index + delta + options.length) % options.length];
    onChange(next.value);
    const el = document.getElementById(`${id}-${next.value}`);
    el?.focus();
  };
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn(
        'flex w-full min-h-control-md items-center gap-space-1 rounded-md border border-border bg-background p-space-1',
        disabled && 'opacity-50',
        className,
      )}
    >
      {options.map((opt, i) => {
        const selected = value === opt.value;
        return (
          <button
            key={opt.value}
            id={`${id}-${opt.value}`}
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={selected || (value === null && i === 0) ? 0 : -1}
            disabled={disabled}
            onClick={() => onChange(opt.value)}
            onKeyDown={e => onKeyDown(e, i)}
            className={cn(
              'flex-1 rounded-sm px-space-3 py-space-2 font-body text-control font-semibold transition-colors duration-[var(--duration-fast)] ease-standard',
              'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
              selected ? 'bg-card text-foreground shadow-sm' : 'text-text-muted hover:text-foreground',
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
