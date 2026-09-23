import { useQuery } from '@tanstack/react-query';
import { getSupabase } from '../lib/supabase';
import { useAuth } from '../auth/useAuth';
import type { EntitlementSource } from './useEntitlements';

/** `reason` de `can_use` — `ok` ou le code du refus, le même que celui des Edge. */
export type CanUseReason = 'ok' | 'not_subscribed' | 'quota_exhausted' | 'unknown_tool' | 'unauthorized';

export interface CanUseResult {
  allowed: boolean;
  reason: CanUseReason;
  /** Le droit qui serait consommé — `null` sur refus. */
  source: EntitlementSource | null;
  /** Unités restantes — `null` = sans quota (ou refus). */
  remaining: number | null;
  /** `https://yunary.com/outils?ajouter=<outil>` sur `not_subscribed` / `quota_exhausted`, sinon `null`. */
  link: string | null;
}

export const canUseKey = (userId: string | undefined, tool: string) => ['can-use', userId, tool] as const;

function parseCanUse(raw: unknown): CanUseResult {
  const v = (raw && typeof raw === 'object' ? raw : {}) as Partial<Record<keyof CanUseResult, unknown>>;
  const reason = typeof v.reason === 'string' ? (v.reason as CanUseReason) : 'unauthorized';
  const source = v.source === 'free' || v.source === 'subscription' || v.source === 'pack' ? v.source : null;
  return {
    allowed: v.allowed === true,
    reason,
    source,
    remaining: typeof v.remaining === 'number' ? v.remaining : null,
    link: typeof v.link === 'string' ? v.link : null,
  };
}

/**
 * 🔒 `select can_use(tool)` — la SEULE source de vérité d'accès, lue avec le jeton de l'utilisateur.
 * Lecture seule : ne débite jamais (le débit n'existe que dans les Edge). Cache court : le quota
 * bouge à chaque action.
 */
export function useCanUse(tool: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: canUseKey(user?.id, tool),
    enabled: !!user && !!tool,
    staleTime: 15 * 1000,
    queryFn: async (): Promise<CanUseResult> => {
      const { data, error } = await getSupabase().rpc('can_use', { p_tool: tool });
      if (error) throw error;
      return parseCanUse(data);
    },
  });
}
