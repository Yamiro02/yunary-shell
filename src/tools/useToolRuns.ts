import { useQuery } from '@tanstack/react-query';
import { getSupabase } from '../lib/supabase';
import { useAuth } from '../auth/useAuth';
import type { Json } from '../integrations/supabase/types';

/** `tool_runs.status`. */
export type ToolRunStatus = 'en_cours' | 'termine' | 'abandonne' | 'erreur';

/** Une exécution d'outil (`tool_runs`) — l'historique du hub ; dans Claude, on le demande en langage naturel. */
export interface ToolRun {
  id: string;
  toolId: string;
  status: ToolRunStatus;
  /** L'étape courante (`method_steps.step_key`) — `null` avant la première. */
  currentStepKey: string | null;
  /** Les informations collectées par l'outil (objet libre, propre à chaque outil). */
  data: Record<string, Json | undefined>;
  /** L'objet produit (`videos.id`, `account_audits.id`…), sans FK. */
  refId: string | null;
  startedAt: string;
  updatedAt: string;
  finishedAt: string | null;
}

export const toolRunsKey = (userId: string | undefined, tool?: string, limit?: number) => ['tool-runs', userId, tool ?? 'all', limit ?? 0] as const;

function parseStatus(raw: string): ToolRunStatus {
  return raw === 'termine' || raw === 'abandonne' || raw === 'erreur' ? raw : 'en_cours';
}

/** Les exécutions de l'utilisateur (RLS owner), les plus récentes d'abord ; `tool` filtre, `limit` borne (50). */
export function useToolRuns({ tool, limit = 50 }: { tool?: string; limit?: number } = {}) {
  const { user } = useAuth();
  return useQuery({
    queryKey: toolRunsKey(user?.id, tool, limit),
    enabled: !!user,
    queryFn: async (): Promise<ToolRun[]> => {
      let query = getSupabase().from('tool_runs').select('*').eq('user_id', user!.id);
      if (tool) query = query.eq('tool_id', tool);
      const { data, error } = await query.order('started_at', { ascending: false }).limit(limit);
      if (error) throw error;
      return data.map(row => ({
        id: row.id, toolId: row.tool_id, status: parseStatus(row.status), currentStepKey: row.current_step_key,
        data: row.data && typeof row.data === 'object' && !Array.isArray(row.data) ? (row.data as Record<string, Json | undefined>) : {},
        refId: row.ref_id, startedAt: row.started_at, updatedAt: row.updated_at, finishedAt: row.finished_at,
      }));
    },
  });
}
