import { useQuery } from '@tanstack/react-query';
import { getSupabase } from '../lib/supabase';
import { useAuth } from '../auth/useAuth';

/** La ligne `subscriptions` : UN abonnement Stripe par client. */
export interface SubscriptionInfo {
  /** Valeurs Stripe : `active`, `trialing`, `past_due`, `unpaid`, `canceled`, `incomplete`… */
  status: string | null;
  currentPeriodEnd: string | null;
  /** Résilié en cours de période (résiliation complète) : l'accès court jusqu'à `currentPeriodEnd`. */
  cancelAtPeriodEnd: boolean;
}

/** Un article de l'abonnement (`subscription_items`) : un outil souscrit. */
export interface SubscriptionItem {
  id: string;
  toolId: string;
  /** Le montant réellement facturé pour cet article, en centimes — `null` tant que Stripe ne l'a pas dit. */
  amountCents: number | null;
  status: 'active' | 'canceled';
}

export interface SubscriptionState {
  /** `null` = jamais abonné (compte gratuit). */
  subscription: SubscriptionInfo | null;
  /** Les articles ACTIFS, dans l'ordre d'ajout. Vide sans abonnement. */
  items: SubscriptionItem[];
}

export const subscriptionKey = (userId: string | undefined) => ['subscription', userId] as const;

/** Abonnement en cours (accès ouvert). */
export function isSubscriptionActive(sub: SubscriptionInfo | null | undefined): boolean {
  return !!sub && (sub.status === 'active' || sub.status === 'trialing');
}

/** Dernier paiement en échec : bandeau « mets à jour ta carte » — L'ACCÈS N'EST PAS COUPÉ. */
export function isPaymentFailed(sub: SubscriptionInfo | null | undefined): boolean {
  return !!sub && (sub.status === 'past_due' || sub.status === 'unpaid');
}

/**
 * L'abonnement du user et ses articles, lus en parallèle.
 * ⚠️ `subscriptions` : GRANT SELECT colonne-limité (hors ids Stripe) — la sélection est EXPLICITE,
 * un `select *` serait rejeté par PostgREST. `subscription_items` : owner SELECT.
 */
export function useSubscription() {
  const { user } = useAuth();
  return useQuery({
    queryKey: subscriptionKey(user?.id),
    enabled: !!user,
    queryFn: async (): Promise<SubscriptionState> => {
      const supabase = getSupabase();
      const [subRes, itemsRes] = await Promise.all([
        supabase.from('subscriptions').select('user_id, status, current_period_end, cancel_at_period_end').eq('user_id', user!.id).maybeSingle(),
        supabase.from('subscription_items').select('id, tool_id, amount_cents, status').eq('user_id', user!.id).eq('status', 'active').order('created_at'),
      ]);
      if (subRes.error) throw subRes.error;
      if (itemsRes.error) throw itemsRes.error;
      const s = subRes.data;
      return {
        subscription: s ? { status: s.status, currentPeriodEnd: s.current_period_end, cancelAtPeriodEnd: s.cancel_at_period_end } : null,
        items: itemsRes.data.map(row => ({ id: row.id, toolId: row.tool_id, amountCents: row.amount_cents, status: row.status === 'canceled' ? 'canceled' : 'active' })),
      };
    },
  });
}
