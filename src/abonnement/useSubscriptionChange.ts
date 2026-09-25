import { useEffect, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useAuth } from '../auth/useAuth';
import { fr } from '../i18n/fr';
import { callEdge } from '../lib/edge';
import { messageForCode } from '../lib/errors';
import { getStripe } from '../lib/stripe';
import { useInvalidateBilling } from '../account/useStripe';
import {
  runSubscriptionChange, type ChangeRunResult, type SubscriptionChange, type SubscriptionPreview, type SubscriptionUpdateResult,
  type UpdateCallResult,
} from './subscriptionChange';

/** Le corps d'un aperçu : un changement, ou un seul outil (`{ tool }` = `{ ajouter: [tool] }`, l'activation rapide). */
export type PreviewRequest = SubscriptionChange | { tool: string };

export const subscriptionPreviewKey = (userId: string | undefined, body: PreviewRequest | null) =>
  ['subscription-preview', userId, body ? JSON.stringify(body) : null] as const;

/** La valeur, 250 ms après son dernier changement : un aperçu par geste, pas un par clic. */
function useDebounced<T>(value: T, ms: number): T {
  const key = JSON.stringify(value);
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(value), ms);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, ms]);
  return debounced;
}

/**
 * `preview-subscription-change` : ce qu'un changement coûterait, sans rien modifier (Stripe `invoices.createPreview`).
 * `body` null = pas d'aperçu (aucun changement, modale fermée). Relu au retour sur l'onglet (après le portail).
 * Sans abonnement vivant : `checkoutRequis: true` → le premier abonnement passe par le `CheckoutModal`.
 */
export function usePreviewSubscriptionChange(body: PreviewRequest | null) {
  const { user } = useAuth();
  const debounced = useDebounced(body, 250);
  const settled = JSON.stringify(debounced) === JSON.stringify(body);
  const query = useQuery({
    queryKey: subscriptionPreviewKey(user?.id, debounced),
    enabled: !!user && !!debounced,
    staleTime: 0,
    retry: false,
    queryFn: async (): Promise<SubscriptionPreview> => {
      const res = await callEdge<SubscriptionPreview>('preview-subscription-change', debounced as Record<string, unknown>, fr.errors.generic);
      if (!res.ok) throw new Error(messageForCode(res.code, fr.errors.generic));
      return res.data;
    },
  });
  /* Tant que la sélection bouge, l'aperçu affiché serait celui d'avant : on le cache (squelettes). */
  return { ...query, data: settled ? query.data : undefined, isPending: !settled || query.isPending };
}

/**
 * `update-subscription` : UN appel. Rend le succès, ou les refus qui ont une suite (`requires_action` avec le
 * `clientSecret` de la 3D Secure, `card_declined`) ; les autres refus (`past_due`, `no_subscription`,
 * `already_subscribed`…) lèvent leur phrase FR. Pour un changement complet, préférer `useApplySubscriptionChange`.
 */
export async function updateSubscription(change: SubscriptionChange): Promise<UpdateCallResult> {
  const res = await callEdge<SubscriptionUpdateResult>('update-subscription', change as Record<string, unknown>, fr.errors.generic);
  if (res.ok) return { status: 'ok', data: res.data };
  if (res.code === 'requires_action' && typeof res.data?.clientSecret === 'string') {
    return { status: 'requires_action', clientSecret: res.data.clientSecret, invoiceId: typeof res.data.invoiceId === 'string' ? res.data.invoiceId : null };
  }
  if (res.code === 'card_declined') return { status: 'card_declined', declineCode: typeof res.data?.declineCode === 'string' ? res.data.declineCode : null };
  throw new Error(messageForCode(res.code, fr.errors.generic));
}

export function useUpdateSubscription() {
  const invalidate = useInvalidateBilling();
  return useMutation({ mutationFn: updateSubscription, onSuccess: r => (r.status === 'ok' ? invalidate() : undefined) });
}

/**
 * La 3D Secure : `stripe.confirmCardPayment(clientSecret)` (contrat du back). Stripe.js ouvre la fenêtre de la
 * banque par-dessus la page (option A) ; `true` = paiement confirmé, `false` = abandonné ou refusé.
 */
export async function confirmBankPayment(clientSecret: string): Promise<boolean> {
  const stripe = await getStripe();
  if (!stripe) throw new Error(fr.errors.checkoutUnavailable);
  const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret);
  return !error && (!paymentIntent || paymentIntent.status === 'succeeded' || paymentIntent.status === 'processing');
}

export interface ApplyChangeVars {
  change: SubscriptionChange;
  /** Le montant de l'aperçu, pour l'écran de retour après une 3DS (le back ne le rend pas sur la relance). */
  expectedTodayCents?: number;
  /** La banque demande une validation : la vue passe en phase `bank`. */
  onBank?: () => void;
}

/**
 * Un changement complet, selon la règle du back : un appel ; 3DS → confirmation → relance avec les SEULS retraits /
 * garder ; 3DS abandonnée ou carte refusée → `declined`, rien n'a changé. Au succès, les caches sont relus tout de
 * suite puis 3 s plus tard : après une 3DS, c'est le webhook qui pose le droit.
 */
export function useApplySubscriptionChange() {
  const invalidate = useInvalidateBilling();
  return useMutation({
    mutationFn: ({ change, expectedTodayCents = 0, onBank }: ApplyChangeVars): Promise<ChangeRunResult> =>
      runSubscriptionChange(change, { update: updateSubscription, confirmPayment: confirmBankPayment, onBank }, expectedTodayCents),
    onSuccess: r => {
      if (r.status !== 'ok') return;
      void invalidate();
      window.setTimeout(() => void invalidate(), 3000);
    },
  });
}

/** « Réactiver » un outil dont le retrait est programmé : `update-subscription { garder: [tool] }`, sans facture. */
export function useReactivateTool() {
  const apply = useApplySubscriptionChange();
  return {
    ...apply,
    mutate: (tool: string, opts?: Parameters<typeof apply.mutate>[1]) => apply.mutate({ change: { garder: [tool] } }, opts),
    mutateAsync: (tool: string) => apply.mutateAsync({ change: { garder: [tool] } }),
  };
}
