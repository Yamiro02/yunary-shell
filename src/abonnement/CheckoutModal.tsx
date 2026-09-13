import { useEffect, useMemo, type JSX } from 'react';
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from '@stripe/react-stripe-js';
import { Badge, Banner, Button, Modal, Spinner } from '@yunary/ds';
import { fr } from '../i18n/fr';
import { getErrorMessage } from '../lib/errors';
import { formatEuros } from '../lib/format';
import { getStripe, hasStripeKey } from '../lib/stripe';
import { useCheckoutSession, type CheckoutSession } from '../account/useStripe';
import { planFor, type PlanId } from '../parametres/plans';

export interface CheckoutModalProps {
  open: boolean;
  onClose: () => void;
  /** La formule à souscrire — `createur` (la seule payante). */
  plan?: Exclude<PlanId, 'free'>;
  /** Démo : la modale dans le flux, sans voile. */
  inline?: boolean;
  /** Démo : état forcé, l'Edge n'est pas appelée. */
  demo?: { session?: CheckoutSession; error?: string; loading?: boolean };
}

/**
 * Le checkout Stripe EMBARQUÉ, dans une modale du DS — l'utilisateur ne quitte pas l'app.
 * À l'ouverture, l'Edge `create-checkout-session` renvoie un `clientSecret` ; Stripe.js (chargé
 * paresseusement, clé de `configureShell`) monte son formulaire dedans. Trois états : préparation,
 * erreur (réessayer / fermer), checkout. Après paiement, Stripe ramène sur `?checkout=<session_id>`
 * (`useCheckoutActivation`). Le montant affiché en tête est CELUI DE L'EDGE (`amountCents`), tarif
 * fondateur compris — jamais une constante. Utilisable depuis Creator comme depuis le Hub.
 */
export function CheckoutModal({ open, onClose, plan = 'createur', inline, demo }: CheckoutModalProps): JSX.Element {
  const t = fr.parametres.abonnement.checkout;
  const checkout = useCheckoutSession();
  const configured = demo ? true : hasStripeKey();

  /* Une session par ouverture ; on repart de zéro à la fermeture (un clientSecret ne se remonte pas). */
  useEffect(() => {
    if (demo) return;
    if (open && configured) checkout.mutate({ plan });
    if (!open) checkout.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, plan, demo, configured]);

  const stripe = useMemo(() => (open && configured && !demo ? getStripe() : null), [open, configured, demo]);

  const session = demo ? demo.session : checkout.data;
  const loading = demo ? !!demo.loading : checkout.isPending;
  const error = demo ? demo.error : !configured ? fr.errors.checkoutUnavailable : checkout.error ? getErrorMessage(checkout.error) : undefined;
  const retry = configured && !demo ? () => checkout.mutate({ plan }) : undefined;

  const name = planFor(plan).name;
  const description = session ? (
    <span className="flex flex-wrap items-center gap-space-2">
      <span className="font-display text-subheading font-extrabold text-foreground">{formatEuros(session.amountCents)}</span>
      <span>{fr.parametres.abonnement.perMonth}</span>
      {session.isFondateur ? <Badge tone="coral" pad="dense" className="chip">{t.founder}</Badge> : null}
    </span>
  ) : undefined;

  return (
    <Modal
      open={open}
      inline={inline}
      size="lg"
      onClose={onClose}
      /* Un clic à côté ne jette pas un paiement en cours de saisie : la croix reste le seul geste de fermeture. */
      dismissable={false}
      title={t.title(name)}
      description={description}
      footer={error ? (
        <>
          <Button variant="secondary" onClick={onClose}>{fr.common.close}</Button>
          {retry ? <Button variant="primary" onClick={retry}>{fr.common.retry}</Button> : null}
        </>
      ) : undefined}
    >
      {error ? (
        <Banner tone="danger">{error}</Banner>
      ) : loading || !session ? (
        <span className="flex items-center gap-space-2 text-text-muted" role="status">
          <Spinner size="sm" />
          {t.loading}
        </span>
      ) : (
        /* Le formulaire Stripe est plus haut que bien des écrans (feuille mobile surtout) : il défile dans son
           propre cadre, la modale du DS n'ayant pas de corps défilant (BACKLOG DS). */
        <div className="-mx-space-1 max-h-[65dvh] overflow-y-auto px-space-1">
          {demo ? null : (
            <EmbeddedCheckoutProvider stripe={stripe} options={{ clientSecret: session.clientSecret }}>
              <EmbeddedCheckout />
            </EmbeddedCheckoutProvider>
          )}
        </div>
      )}
    </Modal>
  );
}
