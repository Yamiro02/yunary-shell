import { fr } from '../i18n/fr';

/**
 * Le catalogue des formules — l'IDENTITÉ et les arguments de vente, rien d'autre. Deux offres
 * depuis 0.2.0 : Gratuite et Créateur (l'offre Pro est retirée).
 *
 * 🔒 AUCUN PRIX NI ALLOCATION ICI : le prix (`plan_allocations.price_cents`, ou le tarif fondateur
 * de `launch_counter` tant qu'il reste des places) et l'allocation mensuelle
 * (`plan_allocations.credits_per_month`) sont lus en base par `usePlanCatalog`. Les COÛTS PAR
 * ACTION viennent de la table `actions` (`useActionCosts`).
 */
export type PlanId = 'free' | 'createur';

export interface PlanDef {
  /** = `subscriptions.plan` et `plan_allocations.plan`. */
  id: PlanId;
  name: string;
  features: readonly string[];
  recommended?: boolean;
  /** Faux = checkout pas ouvert : CTA « Bientôt ». */
  available: boolean;
}

export const FREE_PLAN: PlanDef = {
  id: 'free',
  name: fr.formules.free.name,
  features: fr.formules.free.features,
  available: true,
};

export const CREATEUR_PLAN: PlanDef = {
  id: 'createur',
  name: fr.formules.createur.name,
  features: fr.formules.createur.features,
  recommended: true,
  available: true,
};

export const PLANS: readonly PlanDef[] = [FREE_PLAN, CREATEUR_PLAN];

/** La formule d'un code `subscriptions.plan` — inconnu ou absent = Gratuite. */
export function planFor(plan: string | null | undefined): PlanDef {
  return PLANS.find(p => p.id === plan) ?? FREE_PLAN;
}

/**
 * Les arguments d'une formule, le chiffre en tête — « 50 crédits offerts à l'inscription » vient de
 * `plan_allocations.signup_credits` (la Gratuite n'a plus d'allocation mensuelle depuis le
 * 13/09/2026 : un don unique, jamais rechargé), « 300 crédits par mois » de `credits_per_month` —
 * jamais d'une chaîne. `null` = catalogue pas encore lu → « — crédits … ».
 */
export function planFeatures(plan: PlanDef, credits: { creditsPerMonth: number | null; signupCredits: number | null }): string[] {
  const a = fr.parametres.abonnement;
  const head = plan.id === 'free' ? a.signupCredits(credits.signupCredits) : a.creditsPerMonth(credits.creditsPerMonth);
  return [head, ...plan.features];
}
