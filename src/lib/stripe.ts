import { loadStripe, type Stripe } from '@stripe/stripe-js';
import { getShellConfig } from '../config';

let promise: Promise<Stripe | null> | null = null;

/** La clé publiable est-elle posée ? Sans elle, la `PaymentModal` affiche « paiement indisponible ». */
export function hasStripeKey(): boolean {
  return !!getShellConfig().stripePublishableKey;
}

/**
 * Stripe.js, chargé UNE fois et PARESSEUSEMENT — au premier checkout, jamais au démarrage de
 * l'app : `loadStripe` injecte le script Stripe dans la page, et une app qui n'ouvre pas de
 * modale n'a pas à le charger. La clé vient de `configureShell` (`VITE_STRIPE_PUBLISHABLE_KEY`
 * côté app), jamais d'une constante.
 */
export function getStripe(): Promise<Stripe | null> {
  if (!promise) {
    const key = getShellConfig().stripePublishableKey;
    promise = key ? loadStripe(key) : Promise.resolve(null);
  }
  return promise;
}
