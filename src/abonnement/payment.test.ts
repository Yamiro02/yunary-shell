import { describe, expect, it, vi } from 'vitest';
import type { EdgeResult } from '../lib/edge';
import { formatEuros } from '../lib/format';
import type { ToolCatalog } from '../tools/useToolCatalog';
import {
  billingDetails, cardErrors, cardFieldOfCode, countryOptions, EMPTY_BILLING, monthlyDay, paymentBody, paymentOutcome, paymentRecap,
  payLabel, runPayment, validateBilling,
  type ConfirmCardResult, type CreatePaymentData, type PaymentAttempt, type PaymentIntentData,
} from './payment';
import type { SubscriptionPreview } from './subscriptionChange';

const CATALOG: ToolCatalog = {
  tools: [
    { id: 'analyse', name: 'Yunary Analyse', description: '', position: 1, monthlyQuota: 50, unitLabel: 'analyse', unitLabelPlural: 'analyses', priceCents: 900, isPublished: true, status: 'mvp' },
    { id: 'audit', name: 'Yunary Audit', description: '', position: 2, monthlyQuota: 2, unitLabel: 'audit', unitLabelPlural: 'audits', priceCents: 500, isPublished: true, status: 'mvp' },
  ],
  packs: [{ id: 'analyse-20', toolId: 'analyse', name: '20 analyses supplémentaires', units: 20, priceCents: 500, isPublished: true }],
};
const NEXT = { date: '2026-10-27T10:00:00Z', montant: 900 };
const INTENT: PaymentIntentData = {
  mode: 'payment', clientSecret: 'pi_1_secret', amountCents: 900, tools: ['analyse'], tool: 'analyse',
  prochainPrelevement: NEXT, reutilise: false, retour: 'https://app.yunary.com/bienvenue?paiement=1&tools=analyse&tool=analyse',
};
const PREVIEW: SubscriptionPreview = {
  checkoutRequis: true, aPayerAujourdhui: 900, detail: [], prochainPrelevement: NEXT, carte: null, fin: 'aucune', abonnement: null,
};
const ok = (data: CreatePaymentData): EdgeResult<CreatePaymentData> => ({ ok: true, data });
const refuse = (code: string, data: Record<string, unknown> | null = null): EdgeResult<CreatePaymentData> => ({ ok: false, code, data });
const FORM = { ...EMPTY_BILLING, name: 'Julien Fernandes' };

describe('validateBilling — pays obligatoire, adresse facultative', () => {
  it('nom et pays suffisent', () => {
    expect(validateBilling(FORM)).toEqual({ ok: true, facturation: { pays: 'FR', nom: 'Julien Fernandes' } });
  });
  it('le pays est obligatoire', () => {
    const r = validateBilling({ ...FORM, country: '' });
    expect(r.ok).toBe(false);
    expect(!r.ok && r.errors.country).toBe('Choisis ton pays.');
  });
  it('le nom sur la carte est obligatoire', () => {
    const r = validateBilling({ ...FORM, name: '   ' });
    expect(!r.ok && r.errors.name).toBe('Indique le nom sur la carte.');
  });
  it('case décochée : ni entreprise ni adresse, même saisies avant', () => {
    const r = validateBilling({ ...FORM, withAddress: false, company: 'Studio', line1: '1 rue', postalCode: '75001', city: 'Paris' });
    expect(r).toEqual({ ok: true, facturation: { pays: 'FR', nom: 'Julien Fernandes' } });
  });
  it('case cochée, champs vides : pas d’adresse, rien de bloquant', () => {
    expect(validateBilling({ ...FORM, withAddress: true })).toEqual({ ok: true, facturation: { pays: 'FR', nom: 'Julien Fernandes' } });
  });
  it('entreprise seule : envoyée sans adresse', () => {
    expect(validateBilling({ ...FORM, withAddress: true, company: ' Studio Fernandes ' })).toEqual({ ok: true, facturation: { pays: 'FR', nom: 'Julien Fernandes', entreprise: 'Studio Fernandes' } });
  });
  it('adresse complète : les trois champs, à plat', () => {
    const r = validateBilling({ ...FORM, country: 'be', withAddress: true, line1: '1 rue Neuve', postalCode: '1000', city: 'Bruxelles' });
    expect(r).toEqual({ ok: true, facturation: { pays: 'BE', nom: 'Julien Fernandes', ligne1: '1 rue Neuve', codePostal: '1000', ville: 'Bruxelles' } });
  });
  it('adresse partielle : les champs manquants sont signalés', () => {
    const r = validateBilling({ ...FORM, withAddress: true, line1: '1 rue Neuve' });
    expect(r.ok).toBe(false);
    expect(!r.ok && r.errors).toEqual({ postalCode: 'Indique le code postal.', city: 'Indique la ville.' });
  });
  it('billing_details de Stripe : nom et adresse, pays toujours', () => {
    expect(billingDetails({ pays: 'FR', nom: 'J F' })).toEqual({ name: 'J F', address: { country: 'FR' } });
    expect(billingDetails({ pays: 'FR', ligne1: '1 rue', codePostal: '75001', ville: 'Paris' })).toEqual({ address: { country: 'FR', line1: '1 rue', postal_code: '75001', city: 'Paris' } });
  });
});

describe('paymentBody — le corps de create-payment', () => {
  const f = { pays: 'FR', nom: 'J F' };
  it('outils, outil ou pack, avec cguAcceptees et la version du texte affiché', () => {
    expect(paymentBody({ tools: ['analyse', 'audit'] }, f)).toEqual({ tools: ['analyse', 'audit'], cguAcceptees: true, cguVersion: 'abonnement-v2', facturation: f });
    expect(paymentBody({ tool: 'analyse' }, f)).toEqual({ tool: 'analyse', cguAcceptees: true, cguVersion: 'abonnement-v2', facturation: f });
    expect(paymentBody({ pack: 'analyse-20' }, f)).toEqual({ pack: 'analyse-20', cguAcceptees: true, cguVersion: 'pack-v2', facturation: f });
  });
});

describe('cardErrors — les champs carte avant tout appel', () => {
  const done = { complete: true, empty: false };
  it('complets : aucune erreur', () => {
    expect(cardErrors({ number: done, expiry: done, cvc: done })).toEqual({});
  });
  it('incomplets ou invalides : une phrase tutoyée par champ', () => {
    expect(cardErrors({ number: { complete: false, empty: true }, expiry: { complete: false, empty: false, errorCode: 'invalid_expiry_year_past' }, cvc: { complete: false, empty: false } })).toEqual({
      number: 'Le numéro de carte est incomplet.', expiry: 'Cette carte a expiré.', cvc: 'Le code de sécurité est incomplet.',
    });
  });
  it('un refus de la banque tombe sous le numéro', () => {
    expect(cardFieldOfCode('card_declined')).toBe('number');
    expect(cardFieldOfCode('incorrect_cvc')).toBe('cvc');
  });
});

describe('runPayment — les états d’un clic sur « Payer »', () => {
  const BODY = paymentBody({ tool: 'analyse' }, { pays: 'FR', nom: 'J F' });
  const deps = (create: EdgeResult<CreatePaymentData>, confirm: ConfirmCardResult[], bank = true) => {
    const c = vi.fn<(b: Record<string, unknown>) => Promise<EdgeResult<CreatePaymentData>>>().mockResolvedValue(create);
    const card = vi.fn<(s: string) => Promise<ConfirmCardResult>>();
    confirm.forEach(r => card.mockResolvedValueOnce(r));
    return { create: c, confirmCard: card, confirmBank: vi.fn<(s: string) => Promise<boolean>>().mockResolvedValue(bank), onBank: vi.fn() };
  };

  it('payé : un appel, une confirmation, le montant et l’échéance du serveur', async () => {
    const d = deps(ok(INTENT), [{ status: 'succeeded' }]);
    expect(await runPayment(BODY, null, d)).toEqual({ status: 'paid', amountCents: 900, next: NEXT });
    expect(d.create).toHaveBeenCalledWith(BODY);
    expect(d.confirmCard).toHaveBeenCalledWith('pi_1_secret');
    expect(d.onBank).not.toHaveBeenCalled();
  });

  it('refus puis réessai : le second clic confirme LE MÊME paiement, sans rappeler le serveur', async () => {
    const d = deps(ok(INTENT), [{ status: 'failed', type: 'card_error', code: 'card_declined' }, { status: 'succeeded' }]);
    const first = await runPayment(BODY, null, d);
    expect(first.status).toBe('declined');
    if (first.status !== 'declined') return;
    expect(first.field).toBe('number');
    expect(first.message).toBe('Ta carte a été refusée. Essaie une autre carte ou appelle ta banque.');
    expect(first.attempt?.data.clientSecret).toBe('pi_1_secret');
    const second = await runPayment(BODY, first.attempt, d);
    expect(second).toEqual({ status: 'paid', amountCents: 900, next: NEXT });
    expect(d.create).toHaveBeenCalledTimes(1);
    expect(d.confirmCard).toHaveBeenNthCalledWith(2, 'pi_1_secret');
  });

  it('facturation changée après un refus : le serveur est rappelé (il reprend le paiement incomplet)', async () => {
    const d = deps(ok({ ...INTENT, reutilise: true }), [{ status: 'succeeded' }]);
    const attempt: PaymentAttempt = { key: JSON.stringify(BODY), data: INTENT };
    const other = paymentBody({ tool: 'analyse' }, { pays: 'BE', nom: 'J F' });
    await runPayment(other, attempt, d);
    expect(d.create).toHaveBeenCalledWith(other);
  });

  it('3D Secure validée : payé ; abandonnée : refusée, le paiement reste réessayable', async () => {
    const yes = deps(ok(INTENT), [{ status: 'requires_action' }], true);
    expect(await runPayment(BODY, null, yes)).toEqual({ status: 'paid', amountCents: 900, next: NEXT });
    expect(yes.onBank).toHaveBeenCalledTimes(1);
    expect(yes.confirmBank).toHaveBeenCalledWith('pi_1_secret');
    const no = deps(ok(INTENT), [{ status: 'requires_action' }], false);
    const r = await runPayment(BODY, null, no);
    expect(r.status === 'declined' && r.attempt?.data.clientSecret).toBe('pi_1_secret');
  });

  it('code de sécurité faux : l’erreur sous le bon champ', async () => {
    const d = deps(ok(INTENT), [{ status: 'failed', type: 'card_error', code: 'incorrect_cvc' }]);
    const r = await runPayment(BODY, null, d);
    expect(r.status === 'declined' && [r.field, r.message]).toEqual(['cvc', "Le code de sécurité n'est pas bon."]);
  });

  it('panne côté Stripe au moment de confirmer : message général, on repart de zéro', async () => {
    const d = deps(ok(INTENT), [{ status: 'failed', type: 'other', code: 'payment_intent_unexpected_state' }]);
    expect(await runPayment(BODY, null, d)).toEqual({ status: 'refused', code: 'payment_intent_unexpected_state', message: "Le paiement n'est pas passé. Réessaie dans un instant." });
  });

  it('payment_processing : attendre les droits, aucune confirmation', async () => {
    const d = deps(refuse('payment_processing'), []);
    expect(await runPayment(BODY, null, d)).toEqual({ status: 'processing' });
    expect(d.confirmCard).not.toHaveBeenCalled();
  });

  it.each([
    ['already_subscribed', 'Cet outil est déjà dans ton abonnement.'],
    ['not_published', "Cet outil n'est pas encore disponible à l'achat."],
    ['rate_limited', 'Trop de tentatives. Réessaie dans quelques instants.'],
    ['cgu_required', 'Accepte les CGV pour payer.'],
    ['invalid_input', 'Vérifie tes informations de facturation, puis réessaie.'],
    ['stripe_error', "Le paiement n'a pas pu être préparé. Réessaie dans un instant."],
    ['server_error', 'Impossible de préparer le paiement. Réessaie.'],
  ])('refus %s : un message clair, rien de confirmé', async (code, message) => {
    const d = deps(refuse(code), []);
    expect(await runPayment(BODY, null, d)).toEqual({ status: 'refused', code, message });
    expect(d.confirmCard).not.toHaveBeenCalled();
  });

  it('abonnement vivant : ajouté par le serveur, rien à confirmer', async () => {
    const d = deps(ok({ mode: 'added', tools: ['analyse'], tool: 'analyse', amountCents: 333 }), []);
    expect(await runPayment(BODY, null, d)).toEqual({ status: 'paid', amountCents: 333, next: null });
    expect(d.confirmCard).not.toHaveBeenCalled();
  });

  it('abonnement vivant + 3D Secure sur la carte enregistrée : la banque confirme', async () => {
    const d = deps(refuse('requires_action', { clientSecret: 'pi_2_secret' }), [], true);
    expect(await runPayment(BODY, null, d)).toEqual({ status: 'paid', amountCents: null, next: null });
    expect(d.confirmBank).toHaveBeenCalledWith('pi_2_secret');
  });
});

describe('récap et issue', () => {
  it('un outil : titre, quota avec unité, montants de l’aperçu', () => {
    const r = paymentRecap({ tool: 'analyse' }, CATALOG, PREVIEW);
    expect(r.title).toBe("S'abonner à Yunary Analyse");
    expect(r.lines).toEqual([{ id: 'analyse', name: 'Yunary Analyse', caption: '50 analyses par mois', priceCents: 900 }]);
    expect([r.todayCents, r.next]).toEqual([900, { date: NEXT.date, cents: 900 }]);
  });
  it('aperçu pas encore lu : montants en attente (squelettes)', () => {
    const r = paymentRecap({ tools: ['analyse', 'audit'] }, CATALOG, undefined);
    expect(r.title).toBe("S'abonner à 2 outils");
    expect([r.todayCents, r.next]).toEqual([null, undefined]);
  });
  it('pack : le prix du catalogue, pas de prochain prélèvement', () => {
    const r = paymentRecap({ pack: 'analyse-20' }, CATALOG, undefined);
    expect([r.kind, r.title, r.todayCents, r.next]).toEqual(['pack', 'Acheter 20 analyses supplémentaires', 500, null]);
  });
  it('libellés : « Payer 9 € », « Puis le 1er de chaque mois »', () => {
    expect(payLabel(900)).toBe(`Payer ${formatEuros(900)}`);
    expect(payLabel(null)).toBe('Payer');
    expect(monthlyDay('2026-10-27T10:00:00Z')).toBe(27);
  });
  it('issue d’un abonnement : outils actifs, montant et échéance du serveur', () => {
    const recap = paymentRecap({ tools: ['analyse', 'audit'] }, CATALOG, PREVIEW);
    const o = paymentOutcome({ target: { tools: ['analyse', 'audit'] }, catalog: CATALOG, recap, paid: { amountCents: 1400, next: { date: NEXT.date, montant: 1400 } } });
    expect(o.variant).toBe('added');
    expect(o.subjects).toEqual(['Yunary Analyse', 'Yunary Audit']);
    expect(o.tools[1]).toEqual({ name: 'Yunary Audit', meta: '2 audits par mois · renouvelé le 27/10/2026', status: 'active' });
    expect([o.todayCents, o.next]).toEqual([1400, { cents: 1400, from: NEXT.date }]);
  });
  it('issue d’un pack : l’outil du pack, le nom du pack en légende', () => {
    const recap = paymentRecap({ pack: 'analyse-20' }, CATALOG, undefined);
    const o = paymentOutcome({ target: { pack: 'analyse-20' }, catalog: CATALOG, recap, paid: { amountCents: 500, next: null } });
    expect([o.subjects, o.tools, o.todayCents, o.next]).toEqual([['Yunary Analyse'], [{ name: 'Yunary Analyse', meta: '20 analyses supplémentaires', status: 'active' }], 500, null]);
  });
  it('pays : France présente, noms en français', () => {
    const list = countryOptions();
    expect(list.find(c => c.value === 'FR')?.label).toBe('France');
    expect(list.find(c => c.value === 'DE')?.label).toBe('Allemagne');
  });
});
