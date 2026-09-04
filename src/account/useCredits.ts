import { useQuery } from '@tanstack/react-query';
import { getSupabase } from '../lib/supabase';
import { useAuth } from '../auth/useAuth';
import { planFor } from '../parametres/plans';

export interface CreditsInfo {
  creditsRemaining: number;
  /** Allocation de la formule (dénominateur de la barre) — `null` = inconnue → barre pleine. */
  creditsTotal: number | null;
  /** Date de recharge (`user_credits.period_end`, toujours renseignée par le back). */
  periodEnd: string | null;
  /** Code de la formule (`subscriptions.plan`), `null` = Gratuite. */
  plan: string | null;
}

export const creditsKey = (userId: string | undefined) => ['credits', userId] as const;

/**
 * Solde + date de recharge, lus dans `user_credits` (RLS own) ; allocation résolue depuis
 * `subscriptions.plan`. Les deux lectures partent en parallèle. `null` si aucune ligne de
 * crédits (compte pas encore provisionné) — l'UI affiche « — », jamais ne bloque.
 * Une lecture d'abonnement en échec ne casse pas le solde : le total retombe à `null`.
 */
export function useCredits() {
  const { user } = useAuth();
  return useQuery({
    queryKey: creditsKey(user?.id),
    enabled: !!user,
    queryFn: async (): Promise<CreditsInfo | null> => {
      const supabase = getSupabase();
      const [creditsRes, subRes] = await Promise.all([
        supabase.from('user_credits').select('credits_remaining, period_end').eq('user_id', user!.id).maybeSingle(),
        supabase.from('subscriptions').select('plan').eq('user_id', user!.id).maybeSingle(),
      ]);
      if (creditsRes.error) throw creditsRes.error;
      if (!creditsRes.data) return null;
      const plan = subRes.error ? null : (subRes.data?.plan ?? null);
      return {
        creditsRemaining: creditsRes.data.credits_remaining,
        creditsTotal: subRes.error ? null : planFor(plan).creditsPerMonth,
        periodEnd: creditsRes.data.period_end,
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
