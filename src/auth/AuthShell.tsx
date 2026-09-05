import type { JSX, ReactNode } from 'react';
import { Card, Halo, Logo, cn } from '@yunary/ds';

export interface AuthShellProps {
  className?: string;
  children: ReactNode;
}

/**
 * La coque des pages d'auth (A1-A4) : fond de page, halo central, mot-marque, carte
 * centrée (`max-w-narrow`). Rien ici n'est une fondation — Halo, Logo et Card sont ceux du DS.
 */
export function AuthShell({ className, children }: AuthShellProps): JSX.Element {
  return (
    <div className={cn('relative flex min-h-dvh flex-col items-center justify-center gap-space-6 overflow-hidden bg-background px-space-4 py-space-7', className)}>
      <Halo placement="center" />
      <div className="relative z-10 flex flex-col items-center gap-space-6">
        <Logo variant="wordmark" height="2.25rem" />
        {/* `max-w-narrow` : la largeur de rôle « message centré » du DS (30rem) — la maquette dit 27.5rem,
            on prend le jeton plutôt qu'une largeur inventée. */}
        <Card size="lg" className="flex w-full max-w-narrow flex-col gap-space-5 shadow-md">
          {children}
        </Card>
      </div>
    </div>
  );
}

/** Titre + sous-titre centrés, en tête de carte. */
export function AuthHeading({ title, subtitle }: { title: string; subtitle?: string }): JSX.Element {
  return (
    <div className="flex flex-col gap-space-1 text-center">
      <h1 className="text-heading">{title}</h1>
      {subtitle ? <p className="text-body text-text-muted">{subtitle}</p> : null}
    </div>
  );
}
