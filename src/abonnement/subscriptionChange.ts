import { fr } from '../i18n/fr';
import { formatEuros, formatDateNumerique, formatJourMois } from '../lib/format';
import type { ToolCatalog } from '../tools/useToolCatalog';
import type { ChangeSummaryView, ToolRowState, ToolSwitchRowView } from './ModifySubscriptionView';
import type { ResultToolView } from './SubscriptionResultView';

/* ═══════════════════════════════════════════════════════════════════════════════════════════════
   Le contrat du back (apps/supabase/PROJECT-CONTEXT.md § 8, 25/09/2026), aux noms EXACTS.
   ═══════════════════════════════════════════════════════════════════════════════════════════════ */

/** Le corps de `update-subscription` et de `preview-subscription-change` (10 outils au plus par liste). */
export interface SubscriptionChange {
  ajouter?: string[];
  retirer?: string[];
  garder?: string[];
}

/** Un outil de l'abonnement, vu par le back. */
export interface SubscriptionToolState {
  outil: string;
  nom: string;
  /** Retrait programmé au renouvellement (ou résiliation complète). */
  retraitProgramme: boolean;
}

/** L'abonnement tel que Stripe le voit (`preview.abonnement`, réponse de `update-subscription`). */
export interface SubscriptionSnapshot {
  statut: string;
  finPeriode: string | null;
  resiliation: boolean;
  outils: SubscriptionToolState[];
}

/** La carte enregistrée : celle de l'abonnement, sinon celle du client. */
export interface PreviewCard {
  marque: string;
  last4: string;
  expMois: number;
  expAnnee: number;
}

/** Une ligne de ce qui est facturé aujourd'hui : `du` / `au` = période couverte (ISO). */
export interface PreviewDetailLine {
  outil: string;
  libelle: string;
  montant: number;
  du: string;
  au: string;
}

/** `preview-subscription-change` → `data`. Montants en centimes. Rien n'est modifié. */
export interface SubscriptionPreview {
  /** Pas d'abonnement vivant : le premier abonnement passe par `create-checkout-session` (le `CheckoutModal`). */
  checkoutRequis: boolean;
  aPayerAujourdhui: number;
  detail: PreviewDetailLine[];
  /** `null` quand l'abonnement s'arrête à l'échéance. */
  prochainPrelevement: { date: string; montant: number } | null;
  carte: PreviewCard | null;
  fin: 'aucune' | 'schedule' | 'resiliation';
  /** `null` sans abonnement vivant. */
  abonnement: SubscriptionSnapshot | null;
}

/** `update-subscription` → `data` (succès). */
export interface SubscriptionUpdateResult {
  statut: string;
  finPeriode: string | null;
  resiliation: boolean;
  outils: SubscriptionToolState[];
  ajoutes: string[];
  montantPaye: number;
}

/* ═══════════════════════════════════════════════════════════════════════════════════════════════
   Le changement voulu, à partir des interrupteurs.
   ═══════════════════════════════════════════════════════════════════════════════════════════════ */

/** Les listes non vides seulement ; `null` = aucun changement. */
export function normalizeChange(change: SubscriptionChange): SubscriptionChange | null {
  const out: SubscriptionChange = {};
  if (change.ajouter?.length) out.ajouter = [...change.ajouter];
  if (change.retirer?.length) out.retirer = [...change.retirer];
  if (change.garder?.length) out.garder = [...change.garder];
  return out.ajouter || out.retirer || out.garder ? out : null;
}

/**
 * Ce que disent les interrupteurs : coché et pas souscrit = ajouter ; décoché et actif = retirer ; coché et en
 * cours de retrait = garder. Rien d'autre ne change.
 */
export function diffSelection(rows: Pick<ToolSwitchRowView, 'toolId' | 'state' | 'checked'>[]): SubscriptionChange | null {
  return normalizeChange({
    ajouter: rows.filter(r => r.checked && r.state === 'none').map(r => r.toolId),
    retirer: rows.filter(r => !r.checked && r.state === 'active').map(r => r.toolId),
    garder: rows.filter(r => r.checked && r.state === 'ending').map(r => r.toolId),
  });
}

/** Les retraits et « garder » d'un changement, sans les ajouts : la relance après une 3D Secure réussie. */
export function withoutAdditions(change: SubscriptionChange): SubscriptionChange | null {
  return normalizeChange({ retirer: change.retirer, garder: change.garder });
}

/* ═══════════════════════════════════════════════════════════════════════════════════════════════
   De l'aperçu aux vues. Aucun montant n'est calculé : ils viennent de l'aperçu.
   ═══════════════════════════════════════════════════════════════════════════════════════════════ */

function nameOf(catalog: ToolCatalog | undefined, toolId: string, snapshot?: SubscriptionSnapshot | null): string {
  return catalog?.tools.find(t => t.id === toolId)?.name ?? snapshot?.outils.find(o => o.outil === toolId)?.nom ?? toolId;
}

/** « Yunary Audit du 10/10 au 23/10 » : les lignes facturées aujourd'hui, au nom du catalogue. */
export function prorataDetail(detail: PreviewDetailLine[], catalog: ToolCatalog | undefined): string | null {
  const lines = detail.filter(l => l.montant > 0).map(l => fr.paiement.prorata(nameOf(catalog, l.outil) || l.libelle, formatJourMois(l.du), formatJourMois(l.au)));
  return lines.length ? lines.join(' · ') : null;
}

/**
 * « Yunary Analyse 9 € + Yunary Audit 5 € » : ce qui sera prélevé à la prochaine échéance. Les outils de l'abonnement
 * sans retrait programmé, plus ceux qu'on ajoute ou garde, moins ceux qu'on retire, au prix du catalogue. `null` si
 * un prix manque (jamais un chiffre inventé).
 */
export function nextChargeDetail(preview: SubscriptionPreview, change: SubscriptionChange, catalog: ToolCatalog | undefined): string | null {
  const kept = new Set((preview.abonnement?.outils ?? []).filter(o => !o.retraitProgramme).map(o => o.outil));
  (change.ajouter ?? []).forEach(t => kept.add(t));
  (change.garder ?? []).forEach(t => kept.add(t));
  (change.retirer ?? []).forEach(t => kept.delete(t));
  const parts: string[] = [];
  for (const id of kept) {
    const price = catalog?.tools.find(t => t.id === id)?.priceCents;
    if (price == null) return null;
    parts.push(`${nameOf(catalog, id, preview.abonnement)} ${formatEuros(price)}`);
  }
  return parts.length ? parts.join(' + ') : null;
}

/** Le récapitulatif de la grande modale, depuis l'aperçu et le changement voulu. */
export function summaryFromPreview(preview: SubscriptionPreview, change: SubscriptionChange, catalog: ToolCatalog | undefined): ChangeSummaryView {
  const finPeriode = preview.abonnement?.finPeriode ?? null;
  return {
    added: (change.ajouter ?? []).map(id => ({ name: nameOf(catalog, id, preview.abonnement), priceCents: catalog?.tools.find(t => t.id === id)?.priceCents ?? null })),
    removed: (change.retirer ?? []).map(id => ({ name: nameOf(catalog, id, preview.abonnement), until: finPeriode ?? '' })).filter(r => r.until),
    reactivated: (change.garder ?? []).map(id => nameOf(catalog, id, preview.abonnement)),
    todayCents: preview.aPayerAujourdhui,
    todayDetail: prorataDetail(preview.detail, catalog),
    nextCents: preview.prochainPrelevement?.montant ?? 0,
    nextFrom: preview.prochainPrelevement?.date ?? finPeriode,
  };
}

/** Le récapitulatif « aucun changement » : 0 € aujourd'hui, et ce qui est déjà prévu (montants facturés, lus en base). */
export function unchangedSummary(nextCents: number, nextFrom: string | null): ChangeSummaryView {
  return { added: [], removed: [], reactivated: [], todayCents: 0, nextCents, nextFrom };
}

/** Les montants de la petite modale « Activer », depuis l'aperçu. */
export function activateAmountsFromPreview(preview: SubscriptionPreview, toolId: string, catalog: ToolCatalog | undefined) {
  return {
    todayCents: preview.aPayerAujourdhui,
    todayDetail: prorataDetail(preview.detail, catalog),
    nextCents: preview.prochainPrelevement?.montant ?? 0,
    nextDate: preview.prochainPrelevement?.date ?? preview.abonnement?.finPeriode ?? new Date().toISOString(),
    nextDetail: nextChargeDetail(preview, { ajouter: [toolId] }, catalog),
  };
}

/** L'état d'un outil côté serveur pour la grande modale (droits en base + abonnement). */
export function rowState(opts: { subscribed: boolean; endsAtPeriodEnd: boolean; cancelAtPeriodEnd: boolean }): ToolRowState {
  if (!opts.subscribed) return 'none';
  return opts.endsAtPeriodEnd || opts.cancelAtPeriodEnd ? 'ending' : 'active';
}

/* ═══════════════════════════════════════════════════════════════════════════════════════════════
   L'orchestration : un appel, la 3D Secure, la relance sans les ajouts.
   ═══════════════════════════════════════════════════════════════════════════════════════════════ */

/** Ce que rend un appel à `update-subscription` : succès, ou le refus utile à la suite. */
export type UpdateCallResult =
  | { status: 'ok'; data: SubscriptionUpdateResult }
  | { status: 'requires_action'; clientSecret: string; invoiceId: string | null }
  | { status: 'card_declined'; declineCode: string | null };

/** L'issue d'un changement complet. */
export type ChangeRunResult =
  | { status: 'ok'; data: SubscriptionUpdateResult | null; paidCents: number; confirmedByBank: boolean }
  | { status: 'declined'; declineCode: string | null };

export interface ChangeRunDeps {
  update: (change: SubscriptionChange) => Promise<UpdateCallResult>;
  /** La 3D Secure (`stripe.confirmCardPayment(clientSecret)`) : `true` = paiement confirmé. */
  confirmPayment: (clientSecret: string) => Promise<boolean>;
  /** Prévenu quand la banque demande une validation (la vue passe en phase `bank`). */
  onBank?: () => void;
}

/**
 * 🔒 La règle du back (§ 8) : un appel qui combine ajout et retrait / garder n'applique RIEN tant que le paiement de
 * l'ajout n'est pas passé. Donc :
 * 1. un seul appel avec tout le changement ;
 * 2. `requires_action` → la 3D Secure ; confirmée → relance avec les SEULS retraits / garder (s'il y en a) ;
 *    abandonnée ou refusée → rien n'a changé, issue `declined` ;
 * 3. `card_declined` → rien n'a changé, issue `declined`.
 * Les autres refus (`past_due`, `no_subscription`…) lèvent depuis `update`.
 */
export async function runSubscriptionChange(change: SubscriptionChange, deps: ChangeRunDeps, expectedTodayCents = 0): Promise<ChangeRunResult> {
  const first = await deps.update(change);
  if (first.status === 'ok') return { status: 'ok', data: first.data, paidCents: first.data.montantPaye, confirmedByBank: false };
  if (first.status === 'card_declined') return { status: 'declined', declineCode: first.declineCode };
  deps.onBank?.();
  const confirmed = await deps.confirmPayment(first.clientSecret);
  if (!confirmed) return { status: 'declined', declineCode: null };
  const rest = withoutAdditions(change);
  if (!rest) return { status: 'ok', data: null, paidCents: expectedTodayCents, confirmedByBank: true };
  const second = await deps.update(rest);
  /* La relance ne porte ni ajout ni paiement : elle ne peut pas demander de 3DS. Un refus ici serait un défaut du back. */
  if (second.status !== 'ok') return { status: 'ok', data: null, paidCents: expectedTodayCents, confirmedByBank: true };
  return { status: 'ok', data: second.data, paidCents: expectedTodayCents, confirmedByBank: true };
}

/* ═══════════════════════════════════════════════════════════════════════════════════════════════
   L'écran de retour.
   ═══════════════════════════════════════════════════════════════════════════════════════════════ */

/** De quoi rendre `SubscriptionResultView` après un changement réussi (ou un échec de paiement). */
export interface SubscriptionChangeOutcome {
  variant: 'added' | 'removed' | 'failed';
  subjects: string[];
  tools: ResultToolView[];
  todayCents: number | null;
  next: { cents: number; from: string } | null;
  periodEnd: string | null;
}

export interface OutcomeInput {
  change: SubscriptionChange;
  preview: SubscriptionPreview;
  catalog: ToolCatalog | undefined;
  /** Les outils déjà souscrits et gardés tels quels (ni ajoutés, ni retirés, ni réactivés). */
  unchanged: string[];
  paidCents: number;
  /** Les unités restantes d'un outil retiré (« Encore 9 jusque-là »), lues dans les droits. */
  remaining?: Record<string, number | null>;
}

function quotaMeta(catalog: ToolCatalog | undefined, id: string, renewsOn: string | null): string {
  const quota = fr.tools.quotaPerMonth(catalog?.tools.find(t => t.id === id)?.monthlyQuota ?? null);
  return renewsOn ? `${quota} · ${fr.tools.renewsOn(formatDateNumerique(renewsOn)).toLowerCase()}` : quota;
}

/** L'écran de retour d'un changement réussi : ajout (même combiné à un retrait), retrait seul, ou « garder » seul. */
export function buildOutcome({ change, preview, catalog, unchanged, paidCents, remaining = {} }: OutcomeInput): SubscriptionChangeOutcome {
  const finPeriode = preview.abonnement?.finPeriode ?? preview.prochainPrelevement?.date ?? null;
  const renew = preview.prochainPrelevement?.date ?? finPeriode;
  const name = (id: string) => nameOf(catalog, id, preview.abonnement);
  const added = [...(change.ajouter ?? []), ...(change.garder ?? [])];
  const removed = change.retirer ?? [];
  const active = (id: string): ResultToolView => ({ name: name(id), meta: quotaMeta(catalog, id, renew), status: 'active' });
  const ending = (id: string): ResultToolView => {
    const left = remaining[id];
    return { name: name(id), meta: left != null ? fr.paiement.result.remainingUntil(left) : null, status: 'ending', endsOn: finPeriode };
  };
  const tools = [...added.map(active), ...unchanged.map(active), ...removed.map(ending)];
  const next = preview.prochainPrelevement ? { cents: preview.prochainPrelevement.montant, from: preview.prochainPrelevement.date } : null;
  if (added.length) return { variant: 'added', subjects: added.map(name), tools, todayCents: paidCents, next, periodEnd: finPeriode };
  return { variant: 'removed', subjects: removed.map(name), tools, todayCents: 0, next, periodEnd: finPeriode };
}
