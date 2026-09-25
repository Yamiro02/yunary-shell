import { describe, expect, it } from 'vitest';
import { accountPlanLabel } from './planLabel';
import type { SubscriptionState } from './useSubscription';

const sub = (status: string | null, amounts: (number | null)[]): SubscriptionState => ({
  subscription: status === null ? null : { status, currentPeriodEnd: '2026-10-23T10:00:00Z', cancelAtPeriodEnd: false },
  items: amounts.map((a, i) => ({ id: `si_${i}`, toolId: `t${i}`, amountCents: a, status: 'active' })),
});

describe('accountPlanLabel — la carte compte de la sidebar', () => {
  it('« 2 outils · 14 €/mois » : la somme des montants facturés', () => {
    expect(accountPlanLabel(sub('active', [900, 500]))).toBe('2 outils · 14\u00a0€/mois');
  });
  it('un seul outil, au singulier', () => {
    expect(accountPlanLabel(sub('active', [900]))).toBe('1 outil · 9\u00a0€/mois');
  });
  it('un montant pas encore écrit : le nombre d’outils seul, jamais un prix inventé', () => {
    expect(accountPlanLabel(sub('active', [900, null]))).toBe('2 outils');
  });
  it('« Gratuit » sans abonnement, abonnement inactif ou sans article', () => {
    expect(accountPlanLabel(undefined)).toBe('Gratuit');
    expect(accountPlanLabel(sub(null, []))).toBe('Gratuit');
    expect(accountPlanLabel(sub('canceled', [900]))).toBe('Gratuit');
    expect(accountPlanLabel(sub('active', []))).toBe('Gratuit');
  });
});
