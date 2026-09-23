import type { JSX } from 'react';
import { cn } from '@yunary/ds';
import { fr } from '../i18n/fr';

export interface ToolLabelProps {
  /** Le nom tel qu'il est en base (`tools.name`) : « Yunary Analyse ». */
  name: string;
  className?: string;
}

/**
 * Le nom d'un outil en lockup, sur un nom LU EN BASE : « Yunary » puis le mot accentué en pochoir
 * `.accent` (« Analyse ») — le geste des maquettes (Hub-02, Hub-03, retour de paiement). Un nom
 * qui ne commence pas par « Yunary » est rendu tel quel. Deux spans : l'externe porte la typo
 * (display, graisse de titre), l'interne le pochoir (piège 3 du DS) ; entre les deux, une vraie
 * espace de mot, et le lockup ne se coupe jamais. Aucune couleur ni taille propre : la taille
 * vient de l'appelant (`className`), par défaut celle du texte courant.
 */
export function ToolLabel({ name, className }: ToolLabelProps): JSX.Element {
  const prefix = fr.tools.brandPrefix;
  const accent = name.startsWith(`${prefix} `) ? name.slice(prefix.length + 1).trim() : null;
  return (
    <span className={cn('whitespace-nowrap font-display font-(--heading-weight)', className)}>
      {accent ? (
        <>
          <span>{prefix}</span> <span className="accent">{accent}</span>
        </>
      ) : (
        <span>{name}</span>
      )}
    </span>
  );
}
