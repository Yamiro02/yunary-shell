import { useMutation } from '@tanstack/react-query';
import { getSupabase } from '../lib/supabase';
import { fr } from '../i18n/fr';
import type { PlanId } from '../parametres/plans';

interface UrlResponse {
  success: boolean;
  url?: string;
  code?: string;
  message?: string;
}

/**
 * Portail Stripe via l'Edge `create-portal-session` — le `stripe_customer_id` n'est jamais
 * lisible côté front, l'Edge le résout en service_role. Redirection au succès.
 */
export function usePortalSession() {
  return useMutation({
    mutationFn: async (): Promise<string> => {
      const { data, error } = await getSupabase().functions.invoke<UrlResponse>('create-portal-session', { body: {} });
      if (error) throw new Error(fr.errors.portalFailed);
      if (!data?.success || !data.url) throw new Error(data?.message ?? fr.errors.portalFailed);
      return data.url;
    },
    onSuccess: url => {
      window.location.assign(url);
    },
  });
}

/**
 * Checkout via l'Edge `create-checkout-session` — PAS ENCORE DÉPLOYÉE : l'appel est câblé,
 * l'UI le garde derrière « bientôt » tant que la formule n'est pas `available`.
 * `success_url` revient sur le Hub (Paramètres › Abonnement).
 */
export function useCheckoutSession() {
  return useMutation({
    mutationFn: async ({ plan }: { plan: PlanId }): Promise<string> => {
      const { data, error } = await getSupabase().functions.invoke<UrlResponse>('create-checkout-session', { body: { plan } });
      if (error) throw new Error(fr.errors.checkoutFailed);
      if (!data?.success || !data.url) throw new Error(data?.message ?? fr.errors.checkoutFailed);
      return data.url;
    },
    onSuccess: url => {
      window.location.assign(url);
    },
  });
}
