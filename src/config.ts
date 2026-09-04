/**
 * La configuration de la coque, fournie UNE fois par l'app au démarrage.
 *
 * Pourquoi une fonction et pas `import.meta.env` : Vite ne remplace les `VITE_*` que dans
 * le code de l'app, pas de façon garantie dans un paquet de `node_modules`. Les quatre
 * variables restent donc côté app (PROJECT-CONTEXT §3) ; l'app les lit et les passe ici.
 */
export type ToolId = 'hub' | 'creator' | 'metrics';

export interface ShellConfig {
  /** `VITE_SUPABASE_URL`. */
  supabaseUrl: string;
  /** `VITE_SUPABASE_PUBLISHABLE_KEY` — la clé publishable (`sb_publishable_…`), jamais la legacy anon. */
  supabasePublishableKey: string;
  /** `VITE_HUB_URL` — origine du Hub, sans slash final (`https://app.yunary.com`). */
  hubUrl: string;
  /**
   * `VITE_COOKIE_DOMAIN` — `.yunary.com` en prod, ABSENT en local : `domain` ne fonctionne
   * pas sur `localhost`, et sans lui le cookie reste sur l'origine courante, ce qui est
   * exactement ce qu'on veut en développement.
   */
  cookieDomain?: string;
  /**
   * Origines des outils quand elles ne sont pas `https://<sous-domaine>.yunary.com` — en
   * local, typiquement `{ creator: 'http://localhost:5175' }`. Le Hub vient de `hubUrl`.
   */
  toolUrls?: Partial<Record<Exclude<ToolId, 'hub'>, string>>;
  /**
   * Origines acceptées pour `?next=` EN PLUS des sous-domaines de `yunary.com` — en local
   * seulement (`['http://localhost:5175']`). En prod, ne rien passer.
   */
  extraNextOrigins?: string[];
}

let current: ShellConfig | null = null;

export function configureShell(config: ShellConfig): void {
  if (!config.supabaseUrl || !config.supabasePublishableKey) {
    throw new Error(
      'configureShell : supabaseUrl et supabasePublishableKey sont obligatoires (VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY).',
    );
  }
  /* Garde-fou hérité de la v1 : la legacy anon HS256 (eyJ…) casse sur un projet en JWT
     Signing Keys ES256. On refuse tôt, avec un message qui dit quoi faire. */
  if (config.supabasePublishableKey.startsWith('eyJ')) {
    throw new Error(
      'configureShell : la clé ressemble à une legacy anon (eyJ…). Utilise la clé publishable (sb_publishable_…).',
    );
  }
  if (!config.hubUrl) {
    throw new Error('configureShell : hubUrl est obligatoire (VITE_HUB_URL).');
  }
  current = {
    ...config,
    hubUrl: config.hubUrl.replace(/\/+$/, ''),
    cookieDomain: config.cookieDomain?.trim() || undefined,
  };
}

/** La configuration courante — lève si `configureShell` n'a pas été appelée. */
export function getShellConfig(): ShellConfig {
  if (!current) {
    throw new Error(
      "@yunary/shell n'est pas configuré : appelle configureShell({ … }) dans main.tsx avant tout rendu.",
    );
  }
  return current;
}

export function isShellConfigured(): boolean {
  return current !== null;
}
