import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getSupabase } from '../lib/supabase';
import { fr } from '../i18n/fr';
import { useAuth } from '../auth/useAuth';
import { creditsKey } from './useCredits';
import { subscriptionKey } from './useSubscription';
import { planCatalogKey } from './usePlanCatalog';
import type { PlanId } from '../parametres/plans';

/** Le contrat des Edge du lot Stripe : `{ success: true, data }` ou `{ success: false, code, message }`. */
type EdgeResponse<T> = { success: true; data: T } | { success: false; code?: string; message?: string };

interface UrlResponse {
  success: boolean;
  url?: string;
  code?: string;
  message?: string;
}

export interface CheckoutSession {
  /** Le secret de la session Checkout — monté dans le checkout embarqué, jamais dans une URL. */
  clientSecret: string;
  /** Le montant facturé, en centimes : le tarif fondateur s'il reste des places, sinon le prix plein. */
  amountCents: number;
  isFondateur: boolean;
  slotsRemaining: number;
}

/** Les codes d'erreur des Edge en français ; le `message` de l'Edge n'est jamais montré tel quel. */
function edgeError(code: string | undefined, fallback: string): Error {
  switch (code) {
    case 'already_subscribed': return new Error(fr.errors.checkoutAlreadySubscribed);
    case 'rate_limited': return new Error(fr.errors.rateLimit);
    case 'unauthorized': return new Error(fr.errors.auth.sessionExpired);
    default: return new Error(fallback);
  }
}

/**
 * Un `{ success: false, code }` peut arriver en 2xx (dans `data`) comme en 4xx : dans ce cas
 * supabase-js pose une `FunctionsHttpError` dont `context` est la `Response` — on y relit le code.
 */
async function invokeEdge<T>(name: string, body: Record<string, unknown>, fallback: string): Promise<T> {
  const { data, error } = await getSupabase().functions.invoke<EdgeResponse<T>>(name, { body });
  if (error) {
    const ctx = (error as { context?: unknown }).context;
    if (ctx instanceof Response) {
      const payload = (await ctx.clone().json().catch(() => null)) as EdgeResponse<T> | null;
      if (payload && !payload.success) throw edgeError(payload.code, fallback);
    }
    throw new Error(fallback);
  }
  if (!data) throw new Error(fallback);
  if (!data.success) throw edgeError(data.code, fallback);
  return data.data;
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
      if (!data?.success || !data.url) throw new Error(data?.message ?? fr.errors.portalFailed);
      return data.url;
    },
    onSuccess: url => {
      window.location.assign(url);
    },
  });
}

/**
 * Session Checkout via l'Edge `create-checkout-session` — renvoie un `clientSecret` pour le
 * checkout EMBARQUÉ (`CheckoutModal`) : AUCUNE redirection, l'utilisateur ne quitte pas l'app.
 * Le retour de Stripe après paiement arrive sur `?checkout=<session_id>` (`useCheckoutActivation`).
 */
export function useCheckoutSession() {
  return useMutation({
    mutationFn: ({ plan }: { plan: Exclude<PlanId, 'free'> }): Promise<CheckoutSession> =>
      invokeEdge<CheckoutSession>('create-checkout-session', { plan }, fr.errors.checkoutFailed),
  });
}

/** Les caches que touche un changement d'abonnement : abonnement, crédits, compteur fondateur. */
function useInvalidateBilling() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return () => Promise.all([
    qc.invalidateQueries({ queryKey: subscriptionKey(user?.id) }),
    qc.invalidateQueries({ queryKey: creditsKey(user?.id) }),
    qc.invalidateQueries({ queryKey: planCatalogKey }),
  ]);
}

/**
 * Résiliation à la fin de la période (`cancel-subscription`) : l'accès et les crédits courent
 * jusqu'à `currentPeriodEnd`, puis retour à la Gratuite. Rien n'est remboursé au prorata (CGU art. 5).
 */
export function useCancelSubscription() {
  const invalidate = useInvalidateBilling();
  return useMutation({
    mutationFn: () => invokeEdge<{ currentPeriodEnd: string }>('cancel-subscription', {}, fr.errors.cancelFailed),
    onSuccess: () => invalidate(),
  });
}

/** Annule une résiliation en cours de période (`resume-subscription`) : l'abonnement se renouvelle à nouveau. */
export function useResumeSubscription() {
  const invalidate = useInvalidateBilling();
  return useMutation({
    mutationFn: () => invokeEdge<Record<string, never> | undefined>('resume-subscription', {}, fr.errors.resumeFailed),
    onSuccess: () => invalidate(),
  });
}
