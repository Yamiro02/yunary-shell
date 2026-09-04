import { fr } from '../i18n/fr';

/**
 * Traduit une erreur (Supabase, réseau, inconnue) en PHRASE FR prête à afficher.
 * Toute erreur remontée à l'utilisateur passe par ici — jamais un message brut à l'écran.
 *
 * Un hook peut lever une phrase de `fr.errors` telle quelle (`throw new Error(fr.errors.portalFailed)`) :
 * elle est reconnue et rendue sans retraduction. Tout le reste est reconnu sur les mots
 * anglais de Supabase, puis retombe sur `generic`.
 */
const KNOWN = new Set<string>(collectStrings(fr.errors));

function collectStrings(node: unknown, out: string[] = []): string[] {
  if (typeof node === 'string') out.push(node);
  else if (node && typeof node === 'object') Object.values(node).forEach(v => collectStrings(v, out));
  return out;
}

export function getErrorMessage(error: unknown): string {
  const raw = typeof error === 'string' ? error : error instanceof Error ? error.message : '';
  if (KNOWN.has(raw)) return raw;

  const n = raw.toLowerCase();
  if (n.includes('invalid login credentials') || n.includes('invalid email or password')) return fr.errors.auth.invalidCredentials;
  if (n.includes('email not confirmed')) return fr.errors.auth.emailNotConfirmed;
  if (n.includes('user already registered')) return fr.errors.auth.emailAlreadyRegistered;
  if (n.includes('password should be at least')) return fr.errors.auth.passwordTooShort;
  if (n.includes('different from the old password')) return fr.errors.auth.samePassword;
  if (n.includes('rate limit') || n.includes('too many requests')) return fr.errors.rateLimit;
  if (n.includes('failed to fetch') || n.includes('network')) return fr.errors.network;
  if (n.includes('insufficient_credits')) return fr.errors.insufficientCredits;
  /* Lien de récupération ouvert hors contexte : expiré, déjà utilisé, ou dans un autre
     navigateur (PKCE : le code_verifier n'y est pas). */
  if (/session|token|expired|missing|code verifier|pkce/i.test(raw)) return fr.errors.auth.invalidOrExpiredLink;
  return fr.errors.generic;
}
