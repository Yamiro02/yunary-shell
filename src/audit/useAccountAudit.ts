import { useQuery } from '@tanstack/react-query';
import { getSupabase } from '../lib/supabase';
import { useAuth } from '../auth/useAuth';
import { parseAccountAudit, type AccountAuditRow, type ParsedAccountAudit } from './types';

export const accountAuditKey = (userId: string | undefined) => ['account-audit', userId] as const;

/* Cadence de polling pendant l'onboarding, le temps que l'audit atterrisse. */
const POLL_MS = 4_000;

/**
 * Le DERNIER audit du user — la table est append-only, on lit toujours la ligne la plus
 * récente. Avec `poll`, on re-interroge tant qu'aucune ligne n'existe ; dès qu'elle est là,
 * le polling s'arrête tout seul : le snapshot est figé.
 */
export function useAccountAudit({ poll = false }: { poll?: boolean } = {}) {
  const { user } = useAuth();
  return useQuery({
    queryKey: accountAuditKey(user?.id),
    enabled: !!user?.id,
    refetchInterval: query => (poll && !query.state.data ? POLL_MS : false),
    queryFn: async (): Promise<ParsedAccountAudit | null> => {
      const { data, error } = await getSupabase()
        .from('account_audits')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle<AccountAuditRow>();
      if (error) throw error;
      return data ? parseAccountAudit(data) : null;
    },
  });
}
