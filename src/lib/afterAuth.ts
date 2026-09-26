import { isSafeNext } from './next';

/**
 * La page de consentement OAuth du connecteur (hub). Claude y envoie une personne qui ajoute le
 * connecteur : `…/autoriser?authorization_id=…`. C'est la SEULE destination qui passe avant
 * l'onboarding — sans elle, la connexion à Claude échoue. Ne pas élargir à d'autres routes.
 */
export const AUTHORIZE_PATH = '/autoriser';

/**
 * Où aller après authentification. Depuis 0.4.2, toujours une ROUTE de l'app (`next` est un chemin interne) ;
 * `url` reste dans le type pour compatibilité, la règle ne le produit plus.
 */
export type AfterAuthTarget = { type: 'url'; url: string } | { type: 'route'; path: string };

/**
 * `next` sûr (chemin interne, `isSafeNext`) qui vise EXACTEMENT `/autoriser` : `/autoriser/x`, `/autoriserx` ou
 * `/Autoriser` ne comptent pas. La requête (`authorization_id`…) est gardée intacte.
 */
export function isAuthorizeNext(next: string | null | undefined): next is string {
  if (!isSafeNext(next)) return false;
  return new URL(next, 'https://interne.invalid').pathname === AUTHORIZE_PATH;
}

export interface AfterAuthInput {
  /** `?next=` tel que lu dans l'URL — validé ici, jamais avant. */
  next: string | null | undefined;
  /** `profiles.onboarding_completed` ; `null` = profil pas (encore) lisible. */
  onboardingCompleted: boolean | null;
  /** Ignoré depuis 0.4.2 (`next` est un chemin interne) ; gardé pour ne pas casser les appelants. */
  hubUrl?: string;
  onboardingPath?: string;
  homePath?: string;
}

/**
 * 🔒 LA règle de redirection après authentification (connexion, inscription, OAuth, reset), dans cet ordre :
 * 1. `next` = `/autoriser…` → on y va, requête intacte, QUEL QUE SOIT l'onboarding (seule exception : sans elle, la
 *    connexion du connecteur depuis Claude échoue pour un nouvel inscrit) ;
 * 2. onboarding pas terminé → `onboardingPath` (le hub reprend à la bonne étape) ;
 * 3. `next` interne valide → `next` (lien profond conservé : `/facturation`, `/outils?ajouter=audit`) ;
 * 4. sinon `homePath` (`/outils`).
 * `null` tant que la règle a besoin du profil et qu'il n'est pas lu (étapes 2 à 4).
 */
export function resolveAfterAuth({
  next, onboardingCompleted, onboardingPath = '/onboarding', homePath = '/outils',
}: AfterAuthInput): AfterAuthTarget | null {
  if (isAuthorizeNext(next)) return { type: 'route', path: next };
  if (onboardingCompleted === null) return null;
  if (!onboardingCompleted) return { type: 'route', path: onboardingPath };
  if (isSafeNext(next)) return { type: 'route', path: next };
  return { type: 'route', path: homePath };
}

/**
 * Reporte `next` sur un lien du flux d'auth (connexion ↔ inscription ↔ oubli ↔ reset) quand le
 * lien ne le porte pas déjà. La valeur n'est pas validée ici : `resolveAfterAuth` tranche au moment
 * de rediriger. Marche sur une route (`/login`) comme sur une URL absolue (`https://…/reset`).
 */
export function withNextParam(href: string, next: string | null | undefined): string {
  if (!next) return href;
  const hashAt = href.indexOf('#');
  const base = hashAt === -1 ? href : href.slice(0, hashAt);
  const hash = hashAt === -1 ? '' : href.slice(hashAt);
  const queryAt = base.indexOf('?');
  const params = new URLSearchParams(queryAt === -1 ? '' : base.slice(queryAt + 1));
  if (params.has('next')) return href;
  params.set('next', next);
  const path = queryAt === -1 ? base : base.slice(0, queryAt);
  return `${path}?${params.toString()}${hash}`;
}
