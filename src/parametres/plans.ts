import { fr } from '../i18n/fr';
import type { PlanCatalog } from '../account/usePlanCatalog';

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
 * 🔒 LA SOURCE UNIQUE des arguments de vente des formules (maquette D1 du Hub, 13/09/2026) — l'onglet
 * Abonnement et l'écran de choix du Hub les lisent ici, personne ne tient sa propre liste.
 *   Gratuite : « 50 crédits, offerts une fois » · « Environ 5 analyses » · « Pas de recharge mensuelle »
 *   Créateur : « 300 crédits par mois » · « Tous les outils, sans limite d'accès » · « Tes crédits se rechargent chaque mois »
 * Les chiffres viennent du catalogue (`signup_credits`, `credits_per_month`, `actions.analyse`) — jamais
 * d'une chaîne ; `catalog` absent → « — ». Retirés sur décision Julien : « Environ 30 analyses ou 12
 * scripts complets » (faux : pas les deux avec la même enveloppe) et « Sans carte bleue » (c'est
 * l'argument qui vend le gratuit, on ne le met pas en avant).
 */
export function planFeatures(plan: PlanDef, catalog: PlanCatalog | undefined): string[] {
  const a = fr.parametres.abonnement;
  const row = catalog?.allocations.find(r => r.plan === plan.id);
  if (plan.id === 'free') {
    const signup = row?.signupCredits ?? null;
    const analyses = signup !== null && catalog?.analyseCost ? Math.floor(signup / catalog.analyseCost) : null;
    return [a.signupOnce(signup), a.analysesApprox(analyses), ...plan.features];
  }
  return [a.creditsPerMonth(row?.creditsPerMonth ?? null), ...plan.features];
}
