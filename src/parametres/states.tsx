import type { JSX } from 'react';
import { Banner, Button, Card, Skeleton } from '@yunary/ds';
import { fr } from '../i18n/fr';

/** Un onglet en chargement : une carte de lignes grises, jamais un spinner nu. */
export function TabSkeleton({ lines = 4 }: { lines?: number }): JSX.Element {
  return (
    <Card gap={4} className="max-w-read" aria-busy="true">
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton key={i} width={i % 2 ? '60%' : '85%'} height="1rem" />
      ))}
    </Card>
  );
}

/** Un onglet en erreur : message lisible + « Réessayer ». */
export function TabError({ message, onRetry }: { message: string; onRetry?: () => void }): JSX.Element {
  return (
    <div className="max-w-read">
      <Banner tone="danger" action={onRetry ? <Button variant="secondary" size="sm" onClick={onRetry}>{fr.common.retry}</Button> : undefined}>
        {message}
      </Banner>
    </div>
  );
}
