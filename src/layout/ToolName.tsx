import type { JSX } from 'react';
import { cn } from '@yunary/ds';
import type { ToolDef } from './tools';

/**
 * Le nom d'un outil, en display : « Yunary » puis le mot accentué en pochoir `.accent`
 * (« Creator ») — le Hub n'en a pas, son espace s'appelle « Yunary ». Deux spans : l'externe
 * porte la typo, l'interne le pochoir (piège 3 du DS). Entre les deux, une vraie espace — c'est un
 * espace de mot, pas un gap de mise en page — et le lockup ne se coupe jamais. Partagé par la
 * carte de « Mes outils » (C1) et le lockup de la sidebar (maître HubSidebar, 11/09/2026).
 */
export function ToolName({ tool, className }: { tool: ToolDef; className?: string }): JSX.Element {
  return (
    <span className={cn('whitespace-nowrap font-display text-heading-sm font-(--heading-weight) text-foreground', className)}>
      <span>{tool.label}</span>
      {tool.accent ? <> <span className="accent">{tool.accent}</span></> : null}
    </span>
  );
}
