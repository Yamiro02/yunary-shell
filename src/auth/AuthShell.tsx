import type { JSX, ReactNode } from 'react';
import { Card, Halo, Logo, cn } from '@yunary/ds';

export interface AuthShellProps {
  className?: string;
  children: ReactNode;
}

/**
 * La coque des pages d'auth (A1-A4) : fond de page, halo central, mot-marque, carte
 * centrée (`max-w-dialog`). Rien ici n'est une fondation — Halo, Logo et Card sont ceux du DS.
 */
export function AuthShell({ className, children }: AuthShellProps): JSX.Element {
  return (
    <div className={cn('relative flex min-h-dvh flex-col items-center justify-center gap-space-6 overflow-hidden bg-background px-space-4 py-space-7', className)}>
      <Halo placement="center" />
      {/* La colonne porte la largeur (`w-full max-w-dialog`) pour que la carte l'atteigne vraiment :
          posée sur la carte seule dans une colonne centrée, elle restait à la largeur de son contenu. */}
      <div className="relative z-10 flex w-full max-w-dialog flex-col items-center gap-space-6">
        {/* Lockup de la maquette : mot à 1,875 rem, icône à 44 px — `height` calibre le mot
            (× 1,25), l'icône en découle depuis le DS 0.1.1. */}
        <Logo variant="wordmark" height="1.5rem" />
        {/* `max-w-dialog` : le rôle « carte centrée d'auth ou de dialogue » du DS (27,5 rem = les 440 px
            des maquettes ; ajouté au DS en 0.1.2 quand `narrow`, 30 rem, s'est avéré trop large). */}
        <Card size="lg" className="flex w-full flex-col gap-space-5 shadow-md">
          {children}
        </Card>
      </div>
    </div>
  );
}

/** Titre + sous-titre centrés, en tête de carte. */
export function AuthHeading({ title, subtitle }: { title: string; subtitle?: string }): JSX.Element {
  /* `space-2` entre titre et sous-titre : la maquette dit 0,375 rem, Julien a demandé plus d'air
     (08/09/2026) — le palier du DS juste au-dessus. */
  return (
    <div className="flex flex-col gap-space-2 text-center">
      <h1 className="text-heading">{title}</h1>
      {subtitle ? <p className="text-body text-text-muted">{subtitle}</p> : null}
    </div>
  );
}
