import type { JSX } from 'react';
import { Banner, Button } from '@yunary/ds';
import { fr } from '../i18n/fr';
import { isPaymentFailed, useSubscription } from '../account/useSubscription';
import { usePortalSession } from '../account/useStripe';

export interface PaymentFailedBannerViewProps {
  onPortal: () => void;
  portalBusy?: boolean;
  className?: string;
}

/** Le bandeau, en repos : « Ton dernier paiement n'est pas passé… » + bouton vers le portail Stripe. */
export function PaymentFailedBannerView({ onPortal, portalBusy = false, className }: PaymentFailedBannerViewProps): JSX.Element {
  const t = fr.parametres.abonnement.paymentFailed;
  return (
    <Banner
      tone="warning"
      className={className}
      action={<Button variant="secondary" size="sm" loading={portalBusy} onClick={onPortal}>{t.cta}</Button>}
    >
      {t.text}
    </Banner>
  );
}

/**
 * Paiement en échec (`subscriptions.status` = `past_due` ou `unpaid`) : le bandeau en haut de
 * l'APP, pas seulement dans Paramètres — `AppLayout` le rend sous la barre haute. Le bouton ouvre
 * le portail Stripe (changer de carte). L'ACCÈS N'EST PAS COUPÉ pendant ce temps : rien d'autre
 * ne change. Ne rend rien dans tous les autres cas.
 */
export function PaymentFailedBanner({ className }: { className?: string }): JSX.Element | null {
  const subscription = useSubscription();
  const portal = usePortalSession();
  if (!isPaymentFailed(subscription.data)) return null;
  return <PaymentFailedBannerView className={className} onPortal={() => portal.mutate()} portalBusy={portal.isPending} />;
}
