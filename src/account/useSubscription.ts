import { useQuery } from '@tanstack/react-query';
import { getSupabase } from '../lib/supabase';
import { useAuth } from '../auth/useAuth';

export interface SubscriptionInfo {
  plan: string | null;
  status: string | null;
  currentPeriodEnd: string | null;
}

export const subscriptionKey = (userId: string | undefined) => ['subscription', userId] as const;

/**
 * L'abonnement du user. `null` = pas de ligne → formule Gratuite.
 * ⚠️ GRANT SELECT colonne-limité (user_id, plan, status, current_period_end) : la sélection
 * est EXPLICITE — un `select *` (stripe_customer_id inclus) serait rejeté par PostgREST.
 */
export function useSubscription() {
  const { user } = useAuth();
  return useQuery({
    queryKey: subscriptionKey(user?.id),
    enabled: !!user,
    queryFn: async (): Promise<SubscriptionInfo | null> => {
      const { data, error } = await getSupabase()
        .from('subscriptions')
        .select('user_id, plan, status, current_period_end')
        .eq('user_id', user!.id)
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;
      return { plan: data.plan, status: data.status, currentPeriodEnd: data.current_period_end };
    },
  });
}
