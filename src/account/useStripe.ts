import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getSupabase } from '../lib/supabase';
import { fr } from '../i18n/fr';
import { messageForCode } from '../lib/errors';
import { invokeEdge } from '../lib/edge';
import { useAuth } from '../auth/useAuth';
import { subscriptionKey } from './useSubscription';
import { entitlementsKey } from '../tools/useEntitlements';

interface UrlResponse {
  success: boolean;
  url?: string;
  code?: string;
  message?: string;
}

/** La réponse de `remove-subscription-item`. */
export type RemoveToolResult =
  /** D'autres articles restent : retiré tout de suite (au prorata, contrat actuel du back). */
  | { tool: string; mode: 'removed' }
  /** Contrat à venir du back : l'outil reste jusqu'à la fin de la période, sans avoir. */
  | { tool: string; mode: 'ends_at_period_end'; periodEnd: string | null }
  /** Dernier article : l'abonnement entier passe en fin de période (Stripe refuse un abonnement sans article). */
  | { tool: string; mode: 'cancel_at_period_end'; currentPeriodEnd: string | null };

/** Les caches que touche un changement d'abonnement : l'abonnement (et ses articles) et les droits. */
function useInvalidateBilling() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return () => Promise.all([
    qc.invalidateQueries({ queryKey: subscriptionKey(user?.id) }),
    qc.invalidateQueries({ queryKey: entitlementsKey(user?.id) }),
    qc.invalidateQueries({ queryKey: ['can-use', user?.id] }),
    qc.invalidateQueries({ queryKey: ['subscription-preview', user?.id] }),
    qc.invalidateQueries({ queryKey: ['invoices', user?.id] }),
  ]);
}

/** Exporté pour les hooks de l'abonnement v2 : les mêmes caches à relire après un changement. */
export { useInvalidateBilling };

/**
 * Portail Stripe via l'Edge `create-portal-session` — le `stripe_customer_id` n'est jamais
 * lisible côté front, l'Edge le résout en service_role. Redirection au succès : changer de
 * carte, récupérer ses factures.
 */
export function usePortalSession() {
  return useMutation({
    /* `target` : un onglet ouvert AU CLIC par l'appelant (sinon bloqué comme pop-up) ; le portail s'y charge et la modale
       reste ouverte ici — au retour sur l'onglet, l'aperçu est relu (react-query relit au focus). Sans lui : redirection. */
    mutationFn: async (_vars?: { target?: Window | null }): Promise<string> => {
      const { data, error } = await getSupabase().functions.invoke<UrlResponse>('create-portal-session', { body: {} });
      if (error) throw new Error(fr.errors.portalFailed);
      if (!data?.success || !data.url) throw new Error(messageForCode(data?.code, fr.errors.portalFailed));
      return data.url;
    },
    onSuccess: (url, vars) => {
      if (vars?.target) vars.target.location.href = url;
      else window.location.assign(url);
    },
    onError: (_e, vars) => {
      vars?.target?.close();
    },
  });
}

/**
 * Retirer un outil de l'abonnement (`remove-subscription-item { tool }`). Les trois formes du
 * back sont tolérées : `removed` (contrat actuel, au prorata), `ends_at_period_end` (à venir : fin de
 * période, pas d'avoir) et `cancel_at_period_end` (dernier article : tout l'abonnement s'arrête en fin
 * de période).
 */
export function useRemoveTool() {
  const invalidate = useInvalidateBilling();
  return useMutation({
    mutationFn: ({ tool }: { tool: string }) => invokeEdge<RemoveToolResult>('remove-subscription-item', { tool }, fr.errors.removeToolFailed),
    onSuccess: () => invalidate(),
  });
}

/**
 * Résiliation COMPLÈTE à la fin de la période (`cancel-subscription`) : tous les outils restent
 * jusqu'à `currentPeriodEnd`, puis le compte repasse aux droits gratuits. Rien n'est remboursé.
 */
export function useCancelSubscription() {
  const invalidate = useInvalidateBilling();
  return useMutation({
    mutationFn: () => invokeEdge<{ currentPeriodEnd: string | null }>('cancel-subscription', {}, fr.errors.cancelFailed),
    onSuccess: () => invalidate(),
  });
}

/** Annule une résiliation en cours de période (`resume-subscription`) : l'abonnement se renouvelle à nouveau. */
export function useResumeSubscription() {
  const invalidate = useInvalidateBilling();
  return useMutation({
    mutationFn: () => invokeEdge<{ currentPeriodEnd: string | null }>('resume-subscription', {}, fr.errors.resumeFailed),
    onSuccess: () => invalidate(),
  });
}
