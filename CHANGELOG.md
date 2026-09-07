# Journal des versions — @yunary/shell

Une ligne par décision, et c'est le **pourquoi** qui compte. Trois endroits disent le même
numéro : `package.json`, la ligne d'installation du README, et le tag git.

---

## 0.1.3 — `?next=` sans imbrication

- **`ProtectedRoute` lit l'URL courante dans le routeur**, plus dans `window.location`. Le
  store de session émet deux fois au démarrage (résultat de `getSession()`, puis
  `INITIAL_SESSION`) ; entre les deux, `Navigate` avait déjà changé l'adresse et la seconde
  émission produisait `/login?next=…/login?next=…`. Une seule redirection après connexion,
  désormais. La double émission du store est conservée : elle couvre un `getSession()` en échec.
- C'est **`v0.1.3`** que le Hub épingle.

## 0.1.2 — extension technique, migration Hub du 05/09/2026

- **Types régénérés** après la migration Hub : `profiles.role` / `platform` / `handle`, table
  `plan_allocations`, vue `admin_prospects`. Rien d'autre n'a changé côté schéma.
- **`Profile` porte `role`, `platform`, `handle`** (`PROFILE_COLUMNS` étendu). `role` reste en
  lecture : l'accès Admin se vérifie en base, la coque ne fait qu'exposer la valeur.
- **Paramètres › Infos lit le réseau dans `profiles`**, plus dans le dernier `account_audits` :
  la persistance du handle est tranchée (étape 1 de l'onboarding du Hub). `onReseauChange` reste
  réservé. Un compte sans `platform` / `handle` voit « aucun réseau », comme avant sans audit.
- Première version installée par le Hub.

## 0.1.1 — la première version installable

- **A1 sans classe interne du DS** : le lien « Mot de passe oublié ? » vit dans le libellé du
  `FormField`, plus de `ds-field` / `ds-label` recomposés — la règle vaut pour toute la coque.
- **Formules payantes** : `available` passera à `true` au lot qui déploie
  `create-checkout-session` (noté dans le PROJECT-CONTEXT §4).
- `v0.1.0` reste le premier jalon taggé ; `v0.1.1` a été la première version installable.

## 0.1.0 — la coque

Premier lot. Tout ce qu'une app Yunary partage avec les autres, en un paquet.

- **`configureShell` plutôt que `import.meta.env`** : Vite ne remplace les `VITE_*` que dans
  le code de l'app, pas dans un paquet. Les quatre variables restent côté app.
- **Session en cookies `.yunary.com`** via `createBrowserClient` de `@supabase/ssr` : connecté
  sur un front = connecté partout. PKCE imposé, assumé : un lien de reset ouvert ailleurs est
  déclaré invalide plutôt que contourné.
- **Une entrée unique** `@yunary/shell` ; le tree-shaking ESM fait le reste.
- **Zéro CSS** : la coque compose avec les utilitaires du DS. Les apps déclarent
  `@source '../node_modules/@yunary/shell/src'`.
- **Vue + page** pour chaque écran : la vue est rendue par la démo avec des fixtures, la page
  câble les hooks. Ce qui est vérifié à l'écran est ce qui est publié.
- **Politique de mot de passe alignée sur le projet** (8 caractères, minuscule + majuscule +
  chiffre) : le serveur est passé de 12 à 8 pour ne pas freiner l'inscription.
- **Sept manques du DS** consignés dans son `BACKLOG.md` avec leur solution provisoire ici :
  tab bar mobile, `SegmentedControl`, `ChoiceChip`, tuile radio, icône sur `Input`, avatar
  photo, `ContentIcon` sans TikTok.
