import { fr } from '../i18n/fr';
import type { EdgeResult } from '../lib/edge';
import { formatEuros } from '../lib/format';
import { formatQuotaParMois } from '../lib/quantity';
import { packByIdIn, toolByIdIn, type ToolCatalog } from '../tools/useToolCatalog';
import { quotaMeta, type SubscriptionChangeOutcome, type SubscriptionPreview } from './subscriptionChange';

/*
 * La fenêtre de paiement intégrée (0.5.0) — la LOGIQUE PURE, testée : ce qu'on achète, la facturation saisie,
 * le corps de `create-payment`, l'orchestration « créer au clic → confirmer la carte → 3D Secure → refus et
 * réessai sur le même paiement », et l'issue rendue à l'écran de retour. 🔒 Aucun montant calculé ici : les
 * montants viennent de la base (catalogue), de l'aperçu `preview-subscription-change`, puis de `create-payment`.
 */

/** Ce qu'on achète : `{ tool }`, `{ tools }` (articles d'abonnement) ou `{ pack }` (achat unique). */
export type PaymentTarget =
  | { tool: string; tools?: undefined; pack?: undefined }
  | { tools: string[]; tool?: undefined; pack?: undefined }
  | { pack: string; tool?: undefined; tools?: undefined };

/** Les outils d'une cible, dans l'ordre demandé (vide pour un pack). */
export function paymentTools(target: PaymentTarget): string[] {
  if (target.tools) return target.tools;
  if (target.tool) return [target.tool];
  return [];
}

/** La page des CGV, sur le site vitrine (lien de la mention sous « Payer »). */
export const CGV_URL = 'https://yunary.com/cgv';

/** La version du texte de consentement affiché, envoyée avec `cguAcceptees` : le back enregistre la même phrase. */
export const CGU_VERSIONS = { abonnement: 'abonnement-v2', pack: 'pack-v2' } as const;

export function consentKind(target: PaymentTarget): 'abonnement' | 'pack' {
  return target.pack ? 'pack' : 'abonnement';
}

// ───────── Facturation ─────────

/** Ce que la personne saisit sous la carte. `country` = code ISO 2 (« FR »). */
export interface BillingForm {
  name: string;
  country: string;
  withAddress: boolean;
  company: string;
  line1: string;
  postalCode: string;
  city: string;
}

export const EMPTY_BILLING: BillingForm = { name: '', country: 'FR', withAddress: false, company: '', line1: '', postalCode: '', city: '' };

/** `create-payment` → `facturation`, à plat : le pays seul est obligatoire ; ligne1 + codePostal + ville ensemble. */
export interface Facturation {
  pays: string;
  nom?: string;
  entreprise?: string;
  ligne1?: string;
  codePostal?: string;
  ville?: string;
}

export type BillingField = 'name' | 'country' | 'line1' | 'postalCode' | 'city';
export type CardField = 'number' | 'expiry' | 'cvc';
export type FieldErrors = Partial<Record<BillingField | CardField, string>>;

/**
 * La facturation saisie → le corps attendu par le back, ou les erreurs par champ. Le nom sur la carte et le pays
 * sont obligatoires ; l'adresse est facultative : case décochée (ou les trois champs vides) = pas d'adresse, un
 * champ rempli = les trois attendus. L'entreprise n'est envoyée qu'avec la case cochée.
 */
export function validateBilling(form: BillingForm): { ok: true; facturation: Facturation } | { ok: false; errors: FieldErrors } {
  const e = fr.paiement.form.errors;
  const errors: FieldErrors = {};
  const name = form.name.trim();
  const country = form.country.trim().toUpperCase();
  if (!name) errors.name = e.name;
  if (!/^[A-Z]{2}$/.test(country)) errors.country = e.country;
  const facturation: Facturation = { pays: country, ...(name ? { nom: name } : {}) };
  if (form.withAddress) {
    const company = form.company.trim();
    const parts = { line1: form.line1.trim(), postalCode: form.postalCode.trim(), city: form.city.trim() };
    const filled = Object.values(parts).filter(Boolean).length;
    if (filled > 0 && filled < 3) {
      if (!parts.line1) errors.line1 = e.line1;
      if (!parts.postalCode) errors.postalCode = e.postalCode;
      if (!parts.city) errors.city = e.city;
    }
    if (company) facturation.entreprise = company;
    if (filled === 3) Object.assign(facturation, { ligne1: parts.line1, codePostal: parts.postalCode, ville: parts.city });
  }
  return Object.keys(errors).length ? { ok: false, errors } : { ok: true, facturation };
}

/** Les coordonnées passées à Stripe avec la carte (`billing_details`), tirées de la facturation validée. */
export function billingDetails(f: Facturation): { name?: string; address: { country: string; line1?: string; postal_code?: string; city?: string } } {
  return {
    ...(f.nom ? { name: f.nom } : {}),
    address: { country: f.pays, ...(f.ligne1 ? { line1: f.ligne1, postal_code: f.codePostal, city: f.ville } : {}) },
  };
}

/** Le corps de `create-payment`, envoyé au clic sur « Payer » : c'est ce clic qui vaut acceptation des CGV. */
export function paymentBody(target: PaymentTarget, facturation: Facturation): Record<string, unknown> {
  const what = target.pack ? { pack: target.pack } : target.tools ? { tools: target.tools } : { tool: target.tool };
  return { ...what, cguAcceptees: true, cguVersion: CGU_VERSIONS[consentKind(target)], facturation };
}

// ───────── Erreurs de carte ─────────

/** L'état d'un champ Stripe, tel que ses événements `change` le donnent. */
export interface CardFieldState {
  complete: boolean;
  empty: boolean;
  /** `event.error.code` : `incomplete_number`, `invalid_expiry_year_past`… */
  errorCode?: string | null;
}

const FIELD_OF_CODE: Record<string, CardField> = {
  incomplete_number: 'number', invalid_number: 'number', incorrect_number: 'number',
  incomplete_expiry: 'expiry', invalid_expiry_year_past: 'expiry', invalid_expiry_month_past: 'expiry',
  invalid_expiry_year: 'expiry', invalid_expiry_month: 'expiry', expired_card: 'expiry',
  incomplete_cvc: 'cvc', invalid_cvc: 'cvc', incorrect_cvc: 'cvc',
};

/** Le champ qu'un code d'erreur Stripe concerne ; un refus de la banque tombe sous le numéro de carte. */
export function cardFieldOfCode(code: string | null | undefined): CardField {
  return (code && FIELD_OF_CODE[code]) || 'number';
}

/**
 * La phrase d'une erreur de carte. Jamais le message de Stripe tel quel : il vouvoie, Yunary tutoie. Tout ce qui
 * n'est pas une erreur de saisie (refus, fonds insuffisants, carte perdue…) dit le refus de la maquette.
 */
export function cardErrorMessage(code: string | null | undefined): string {
  const e = fr.paiement.form.errors;
  switch (code) {
    case 'incomplete_number': return e.numberIncomplete;
    case 'invalid_number':
    case 'incorrect_number': return e.numberInvalid;
    case 'incomplete_expiry': return e.expiryIncomplete;
    case 'invalid_expiry_year_past':
    case 'invalid_expiry_month_past':
    case 'expired_card': return e.expiryPast;
    case 'invalid_expiry_year':
    case 'invalid_expiry_month': return e.expiryInvalid;
    case 'incomplete_cvc': return e.cvcIncomplete;
    case 'invalid_cvc':
    case 'incorrect_cvc': return e.cvcInvalid;
    default: return e.declined;
  }
}

const INCOMPLETE: Record<CardField, string> = { number: 'incomplete_number', expiry: 'incomplete_expiry', cvc: 'incomplete_cvc' };

/** Les erreurs des trois champs carte avant tout appel : une erreur signalée par Stripe, ou un champ incomplet. */
export function cardErrors(state: Record<CardField, CardFieldState>): FieldErrors {
  const errors: FieldErrors = {};
  for (const f of ['number', 'expiry', 'cvc'] as const) {
    const s = state[f];
    if (s.errorCode) errors[f] = cardErrorMessage(s.errorCode);
    else if (!s.complete) errors[f] = cardErrorMessage(INCOMPLETE[f]);
  }
  return errors;
}

// ───────── create-payment ─────────

/** `create-payment` → `data`. */
export type CreatePaymentData =
  /** Abonnement vivant : les outils sont ajoutés au prorata par le module de l'Abonnement v2, rien à confirmer. */
  | { mode: 'added'; tools: string[]; tool?: string; amountCents: number }
  /** À confirmer par la carte saisie. Les droits sont posés par le webhook une fois le paiement confirmé. */
  | {
    mode: 'payment';
    clientSecret: string;
    amountCents: number;
    tools?: string[];
    tool?: string;
    pack?: string;
    prochainPrelevement: { date: string; montant: number } | null;
    reutilise: boolean;
    retour: string;
  };

export type PaymentIntentData = Extract<CreatePaymentData, { mode: 'payment' }>;

/** La phrase d'un refus de `create-payment` (« message clair + réessayer » : le bouton « Payer » reste le geste). */
export function serverErrorMessage(code: string | null): string {
  const e = fr.paiement.form.errors;
  switch (code) {
    case 'already_subscribed': return fr.errors.tools.alreadySubscribed;
    case 'not_published': return fr.errors.tools.notPublished;
    case 'rate_limited': return fr.errors.rateLimit;
    case 'cgu_required': return e.cguRequired;
    case 'invalid_input': return e.invalidInput;
    case 'stripe_error': return e.stripe;
    case 'unauthorized': return fr.errors.auth.sessionExpired;
    case 'card_declined': return e.declined;
    default: return e.prepare;
  }
}

/** Le résultat de `stripe.confirmCardPayment`, réduit à ce que l'orchestration regarde. */
export type ConfirmCardResult =
  | { status: 'succeeded' }
  | { status: 'processing' }
  | { status: 'requires_action' }
  | { status: 'failed'; type: 'card_error' | 'validation_error' | 'other'; code: string | null };

/** Un paiement créé et gardé pour un réessai : même facturation = même paiement, sans rappeler le serveur. */
export interface PaymentAttempt {
  key: string;
  data: PaymentIntentData;
}

export type PaymentRunResult =
  /** Payé : `amountCents` = ce que le serveur a facturé, `next` = son prochain prélèvement (abonnement). */
  | { status: 'paid'; amountCents: number | null; next: { date: string; montant: number } | null }
  /** Paiement en cours de validation (`payment_processing`, ou un paiement `processing`) : attendre les droits, ne rien repayer. */
  | { status: 'processing' }
  /** La carte est refusée, ou une saisie est fausse : l'erreur sous son champ ; `attempt` sert au réessai. */
  | { status: 'declined'; field: CardField; message: string; attempt: PaymentAttempt | null }
  /** Refus du serveur ou panne : un message au-dessus de « Payer », et on repart de zéro au prochain clic. */
  | { status: 'refused'; code: string | null; message: string };

export interface PaymentRunDeps {
  create: (body: Record<string, unknown>) => Promise<EdgeResult<CreatePaymentData>>;
  /** `stripe.confirmCardPayment(clientSecret, { payment_method: { card, billing_details } }, { handleActions: false })`. */
  confirmCard: (clientSecret: string) => Promise<ConfirmCardResult>;
  /** La 3D Secure : `stripe.confirmCardPayment(clientSecret)`, fenêtre de la banque par-dessus la page. */
  confirmBank: (clientSecret: string) => Promise<boolean>;
  onBank?: () => void;
}

/**
 * Un clic sur « Payer ». Le paiement est créé À CE MOMENT (le clic vaut acceptation des CGV) ; après un refus de
 * carte, un nouveau clic avec la même facturation réessaie LE MÊME paiement (`attempt`). Si la facturation a
 * changé, le serveur est rappelé : il reprend le paiement incomplet (`reutilise`).
 */
export async function runPayment(body: Record<string, unknown>, attempt: PaymentAttempt | null, deps: PaymentRunDeps): Promise<PaymentRunResult> {
  const key = JSON.stringify(body);
  let data: PaymentIntentData;
  if (attempt && attempt.key === key) {
    data = attempt.data;
  } else {
    const res = await deps.create(body);
    if (!res.ok) {
      if (res.code === 'payment_processing') return { status: 'processing' };
      /* Abonnement vivant (mode ajout) : la carte enregistrée demande une 3D Secure. */
      const secret = typeof res.data?.clientSecret === 'string' ? res.data.clientSecret : null;
      if (res.code === 'requires_action' && secret) {
        deps.onBank?.();
        return (await deps.confirmBank(secret))
          ? { status: 'paid', amountCents: null, next: null }
          : { status: 'declined', field: 'number', message: fr.paiement.form.errors.declined, attempt: null };
      }
      if (res.code === 'card_declined') return { status: 'declined', field: 'number', message: fr.paiement.form.errors.declined, attempt: null };
      return { status: 'refused', code: res.code, message: serverErrorMessage(res.code) };
    }
    if (res.data.mode === 'added') return { status: 'paid', amountCents: res.data.amountCents, next: null };
    data = res.data;
  }
  const kept: PaymentAttempt = { key, data };
  const paid: PaymentRunResult = { status: 'paid', amountCents: data.amountCents, next: data.prochainPrelevement };
  const c = await deps.confirmCard(data.clientSecret);
  if (c.status === 'succeeded') return paid;
  if (c.status === 'processing') return { status: 'processing' };
  if (c.status === 'requires_action') {
    deps.onBank?.();
    return (await deps.confirmBank(data.clientSecret))
      ? paid
      : { status: 'declined', field: 'number', message: fr.paiement.form.errors.declined, attempt: kept };
  }
  if (c.type === 'other') return { status: 'refused', code: c.code, message: fr.paiement.form.errors.failed };
  return { status: 'declined', field: cardFieldOfCode(c.code), message: cardErrorMessage(c.code), attempt: kept };
}

// ───────── Récap et issue ─────────

export interface PaymentRecapLine {
  id: string;
  name: string;
  /** « 50 analyses par mois » ; pour un pack, son nom. */
  caption: string | null;
  priceCents: number | null;
}

/** Ce que dit la colonne de gauche (le haut de la page sur mobile). `undefined` = pas encore lu (squelette). */
export interface PaymentRecap {
  kind: 'abonnement' | 'pack';
  title: string;
  subtitle: string;
  lines: PaymentRecapLine[];
  todayCents: number | null;
  /** `null` = pas de prochain prélèvement (pack) · `undefined` = pas encore lu. */
  next: { date: string; cents: number } | null | undefined;
}

/**
 * Le récap : noms, quotas et prix du catalogue ; « À payer aujourd'hui » et « Prochain prélèvement » lus dans
 * l'aperçu du back (abonnement), le prix du pack dans le catalogue.
 */
export function paymentRecap(target: PaymentTarget, catalog: ToolCatalog | undefined, preview: SubscriptionPreview | undefined): PaymentRecap {
  const t = fr.paiement.form;
  if (target.pack) {
    const pack = packByIdIn(catalog, target.pack);
    const tool = toolByIdIn(catalog, pack?.toolId);
    const price = pack?.priceCents ?? null;
    return {
      kind: 'pack',
      title: t.titlePack(pack?.name ?? target.pack),
      subtitle: t.subtitlePack,
      lines: [{ id: target.pack, name: tool?.name ?? pack?.toolId ?? target.pack, caption: pack?.name ?? null, priceCents: price }],
      todayCents: price,
      next: null,
    };
  }
  const ids = paymentTools(target);
  const lines = ids.map(id => {
    const tool = toolByIdIn(catalog, id);
    return { id, name: tool?.name ?? id, caption: tool ? formatQuotaParMois(tool) : null, priceCents: tool?.priceCents ?? null };
  });
  const p = preview?.prochainPrelevement;
  return {
    kind: 'abonnement',
    title: lines.length > 1 ? t.titleMany(lines.length) : t.titleOne(lines[0]?.name ?? ''),
    subtitle: t.subtitle,
    lines,
    todayCents: preview ? preview.aPayerAujourdhui : null,
    next: preview ? (p ? { date: p.date, cents: p.montant } : null) : undefined,
  };
}

/** « Puis le 27 de chaque mois » : le jour de l'échéance, lu comme la date affichée à côté. */
export function monthlyDay(iso: string): number {
  return new Date(iso).getDate();
}

/** Le libellé du bouton : « Payer 9 € », ou « Payer » tant que le montant n'est pas lu. */
export function payLabel(cents: number | null): string {
  return cents === null ? fr.paiement.pay('').trim() : fr.paiement.pay(formatEuros(cents));
}

/**
 * L'écran de retour d'un paiement réussi (`SubscriptionResultScreen`, variante « ajout ») : les outils achetés,
 * actifs, avec leur quota ; le montant payé et le prochain prélèvement du serveur (repli : l'aperçu). Pour un
 * pack : l'outil du pack, actif, avec le nom du pack en légende.
 */
export function paymentOutcome({ target, catalog, recap, paid }: {
  target: PaymentTarget;
  catalog: ToolCatalog | undefined;
  recap: PaymentRecap;
  paid: { amountCents: number | null; next: { date: string; montant: number } | null } | null;
}): SubscriptionChangeOutcome {
  const next = paid?.next
    ? { cents: paid.next.montant, from: paid.next.date }
    : recap.next ? { cents: recap.next.cents, from: recap.next.date } : null;
  const todayCents = paid?.amountCents ?? recap.todayCents;
  if (target.pack) {
    const pack = packByIdIn(catalog, target.pack);
    const name = toolByIdIn(catalog, pack?.toolId)?.name ?? pack?.toolId ?? target.pack;
    return { variant: 'added', subjects: [name], tools: [{ name, meta: pack?.name ?? null, status: 'active' }], todayCents, next: null, periodEnd: null };
  }
  const ids = paymentTools(target);
  const name = (id: string) => toolByIdIn(catalog, id)?.name ?? id;
  return {
    variant: 'added',
    subjects: ids.map(name),
    tools: ids.map(id => ({ name: name(id), meta: quotaMeta(catalog, id, next?.from ?? null), status: 'active' as const })),
    todayCents,
    next,
    periodEnd: next?.from ?? null,
  };
}

// ───────── Pays ─────────

/* Les codes ISO 3166-1 alpha-2 ; les noms viennent du navigateur, en français (`Intl.DisplayNames`). */
const ISO_REGIONS = (
  'AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ CA CC CD CF CG CH '
  + 'CI CK CL CM CN CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR GA GB GD GE GF GG GH GI GL GM '
  + 'GN GP GQ GR GS GT GU GW GY HK HM HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO JP KE KG KH KI KM KN KP KR KW KY KZ LA LB '
  + 'LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP NR '
  + 'NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX '
  + 'SY SZ TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ UA UG UM US UY UZ VA VC VE VG VI VN VU WF WS YE YT ZA ZM ZW'
).split(' ');

let countries: { value: string; label: string }[] | null = null;

/** La liste du champ Pays, triée à la française. */
export function countryOptions(): { value: string; label: string }[] {
  if (!countries) {
    const names = new Intl.DisplayNames(['fr'], { type: 'region' });
    countries = ISO_REGIONS
      .map(code => ({ value: code, label: names.of(code) ?? code }))
      .sort((a, b) => a.label.localeCompare(b.label, 'fr'));
  }
  return countries;
}
