import type { AccountView, Entitlement, EntitlementSummary, ShellNavItem, SubscriptionInfo, ToolCatalog, ToolRule, ToolRun } from '@yunary/shell';
import { summarizeEntitlements } from '@yunary/shell';
import { Icon } from '@yunary/ds';
import { ListChecks } from 'lucide-react';

/* Les données de la vitrine — la forme exacte de ce que les hooks rendent. Aucune n'est lue en base. */
export const ACCOUNT: AccountView = {
  name: 'Julien Fernandes',
  initials: 'JF',
  avatarUrl: null,
  planLabel: 'Gratuit',
};

export const ACCOUNT_SUBSCRIBED: AccountView = { ...ACCOUNT, planLabel: '2 outils · 14 €/mois' };

/* Le catalogue tel que `useToolCatalog` le lit (`tools`, `tool_packs`) — valeurs de la base au 23/09/2026 (catalogue Stripe test : audit 5 € / 2, analyse 9 € / 50, pack 5 €) ; les prix ne vivent que là. */
export const CATALOG: ToolCatalog = {
  tools: [
    { id: 'audit', name: 'Yunary Audit', description: 'Audit de ton compte à partir de ton identifiant : chiffres, verdicts, points forts et actions.', position: 1, monthlyQuota: 2, unitLabel: 'audit', unitLabelPlural: 'audits', priceCents: 500, isPublished: true, status: 'mvp' },
    { id: 'analyse', name: 'Yunary Analyse', description: "Analyse complète d'une vidéo (transcription, mécanismes, performance) et fiche rédigée.", position: 2, monthlyQuota: 50, unitLabel: 'analyse', unitLabelPlural: 'analyses', priceCents: 900, isPublished: true, status: 'mvp' },
    { id: 'script', name: 'Yunary Script', description: 'Du hook au script rédigé, étape par étape.', position: 3, monthlyQuota: null, unitLabel: 'script', unitLabelPlural: 'scripts', priceCents: null, isPublished: false, status: 'a_venir' },
    { id: 'programmation', name: 'Yunary Programmation', description: 'Programmation de tes publications sur tes réseaux.', position: 4, monthlyQuota: null, unitLabel: 'publication', unitLabelPlural: 'publications', priceCents: null, isPublished: false, status: 'a_venir' },
  ],
  packs: [
    { id: 'analyse-20', toolId: 'analyse', name: '20 analyses supplémentaires', units: 20, priceCents: 500, isPublished: true },
  ],
};

const NOW = '2026-09-23T10:00:00Z';
const PERIOD_END = '2026-10-23T10:00:00Z';

/* Les droits gratuits posés à l'inscription (`handle_new_user`) : 1 audit, 5 analyses, à vie. */
export const ENTITLEMENTS_FREE: Entitlement[] = [
  { id: 'e-free-audit', toolId: 'audit', source: 'free', status: 'active', quotaTotal: 1, quotaUsed: 1, periodStart: NOW, periodEnd: null, endsAtPeriodEnd: false },
  { id: 'e-free-analyse', toolId: 'analyse', source: 'free', status: 'active', quotaTotal: 5, quotaUsed: 2, periodStart: NOW, periodEnd: null, endsAtPeriodEnd: false },
];

/* Abonné à Analyse : le droit d'abonnement passe devant le gratuit (l'ordre du serveur : subscription → pack → free). */
export const ENTITLEMENTS_SUBSCRIBED: Entitlement[] = [
  ...ENTITLEMENTS_FREE,
  { id: 'e-sub-analyse', toolId: 'analyse', source: 'subscription', status: 'active', quotaTotal: 50, quotaUsed: 12, periodStart: NOW, periodEnd: PERIOD_END, endsAtPeriodEnd: false },
];

/* Abonnement épuisé + pack : le résumé montre le pack (celui que le serveur consommerait). */
export const ENTITLEMENTS_WITH_PACK: Entitlement[] = [
  ...ENTITLEMENTS_FREE,
  { id: 'e-sub-analyse', toolId: 'analyse', source: 'subscription', status: 'active', quotaTotal: 50, quotaUsed: 50, periodStart: NOW, periodEnd: PERIOD_END, endsAtPeriodEnd: false },
  { id: 'e-pack-analyse', toolId: 'analyse', source: 'pack', status: 'active', quotaTotal: 20, quotaUsed: 3, periodStart: NOW, periodEnd: null, endsAtPeriodEnd: false },
];

/* Outil retiré, gardé jusqu'à la fin de la période (`ends_at_period_end`, colonne à venir côté back). */
export const ENTITLEMENTS_ENDING: Entitlement[] = [
  ...ENTITLEMENTS_FREE,
  { id: 'e-sub-analyse', toolId: 'analyse', source: 'subscription', status: 'active', quotaTotal: 50, quotaUsed: 31, periodStart: NOW, periodEnd: PERIOD_END, endsAtPeriodEnd: true },
];

const FIXED_NOW = new Date(NOW).getTime();
export const SUMMARIES_FREE: EntitlementSummary[] = summarizeEntitlements(ENTITLEMENTS_FREE, FIXED_NOW);
export const SUMMARIES_SUBSCRIBED: EntitlementSummary[] = summarizeEntitlements(ENTITLEMENTS_SUBSCRIBED, FIXED_NOW);
export const SUMMARIES_WITH_PACK: EntitlementSummary[] = summarizeEntitlements(ENTITLEMENTS_WITH_PACK, FIXED_NOW);
export const SUMMARIES_ENDING: EntitlementSummary[] = summarizeEntitlements(ENTITLEMENTS_ENDING, FIXED_NOW);

/* La ligne `subscriptions` — un abonnement par client ; les outils sont ses articles. */
export const SUB_ACTIVE: SubscriptionInfo = { status: 'active', currentPeriodEnd: PERIOD_END, cancelAtPeriodEnd: false };
export const SUB_ENDING: SubscriptionInfo = { ...SUB_ACTIVE, cancelAtPeriodEnd: true };
export const SUB_PAST_DUE: SubscriptionInfo = { ...SUB_ACTIVE, status: 'past_due' };

/* Les règles personnelles (`user_tool_rules`) : par outil, ou par étape. */
export const RULES: ToolRule[] = [
  { id: 'r1', toolId: 'analyse', stepKey: null, text: 'Tutoie-moi, phrases courtes, jamais de jargon marketing.', createdAt: NOW, updatedAt: NOW },
  { id: 'r2', toolId: 'analyse', stepKey: 'transposition', text: 'Propose toujours une transposition pour ma niche : la cuisine végétale.', createdAt: NOW, updatedAt: NOW },
  { id: 'r3', toolId: 'audit', stepKey: null, text: "Ne compare jamais mes chiffres à des comptes de divertissement.", createdAt: NOW, updatedAt: NOW },
];

/* L'historique (`tool_runs`), plus récent d'abord. */
export const RUNS: ToolRun[] = [
  { id: 'run-3', toolId: 'analyse', status: 'en_cours', currentStepKey: 'mecanismes', data: { url: 'https://www.instagram.com/reel/abc' }, refId: 'v-3', startedAt: '2026-09-23T09:40:00Z', updatedAt: '2026-09-23T09:52:00Z', finishedAt: null },
  { id: 'run-2', toolId: 'analyse', status: 'termine', currentStepKey: 'transposition', data: { url: 'https://www.tiktok.com/@x/video/1' }, refId: 'v-2', startedAt: '2026-09-22T18:00:00Z', updatedAt: '2026-09-22T18:20:00Z', finishedAt: '2026-09-22T18:20:00Z' },
  { id: 'run-1', toolId: 'audit', status: 'erreur', currentStepKey: 'collecte', data: {}, refId: null, startedAt: '2026-09-21T08:00:00Z', updatedAt: '2026-09-21T08:03:00Z', finishedAt: '2026-09-21T08:03:00Z' },
];

/* La nav du hub telle que l'app la passe — rien de propre au hub dans la coque. */
export const HUB_ITEMS: ShellNavItem[] = [
  { label: 'Mes règles', href: '/regles', icon: <Icon glyph={ListChecks} /> },
  { label: 'Historique', href: '/historique', icon: <Icon name="clock" /> },
];
