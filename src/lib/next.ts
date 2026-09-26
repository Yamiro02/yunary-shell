import { getShellConfig } from '../config';

/** Une base factice pour lire un chemin comme une URL : tout ce qui en sort n'est plus un chemin interne. */
const INTERNAL_BASE = 'https://interne.invalid';

/**
 * `?next=` — la seule chose qu'un front accepte comme destination après connexion (0.4.2, recette A4) : un CHEMIN
 * INTERNE et rien d'autre. Il commence par « / », pas par « // » ni « /\\ » (lus comme une autre origine par les
 * navigateurs), sans schéma ni hôte, sans caractère de contrôle. Toute URL complète est refusée, même en
 * `*.yunary.com`. Anti open-redirect par construction : la destination reste sur l'origine courante.
 */
export function isSafeNext(candidate: string | null | undefined): candidate is string {
  if (!candidate || typeof candidate !== 'string') return false;
  if (!candidate.startsWith('/') || candidate.startsWith('//') || candidate.startsWith('/\\')) return false;
  if (/[\u0000-\u001f\u007f\\]/.test(candidate)) return false;
  try {
    return new URL(candidate, INTERNAL_BASE).origin === INTERNAL_BASE;
  } catch {
    return false;
  }
}

/** Lit `next` dans une query string et ne le rend que s'il est sûr (chemin interne). */
export function readSafeNext(search: string): string | null {
  const value = new URLSearchParams(search).get('next');
  return isSafeNext(value) ? value : null;
}

/**
 * Le chemin interne d'une adresse : `pathname + search + hash`. Une URL complète est réduite à son chemin (jamais
 * transmise telle quelle) ; un chemin déjà interne est rendu tel quel.
 */
export function toInternalPath(location: string): string {
  if (isSafeNext(location)) return location;
  try {
    const url = new URL(location);
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return '/';
  }
}

/** L'URL de connexion du hub, avec le CHEMIN de la page courante en `next` (jamais une URL complète). */
export function buildLoginUrl(current: string): string {
  const { hubUrl } = getShellConfig();
  const path = toInternalPath(current);
  return isSafeNext(path) ? `${hubUrl}/login?next=${encodeURIComponent(path)}` : `${hubUrl}/login`;
}
