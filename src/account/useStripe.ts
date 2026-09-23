import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getSupabase } from '../lib/supabase';
import { fr } from '../i18n/fr';
import { messageForCode } from '../lib/errors';
import { useAuth } from '../auth/useAuth';
import { subscriptionKey } from './useSubscription';
import { entitlementsKey } from '../tools/useEntitlements';

/** Le contrat des Edge : `{ success: true, data }` ou `{ success: false, code, message }` (200 métier, 4xx / 5xx technique). */
type EdgeResponse<T> = { success: true; data: T } | { success: false; code?: string; message?: string };

interface UrlResponse {
  success: boolean;
  url?: string;
  code?: string;
  message?: string;
}

/** Ce qu'on achète : un outil (article d'abonnement) ou un pack (achat unique). */
export type CheckoutTarget = { tool: string; pack?: undefined } | { pack: string; tool?: undefined };

/** La réponse de `create-checkout-session`. */
export type CheckoutStart =
  /** Abonnement vivant : l'article a été ajouté au prorata par l'API Stripe, PAS de Checkout — rafraîchir. */
  | { mode: 'added'; tool: string; amountCents: number }
  /** Checkout embarqué (nouvel abonnement, ou pack) : le `clientSecret` monte le formulaire Stripe, jamais dans une URL. */
  | { mode: 'checkout'; clientSecret: string; amountCents: number; tool: string; pack?: string };

/** La réponse de `remove-subscription-item`. */
export type RemoveToolResult =
  /** D'autres articles restent : retiré tout de suite (au prorata, contrat actuel du back). */
  | { tool: string; mode: 'removed' }
  /** Contrat à venir du back : l'outil reste jusqu'à la fin de la période, sans avoir. */
  | { tool: string; mode: 'ends_at_period_end'; periodEnd: string | null }
  /** Dernier article : l'abonnement entier passe en fin de période (Stripe refuse un abonnement sans article). */
  | { tool: string; mode: 'cancel_at_period_end'; currentPeriodEnd: string | null };

/**
 * Un `{ success: false, code }` arrive en 200 (dans `data`) pour une erreur métier, ou en 4xx / 5xx :
 * supabase-js pose alors une `FunctionsHttpError` dont `context` est la `Response` — on y relit le code.
 */
async function invokeEdge<T>(name: string, body: Record<string, unknown>, fallback: string): Promise<T> {
  const { data, error } = await getSupabase().functions.invoke<EdgeResponse<T>>(name, { body });
  if (error) {
    const ctx = (error as { context?: unknown }).context;
    if (ctx instanceof Response) {
      const payload = (await ctx.clone().json().catch(() => null)) as EdgeResponse<T> | null;
      if (payload && !payload.success) throw new Error(messageForCode(payload.code, fallback));
    }
    throw new Error(fallback);
  }
  if (!data) throw new Error(fallback);
  if (!data.success) throw new Error(messageForCode(data.code, fallback));
  return data.data;
}

/** Les caches que touche un changement d'abonnement : l'abonnement (et ses articles) et les droits. */
function useInvalidateBilling() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return () => Promise.all([
    qc.invalidateQueries({ queryKey: subscriptionKey(user?.id) }),
    qc.invalidateQueries({ queryKey: entitlementsKey(user?.id) }),
    qc.invalidateQueries({ queryKey: ['can-use', user?.id] }),
  ]);
}

/**
 * Portail Stripe via l'Edge `create-portal-session` — le `stripe_customer_id` n'est jamais
 * lisible côté front, l'Edge le résout en service_role. Redirection au succès : changer de
 * carte, récupérer ses factures.
 */
export function usePortalSession() {
  return useMutation({
    mutationFn: async (): Promise<string> => {
      const { data, error } = await getSupabase().functions.invoke<UrlResponse>('create-portal-session', { body: {} });
      if (error) throw new Error(fr.errors.portalFailed);
      if (!data?.success || !data.url) throw new Error(messageForCode(data?.code, fr.errors.portalFailed));
      return data.url;
    },
    onSuccess: url => {
      window.location.assign(url);
    },
  });
}

/**
 * Démarrer un achat via l'Edge `create-checkout-session` `{ tool }` ou `{ pack }` :
 * - `mode: 'added'` — abonnement vivant, l'article est ajouté au prorata côté Stripe et en base :
 *   rien à payer ici, les caches sont invalidés ;
 * - `mode: 'checkout'` — un `clientSecret` pour le checkout EMBARQUÉ (`CheckoutModal`) : aucune
 *   redirection. Le retour de Stripe après paiement arrive sur `?checkout=<session_id>`
 *   (`useCheckoutActivation`).
 * 🔒 Aucun achat depuis Claude : ce hook ne vit que dans le web.
 */
export function useStartCheckout() {
  const invalidate = useInvalidateBilling();
  return useMutation({
    mutationFn: (target: CheckoutTarget): Promise<CheckoutStart> =>
      invokeEdge<CheckoutStart>('create-checkout-session', target.pack ? { pack: target.pack } : { tool: target.tool }, fr.errors.checkoutFailed),
    onSuccess: result => (result.mode === 'added' ? invalidate() : undefined),
  });
}

/**
 * Retirer un outil de l'abonnement (`remove-subscription-item { tool }`). Les trois formes du
 * back sont tolérées : `removed` (contrat actuel, au prorata), `ends_at_period_end` (à venir : fin de
 * période, pas d'avoir) et `cancel_at_period_end` (dernier article : tout l'abonnement s'arrête en fin
 * de période).
 */
export function useRemoveTool() {
  const invalidate = useInvalidateBilling();
  return useMutation({
    mutationFn: ({ tool }: { tool: string }) => invokeEdge<RemoveToolResult>('remove-subscription-item', { tool }, fr.errors.removeToolFailed),
    onSuccess: () => invalidate(),
  });
}

/**
 * Résiliation COMPLÈTE à la fin de la période (`cancel-subscription`) : tous les outils restent
 * jusqu'à `currentPeriodEnd`, puis le compte repasse aux droits gratuits. Rien n'est remboursé.
 */
export function useCancelSubscription() {
  const invalidate = useInvalidateBilling();
  return useMutation({
    mutationFn: () => invokeEdge<{ currentPeriodEnd: string | null }>('cancel-subscription', {}, fr.errors.cancelFailed),
    onSuccess: () => invalidate(),
  });
}

/** Annule une résiliation en cours de période (`resume-subscription`) : l'abonnement se renouvelle à nouveau. */
export function useResumeSubscription() {
  const invalidate = useInvalidateBilling();
  return useMutation({
    mutationFn: () => invokeEdge<{ currentPeriodEnd: string | null }>('resume-subscription', {}, fr.errors.resumeFailed),
    onSuccess: () => invalidate(),
  });
}
