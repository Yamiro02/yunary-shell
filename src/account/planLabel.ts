import { fr } from '../i18n/fr';
import { formatEuros } from '../lib/format';
import { isSubscriptionActive, type SubscriptionState } from './useSubscription';

/**
 * Le libellé de la carte compte (maquette « Yunary Hub Dashboard », 25/09/2026) : « 2 outils · 14 €/mois »
 * (articles actifs de l'abonnement, montants RÉELLEMENT facturés, `subscription_items.amount_cents`, lus en
 * base), « 1 outil » si un montant manque encore, « Gratuit » sans abonnement actif ou sans article.
 * 🔒 Aucun prix du catalogue ici : ce que la personne paie.
 */
export function accountPlanLabel(state: SubscriptionState | undefined): string {
  const items = state?.items ?? [];
  if (!isSubscriptionActive(state?.subscription) || items.length === 0) return fr.layout.planFree;
  const known = items.every(i => i.amountCents !== null);
  const total = items.reduce((sum, i) => sum + (i.amountCents ?? 0), 0);
  return fr.layout.planTools(items.length, known ? formatEuros(total) : null);
}
