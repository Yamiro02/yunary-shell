import { useQuery } from '@tanstack/react-query';
import { getSupabase } from '../lib/supabase';
import { useAuth } from '../auth/useAuth';
import type { PlanId } from '../parametres/plans';

export interface PlanAllocation {
  plan: string;
  label: string;
  /** Allocation mensuelle — `0` pour la Gratuite (jamais rechargée). */
  creditsPerMonth: number;
  /** Crédits offerts UNE fois à l'inscription (`signup_credits`) — la Gratuite ; `0` ailleurs. */
  signupCredits: number;
  /** Prix plein, en centimes. */
  priceCents: number;
}

export interface FounderOffer {
  /** Places restantes (`total - taken`), jamais négatif. */
  slotsRemaining: number;
  total: number;
  /** Tarif fondateur, en centimes — valable tant qu'il reste des places. */
  priceCents: number;
}

export interface LaunchCounter {
  /** Places de lancement au total (« Tu fais partie des N premiers ») — disponible même à zéro place restante. */
  total: number;
  taken: number;
  priceCents: number;
}

export interface PlanCatalog {
  allocations: PlanAllocation[];
  /** `null` = pas de compteur de lancement (ou places épuisées) : le prix plein s'applique. */
  founder: FounderOffer | null;
  /** Le compteur `launch_counter` tel quel, indépendant de l'offre en cours — `null` = pas de ligne. */
  launch: LaunchCounter | null;
}

export const planCatalogKey = ['plan-catalog'] as const;

/**
 * 🔒 Le catalogue — prix et allocations — vient de la BASE, jamais d'une constante front :
 * `plan_allocations` (label, `credits_per_month`, `signup_credits`, `price_cents`) et `launch_counter` (places
 * fondateur : `taken`, `total`, `price_cents`), lus en parallèle. Les deux tables sont lisibles
 * par `authenticated`. Le compteur bouge à chaque abonnement : cache court.
 */
export function usePlanCatalog() {
  const { user } = useAuth();
  return useQuery({
    queryKey: planCatalogKey,
    enabled: !!user,
    staleTime: 60 * 1000,
    queryFn: async (): Promise<PlanCatalog> => {
      const supabase = getSupabase();
      const [allocRes, counterRes] = await Promise.all([
        supabase.from('plan_allocations').select('plan, label, credits_per_month, signup_credits, price_cents'),
        /* Une seule ligne aujourd'hui (l'offre fondateur) ; on ne présume pas de sa `key`. */
        supabase.from('launch_counter').select('key, taken, total, price_cents').order('key').limit(1).maybeSingle(),
      ]);
      if (allocRes.error) throw allocRes.error;
      if (counterRes.error) throw counterRes.error;
      const allocations = allocRes.data.map(row => ({
        plan: row.plan, label: row.label, creditsPerMonth: row.credits_per_month, signupCredits: row.signup_credits, priceCents: row.price_cents,
      }));
      const c = counterRes.data;
      const slotsRemaining = c ? Math.max(0, c.total - c.taken) : 0;
      return {
        allocations,
        founder: c && slotsRemaining > 0 ? { slotsRemaining, total: c.total, priceCents: c.price_cents } : null,
        launch: c ? { total: c.total, taken: c.taken, priceCents: c.price_cents } : null,
      };
    },
  });
}

/** Les crédits offerts à l'inscription par une formule — `null` = catalogue absent ou formule inconnue. */
export function signupCreditsFor(catalog: PlanCatalog | undefined, plan: PlanId | string | null | undefined): number | null {
  const row = catalog?.allocations.find(a => a.plan === (plan ?? 'free'));
  return row ? row.signupCredits : null;
}

/** L'allocation mensuelle d'une formule — `null` = catalogue absent ou formule inconnue. */
export function allocationFor(catalog: PlanCatalog | undefined, plan: PlanId | string | null | undefined): number | null {
  const row = catalog?.allocations.find(a => a.plan === (plan ?? 'free'));
  return row ? row.creditsPerMonth : null;
}

/** Le prix PLEIN d'une formule (`plan_allocations.price_cents`), en centimes — le prix barré à côté de l'offre de lancement. `null` = pas encore lu. */
export function fullPriceFor(catalog: PlanCatalog | undefined, plan: PlanId | string | null | undefined): number | null {
  const row = catalog?.allocations.find(a => a.plan === (plan ?? 'free'));
  return row ? row.priceCents : null;
}

/**
 * 🔒 Le prix à afficher à une personne : **pas encore abonnée → le catalogue** (`priceFor`) ;
 * **déjà abonnée → `subscriptions.amount_cents`, et rien d'autre** — le catalogue peut avoir
 * changé (places écoulées, tarif revu) sans que son abonnement bouge ; lui montrer 19 € quand on
 * lui a promis 12 € serait exactement l'inverse de l'engagement. `null` = pas encore connu.
 */
export function priceToShow(catalog: PlanCatalog | undefined, plan: PlanId, subscription: { plan: string | null; amountCents: number | null } | null | undefined): number | null {
  if (subscription && subscription.plan === plan) return subscription.amountCents;
  return priceFor(catalog, plan);
}

/**
 * Le montant est-il un prix de lancement ? Se décide sur `amount < prix catalogue plein`, jamais sur
 * une égalité avec le tarif de lancement — qui casserait si ce tarif changeait. `false` tant que le
 * catalogue ou le montant manquent.
 */
export function isLaunchPrice(amountCents: number | null | undefined, catalog: PlanCatalog | undefined, plan: PlanId): boolean {
  const full = fullPriceFor(catalog, plan);
  return amountCents !== null && amountCents !== undefined && full !== null && amountCents < full;
}

/**
 * Le prix affiché d'une formule, en centimes : l'offre de lancement de `launch_counter` s'il reste
 * des places (Créateur seulement), sinon `plan_allocations.price_cents`. `null` = pas encore lu.
 */
export function priceFor(catalog: PlanCatalog | undefined, plan: PlanId): number | null {
  if (!catalog) return null;
  if (plan === 'createur' && catalog.founder) return catalog.founder.priceCents;
  const row = catalog.allocations.find(a => a.plan === plan);
  return row ? row.priceCents : null;
}
