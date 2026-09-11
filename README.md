# @yunary/shell

**La coque partagée des apps Yunary.** Une app = `@yunary/ds` + `@yunary/shell` + ses écrans
métier. Ce paquet porte ce qu'aucune app ne doit réécrire : le client Supabase unique et la
session partagée entre sous-domaines, les hooks de compte (`useAuth`, `useProfile`,
`useCredits`), la protection de route, le layout et le registre des outils, les pages
Paramètres, auth et légales, le bilan d'audit, les cartes du profil créateur, les chaînes FR
communes.

**Aucune fondation ici.** Couleurs, rayons, typo et composants génériques viennent de
`@yunary/ds` ; la coque compose, elle ne dessine pas. Un manque dans le design system se
signale au design system, il ne se recrée pas ici.

Ce que le paquet est et exporte, en détail → [`PROJECT-CONTEXT.md`](PROJECT-CONTEXT.md).
L'API publique, symbole par symbole → [`EXPORTS.md`](EXPORTS.md).

## Installation

Pas de registry : chaque app épingle une version par un tag git.

```bash
npm i github:Yamiro02/yunary-shell#v0.1.7
```

Peer dependencies, à la charge de l'app : `react`, `react-dom`, `react-router-dom`,
`@yunary/ds`, `@tanstack/react-query`, `lucide-react`, `tailwind-merge`. Le QueryClient est
celui de l'app : la coque ne crée pas le sien.

## Mise en route

```ts
// src/main.tsx
import '@yunary/ds/core.css';
import '@yunary/ds/brand-yunary.css';
import { configureShell } from '@yunary/shell';

configureShell({
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
  supabasePublishableKey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
  hubUrl: import.meta.env.VITE_HUB_URL,
  cookieDomain: import.meta.env.VITE_COOKIE_DOMAIN || undefined,
});
```

```css
/* src/index.css — la couche Tailwind, puis les sources de la coque */
@import '@yunary/ds/theme.css';
@source '../node_modules/@yunary/shell/src';
```

`configureShell` existe parce qu'un paquet ne lit pas `import.meta.env` : Vite ne remplace
les `VITE_*` que dans le code de l'app. Les quatre variables restent côté app, la coque les
reçoit. Le client `supabase` est un singleton paresseux : l'utiliser avant `configureShell`
lève une erreur explicite.

## Développement

```bash
npm run setup        # installe le paquet et la démo
npm run demo         # la vitrine, sur http://localhost:5274
npm run typecheck && npm run build && npm run demo:build
```

La démo consomme la coque depuis ses sources et le design system depuis `node_modules`,
épinglé — comme une app. Ce qui est vérifié à l'écran est ce qui est publié.

## Versions

Semver + tags git. Une évolution = commit sur ce repo, bump, tag, puis montée de version
volontaire dans chaque app (jamais `latest`). Journal → [`CHANGELOG.md`](CHANGELOG.md).
