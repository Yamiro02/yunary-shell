import type { JSX, ReactNode } from 'react';
import { Card, Pastille } from '@yunary/ds';

export interface AuditStateCardProps {
  /** `brand` : attente, cas limite normal · `danger` : c'est nous, pas toi. */
  tone?: 'brand' | 'danger';
  /** Le glyphe de la pastille (1,625 rem). */
  icon: ReactNode;
  title: string;
  description?: ReactNode;
  /** Appoint sous la description : badge, ligne de rassurance… */
  children?: ReactNode;
  className?: string;
}

/**
 * La carte d'état héros de l'onboarding — le design de la v1 (`StateCard` héros, cadre plein,
 * pastille ronde) repris avec le DS : `Card lg` centrée, `Pastille heros` ronde, titre
 * `subheading`, corps `control` muted, pas `space-4` (l'artboard « données insuffisantes »).
 * Sert l'attente, l'audit indisponible, l'audit en erreur et la variante non évaluable, ici et
 * dans Creator. Manque du DS (carte d'état héros) consigné dans son BACKLOG.
 */
export function AuditStateCard({ tone = 'brand', icon, title, description, children, className }: AuditStateCardProps): JSX.Element {
  return (
    <Card size="lg" role={tone === 'danger' ? 'alert' : 'status'} className={['flex flex-col items-center gap-space-4 text-center', className].filter(Boolean).join(' ')}>
      <Pastille size="heros" shape="round" tone={tone}>{icon}</Pastille>
      <div className="flex max-w-narrow flex-col gap-space-2">
        <span className="text-subheading text-foreground">{title}</span>
        {description ? <p className="text-control leading-normal text-text-muted">{description}</p> : null}
      </div>
      {children}
    </Card>
  );
}
