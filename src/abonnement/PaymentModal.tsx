import { useCallback, useMemo, useRef, useState, type JSX } from 'react';
import { CardCvcElement, CardExpiryElement, CardNumberElement, Elements, useElements, useStripe } from '@stripe/react-stripe-js';
import type { StripeCardCvcElementOptions, StripeCardExpiryElementOptions, StripeCardNumberElementOptions, StripeElementStyle, StripeError } from '@stripe/stripe-js';
import { fr } from '../i18n/fr';
import { getErrorMessage } from '../lib/errors';
import { getStripe, hasStripeKey } from '../lib/stripe';
import { useAuth } from '../auth/useAuth';
import { useInvalidateBilling } from '../account/useStripe';
import { packByIdIn, useToolCatalog } from '../tools/useToolCatalog';
import { confirmBankPayment, usePreviewSubscriptionChange } from './useSubscriptionChange';
import type { SubscriptionChangeOutcome } from './subscriptionChange';
import { PaymentView, type PaymentViewPhase } from './PaymentView';
import {
  billingDetails, cardErrors, countryOptions, EMPTY_BILLING, paymentBody, paymentOutcome, paymentRecap, paymentTools, runPayment, validateBilling,
  type BillingForm, type CardField, type CardFieldState, type ConfirmCardResult, type FieldErrors, type PaymentAttempt, type PaymentTarget,
} from './payment';
import { createPayment, readStripeStyle, rightsActive, stripeFonts, waitForRights } from './usePayment';

export interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  /** Ce qu'on achète : `{ tool }`, `{ tools }` ou `{ pack }`. */
  target: PaymentTarget;
  /** Paiement réussi : le hub affiche l'écran de retour (`SubscriptionResultScreen`) avec cette issue. */
  onDone: (outcome: SubscriptionChangeOutcome) => void;
}

/** Au plus, après un paiement confirmé : le temps que le webhook pose les droits avant l'écran de retour. */
const RIGHTS_AFTER_PAYMENT_MS = 8_000;
/** `payment_processing` : on attend l'activation plus longtemps, sans jamais proposer de repayer. */
const RIGHTS_WHILE_PROCESSING_MS = 20_000;

const FIELDS: CardField[] = ['number', 'expiry', 'cvc'];
const EMPTY_CARD: CardFieldState = { complete: false, empty: true, errorCode: null };

/**
 * La fenêtre de paiement intégrée (0.5.0), câblée — remplace le Checkout Stripe embarqué. Stripe.js se charge à
 * l'ouverture et monte TROIS champs carte séparés (numéro, expiration, code) dans des `.ds-input` du DS, style lu
 * dans les jetons ; Link n'est pas proposé. Au clic sur « Payer » (qui vaut acceptation des CGV) :
 * `create-payment` → `stripe.confirmCardPayment` avec la carte et la facturation → 3D Secure si la banque la
 * demande → attente des droits posés par le webhook → `onDone(issue)`. Un refus de carte s'affiche sous son champ
 * et le clic suivant réessaie le MÊME paiement. Même composant pour l'onboarding, Mes outils et les packs.
 * 🔒 Aucun achat depuis Claude : ce composant ne vit que dans le web.
 */
export function PaymentModal(props: PaymentModalProps): JSX.Element | null {
  /* Une session par ouverture : tout l'état (paiement gardé pour un réessai compris) repart de zéro à la fermeture. */
  if (!props.open) return null;
  return <PaymentModalOpen {...props} />;
}

function PaymentModalOpen(props: PaymentModalProps): JSX.Element {
  const configured = hasStripeKey();
  /* Chargés UNE fois par ouverture : Stripe.js (paresseux) et les fichiers de la police mono du DS pour ses iframes. */
  const stripe = useMemo(() => (configured ? getStripe() : null), [configured]);
  const options = useMemo(() => ({ locale: 'fr' as const, fonts: stripeFonts() }), []);
  return (
    <Elements stripe={stripe} options={options}>
      <PaymentSession {...props} configured={configured} />
    </Elements>
  );
}

function mapConfirmError(error: StripeError): ConfirmCardResult {
  const type = error.type === 'card_error' ? 'card_error' : error.type === 'validation_error' ? 'validation_error' : 'other';
  return { status: 'failed', type, code: error.code ?? null };
}

function PaymentSession({ onClose, target, onDone, configured }: PaymentModalProps & { configured: boolean }): JSX.Element {
  const stripe = useStripe();
  const elements = useElements();
  const { user } = useAuth();
  const invalidate = useInvalidateBilling();
  const catalog = useToolCatalog();
  const preview = usePreviewSubscriptionChange(target.pack ? null : { ajouter: paymentTools(target) });
  const recap = paymentRecap(target, catalog.data, preview.data);
  const countries = useMemo(() => countryOptions(), []);

  const [form, setForm] = useState<BillingForm>(EMPTY_BILLING);
  const [cards, setCards] = useState<Record<CardField, CardFieldState>>({ number: EMPTY_CARD, expiry: EMPTY_CARD, cvc: EMPTY_CARD });
  const [ready, setReady] = useState<Record<CardField, boolean>>({ number: false, expiry: false, cvc: false });
  const [focus, setFocus] = useState<CardField | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [banner, setBanner] = useState<string | null>(null);
  const [phase, setPhase] = useState<Exclude<PaymentViewPhase, 'preparing'>>('ready');
  const [locked, setLocked] = useState(false);
  const attempt = useRef<PaymentAttempt | null>(null);

  /* Le style des champs, lu dans les jetons du DS sur le premier `.ds-input` monté (taille, couleurs, police mono). */
  const [style, setStyle] = useState<StripeElementStyle | undefined>(undefined);
  const styleAnchor = useCallback((node: HTMLDivElement | null) => {
    const input = node?.closest('.ds-input');
    if (input instanceof HTMLElement) setStyle(s => s ?? readStripeStyle(input));
  }, []);

  const preparing = !configured || !FIELDS.every(f => ready[f]);
  const viewPhase: PaymentViewPhase = phase === 'ready' && preparing ? 'preparing' : phase;
  const disabled = phase !== 'ready';
  const unavailable = !configured ? fr.errors.checkoutUnavailable : null;
  const previewError = preview.error ? getErrorMessage(preview.error) : null;

  const onFormChange = (patch: Partial<BillingForm>) => {
    setForm(f => ({ ...f, ...patch }));
    setErrors(e => {
      const next = { ...e };
      for (const k of Object.keys(patch)) delete next[k as keyof FieldErrors];
      if ('withAddress' in patch) { delete next.line1; delete next.postalCode; delete next.city; }
      return next;
    });
  };

  const onCardChange = (field: CardField) => (e: { complete: boolean; empty: boolean; error?: { code?: string } }) => {
    setCards(c => ({ ...c, [field]: { complete: e.complete, empty: e.empty, errorCode: e.error?.code ?? null } }));
    setErrors(prev => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const finish = async (paid: { amountCents: number | null; next: { date: string; montant: number } | null } | null, maxMs: number) => {
    const since = Date.now();
    const packToolId = target.pack ? packByIdIn(catalog.data, target.pack)?.toolId ?? null : null;
    const active = user ? await waitForRights(() => rightsActive(target, user.id, since, packToolId), maxMs) : false;
    void invalidate();
    window.setTimeout(() => void invalidate(), 3000);
    /* Payé : l'écran de retour, même si le webhook traîne (les caches sont relus derrière). En validation : seulement une fois actif. */
    if (!active && !paid) return false;
    onDone(paymentOutcome({ target, catalog: catalog.data, recap, paid }));
    return true;
  };

  const pay = async () => {
    if (!stripe || !elements || disabled || preparing) return;
    const billing = validateBilling(form);
    const found: FieldErrors = { ...(billing.ok ? {} : billing.errors), ...cardErrors(cards) };
    if (Object.keys(found).length || !billing.ok) {
      setErrors(found);
      return;
    }
    const card = elements.getElement(CardNumberElement);
    if (!card) return;
    setErrors({});
    setBanner(null);
    setPhase('sending');
    const result = await runPayment(paymentBody(target, billing.facturation), attempt.current, {
      create: createPayment,
      confirmCard: async clientSecret => {
        const { error, paymentIntent } = await stripe.confirmCardPayment(
          clientSecret,
          { payment_method: { card, billing_details: billingDetails(billing.facturation) } },
          { handleActions: false },
        );
        if (error) return mapConfirmError(error);
        if (paymentIntent?.status === 'succeeded') return { status: 'succeeded' };
        if (paymentIntent?.status === 'processing') return { status: 'processing' };
        if (paymentIntent?.status === 'requires_action') return { status: 'requires_action' };
        return { status: 'failed', type: 'other', code: paymentIntent?.status ?? null };
      },
      confirmBank: confirmBankPayment,
      onBank: () => setPhase('bank'),
    }).catch(e => ({ status: 'refused' as const, code: null, message: getErrorMessage(e) }));

    if (result.status === 'paid') {
      attempt.current = null;
      await finish(result, RIGHTS_AFTER_PAYMENT_MS);
      return;
    }
    if (result.status === 'processing') {
      /* Le paiement est en cours de validation : on attend les droits, sans jamais proposer de repayer. */
      attempt.current = null;
      setPhase('activating');
      if (!(await finish(null, RIGHTS_WHILE_PROCESSING_MS))) {
        setLocked(true);
        setBanner(fr.paiement.form.errors.processing);
      }
      return;
    }
    if (result.status === 'declined') {
      attempt.current = result.attempt;
      setErrors({ [result.field]: result.message });
      setPhase('ready');
      return;
    }
    attempt.current = null;
    setBanner(result.message);
    setPhase('ready');
  };

  const base = { style, disabled };
  const handlers = (field: CardField) => ({
    onReady: () => setReady(r => ({ ...r, [field]: true })),
    onChange: onCardChange(field),
    onFocus: () => setFocus(field),
    onBlur: () => setFocus(f => (f === field ? null : f)),
  });
  const renderCard = (field: CardField, placeholder: string) => {
    if (!configured) return null;
    const inner = field === 'number'
      ? <CardNumberElement options={{ ...base, placeholder, showIcon: false, disableLink: true } as StripeCardNumberElementOptions} {...handlers('number')} />
      : field === 'expiry'
        ? <CardExpiryElement options={{ ...base, placeholder } as StripeCardExpiryElementOptions} {...handlers('expiry')} />
        : <CardCvcElement options={{ ...base, placeholder } as StripeCardCvcElementOptions} {...handlers('cvc')} />;
    return <div ref={field === 'number' ? styleAnchor : undefined}>{inner}</div>;
  };

  return (
    <PaymentView
      open
      onClose={onClose}
      recap={recap}
      phase={locked ? 'activating' : viewPhase}
      form={form}
      onFormChange={onFormChange}
      errors={errors}
      banner={banner ?? unavailable ?? previewError}
      countries={countries}
      renderCard={renderCard}
      cardFocus={focus}
      onPay={() => void pay()}
      payDisabled={!configured || locked}
    />
  );
}
