import { getSupabase } from './supabase';
import { messageForCode } from './errors';

/** L'enveloppe des Edge : `{ success: true, data }` ou `{ success: false, code, message, data? }` (200 métier, 4xx / 5xx technique). */
type EdgeEnvelope<T> = { success: true; data: T; message?: string } | { success: false; code?: string; message?: string; data?: unknown };

/** Le résultat brut d'un appel : succès, ou refus avec son `code` et ses `data` (clientSecret d'une 3DS, declineCode…). */
export type EdgeResult<T> = { ok: true; data: T } | { ok: false; code: string | null; data: Record<string, unknown> | null };

/**
 * Appelle une Edge et rend le refus au lieu de le lever : `card_declined`, `requires_action`, `past_due` sont
 * des 200 métier dont les `data` servent à la suite (le `clientSecret` d'une 3D Secure). Un `{ success:false }`
 * arrive en 200 (dans `data`) ou en 4xx / 5xx : supabase-js pose alors une `FunctionsHttpError` dont `context`
 * est la `Response`, relue ici. Une panne réseau ou une réponse illisible lève `fallback`.
 */
export async function callEdge<T>(name: string, body: Record<string, unknown>, fallback: string): Promise<EdgeResult<T>> {
  const { data, error } = await getSupabase().functions.invoke<EdgeEnvelope<T>>(name, { body });
  let payload: EdgeEnvelope<T> | null = data ?? null;
  if (error) {
    const ctx = (error as { context?: unknown }).context;
    payload = ctx instanceof Response ? ((await ctx.clone().json().catch(() => null)) as EdgeEnvelope<T> | null) : null;
    if (!payload || payload.success) throw new Error(fallback);
  }
  if (!payload) throw new Error(fallback);
  if (payload.success) return { ok: true, data: payload.data };
  const extra = payload.data && typeof payload.data === 'object' ? (payload.data as Record<string, unknown>) : null;
  return { ok: false, code: payload.code ?? null, data: extra };
}

/** `callEdge` qui lève la phrase FR du code sur un refus — pour les appels sans suite métier. */
export async function invokeEdge<T>(name: string, body: Record<string, unknown>, fallback: string): Promise<T> {
  const res = await callEdge<T>(name, body, fallback);
  if (res.ok) return res.data;
  throw new Error(messageForCode(res.code, fallback));
}
