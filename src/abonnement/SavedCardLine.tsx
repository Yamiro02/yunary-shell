import type { JSX } from 'react';
import { CreditCard } from 'lucide-react';
import { Button, Icon, Pastille, cn } from '@yunary/ds';
import { fr } from '../i18n/fr';

/** La carte enregistrée, telle que l'aperçu du back la rend (le front ne lit jamais Stripe). */
export interface SavedCardView {
  /** `visa`, `mastercard`, `amex`… (valeur Stripe). */
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
}

export interface SavedCardLineProps {
  /** `null` = aucune carte enregistrée : la ligne invite à en ajouter une (portail). */
  card: SavedCardView | null;
  /** `full` : grande modale (avec l'expiration) · `compact` : petite modale · `inline` : une ligne en légende (bas de la modale mobile). */
  size?: 'full' | 'compact' | 'inline';
  /** « Changer » → le portail Stripe. */
  onChange?: () => void;
  /** « Ajouter une carte » → le portail Stripe ; au retour, l'appelant relit l'aperçu. */
  onAdd?: () => void;
  busy?: boolean;
  className?: string;
}

const BRANDS: Record<string, string> = {
  visa: 'Visa', mastercard: 'Mastercard', amex: 'American Express', cartes_bancaires: 'CB', discover: 'Discover', jcb: 'JCB', unionpay: 'UnionPay', diners: 'Diners',
};

/** « visa » → « Visa » ; une marque inconnue garde sa valeur, capitalisée. */
export function cardBrandLabel(brand: string): string {
  return BRANDS[brand.toLowerCase()] ?? (brand ? brand.charAt(0).toUpperCase() + brand.slice(1) : '');
}

function expiry(card: SavedCardView): string {
  return `${String(card.expMonth).padStart(2, '0')}/${String(card.expYear % 100).padStart(2, '0')}`;
}

/**
 * La ligne « Visa · •••• 4242 · Changer » (artboards Hub-03-ModifierOutils, Hub-Outils-Activer).
 * « Changer » est un bouton qui ouvre le portail, pas un lien : il déclenche une action. Carte
 * absente alors qu'on doit payer : « Ajoute une carte pour continuer » + « Ajouter une carte »
 * (décision Julien, 25/09/2026 — jamais le Checkout, qui créerait un second abonnement).
 */
export function SavedCardLine({ card, size = 'full', onChange, onAdd, busy = false, className }: SavedCardLineProps): JSX.Element {
  const t = fr.paiement.card;
  if (!card) {
    return (
      <div className={cn('flex flex-wrap items-center gap-space-3', className)}>
        {size === 'inline' ? null : <Pastille size="carte" tone="amber"><Icon glyph={CreditCard} /></Pastille>}
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="text-body-sm font-semibold text-foreground">{t.missingTitle}</span>
          {size === 'full' ? <span className="text-caption text-text-muted">{t.missingBody}</span> : null}
        </span>
        {onAdd ? <Button variant="secondary" surface="card" size="sm" loading={busy} onClick={onAdd}>{t.add}</Button> : null}
      </div>
    );
  }
  const change = onChange ? (
    <button type="button" onClick={onChange} disabled={busy} className="font-semibold text-primary disabled:opacity-50">{t.change}</button>
  ) : null;
  const label = (
    <>
      {cardBrandLabel(card.brand)} · <span className="whitespace-nowrap tabular-nums">•••• {card.last4}</span>
    </>
  );
  if (size === 'inline') {
    return (
      <span className={cn('text-caption text-text-muted', className)}>
        {label}{change ? <> · {change}</> : null}
      </span>
    );
  }
  return (
    <div className={cn('flex items-center gap-space-3', className)}>
      <Pastille size="carte" tone="neutral"><Icon glyph={CreditCard} /></Pastille>
      <span className="flex min-w-0 flex-col">
        <span className="text-body-sm font-semibold text-foreground">
          {label}{change ? <> · {change}</> : null}
        </span>
        {size === 'full' ? <span className="text-caption text-text-muted">{t.expires(expiry(card))}</span> : null}
      </span>
    </div>
  );
}
