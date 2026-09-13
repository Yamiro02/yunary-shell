import { useQuery } from '@tanstack/react-query';
import { getSupabase } from '../lib/supabase';
import { useAuth } from '../auth/useAuth';

export interface SubscriptionInfo {
  plan: string | null;
  /** Valeurs Stripe : `active`, `trialing`, `past_due`, `unpaid`, `canceled`, `incomplete`… */
  status: string | null;
  currentPeriodEnd: string | null;
  /** Résilié en cours de période : l'accès court jusqu'à `currentPeriodEnd`, puis retour à la Gratuite. */
  cancelAtPeriodEnd: boolean;
  /**
   * 🔒 Le montant RÉELLEMENT facturé à cette personne, en centimes (`subscriptions.amount_cents`).
   * Pour un abonné, c'est LE prix à afficher — jamais le catalogue, qui peut avoir changé (places
   * de lancement écoulées, tarif revu) sans que son abonnement bouge. `null` = pas encore écrit.
   */
  amountCents: number | null;
}

export const subscriptionKey = (userId: string | undefined) => ['subscription', userId] as const;

/** Abonnement en cours (accès ouvert, recharge mensuelle). */
export function isSubscriptionActive(sub: SubscriptionInfo | null | undefined): boolean {
  return !!sub && (sub.status === 'active' || sub.status === 'trialing');
}

/** Dernier paiement en échec : bandeau « mets à jour ta carte » — L'ACCÈS N'EST PAS COUPÉ. */
export function isPaymentFailed(sub: SubscriptionInfo | null | undefined): boolean {
  return !!sub && (sub.status === 'past_due' || sub.status === 'unpaid');
}

/**
 * L'abonnement du user. `null` = pas de ligne → formule Gratuite.
 * ⚠️ GRANT SELECT colonne-limité (user_id, plan, status, current_period_end, cancel_at_period_end, amount_cents) :
 * la sélection est EXPLICITE — un `select *` (stripe_customer_id inclus) serait rejeté par PostgREST.
 */
export function useSubscription() {
  const { user } = useAuth();
  return useQuery({
    queryKey: subscriptionKey(user?.id),
    enabled: !!user,
    queryFn: async (): Promise<SubscriptionInfo | null> => {
      const { data, error } = await getSupabase()
        .from('subscriptions')
        .select('user_id, plan, status, current_period_end, cancel_at_period_end, amount_cents')
        .eq('user_id', user!.id)
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;
      return { plan: data.plan, status: data.status, currentPeriodEnd: data.current_period_end, cancelAtPeriodEnd: data.cancel_at_period_end, amountCents: data.amount_cents };
    },
  });
}
