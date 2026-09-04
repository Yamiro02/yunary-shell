import { fr } from '../i18n/fr';

/**
 * Le catalogue des formules — ce qu'affiche Paramètres › Abonnement et la carte crédits.
 * La Gratuite est réelle (50 crédits, PROJECT-CONTEXT racine §4). Les payantes n'ont ni
 * prix ni allocation tant que la grille n'est pas calée : elles s'affichent en « — € »,
 * comme la maquette C4, et leur CTA reste « bientôt » tant que `available` est faux.
 *
 * ⚠️ Les COÛTS PAR ACTION ne vivent pas ici : ils sont lus dans la table `actions`
 * (`useActionCosts`). Ici, seulement l'allocation mensuelle d'une formule.
 */
export type PlanId = 'free' | 'createur' | 'pro';

export interface PlanDef {
  /** = `subscriptions.plan`. */
  id: PlanId;
  name: string;
  /** € / mois — `null` = pas encore calé. */
  priceMonthly: number | null;
  /** Allocation mensuelle — `null` = pas encore calée (barre de crédits pleine). */
  creditsPerMonth: number | null;
  features: readonly string[];
  recommended?: boolean;
  /** Faux = checkout pas ouvert : CTA « Bientôt ». */
  available: boolean;
}

export const FREE_PLAN: PlanDef = {
  id: 'free',
  name: fr.formules.free.name,
  priceMonthly: 0,
  creditsPerMonth: 50,
  features: fr.formules.free.features,
  available: true,
};

export const PLANS: readonly PlanDef[] = [
  FREE_PLAN,
  {
    id: 'createur',
    name: fr.formules.createur.name,
    priceMonthly: null,
    creditsPerMonth: null,
    features: fr.formules.createur.features,
    recommended: true,
    available: false,
  },
  {
    id: 'pro',
    name: fr.formules.pro.name,
    priceMonthly: null,
    creditsPerMonth: null,
    features: fr.formules.pro.features,
    available: false,
  },
];

/** La formule d'un code `subscriptions.plan` — inconnu ou absent = Gratuite. */
export function planFor(plan: string | null | undefined): PlanDef {
  return PLANS.find(p => p.id === plan) ?? FREE_PLAN;
}
