import { getShellConfig } from '../config';

/**
 * `?next=` — la seule chose qu'un front accepte comme destination après connexion.
 * Règle dure : un sous-domaine de `yunary.com` en https, rien d'autre (anti open-redirect).
 * En local, `extraNextOrigins` de la config ajoute les origines de développement.
 */
export function isSafeNext(candidate: string | null | undefined): candidate is string {
  if (!candidate) return false;
  let url: URL;
  try {
    url = new URL(candidate);
  } catch {
    return false;
  }
  if (url.protocol === 'https:') {
    const host = url.hostname.toLowerCase();
    if (host === 'yunary.com' || host.endsWith('.yunary.com')) return true;
  }
  const extra = getShellConfig().extraNextOrigins ?? [];
  return extra.some(origin => origin.replace(/\/+$/, '') === url.origin);
}

/** Lit `next` dans une query string et ne le rend que s'il est sûr. */
export function readSafeNext(search: string): string | null {
  const value = new URLSearchParams(search).get('next');
  return isSafeNext(value) ? value : null;
}

/** L'URL de connexion du Hub, avec la page courante en `next`. */
export function buildLoginUrl(currentUrl: string): string {
  const { hubUrl } = getShellConfig();
  return `${hubUrl}/login?next=${encodeURIComponent(currentUrl)}`;
}
