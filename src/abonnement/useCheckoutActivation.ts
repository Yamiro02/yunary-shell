import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getSupabase } from '../lib/supabase';
import { useAuth } from '../auth/useAuth';
import { creditsKey } from '../account/useCredits';
import { subscriptionKey } from '../account/useSubscription';
import { planCatalogKey } from '../account/usePlanCatalog';

/** Le paramètre que Stripe ajoute au retour du checkout embarqué : `?checkout=<session_id>`. */
export const CHECKOUT_PARAM = 'checkout';

/**
 * `idle` : pas de retour de checkout dans l'URL · `pending` : on sonde `subscriptions` ·
 * `active` : l'abonnement est là · `late` : 20 s sans webhook — le paiement a réussi, l'activation
 * arrive, on le dit calmement (jamais une erreur).
 */
export type CheckoutActivationState = 'idle' | 'pending' | 'active' | 'late';

const POLL_MS = 1000;
const POLL_MAX_MS = 20_000;

interface Probe {
  active: boolean;
  /** Le premier passage : la fenêtre de 20 s court à partir de là. */
  startedAt: number;
  at: number;
}

const activationKey = (userId: string | undefined, sessionId: string | null) => ['checkout-activation', userId, sessionId] as const;

/**
 * Le retour de Stripe. Le webhook qui écrit `subscriptions` arrive une à trois secondes APRÈS le
 * navigateur : tant qu'il n'est pas passé, la base dit encore « Gratuite ». On sonde donc
 * `subscriptions` chaque seconde jusqu'à voir un abonnement actif (20 s au plus), puis on invalide
 * abonnement, crédits et catalogue (le compteur fondateur a bougé). Pendant la sonde, `AppLayout`
 * remplace « Formule Gratuite » par « Activation en cours… » : on ne montre jamais la Gratuite à
 * quelqu'un qui vient de payer. Une seule sonde quel que soit le nombre de consommateurs
 * (react-query déduplique sur la clé) ; `?checkout=` reste dans l'URL jusqu'à `clear()`.
 */
export function useCheckoutActivation(): { state: CheckoutActivationState; clear: () => void } {
  const location = useLocation();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { user } = useAuth();
  const sessionId = new URLSearchParams(location.search).get(CHECKOUT_PARAM);
  const key = activationKey(user?.id, sessionId);
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
      const { data } = await getSupabase().from('subscriptions').select('status').eq('user_id', user!.id).maybeSingle();
      const active = !!data && (data.status === 'active' || data.status === 'trialing');
      if (active && !previous?.active) {
        await Promise.all([
          qc.invalidateQueries({ queryKey: subscriptionKey(user!.id) }),
          qc.invalidateQueries({ queryKey: creditsKey(user!.id) }),
          qc.invalidateQueries({ queryKey: planCatalogKey }),
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
    const params = new URLSearchParams(location.search);
    params.delete(CHECKOUT_PARAM);
    const search = params.toString();
    navigate({ pathname: location.pathname, search: search ? `?${search}` : '' }, { replace: true });
  };

  if (!sessionId) return { state: 'idle', clear };
  const d = probe.data;
  if (d?.active) return { state: 'active', clear };
  if (d ? d.at - d.startedAt >= POLL_MAX_MS : probe.isError && Date.now() - mountedAt >= POLL_MAX_MS) return { state: 'late', clear };
  return { state: 'pending', clear };
}
