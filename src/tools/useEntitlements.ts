import { useQuery } from '@tanstack/react-query';
import { getSupabase } from '../lib/supabase';
import { useAuth } from '../auth/useAuth';

/** `tool_entitlements.source` — dans l'ordre où le serveur les consomme. */
export type EntitlementSource = 'free' | 'subscription' | 'pack';
export type EntitlementStatus = 'active' | 'canceled' | 'expired';

/** Une ligne `tool_entitlements` de l'utilisateur (RLS : les siennes). */
export interface Entitlement {
  id: string;
  toolId: string;
  source: EntitlementSource;
  status: EntitlementStatus;
  /** `null` = sans quota. */
  quotaTotal: number | null;
  quotaUsed: number;
  periodStart: string;
  /** `null` = à vie (gratuit, pack). */
  periodEnd: string | null;
  /**
   * Droit d'abonnement retiré, gardé jusqu'à la fin de la période (colonne `ends_at_period_end`,
   * à venir côté back) — `false` tant que la colonne n'existe pas. Affiché « Se termine le … ».
   */
  endsAtPeriodEnd: boolean;
}

/**
 * Le résumé d'un outil pour l'affichage : LE droit que le serveur utiliserait (`can_use_for` :
 * `subscription` → `pack` → `free`, actif, en période, non épuisé), sinon le premier droit actif
 * dans le même ordre (pour montrer « 5 / 5 » plutôt que rien).
 */
export interface EntitlementSummary {
  toolId: string;
  source: EntitlementSource;
  status: EntitlementStatus;
  used: number;
  /** `null` = sans limite. */
  total: number | null;
  /** `null` = sans limite. */
  remaining: number | null;
  periodEnd: string | null;
  endsAtPeriodEnd: boolean;
  /** Il reste au moins une unité (ou pas de quota) : ce que `can_use` répondrait, sans l'appeler. */
  usable: boolean;
}

export interface EntitlementsInfo {
  rows: Entitlement[];
  /** Un résumé par outil qui a au moins un droit actif, dans l'ordre des lignes. */
  summaries: EntitlementSummary[];
}

export const entitlementsKey = (userId: string | undefined) => ['entitlements', userId] as const;

const SOURCE_ORDER: Record<EntitlementSource, number> = { subscription: 0, pack: 1, free: 2 };

function parseSource(raw: string): EntitlementSource {
  return raw === 'subscription' || raw === 'pack' ? raw : 'free';
}

function parseStatus(raw: string): EntitlementStatus {
  return raw === 'canceled' || raw === 'expired' ? raw : 'active';
}

/** Actif, en période, et il reste du quota (ou pas de quota) — la règle de `can_use_for`, côté lecture. */
export function isEntitlementUsable(row: Entitlement, now: number = Date.now()): boolean {
  if (row.status !== 'active') return false;
  if (row.periodEnd && new Date(row.periodEnd).getTime() < now) return false;
  return row.quotaTotal === null || row.quotaUsed < row.quotaTotal;
}

function inPeriod(row: Entitlement, now: number): boolean {
  return row.status === 'active' && (!row.periodEnd || new Date(row.periodEnd).getTime() >= now);
}

export function summarize(row: Entitlement, now: number = Date.now()): EntitlementSummary {
  const remaining = row.quotaTotal === null ? null : Math.max(0, row.quotaTotal - row.quotaUsed);
  return {
    toolId: row.toolId, source: row.source, status: row.status, used: row.quotaUsed, total: row.quotaTotal, remaining,
    periodEnd: row.periodEnd, endsAtPeriodEnd: row.endsAtPeriodEnd, usable: isEntitlementUsable(row, now),
  };
}

/** Les résumés par outil à partir des lignes — exporté pour la démo et les tests, `useEntitlements` l'applique. */
export function summarizeEntitlements(rows: Entitlement[], now: number = Date.now()): EntitlementSummary[] {
  const byTool = new Map<string, Entitlement[]>();
  rows.forEach(row => byTool.set(row.toolId, [...(byTool.get(row.toolId) ?? []), row]));
  const summaries: EntitlementSummary[] = [];
  byTool.forEach((list, toolId) => {
    const active = list.filter(r => inPeriod(r, now)).sort((a, b) => SOURCE_ORDER[a.source] - SOURCE_ORDER[b.source]);
    const chosen = active.find(r => isEntitlementUsable(r, now)) ?? active[0];
    if (chosen) summaries.push({ ...summarize(chosen, now), toolId });
  });
  return summaries;
}

/**
 * Les droits de l'utilisateur (`tool_entitlements`, RLS owner) + un résumé par outil. Ce que
 * l'onglet Abonnement affiche ; la vérité d'accès reste `can_use` (serveur) — ici on montre, on
 * ne décide pas. La colonne `ends_at_period_end` est lue si elle existe (`select *`), sinon `false`.
 */
export function useEntitlements() {
  const { user } = useAuth();
  return useQuery({
    queryKey: entitlementsKey(user?.id),
    enabled: !!user,
    queryFn: async (): Promise<EntitlementsInfo> => {
      const { data, error } = await getSupabase().from('tool_entitlements').select('*').eq('user_id', user!.id).order('created_at');
      if (error) throw error;
      const rows: Entitlement[] = data.map(row => ({
        id: row.id, toolId: row.tool_id, source: parseSource(row.source), status: parseStatus(row.status),
        quotaTotal: row.quota_total, quotaUsed: row.quota_used, periodStart: row.period_start, periodEnd: row.period_end,
        endsAtPeriodEnd: (row as { ends_at_period_end?: boolean | null }).ends_at_period_end === true,
      }));
      return { rows, summaries: summarizeEntitlements(rows) };
    },
  });
}
