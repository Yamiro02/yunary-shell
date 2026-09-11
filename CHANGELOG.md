# Journal des versions — @yunary/shell

Une ligne par décision, et c'est le **pourquoi** qui compte. Trois endroits disent le même
numéro : `package.json`, la ligne d'installation du README, et le tag git.

---

## 0.1.11 — la carte « Ta voix » sur l'artboard 06 (12/09/2026)

Trois corrections sur `VoixCard` (maquette `Yunary Creator.dc.html`, artboard « 06 Profil Ta voix »).

- **`ChoiceChip` : filet 1,5 px** (`border-[1.5px]`, la hairline en px admise comme dans le DS)
  au lieu de 1 px — humour et expressions signature, et tout autre usage (Hub, onboarding) suit
  sans rien changer. État coché (filet `--primary`, coche), désactivé et `:focus-visible`
  (anneau `--ring` 2 px, offset 2) vérifiés.
- **Glyphe de la pastille à 18 px** (`size="1.125rem"` sur l'`Icon`, comme le `<svg 18>` de
  l'artboard) au lieu du repli 20 de la pastille `carte`. C'est la surcharge optique prévue par
  l'`Icon` du DS (elle écrit `--ds-icon-size` au site d'appel), pas un forçage. Les autres cartes
  du profil gardent 20.
- **« Tes expressions signature » s'affiche dès qu'il y a quelque chose à montrer** : les
  expressions captées par l'empreinte de voix ET celles déjà retenues (`voix.tics`, ou la prop
  `expressions` quand l'hôte les porte à part), dédoublonnées — même sans empreinte captée.
  Masquée seulement si la liste est vide. Avant, le bloc n'apparaissait qu'avec
  `expressionsDetectees` : un profil aux tics saisis mais sans empreinte ne les voyait pas.
- Épingle **`@yunary/ds` v0.1.8** (tuile à média collée aux bords — rien que la coque consomme).
- Vitrine : cadre « Ta voix · expressions sans empreinte ».

## 0.1.10 — retours de Julien sur la sidebar, Card gap (11/09/2026)

- **Sidebar, textes de formule : retour au rendu de la 0.1.8.** Le libellé de formule de la carte
  compte (« Formule Gratuite ») et « Recharge le… » de la carte crédits reviennent en
  `text-caption` (13 px) `font-medium` muted — le `text-eyebrow` (12 px) posé en 0.1.9 d'après le
  maître ne va pas à Julien. Rien d'autre ne change de taille.
- **Lockup sans retrait propre** (décision Julien, 11/09/2026) : plus de `px-space-2` sur le lien
  du logo, web et natif. Le bord gauche du monogramme est celui des pilules de nav, comme le logo
  de la `Sidebar` du DS — on ne l'aligne plus sur les icônes des entrées (qui, elles, sont en
  retrait de `space-2` dans leur pilule).
- **Largeur de la sidebar : `--sidebar-w` du DS**, clamp 240 → 288 selon l'écran, multiplié par le
  zoom. Inchangée, jamais figée, aucune largeur en dur dans la coque.
- **`Card gap={5}` du DS** dans `OutilsView` (cartes d'outil) et `ProfilCard`, à la place de
  `flex flex-col gap-space-5` en `className` : la pile est la prop du composant, pas une
  recomposition. Rendu identique.
- Épingle **`@yunary/ds` v0.1.7** (shell et vitrine).

## 0.1.9 — alignement sur les maquettes du 11/09 (11/09/2026)

Les retours de Julien et les maquettes mises à jour le 11/09/2026 (`resources/screens/` :
HubSidebar, AuditBilan, Yunary Hub C1-C6 et B4-B5), sur le **DS 0.1.5** — l'élément sélectionné
en corail `--primary` sur `--accent`, `StateCard`, `RadioTile`, le titre de modale sur la ligne de
la croix. Le peer monte à `>=0.1.5`. Deux décisions de Julien tiennent : l'espacement interne des
cartes reste à 24 px (les maquettes disent 20 / 22), et l'élément sélectionné n'est jamais en noir
gras.

### ⚠ Ce qui change à l'écran pour une app qui monte

- **La sidebar porte le lockup du maître** : le monogramme du `Logo` à 1,5 rem puis le nom de
  l'outil — « Yunary » en Onest 18 (`heading-sm`, `heading-weight`) et le mot accentué en pochoir
  `.accent` (« Yunary Creator » ; le Hub = « Yunary » seul), lu dans le registre `TOOLS` par la
  prop `tool` de `HubSidebar`, qui redevient lue. Plus de wordmark à 0,9 rem. Même retrait
  `space-2` qu'une entrée : l'icône s'aligne sur les icônes de nav par construction ; gap
  `space-2` (le maître dit 10). `no-underline` sur ce lien : c'est une entrée de nav, comme
  `.ds-sidenav` — la règle « jamais de no-underline » vise les liens de prose.
- **L'état actif de la nav est celui du DS 0.1.5** : plaque `--accent`, texte `--primary`, même
  graisse que les autres entrées — plus de fond surface-alt + encre 600 + icône `--brand-via`.
  Rien à faire dans la coque (c'est la `Sidebar` du DS), tout à voir dans l'app.
- **`AuditStateCard` rend la `StateCard` du DS** : pastille héros **outlined et carrée** (elle
  était ronde), padding 48, corps `body-sm` sur la colonne `narrow`, `role` status / alert. L'API
  de la coque ne bouge pas (`tone`, `icon`, `title`, `description`, `children`, `className`) — le
  Hub (attente, lenteur) et Creator n'ont rien à changer, mais la carte est plus haute.
- **`NicheCard` passe sur la `RadioTile` du DS** (la tuile radio composée dans la coque sort du
  BACKLOG du DS) : filet 1,5 px, `--primary` + `--accent` cochée, la tuile EST le label. Padding et
  titre sont ceux du composant (18 / 20, body 600 — le maître dit 14 / 16, control 500) : c'est le
  socle, on le prend tel quel (Julien, 11/09/2026).

### Sidebar, cartes crédits et compte

- Cartes au plus près du maître, sur les paliers du DS : elles y étaient déjà (12 / 16 et 8 / 12
  pour 14 / 16 et 10 / 12, gap 8 et 12 pour 8 et 10, min 52, avatar 36, piste sur `--card`). Un
  écart réel corrigé : **le libellé de formule passe à 12 px** (`text-eyebrow`, le maître) ; la
  ligne « Recharge le… » (gardée bien que le maître ne la dessine pas) suit à 12 — même rôle, même
  carte (Julien, 11/09/2026).
- `ToolName` (nouvel export) : le nom d'un outil en display avec son mot accentué, partagé par
  la carte de « Mes outils » et le lockup.

### Profil créateur, bilan d'audit

- **`SegmentedControl` : la convention de sélection des Tabs** (l'artboard B5 le dessine en
  `.ds-tabs`) — plaque `--accent`, texte `--primary`, ombre `sm`, même graisse (600) que les
  options non choisies. Plus de fond carte + encre 600.
- **Pastilles de marque outlined** partout (14 carte + 1 héros sur les maquettes) : `ProfilCard`,
  les en-têtes de section et les tuiles de chiffres d'`AuditBilan`.
- **`AuditBilan` : tous les titres de section à `heading-sm` (18 px)**, « Ton profil » compris
  (il était en `subheading`).

### Paramètres (artboards C2-C5)

- **C4 Abonnement** : nom de formule, solde et prix en **800** (`font-extrabold`, Onest 800 est
  chargé par la marque — l'écart « la graisse suit le palier, 700 » du 08/09 est levé par Julien
  le 11/09) ; cartes de formule en **filet 1,5 px** (hairline en px, comme le DS) ; la recommandée
  en `--primary` + **`shadow-md`** (était `sm`). Padding 24 gardé (l'artboard dit 22).
- **C2 Infos** : « Comptes connectés » à la taille de l'artboard (`titleSize="lg"`, `subheading`
  22 — l'écart « 22 → 18 » du 08/09 est levé) ; rangées Instagram / TikTok en filet 1,5 px sur
  `--input`.
- **Modales mot de passe et suppression : plus de pastille** — le titre partage la ligne de la
  croix (DS 0.1.4, maquette 02 de Creator). « Annuler » était déjà `secondary`. La suppression perd
  sa corbeille rouge : le danger reste porté par le bouton `danger` et le mot à taper (Julien,
  11/09/2026).

### Outillage

- Épingle **`@yunary/ds` v0.1.5** (shell et vitrine). `.claude/launch.json` gagne `shell-demo-5284`
  (la vitrine sur un second port, quand 5274 est tenu par une autre session).

## 0.1.8 — « Mes outils » et Paramètres s'ouvrent dans chaque outil (11/09/2026)

Décision Julien (11/09/2026) : depuis Creator, « Mes outils » ne renvoie plus vers le Hub. La page
s'ouvre **dans l'outil courant**, sur sa route locale, sans changer d'URL de sous-domaine ni de
menu — la sidebar reste celle de l'outil. Paramètres l'était déjà (`/parametres` monté par chaque
app). Exige **`@yunary/ds` ≥ 0.1.3** (`grid-cards-dialog`) : le peer monte.

- **`OutilsPage` remontée du Hub dans la coque** — `src/outils/OutilsPage.tsx`, vue
  (`OutilsView tool homeHref? prenom`) + page câblée (`OutilsPage tool homeHref?`, prénom lu dans
  le profil), chaînes `fr.outils` (`hello`, `lead`, `open`, `soon`). Même rendu qu'aujourd'hui :
  artboard C1, `grid-cards-dialog`, cartes du registre `TOOLS` sauf le Hub (« Mes outils » EST son
  accueil), « Bientôt » à 80 %.
- **La carte de l'outil courant navigue en interne** : avec `homeHref` (`/videos` pour Creator),
  « Ouvrir » reste une vraie `<a href>` — clic-milieu, « ouvrir dans un onglet » et lecteur d'écran
  intacts — dont le clic simple est intercepté vers `navigate(homeHref)` : plus de rechargement vers
  le sous-domaine où l'on est déjà. Les autres outils gardent leur lien absolu (`toolUrl`). Le `as`
  de `Button` n'accepte pas le `Link` du routeur (BACKLOG du DS), d'où le détour, le même que le
  `CardLink` de Creator.
- **`AppLayout` et `HubSidebar` : « Mes outils » ET le logo pointent par défaut vers la route
  locale `/outils`** — plus jamais `toolUrl('hub')`. Nouvelle prop `toolsHref` sur `AppLayout`
  (défaut `/outils`) ; l'entrée est active sur cette route (`isActive`, exact pour `/`). Le
  cas particulier « Hub → `/` » codé en dur dans `AppLayout` disparaît : **le Hub passe
  `toolsHref="/"`**, son accueil.
- **Paramètres et Abonnement : aucun lien de la coque ne renvoie vers le Hub** — vérifié :
  `settingsHref` est relatif (`/parametres`), les onglets vivent dans `?tab=`, les liens légaux sont
  `DEFAULT_LEGAL_HREFS` (`/cgu`…), les cartes crédits et compte n'ont pas de lien. Seuls les flux
  d'auth (`login`, `reset`, `next=`) visent `hubUrl`, et c'est leur rôle.
- ⚠ **Chaque app à sa montée en 0.1.8** : **monter `OutilsPage` sur `/outils`** dans le layout
  connecté — Creator : `<Route path="/outils" element={<OutilsPage tool="creator" homeHref="/videos" />} />`
  et DS `#v0.1.3` ; Hub : `<OutilsPage tool="hub" />` sur `/` à la place de sa page locale,
  **`toolsHref="/"` sur `AppLayout`** (sinon le pied de nav mène à `/outils`, qui n'existe pas dans
  le Hub), suppression de `apps/hub/src/pages/OutilsPage.tsx` et de `fr.outils` du Hub (désormais
  dans `fr` de la coque). Sans la route, l'entrée du pied de nav mène à une page absente.
- Vitrine : section « OutilsView · « Mes outils » dans l'outil » — Creator courant, « Ouvrir »
  en interne vers `/videos` ; les cadres Hub passent `toolsHref="/"`.

## 0.1.7 — les marges de page de la v1, exportées (11/09/2026)

- **`AppContent` reprend les gouttières de la v1** (`legacy-v1 › AppLayout` : `px-4 pt-6 pb-6
  lg:p-6`, décision Julien) : **16 px de côté, 24 px en haut et en bas** en régime tiroir ; **24 px
  partout** dès que la sidebar est à demeure. Sur les paliers du DS : `px-space-4 py-space-5`,
  `px-space-5` dès `64.0625rem`. Le `space-7` de 0.1.6 (48 px de côté et en vertical) disparaît :
  il était le palier « le plus proche » des 56 / 64 px des artboards, la v1 en usage réel tranche
  pour des marges plus serrées. Le seuil reste celui de la sidebar au pixel près (`64.0625rem`,
  pas `lg:`) — le DS n'a pas de palier nommé pour lui, l'entrée (d) de son BACKLOG reste ouverte.
- **Les gouttières sont exportées, à côté d'`AppContent`** — Creator les recopiait dans
  `src/components/common/marges.ts` pour ses barres collantes bord à bord (haut de fiche, haut de
  script, assistant, pied du tri), et ne suivait donc pas la coque quand elle bougeait. Trois
  constantes, miroir un pour un des siennes : **`APP_GUTTER_X`** (rentrer dans les gouttières
  latérales — ce qu'`AppContent` pose, ex-`DANS_MARGES`), **`APP_BLEED_X`** (en sortir,
  ex-`HORS_MARGES`), **`APP_BLEED_TOP`** (coller au haut du contenu, ex-`HORS_MARGE_HAUTE`) ; et
  **`<AppBleed flush?>`**, le wrapper du cas « page entière » (`APP_BLEED_X`, plus
  `APP_BLEED_TOP` avec `flush`). Une barre seule qui sort et rentre sur le même élément compose
  les deux constantes sans wrapper. `AppContent` est construit sur `APP_GUTTER_X` : une seule
  source, plus de valeur en double.
- ⚠ **Chaque app remonte à 0.1.7 et suit** : Creator supprime `marges.ts` et importe les trois
  constantes (renommage mécanique) ; toute page qui calait un retrait sur les 48 px de 0.1.6 (un
  `-mt-space-7`, un `px-space-7` miroir) casse silencieusement — 24 px de trop d'un côté.
- Épingle **`@yunary/ds` v0.1.3** (échelle d'app 100 / 115 %, titre de page 36 px, `grid-cards-*`) :
  rien de nouveau n'est consommé par la coque, le peer reste `>=0.1.2` — la vitrine, elle, rend
  désormais aux proportions de la v1.
- Vitrine : section « AppBleed · barre collante bord à bord » — une fiche dans la coque, barre
  haute et pied collants, le cadre défile ; note de la section AppLayout mise à jour. Les deux
  cadres d'app **retirent la sidebar sous le seuil** (0.1.6 l'épinglait : à 375 px le contenu
  n'avait plus que 100 px) — dans une app c'est le tiroir d'`AppLayout` qui prend le relais.

## 0.1.6 — le contenu passe pleine largeur (11/09/2026)

- **`AppLayout` ne monte plus `.page`** : le contenu du Hub et de Creator remplit la colonne,
  comme les artboards (aucun `max-width` dans leurs `main`, 56 à 64 px de côté). `.page` du DS
  (70 rem centrés) plafonnait tout à 1 120 px ; il n'est pas touché, il sert au site et aux pages
  légales publiques. Le conteneur est **`AppContent`** (nouvel export) : `space-5` de côté en régime
  tiroir (les 24 px d'aujourd'hui, rien ne bouge sous 64 rem), `space-7` dès que la sidebar est à
  demeure (`64.0625rem`, le seuil du DS — 48 px, le palier le plus proche des maquettes), vertical
  `space-7` inchangé. Exporté pour qu'une page hors `AppLayout` puisse prendre les mêmes bords.
- **Plafonds gardés, parce qu'ils sont ceux du bloc, pas de la page** : `max-w-read` sur les
  formulaires (Infos, Notifications, Légal, leurs squelettes et erreurs) et sur la prose du bilan —
  un champ ou une ligne de texte de 1 400 px ne se lit pas ; `max-w-wide` sur Abonnement — trois
  cartes de formule à 900 px, comme l'artboard C4, plutôt que trois cartes vides à 460 ;
  `max-w-narrow` sur le texte d'`AuditStateCard` (message centré). Les cartes du bilan (synthèse,
  profil, chiffres, verdicts, points) et celles du profil créateur n'ont aucun plafond : elles
  s'étirent. Rien n'est centré dans le sens de la page.
- ⚠ **Chaque app retire ses propres plafonds de page** à sa montée de version — un `.page`, un
  `max-w-[71.25rem]` ou un `px-[3.5rem]` posé dans une page d'app doublerait désormais les
  gouttières de la coque ou recréerait le plafond. Les plafonds de bloc (un texte, un état vide, un
  champ de recherche) restent à l'app.
- Vitrine : section « AppLayout · contenu pleine largeur » — la coque en `AppShell` fixe sur toute
  la fenêtre, Paramètres dedans, à redimensionner.

## 0.1.5 — lot Creator (10/09/2026)

Ce que Creator a demandé à la coque en montant ses écrans, plus les retraits prévus au 08/09.

- **Types régénérés** après les migrations Creator : tables `creator_scripts` et `generations`,
  RPC `persist_generation` / `validate_batch` (et `reset_free_credits`), `platform` et `format`
  sur `hooks` et `structures`, enum `action_type` étendu à `hook`, `restructure`, `suggest`.
  Rien d'autre n'a bougé côté schéma.
- ⚠ **`SpaceSwitcher` et `SpaceName` sont supprimés** — plus montés depuis 0.1.4 (le logo est
  statique, les outils vivent en cartes sur « Mes outils »), le retrait était annoncé pour ce lot.
  Ni le Hub ni Creator ne les importaient. `fr.layout.switchSpace` disparaît avec eux ; le registre
  (`TOOLS`, `toolUrl`, `toolFullName`) reste, c'est lui qui porte les outils.
- **`AuditBilan`, variante `non_evaluable` : la jauge de l'artboard 09b** remplace le badge
  « 2 publications récentes sur 3 » — un compteur `mono` sur le palier `subheading`, la `Progress`
  du DS et « Plus qu'une » en corail : elle dit ce qu'il reste à faire au lieu de répéter la
  description. Bloc à 20 rem sur `--background` ; les 18 px de côté et le gap de 10 px du maître
  sont ramenés aux paliers du DS (`space-4`, `space-2`). La pastille reste `Sprout` (choix du
  08/09) là où l'artboard dessine une horloge. Le Hub en hérite sans rien changer.
- ⚠ **La ligne de rassurance n'est plus rendue d'office** : elle parle d'« étape suivante », ce qui
  n'a de sens que dans l'onboarding du Hub, pas dans l'onglet Audit de Creator. Elle passe par la
  nouvelle prop **`nonEvaluableNote`** ; la chaîne `fr.audit.nonEvaluable.profilReady` reste
  exportée. Le Hub rend déjà sa propre phrase sous `AuditBilan` (`nonEvaluableNext`, artboard B4) :
  il ne perd rien en montant en 0.1.5, et peut passer la prop s'il veut la remonter dans la carte.
  `fr.audit.nonEvaluable.badge` disparaît, `compteur` et `reste` la remplacent.
- **`AuditBilan` : la photo de profil ne dépend plus du CDN.** Les avatars TikTok
  (`p16-*.tiktokcdn-us.com`) sont servis avec `Cross-Origin-Resource-Policy` : le navigateur
  bloquait l'image et la carte « Ton profil » restait sans photo. `onError` bascule sur l'initiale
  du handle, la même recette que `UserAvatar`.
- **`SHELL_VERSION` était resté à `0.1.3`** : la constante est alignée sur le `package.json`, et
  porte désormais la consigne de se bumper dans le même commit (la dériver du `package.json` au
  build casserait la vitrine, qui consomme les sources).
- **`AppLayout` accepte la nav de Creator telle quelle** — Vidéos · Générateur · Profil créateur,
  icônes `video` / `file-text` / `user` du DS : la coque n'a rien de propre à Creator, la vitrine
  le montre avec la nav réelle.
- C'est **`v0.1.5`** que Creator épingle ; le Hub monte à son prochain lot.

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
