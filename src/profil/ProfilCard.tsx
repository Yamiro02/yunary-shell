import type { JSX, ReactNode } from 'react';
import { Card, Pastille } from '@yunary/ds';

/** La coque commune des cartes du profil créateur : Card lg, pastille de marque outlined (maquettes du 11/09/2026), titre H4. */
export function ProfilCard({ icon, title, description, children }: { icon: ReactNode; title: string; description?: string; children: ReactNode }): JSX.Element {
  return (
    <Card size="lg" gap={5}>
      <div className="flex items-center gap-space-3">
        <Pastille size="carte" tone="brand" outlined>{icon}</Pastille>
        <span className="font-display text-heading-sm font-bold text-foreground">{title}</span>
      </div>
      {description ? <p className="text-control leading-normal text-text-secondary">{description}</p> : null}
      {children}
    </Card>
  );
}
