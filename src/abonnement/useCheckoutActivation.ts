import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getSupabase } from '../lib/supabase';
import { useAuth } from '../auth/useAuth';
import { subscriptionKey } from '../account/useSubscription';
import { entitlementsKey } from '../tools/useEntitlements';

/** Le paramètre que Stripe ajoute au retour du checkout embarqué : `?checkout=<session_id>`. */
export const CHECKOUT_PARAM = 'checkout';
/** Facultatifs dans l'URL de retour (le back les ajoutera au `return_url`) : la sonde vise alors le droit précis. */
export const CHECKOUT_TOOL_PARAM = 'tool';
export const CHECKOUT_PACK_PARAM = 'pack';

/**
 * `idle` : pas de retour de checkout dans l'URL · `pending` : on sonde `tool_entitlements` ·
 * `active` : le droit est là · `late` : 20 s sans webhook — le paiement a réussi, l'activation
 * arrive, on le dit calmement (jamais une erreur).
 */
export type CheckoutActivationState = 'idle' | 'pending' | 'active' | 'late';

const POLL_MS = 1000;
const POLL_MAX_MS = 20_000;
/** Marge derrière l'arrivée sur la page : le webhook peut avoir devancé le navigateur de quelques secondes. */
const LOOKBACK_MS = 60_000;

interface Probe {
  active: boolean;
  /** Le premier passage : la fenêtre de 20 s court à partir de là. */
  startedAt: number;
  at: number;
}

const activationKey = (userId: string | undefined, sessionId: string | null, tool: string | null, pack: string | null) =>
  ['checkout-activation', userId, sessionId, tool, pack] as const;

/**
 * Le retour de Stripe. Le webhook qui écrit les droits arrive une à trois secondes APRÈS le
 * navigateur : tant qu'il n'est pas passé, la base ne connaît pas encore le nouvel outil. On sonde
 * donc `tool_entitlements` chaque seconde jusqu'à voir le droit (20 s au plus), puis on invalide
 * abonnement et droits. Ce qu'on cherche :
 * - `?tool=` présent → le droit `subscription` actif de cet outil ;
 * - `?pack=` présent → un droit `pack` actif de l'outil du pack, écrit depuis l'arrivée sur la page ;
 * - sinon → un droit `subscription` ou `pack` actif écrit depuis l'arrivée sur la page (moins une
 *   minute de marge, le `return_url` du back ne dit pas encore ce qui a été acheté).
 * Pendant la sonde, `AppLayout` affiche « Activation en cours… » à la place du libellé de formule.
 * Une seule sonde quel que soit le nombre de consommateurs (react-query déduplique sur la clé) ;
 * `?checkout=` reste dans l'URL jusqu'à `clear()`.
 */
export function useCheckoutActivation(): { state: CheckoutActivationState; clear: () => void } {
  const location = useLocation();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { user } = useAuth();
  const params = new URLSearchParams(location.search);
  const sessionId = params.get(CHECKOUT_PARAM);
  const tool = params.get(CHECKOUT_TOOL_PARAM);
  const pack = params.get(CHECKOUT_PACK_PARAM);
  const key = activationKey(user?.id, sessionId, tool, pack);
  /* Repli si la sonde elle-même échoue (réseau) : la fenêtre de 20 s court quand même. */
  const [mountedAt] = useState(() => Date.now());

  const probe = useQuery({
    queryKey: key,
    enabled: !!sessionId && !!user,
    staleTime: Infinity,
    retry: false,
    queryFn: async (): Promise<Probe> => {
      const previous = qc.getQueryData<Probe>(key);
      const startedAt = previous?.startedAt ?? Date.now();
      const supabase = getSupabase();
      let query = supabase.from('tool_entitlements').select('id').eq('user_id', user!.id).eq('status', 'active').limit(1);
      if (tool) {
        query = query.eq('tool_id', tool).eq('source', 'subscription');
      } else {
        const since = new Date(mountedAt - LOOKBACK_MS).toISOString();
        query = query.gte('updated_at', since);
        if (pack) {
          const { data: packRow } = await supabase.from('tool_packs').select('tool_id').eq('id', pack).maybeSingle();
          query = query.eq('source', 'pack');
          if (packRow) query = query.eq('tool_id', packRow.tool_id);
        } else {
          query = query.in('source', ['subscription', 'pack']);
        }
      }
      const { data } = await query;
      const active = !!data && data.length > 0;
      if (active && !previous?.active) {
        await Promise.all([
          qc.invalidateQueries({ queryKey: subscriptionKey(user!.id) }),
          qc.invalidateQueries({ queryKey: entitlementsKey(user!.id) }),
          qc.invalidateQueries({ queryKey: ['can-use', user!.id] }),
        ]);
      }
      return { active, startedAt, at: Date.now() };
    },
    refetchInterval: query => {
      const d = query.state.data;
      if (!d) return query.state.status === 'error' && Date.now() - mountedAt < POLL_MAX_MS ? POLL_MS : false;
      if (d.active || d.at - d.startedAt >= POLL_MAX_MS) return false;
      return POLL_MS;
    },
  });

  const clear = () => {
    const next = new URLSearchParams(location.search);
    next.delete(CHECKOUT_PARAM);
    next.delete(CHECKOUT_TOOL_PARAM);
    next.delete(CHECKOUT_PACK_PARAM);
    const search = next.toString();
    navigate({ pathname: location.pathname, search: search ? `?${search}` : '' }, { replace: true });
  };

  if (!sessionId) return { state: 'idle', clear };
  const d = probe.data;
  if (d?.active) return { state: 'active', clear };
  if (d ? d.at - d.startedAt >= POLL_MAX_MS : probe.isError && Date.now() - mountedAt >= POLL_MAX_MS) return { state: 'late', clear };
  return { state: 'pending', clear };
}
