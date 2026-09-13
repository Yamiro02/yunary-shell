import { useEffect, useMemo, useRef, type JSX, type ReactNode } from 'react';
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from '@stripe/react-stripe-js';
import { Banner, Button, Icon, IconButton, Modal, Spinner, cn } from '@yunary/ds';
import { fr } from '../i18n/fr';
import { getErrorMessage } from '../lib/errors';
import { formatEuros } from '../lib/format';
import { getStripe, hasStripeKey } from '../lib/stripe';
import { DS_MOBILE_QUERY, useMediaQuery } from '../lib/useMediaQuery';
import { useCheckoutSession, type CheckoutSession } from '../account/useStripe';
import { priceFor, usePlanCatalog, type PlanCatalog } from '../account/usePlanCatalog';
import { planFor, type PlanId } from '../parametres/plans';

export interface CheckoutModalProps {
  open: boolean;
  onClose: () => void;
  /** La formule à souscrire — `createur` (la seule payante). */
  plan?: Exclude<PlanId, 'free'>;
  /** Démo : rendu dans le flux, sans voile ni `position: fixed`. */
  inline?: boolean;
  /** Démo : état forcé, l'Edge n'est pas appelée. `catalog` alimente le sous-titre avant la session. */
  demo?: { session?: CheckoutSession; error?: string; loading?: boolean; catalog?: PlanCatalog; layout?: 'modal' | 'fullscreen'; filler?: boolean };
}

/**
 * Le checkout Stripe EMBARQUÉ — l'utilisateur ne quitte pas l'app. À l'ouverture, l'Edge
 * `create-checkout-session` renvoie un `clientSecret` ; Stripe.js (chargé paresseusement, clé de
 * `configureShell`) monte son formulaire dedans. Trois états : préparation, erreur (réessayer /
 * fermer), checkout. Après paiement, Stripe ramène sur `?checkout=<session_id>`
 * (`useCheckoutActivation`). Utilisable depuis Creator comme depuis le Hub.
 *
 * DEUX TRAITEMENTS SELON L'ÉCRAN (artboards D2 / D2b du Hub, 13/09/2026) :
 * - **bureau** (> 64 rem) : la `Modal` lg du DS (520 px), plafonnée à ~80 % de la hauteur d'écran,
 *   en-tête fixe et corps défilant ;
 * - **mobile** (≤ 64 rem) : **PLEIN ÉCRAN, ce n'est plus une modale** — aucun voile, rien de visible
 *   derrière, en-tête fixe (titre, sous-titre, croix) et zone Stripe qui défile, le bord bas de
 *   l'écran reste visible : une page à part entière, pas un panneau qui déborde.
 *   ⚠ Exception ASSUMÉE au traitement modal du DS (feuille basse) : payer est un moment où l'on
 *   isole complètement. Décision Julien, 13/09/2026 — ne pas « corriger » en feuille.
 *
 * En-tête : « S'abonner à Créateur » · « 12 €/mois — offre de lancement ». Le montant vient du
 * CATALOGUE (`usePlanCatalog`, offre de lancement s'il reste des places) puis de l'Edge
 * (`amountCents`, qui fait foi dès que la session est là) — jamais d'une constante.
 */
export function CheckoutModal({ open, onClose, plan = 'createur', inline, demo }: CheckoutModalProps): JSX.Element | null {
  const t = fr.parametres.abonnement.checkout;
  const checkout = useCheckoutSession();
  const catalogQuery = usePlanCatalog();
  const isMobile = useMediaQuery(DS_MOBILE_QUERY);
  const fullscreen = demo?.layout ? demo.layout === 'fullscreen' : isMobile;
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

  const catalog = demo ? demo.catalog : catalogQuery.data;
  const name = planFor(plan).name;
  /* Le sous-titre : l'Edge fait foi (montant facturé), le catalogue le précède le temps de la préparation. */
  const amount = session ? session.amountCents : priceFor(catalog, plan);
  const launchOffer = session ? session.isFondateur : !!catalog?.founder;
  const subtitle = amount === null ? undefined : t.subtitle(formatEuros(amount), launchOffer);

  const body = error ? (
    <Banner tone="danger">{error}</Banner>
  ) : loading || !session ? (
    <span className="flex items-center gap-space-2 text-text-muted" role="status">
      <Spinner size="sm" />
      {t.loading}
    </span>
  ) : demo ? (
    /* Démo : un gabarit de la hauteur d'un formulaire Stripe (l'artboard dit 820 px) pour éprouver le défilement. */
    demo.filler ? <div className="h-[51.25rem] rounded-md border-[1.5px] border-dashed border-border" aria-hidden="true" /> : null
  ) : (
    <EmbeddedCheckoutProvider stripe={stripe} options={{ clientSecret: session.clientSecret }}>
      <EmbeddedCheckout />
    </EmbeddedCheckoutProvider>
  );

  if (fullscreen) {
    if (!open) return null;
    return (
      <CheckoutFullScreen title={t.title(name)} subtitle={subtitle} onClose={onClose} inline={inline}>
        {error ? (
          <div className="flex flex-col gap-space-4">
            {body}
            <div className="flex justify-end gap-space-2">
              <Button variant="secondary" onClick={onClose}>{fr.common.close}</Button>
              {retry ? <Button variant="primary" onClick={retry}>{fr.common.retry}</Button> : null}
            </div>
          </div>
        ) : body}
      </CheckoutFullScreen>
    );
  }

  return (
    <Modal
      open={open}
      inline={inline}
      size="lg"
      onClose={onClose}
      /* Un clic à côté ne jette pas un paiement en cours de saisie : la croix reste le seul geste de fermeture. */
      dismissable={false}
      /* Artboard D2 : titre au palier `subheading` (22), sous-titre `body-sm` muted — la description de la Modal. */
      title={<span className="text-subheading">{t.title(name)}</span>}
      description={subtitle}
      footer={error ? (
        <>
          <Button variant="secondary" onClick={onClose}>{fr.common.close}</Button>
          {retry ? <Button variant="primary" onClick={retry}>{fr.common.retry}</Button> : null}
        </>
      ) : undefined}
    >
      {/* Artboard D2 : la modale occupe ~80 % de la hauteur d'écran, en-tête fixe, corps défilant. La Modal du DS n'a
          pas de corps défilant (BACKLOG DS) : le cadre porte le plafond — 80dvh moins la hauteur du cadre de la modale
          (padding, en-tête, sous-titre, gaps : ~8,5 rem, mesuré). Valeur hors jeton admise (Julien, 13/09/2026). */}
      <div className="-mx-space-1 max-h-[calc(80dvh-8.5rem)] overflow-y-auto px-space-1">{body}</div>
    </Modal>
  );
}

interface CheckoutFullScreenProps {
  title: string;
  subtitle?: string;
  onClose: () => void;
  inline?: boolean;
  children: ReactNode;
}

/**
 * La page plein écran du paiement sur mobile (artboard D2b) : `fixed inset-0` au rang `--z-modal`,
 * fond `--card`, aucun voile. En-tête fixe sous la zone sûre (titre `heading-sm`, sous-titre
 * `body-sm` muted, croix à droite), corps `flex-1` qui défile seul — le bord bas de l'écran reste
 * visible. Échap ferme, le focus arrive sur la croix, le document ne défile plus derrière.
 */
function CheckoutFullScreen({ title, subtitle, onClose, inline, children }: CheckoutFullScreenProps): JSX.Element {
  const headRef = useRef<HTMLElement>(null);
  useEffect(() => {
    if (inline) return;
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    /* L'`IconButton` du DS ne transmet pas de ref : on vise la croix depuis l'en-tête. */
    headRef.current?.querySelector('button')?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener('keydown', onKey);
      previous?.focus?.();
    };
  }, [inline, onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className={cn('flex flex-col bg-card text-foreground', inline ? 'relative h-full min-h-full' : 'fixed inset-0 z-(--z-modal)')}
    >
      {/* Artboard D2b : en-tête 56 / 20 / 16 — les 56 du haut sont la barre d'état de la maquette : ici `space-5` sous la
          zone sûre (`env(safe-area-inset-top)`), 20 → `space-5`, 16 → `space-4`. La croix est l'`IconButton` ghost du DS
          (2,75 rem sous 64 rem : la cible tactile) là où l'artboard dessine la croix de modale à 2 rem. */}
      <header
        ref={headRef}
        className="flex flex-none items-start justify-between gap-space-3 border-b border-border px-space-5 pb-space-4 pt-space-5"
        style={inline ? undefined : { paddingTop: 'max(var(--space-5), env(safe-area-inset-top))' }}
      >
        <div className="flex flex-col gap-space-1">
          <h2 className="text-heading-sm">{title}</h2>
          {subtitle ? <span className="text-body-sm text-text-muted">{subtitle}</span> : null}
        </div>
        <IconButton variant="ghost" label={fr.common.close} onClick={onClose} className="-mr-space-2 -mt-space-2">
          <Icon name="x" size="1.125rem" />
        </IconButton>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto px-space-5 pb-space-5 pt-space-4">{children}</div>
    </div>
  );
}
