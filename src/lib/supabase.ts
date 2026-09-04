import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../integrations/supabase/types';
import { getShellConfig } from '../config';

/**
 * LE client Supabase de l'écosystème — le seul endroit qui en crée un ou qui touche au
 * stockage de session. Aucune app ne fait `createClient` : elle importe `supabase` d'ici.
 *
 * `createBrowserClient` de @supabase/ssr écrit la session en COOKIES, ce qui est ce qui la
 * partage entre sous-domaines : `domain=.yunary.com` en prod (absent en local), `path=/`,
 * `SameSite=Lax`, `Secure`. `httpOnly` est impossible côté client — c'est le navigateur qui
 * écrit. Le flux est PKCE (imposé par @supabase/ssr) : le `code_verifier` vit lui aussi en
 * cookie, donc un lien de reset ouvert dans un AUTRE navigateur échoue — cas traité par un
 * message clair et un renvoi vers « Mot de passe oublié », jamais contourné.
 *
 * Singleton PARESSEUX : créé au premier accès, après `configureShell`. Avant, l'accès lève
 * une erreur explicite plutôt qu'un client muet sur une URL vide.
 */
export type ShellSupabaseClient = SupabaseClient<Database>;

let client: ShellSupabaseClient | null = null;

export function getSupabase(): ShellSupabaseClient {
  if (client) return client;
  const config = getShellConfig();
  client = createBrowserClient<Database>(config.supabaseUrl, config.supabasePublishableKey, {
    isSingleton: true,
    cookieOptions: {
      ...(config.cookieDomain ? { domain: config.cookieDomain } : {}),
      path: '/',
      sameSite: 'lax',
      secure: true,
    },
  });
  return client;
}

/**
 * Le même client, sous la forme d'un objet : `supabase.from(...)`, `supabase.auth...` —
 * l'écriture habituelle. C'est un mandataire qui résout le singleton au premier accès :
 * importer `supabase` ne crée rien, l'utiliser avant `configureShell` lève.
 */
export const supabase: ShellSupabaseClient = new Proxy({} as ShellSupabaseClient, {
  get(_target, prop) {
    const real = getSupabase() as unknown as Record<PropertyKey, unknown>;
    const value = real[prop];
    return typeof value === 'function' ? (value as (...a: unknown[]) => unknown).bind(real) : value;
  },
});

/**
 * Déconnexion — passe TOUJOURS par ici. `scope: 'global'` révoque le refresh token côté
 * serveur ; le client efface ensuite les cookies sur le domaine partagé. Un signOut fait
 * ailleurs, sur un autre client, laisserait des cookies traîner sur un sous-domaine.
 */
export async function signOut(): Promise<void> {
  const { error } = await getSupabase().auth.signOut({ scope: 'global' });
  if (error) throw error;
}
