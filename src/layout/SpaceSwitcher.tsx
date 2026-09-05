import { useEffect, useRef, useState, type JSX } from 'react';
import { Badge, Dropdown, Icon, Logo, cn, type DropdownItem } from '@yunary/ds';
import { fr } from '../i18n/fr';
import type { ToolId } from '../config';
import { TOOLS, toolById, toolFullName, toolUrl } from './tools';

/** Le nom d'un espace : « Yunary » + mot accentué (« Creator »). Deux spans : piège 3 du DS. */
export function SpaceName({ tool, size = 'md' }: { tool: ToolId; size?: 'md' | 'lg' }): JSX.Element {
  const def = toolById(tool);
  return (
    <span className={cn('inline-flex gap-[0.28em] whitespace-nowrap font-display font-(--heading-weight) tracking-heading-sm text-foreground', size === 'lg' ? 'text-heading-sm' : 'text-[1.125rem]')}>
      <span>{def.label}</span>
      {def.accent ? <span className="accent">{def.accent}</span> : null}
    </span>
  );
}

export interface SpaceSwitcherProps {
  current: ToolId;
}

/**
 * Le commutateur d'espace, en tête de sidebar : le nom de l'espace courant ouvre un
 * `Dropdown` du DS qui liste le registre — `live` en lien, `soon` grisé avec « Bientôt ».
 */
export function SpaceSwitcher({ current }: SpaceSwitcherProps): JSX.Element {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const items: DropdownItem[] = TOOLS.map(tool => {
    const isCurrent = tool.id === current;
    const soon = tool.status === 'soon';
    return {
      icon: <Logo variant="monogram" height="1.25rem" />,
      label: (
        <span className="inline-flex gap-[0.28em] font-display font-(--heading-weight)">
          <span>{tool.label}</span>
          {tool.accent ? <span className="accent">{tool.accent}</span> : null}
        </span>
      ),
      hint: soon ? <Badge tone="neutral" pad="dense">{fr.common.soon}</Badge> : isCurrent ? <Icon name="check" strokeWidth={3} size="1rem" /> : undefined,
      className: soon ? 'pointer-events-none opacity-60' : undefined,
      onSelect: soon || isCurrent ? () => setOpen(false) : () => window.location.assign(toolUrl(tool.id)),
    };
  });

  return (
    <div ref={ref} className="relative min-w-0">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`${toolFullName(toolById(current))} — ${fr.layout.switchSpace}`}
        onClick={() => setOpen(o => !o)}
        className="flex min-h-[3rem] w-full items-center gap-space-3 rounded-sm px-space-2 text-left transition-colors duration-[var(--duration-fast)] hover:bg-surface-alt focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        <Logo variant="monogram" height="1.5rem" />
        <SpaceName tool={current} />
        <Icon name="chevron-down" size="1rem" className={cn('ml-auto text-text-muted transition-transform duration-[var(--duration-fast)]', open && 'rotate-180')} />
      </button>
      {open ? <Dropdown items={items} className="left-0 top-full mt-space-1 min-w-full" /> : null}
    </div>
  );
}
