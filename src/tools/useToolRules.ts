import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getSupabase } from '../lib/supabase';
import { useAuth } from '../auth/useAuth';
import { fr } from '../i18n/fr';

/** Une règle personnelle (`user_tool_rules`) : par outil, ou par étape d'un outil. */
export interface ToolRule {
  id: string;
  toolId: string;
  /** `null` = vaut pour tout l'outil. */
  stepKey: string | null;
  text: string;
  createdAt: string;
  updatedAt: string;
}

/** Bornes de `user_tool_rules.text` (CHECK en base : 1..500 caractères utiles). */
export const RULE_TEXT_MAX = 500;

export const toolRulesKey = (userId: string | undefined, tool?: string) => ['tool-rules', userId, tool ?? 'all'] as const;

function parseRule(row: { id: string; tool_id: string; step_key: string | null; text: string; created_at: string; updated_at: string }): ToolRule {
  return { id: row.id, toolId: row.tool_id, stepKey: row.step_key, text: row.text, createdAt: row.created_at, updatedAt: row.updated_at };
}

/** Le texte, nettoyé ; lève une phrase FR s'il est vide ou trop long — la base refuserait de toute façon. */
function cleanRuleText(text: string): string {
  const clean = text.trim();
  if (!clean) throw new Error(fr.errors.rules.empty);
  if (clean.length > RULE_TEXT_MAX) throw new Error(fr.errors.rules.tooLong);
  return clean;
}

/** Les règles de l'utilisateur (RLS owner), pour un outil ou toutes, les plus récentes d'abord. */
export function useToolRules({ tool }: { tool?: string } = {}) {
  const { user } = useAuth();
  return useQuery({
    queryKey: toolRulesKey(user?.id, tool),
    enabled: !!user,
    queryFn: async (): Promise<ToolRule[]> => {
      let query = getSupabase().from('user_tool_rules').select('id, tool_id, step_key, text, created_at, updated_at').eq('user_id', user!.id);
      if (tool) query = query.eq('tool_id', tool);
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return data.map(parseRule);
    },
  });
}

function useInvalidateRules() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return () => qc.invalidateQueries({ queryKey: ['tool-rules', user?.id] });
}

/** Ajouter une règle (le hub « Mes règles » ; dans Claude, c'est la fonction `ajouter_regle` du serveur). */
export function useAddToolRule() {
  const { user } = useAuth();
  const invalidate = useInvalidateRules();
  return useMutation({
    mutationFn: async ({ toolId, stepKey = null, text }: { toolId: string; stepKey?: string | null; text: string }): Promise<ToolRule> => {
      if (!user) throw new Error(fr.errors.auth.sessionExpired);
      const { data, error } = await getSupabase()
        .from('user_tool_rules')
        .insert({ user_id: user.id, tool_id: toolId, step_key: stepKey, text: cleanRuleText(text) })
        .select('id, tool_id, step_key, text, created_at, updated_at')
        .single();
      if (error) throw error;
      return parseRule(data);
    },
    onSuccess: () => invalidate(),
  });
}

/** Modifier le texte (et l'étape) d'une règle. */
export function useUpdateToolRule() {
  const { user } = useAuth();
  const invalidate = useInvalidateRules();
  return useMutation({
    mutationFn: async ({ id, text, stepKey }: { id: string; text: string; stepKey?: string | null }): Promise<void> => {
      if (!user) throw new Error(fr.errors.auth.sessionExpired);
      const { error } = await getSupabase()
        .from('user_tool_rules')
        .update({ text: cleanRuleText(text), ...(stepKey !== undefined ? { step_key: stepKey } : {}) })
        .eq('id', id)
        .eq('user_id', user.id);
      if (error) throw error;
    },
    onSuccess: () => invalidate(),
  });
}

/** Supprimer une règle — la seule suppression que l'utilisateur fait lui-même (owner DELETE). */
export function useDeleteToolRule() {
  const { user } = useAuth();
  const invalidate = useInvalidateRules();
  return useMutation({
    mutationFn: async ({ id }: { id: string }): Promise<void> => {
      if (!user) throw new Error(fr.errors.auth.sessionExpired);
      const { error } = await getSupabase().from('user_tool_rules').delete().eq('id', id).eq('user_id', user.id);
      if (error) throw error;
    },
    onSuccess: () => invalidate(),
  });
}
