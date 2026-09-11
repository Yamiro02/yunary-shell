import type { JSX, ReactNode } from 'react';
import { StateCard } from '@yunary/ds';

export interface AuditStateCardProps {
  /** `brand` : attente, cas limite normal · `danger` : c'est nous, pas toi. */
  tone?: 'brand' | 'danger';
  /** Le glyphe de la pastille héros — un `<Icon />` nu. */
  icon: ReactNode;
  title: string;
  description?: ReactNode;
  /** Appoint sous la description : badge, jauge, ligne de rassurance… */
  children?: ReactNode;
  className?: string;
}

/**
 * La carte d'état héros de l'onboarding — l'attente, l'audit indisponible, l'audit en erreur et
 * la variante non évaluable, ici et dans le Hub. Depuis 0.1.9 c'est la **`StateCard` du DS**
 * (0.1.4, sortie de son BACKLOG à la troisième demande) : `Card lg` centrée, pastille héros
 * outlined et carrée, titre subheading, corps muted sur la colonne `narrow`, `role` status /
 * alert selon le ton. L'API de la coque ne bouge pas : les apps ne changent rien.
 */
export function AuditStateCard({ tone = 'brand', icon, title, description, children, className }: AuditStateCardProps): JSX.Element {
  return (
    <StateCard tone={tone} icon={icon} title={title} description={description} className={className}>
      {children}
    </StateCard>
  );
}
