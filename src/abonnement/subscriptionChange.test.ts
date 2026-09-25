import { describe, expect, it, vi } from 'vitest';
import type { ToolCatalog } from '../tools/useToolCatalog';
import {
  buildOutcome, diffSelection, nextChargeDetail, prorataDetail, rowState, runSubscriptionChange, summaryFromPreview, withoutAdditions,
  type SubscriptionPreview, type SubscriptionUpdateResult, type UpdateCallResult,
} from './subscriptionChange';

const CATALOG: ToolCatalog = {
  tools: [
    { id: 'audit', name: 'Yunary Audit', description: '', position: 1, monthlyQuota: 2, priceCents: 500, isPublished: true, status: 'mvp' },
    { id: 'analyse', name: 'Yunary Analyse', description: '', position: 2, monthlyQuota: 50, priceCents: 900, isPublished: true, status: 'mvp' },
  ],
  packs: [],
};
const END = '2026-10-23T10:00:00Z';
const PREVIEW: SubscriptionPreview = {
  checkoutRequis: false,
  aPayerAujourdhui: 333,
  detail: [{ outil: 'audit', libelle: 'Yunary Audit · prorata', montant: 333, du: '2026-10-10T10:00:00Z', au: END }],
  prochainPrelevement: { date: END, montant: 500 },
  carte: { marque: 'visa', last4: '4242', expMois: 8, expAnnee: 2028 },
  fin: 'schedule',
  abonnement: { statut: 'active', finPeriode: END, resiliation: false, outils: [{ outil: 'analyse', nom: 'Yunary Analyse', retraitProgramme: false }] },
};
const OK: SubscriptionUpdateResult = { statut: 'active', finPeriode: END, resiliation: false, outils: [], ajoutes: ['audit'], montantPaye: 333 };

describe('diffSelection — les interrupteurs deviennent le corps de update-subscription', () => {
  it('coché + pas souscrit = ajouter ; décoché + actif = retirer ; coché + en retrait = garder', () => {
    expect(diffSelection([
      { toolId: 'audit', state: 'none', checked: true },
      { toolId: 'analyse', state: 'active', checked: false },
      { toolId: 'script', state: 'ending', checked: true },
    ])).toEqual({ ajouter: ['audit'], retirer: ['analyse'], garder: ['script'] });
  });
  it('rien ne bouge = null', () => {
    expect(diffSelection([{ toolId: 'analyse', state: 'active', checked: true }, { toolId: 'audit', state: 'none', checked: false }, { toolId: 's', state: 'ending', checked: false }])).toBeNull();
  });
  it('la relance après une 3DS ne garde que retraits et « garder »', () => {
    expect(withoutAdditions({ ajouter: ['audit'], retirer: ['analyse'] })).toEqual({ retirer: ['analyse'] });
    expect(withoutAdditions({ ajouter: ['audit'] })).toBeNull();
  });
  it("l'état d'une ligne : résiliation complète = tous en retrait", () => {
    expect(rowState({ subscribed: true, endsAtPeriodEnd: false, cancelAtPeriodEnd: true })).toBe('ending');
    expect(rowState({ subscribed: true, endsAtPeriodEnd: false, cancelAtPeriodEnd: false })).toBe('active');
    expect(rowState({ subscribed: false, endsAtPeriodEnd: false, cancelAtPeriodEnd: false })).toBe('none');
  });
});

describe('aperçu → vues : aucun montant calculé côté front', () => {
  it('le détail du prorata, au nom du catalogue', () => {
    expect(prorataDetail(PREVIEW.detail, CATALOG)).toBe('Yunary Audit du 10/10 au 23/10');
  });
  it('le récapitulatif reprend les montants de l’aperçu', () => {
    const s = summaryFromPreview(PREVIEW, { ajouter: ['audit'], retirer: ['analyse'] }, CATALOG);
    expect(s.added).toEqual([{ name: 'Yunary Audit', priceCents: 500 }]);
    expect(s.removed).toEqual([{ name: 'Yunary Analyse', until: END }]);
    expect(s.todayCents).toBe(333);
    expect(s.nextCents).toBe(500);
    expect(s.nextFrom).toBe(END);
  });
  it('le détail du prochain prélèvement', () => {
    expect(nextChargeDetail(PREVIEW, { ajouter: ['audit'] }, CATALOG)).toBe('Yunary Analyse 9 € + Yunary Audit 5 €');
    expect(nextChargeDetail(PREVIEW, { ajouter: ['audit'], retirer: ['analyse'] }, CATALOG)).toBe('Yunary Audit 5 €');
  });
});

describe('runSubscriptionChange — la règle du back sur la 3D Secure', () => {
  it('payé tout de suite : un seul appel, avec tout le changement', async () => {
    const update = vi.fn<(c: object) => Promise<UpdateCallResult>>().mockResolvedValue({ status: 'ok', data: OK });
    const confirmPayment = vi.fn();
    const r = await runSubscriptionChange({ ajouter: ['audit'], retirer: ['analyse'] }, { update, confirmPayment });
    expect(r).toEqual({ status: 'ok', data: OK, paidCents: 333, confirmedByBank: false });
    expect(update).toHaveBeenCalledTimes(1);
    expect(update).toHaveBeenCalledWith({ ajouter: ['audit'], retirer: ['analyse'] });
    expect(confirmPayment).not.toHaveBeenCalled();
  });
  it('3DS confirmée : relance avec les SEULS retraits / garder', async () => {
    const update = vi.fn<(c: object) => Promise<UpdateCallResult>>()
      .mockResolvedValueOnce({ status: 'requires_action', clientSecret: 'pi_secret', invoiceId: 'in_1' })
      .mockResolvedValueOnce({ status: 'ok', data: { ...OK, ajoutes: [], montantPaye: 0 } });
    const onBank = vi.fn();
    const r = await runSubscriptionChange({ ajouter: ['audit'], retirer: ['analyse'], garder: ['script'] }, { update, confirmPayment: async () => true, onBank }, 333);
    expect(onBank).toHaveBeenCalledTimes(1);
    expect(update).toHaveBeenNthCalledWith(2, { retirer: ['analyse'], garder: ['script'] });
    expect(r.status).toBe('ok');
    expect(r.status === 'ok' && r.paidCents).toBe(333);
  });
  it('3DS confirmée sans retrait : aucune relance', async () => {
    const update = vi.fn<(c: object) => Promise<UpdateCallResult>>().mockResolvedValue({ status: 'requires_action', clientSecret: 's', invoiceId: null });
    const r = await runSubscriptionChange({ ajouter: ['audit'] }, { update, confirmPayment: async () => true }, 333);
    expect(update).toHaveBeenCalledTimes(1);
    expect(r).toEqual({ status: 'ok', data: null, paidCents: 333, confirmedByBank: true });
  });
  it('3DS abandonnée ou refusée : rien ne change, carte refusée, aucune relance', async () => {
    const update = vi.fn<(c: object) => Promise<UpdateCallResult>>().mockResolvedValue({ status: 'requires_action', clientSecret: 's', invoiceId: null });
    const r = await runSubscriptionChange({ ajouter: ['audit'], retirer: ['analyse'] }, { update, confirmPayment: async () => false });
    expect(update).toHaveBeenCalledTimes(1);
    expect(r).toEqual({ status: 'declined', declineCode: null });
  });
  it('carte refusée : rien ne change', async () => {
    const update = vi.fn<(c: object) => Promise<UpdateCallResult>>().mockResolvedValue({ status: 'card_declined', declineCode: 'insufficient_funds' });
    const confirmPayment = vi.fn();
    const r = await runSubscriptionChange({ ajouter: ['audit'] }, { update, confirmPayment });
    expect(r).toEqual({ status: 'declined', declineCode: 'insufficient_funds' });
    expect(confirmPayment).not.toHaveBeenCalled();
  });
});

describe('buildOutcome — l’écran de retour', () => {
  it('ajout + retrait = variante ajout, l’outil retiré en « Se termine le »', () => {
    const o = buildOutcome({ change: { ajouter: ['audit'], retirer: ['analyse'] }, preview: PREVIEW, catalog: CATALOG, unchanged: [], paidCents: 333, remaining: { analyse: 9 } });
    expect(o.variant).toBe('added');
    expect(o.subjects).toEqual(['Yunary Audit']);
    expect(o.tools.map(t => [t.name, t.status])).toEqual([['Yunary Audit', 'active'], ['Yunary Analyse', 'ending']]);
    expect(o.tools[1].meta).toBe('Encore 9 disponibles jusque-là');
    expect(o.todayCents).toBe(333);
    expect(o.next).toEqual({ cents: 500, from: END });
  });
  it('retrait seul = variante retrait, rien payé', () => {
    const o = buildOutcome({ change: { retirer: ['analyse'] }, preview: { ...PREVIEW, aPayerAujourdhui: 0 }, catalog: CATALOG, unchanged: ['audit'], paidCents: 0 });
    expect(o.variant).toBe('removed');
    expect(o.periodEnd).toBe(END);
    expect(o.tools.map(t => t.status)).toEqual(['active', 'ending']);
  });
});
