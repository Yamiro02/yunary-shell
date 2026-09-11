import type { JSX, ReactNode } from 'react';
import { Card, Pastille } from '@yunary/ds';
import { withGlyphSize } from '../lib/icon';

/**
 * La coque commune des cartes du profil créateur (artboards 06-09 de Creator, B5 du Hub) : Card lg
 * en pile `space-5`, pastille de marque outlined au **glyphe de 18 px** (posé ici sur l'icône reçue
 * — toutes les cartes, celles des apps comprises, sans rien passer), titre H4. La phrase sous le
 * titre est à **16 px** du titre (`space-4` — l'artboard 07 dit 14, le palier le plus proche),
 * les blocs suivants restent à 24.
 */
export function ProfilCard({ icon, title, description, children }: { icon: ReactNode; title: string; description?: string; children: ReactNode }): JSX.Element {
  const header = (
    <div className="flex items-center gap-space-3">
      <Pastille size="carte" tone="brand" outlined>{withGlyphSize(icon)}</Pastille>
      <span className="font-display text-heading-sm font-bold text-foreground">{title}</span>
    </div>
  );
  return (
    <Card size="lg" gap={5}>
      {description ? (
        <div className="flex flex-col gap-space-4">
          {header}
          <p className="text-control leading-normal text-text-secondary">{description}</p>
        </div>
      ) : header}
      {children}
    </Card>
  );
}
