import { useSyncExternalStore } from 'react';

/** Le seuil unique du DS : sous 64 rem inclus, une modale est une feuille, la sidebar un tiroir. */
export const DS_MOBILE_QUERY = '(max-width: 64rem)';

/**
 * `matchMedia` en `useSyncExternalStore` — même geste que `useAuth`, sans état ni effet. Hors
 * navigateur (SSR, tests) : faux. Sert quand un rendu doit CHANGER DE STRUCTURE selon la taille
 * (le checkout : modale sur bureau, page plein écran sur mobile) — un simple `hidden` monterait
 * Stripe deux fois.
 */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    onChange => {
      if (typeof window === 'undefined') return () => undefined;
      const mql = window.matchMedia(query);
      mql.addEventListener('change', onChange);
      return () => mql.removeEventListener('change', onChange);
    },
    () => (typeof window === 'undefined' ? false : window.matchMedia(query).matches),
    () => false,
  );
}
