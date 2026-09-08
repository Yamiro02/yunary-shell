# Journal des versions — @yunary/shell

Une ligne par décision, et c'est le **pourquoi** qui compte. Trois endroits disent le même
numéro : `package.json`, la ligne d'installation du README, et le tag git.

---

## 0.1.4 — refonte visuelle des écrans (lot du 08/09/2026)

Chaque écran de la coque a été réécrit sur l'inventaire exhaustif de sa maquette
(`resources/screens/*.dc.html`), avec les composants du DS seulement — hooks, logique,
routage et comportements intacts. Julien a validé chaque écran à l'écran, desktop et mobile.
Exige **`@yunary/ds` ≥ 0.1.2** (`max-w-dialog`, `--heading-xl-weight`, `Sidebar` `disabled` /
`badge`, en-tête et pied sans gouttière).

- ⚠ **`fr.auth.login.subtitle` n'existe plus** : A1 n'a pas de sous-titre (retiré par Julien, ne
  jamais le réintroduire). Une app qui lisait la clé ne compile plus — c'est voulu.
- **Auth A1-A4** : colonne `max-w-dialog` (les 440 px des maquettes), logo à 1,5 rem, liens sur
  `text-primary` soulignés au survol par le socle (plus aucun `no-underline`), boutons OAuth et
  « Renvoyer l'e-mail » en `surface="card"`, formulaire A3 et colonne A4 au pas `space-5`.
- **`AuditStateCard` (nouvel export)** : la carte d'état héros du design v1 (`Card lg` centrée,
  `Pastille heros` ronde, `brand` ou `danger`) — attente, indisponible, erreur, non évaluable.
  Composée dans la coque tant que le DS n'a pas sa `StateCard` (BACKLOG DS).
- **`AuditBilan` reconstruit sur l'inventaire** du maître et de l'artboard B4 : colonne
  `space-5`, libellés en `eyebrow` gras, titres de badge en DM Sans, panneaux bio et engagement
  au pas `space-3`, erreur → `AuditStateCard danger` (WifiOff), non évaluable → `brand` (Sprout).
- **`SegmentedControl`** au rayon des onglets du DS, sans ombre, et sur deux rangées sous 64 rem
  (quatre options ne tiennent pas en 375 px). `NicheCard` / `ChoiceChip` sur un filet de 1 px.
- **`HubSidebar` sans commutateur et sans repli** (décisions Julien) : logo statique, lien vers
  « Mes outils » ; nav de l'outil, puis « Mes outils » + « Paramètres » en pied de nav — les
  outils ne vivent qu'en cartes sur la page « Mes outils » ; `collapsible={false}` et
  `defaultCollapsed={false}` (un état replié resté en localStorage est neutralisé) ; logo,
  entrées et cartes crédits / compte sur les mêmes bords. `SpaceSwitcher` reste exporté mais n'est
  plus monté (retrait au lot Creator). `AppLayout` : barre haute sous `64.0625rem` (le seuil du DS,
  plus le `lg:` de Tailwind qui chevauchait d'un pixel), `toolsHref` relatif sur le Hub.
- **Paramètres C2-C5 sur les artboards** : en-tête `space-2`, onglets dans un rail défilant sous
  64 rem ; **Infos** au pas `space-4`, ligne d'état sans place quand vide, rangée photo qui plie,
  carte **« Comptes connectés »** à deux rangées Instagram / TikTok (pseudo lu dans `profiles`,
  bouton « Connecter » désactivé avec l'infobulle « Bientôt » tant qu'OAuth est au frigo — état
  validé par Julien), carte « Se déconnecter » au titre de carte ; chaînes
  `parametres.infos.comptes.*` ajoutées ; **Notifications / Abonnement / Légal** : titres de
  rangée, de facturation et de lien sur l'unique palier `heading-sm` (18 Onest 700), cartes à
  24 px de côtés, badge « Recommandée » en `chip`, plus de titre « Changer de formule ».
- **Vitrine** : `server.fs.allow` élargi à `apps/packages` pour servir les polices d'un DS branché
  en lien symbolique pendant un lot.
- C'est **`v0.1.4`** que le Hub épingle.

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
