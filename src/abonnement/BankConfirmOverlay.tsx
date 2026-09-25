import type { JSX } from 'react';
import { Landmark } from 'lucide-react';
import { Button, Card, Icon, Pastille, Spinner } from '@yunary/ds';
import { fr } from '../i18n/fr';
import { formatEuros } from '../lib/format';

export interface BankConfirmOverlayProps {
  /** Le montant que la banque doit valider, en centimes (lu dans l'aperçu). */
  amountCents: number;
  /** « Annuler le paiement » : le conteneur abandonne la confirmation 3D Secure. */
  onCancel?: () => void;
}

/**
 * L'attente 3D Secure (artboard Hub-03-ModifierOutils-3DS) : une carte posée sur la modale, sous un
 * voile interne. Option A (Julien, 25/09/2026) : la fenêtre de la banque est celle de Stripe.js
 * (`handleNextAction`), qui s'ouvre PAR-DESSUS ; cette carte reste en fond et dit ce qui se passe.
 * D'où une zone d'attente courte (spinner + « La fenêtre de ta banque est ouverte ») à la place du
 * cadre de 220 px de la maquette, qui dessinait la fenêtre de la banque dans la carte.
 * Le voile reprend la recette du voile du DS (`--tone-dark`, ici 35 % comme la maquette) : pas de
 * jeton pour un voile interne à une modale, consigné au BACKLOG du DS.
 */
export function BankConfirmOverlay({ amountCents, onCancel }: BankConfirmOverlayProps): JSX.Element {
  const t = fr.paiement.bank;
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center bg-[color-mix(in_srgb,var(--tone-dark)_35%,transparent)] p-space-5" role="status" aria-live="polite">
      <Card gap={4} className="w-full max-w-dialog text-left shadow-lg">
        <div className="flex items-center gap-space-3">
          <Pastille size="carte" tone="neutral"><Icon glyph={Landmark} /></Pastille>
          <span className="font-display text-heading-sm font-bold text-foreground">{t.title}</span>
        </div>
        <p className="text-body-sm leading-body text-text-secondary">{t.body(formatEuros(amountCents))}</p>
        <div className="flex items-center gap-space-3 rounded-md border-[1.5px] border-dashed border-border bg-background px-space-4 py-space-4">
          <Spinner size="sm" />
          <span className="text-caption text-text-muted">{t.waiting}</span>
        </div>
        <div className="flex items-center justify-between gap-space-4">
          <span className="min-w-0 text-caption text-text-muted">{t.reassurance}</span>
          {onCancel ? <Button variant="ghost" size="sm" onClick={onCancel} className="flex-none">{t.cancel}</Button> : null}
        </div>
      </Card>
    </div>
  );
}
