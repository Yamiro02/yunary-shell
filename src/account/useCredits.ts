import { useQuery } from '@tanstack/react-query';
import { getSupabase } from '../lib/supabase';
import { useAuth } from '../auth/useAuth';

export interface CreditsInfo {
  creditsRemaining: number;
  /**
   * Allocation MENSUELLE de la formule (`plan_allocations.credits_per_month`), dénominateur de la
   * barre — `null` = inconnue. `0` pour la Gratuite (13/09/2026 : 50 crédits une fois à
   * l'inscription, jamais rechargés) : pas de barre, pas de « X / Y », juste le solde.
   */
  creditsTotal: number | null;
  /** Date de recharge (`user_credits.period_end`) — `null` sans abonnement payant : un gratuit n'est plus rechargé. */
  periodEnd: string | null;
  /** Code de la formule (`subscriptions.plan`), `null` = Gratuite. */
  plan: string | null;
}

export const creditsKey = (userId: string | undefined) => ['credits', userId] as const;

/** Un abonnement qui donne droit à la recharge mensuelle (valeurs `status` de Stripe). */
export function isPaidPlan(plan: string | null | undefined, status: string | null | undefined): boolean {
  return !!plan && plan !== 'free' && (status === 'active' || status === 'trialing' || status === 'past_due');
}

/**
 * Solde, allocation et date de recharge : `user_credits` (RLS own), `subscriptions` (own) et
 * `plan_allocations` (catalogue serveur), lus en parallèle. `null` si aucune ligne de crédits
 * (compte pas encore provisionné) — l'UI affiche « — », jamais ne bloque. Une lecture
 * d'abonnement ou de catalogue en échec ne casse pas le solde : le total retombe à `null`.
 * `periodEnd` n'est exposée que pour un abonné payant : la Gratuite n'a plus de recharge.
 */
export function useCredits() {
  const { user } = useAuth();
  return useQuery({
    queryKey: creditsKey(user?.id),
    enabled: !!user,
    queryFn: async (): Promise<CreditsInfo | null> => {
      const supabase = getSupabase();
      const [creditsRes, subRes, allocRes] = await Promise.all([
        supabase.from('user_credits').select('credits_remaining, period_end').eq('user_id', user!.id).maybeSingle(),
        supabase.from('subscriptions').select('plan, status').eq('user_id', user!.id).maybeSingle(),
        supabase.from('plan_allocations').select('plan, credits_per_month'),
      ]);
      if (creditsRes.error) throw creditsRes.error;
      if (!creditsRes.data) return null;
      const plan = subRes.error ? null : (subRes.data?.plan ?? null);
      const paid = !subRes.error && isPaidPlan(plan, subRes.data?.status);
      const allocation = allocRes.error ? null : (allocRes.data.find(a => a.plan === (plan ?? 'free'))?.credits_per_month ?? null);
      return {
        creditsRemaining: creditsRes.data.credits_remaining,
        creditsTotal: subRes.error ? null : allocation,
        periodEnd: paid ? creditsRes.data.period_end : null,
        plan,
      };
    },
  });
}

export interface ActionCost {
  actionType: string;
  label: string;
  creditsCost: number;
}

/**
 * 🔒 Les coûts en crédits viennent de la table `actions`, jamais d'une constante front.
 * Lisible par `authenticated` ; cache long, ça ne bouge qu'à une migration.
 */
export function useActionCosts() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['actions'],
    enabled: !!user,
    staleTime: 60 * 60 * 1000,
    queryFn: async (): Promise<ActionCost[]> => {
      const { data, error } = await getSupabase().from('actions').select('action_type, label, credits_cost');
      if (error) throw error;
      return data.map(row => ({ actionType: row.action_type, label: row.label, creditsCost: row.credits_cost }));
    },
  });
}
