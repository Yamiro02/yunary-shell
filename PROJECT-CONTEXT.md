# PROJECT-CONTEXT.md — @yunary/shell

> Contexte du package **coque** partagé par tous les fronts Yunary. Yunary en général → `../../../PROJECT-CONTEXT.md`. Données → `../../supabase/PROJECT-CONTEXT.md`.
> Repo GitHub `Yamiro02/yunary-shell` cloné ici, installé **épinglé** dans chaque app. Dépend de `@yunary/ds`. L'API symbole par symbole → `EXPORTS.md`. Un état, pas un journal.

---

## 1. Rôle

Tout ce qu'une app Yunary a en commun avec les autres et ne doit **jamais** réécrire : la session partagée entre sous-domaines, l'auth côté client, le solde de crédits, le layout (sidebar, tiroir mobile), le **commutateur d'outil**, les pages Paramètres (dont Abonnement), auth et légales, le bilan d'audit, les cartes du profil créateur, les chaînes FR communes. Une app = `@yunary/ds` + `@yunary/shell` + ses écrans métier.

**Aucune fondation ici** : couleurs, rayons, typo et composants génériques viennent du DS ; la coque compose avec les utilitaires Tailwind branchés sur ses jetons, sans CSS propre. Un manque du DS se signale dans son `BACKLOG.md`, avec la solution provisoire posée ici, jamais recréé comme fondation.

---

## 2. Ce que le package exporte

- **`configureShell(config)`** — appelé une fois par l'app dans `main.tsx` : `supabaseUrl`, `supabasePublishableKey`, `hubUrl`, `cookieDomain` (absent en local), `toolUrls` et `extraNextOrigins` (local seulement). Un paquet ne lit pas `import.meta.env` : les variables restent côté app.
- **`supabase`** — client unique, `createBrowserClient` de `@supabase/ssr` avec `cookieOptions: { domain: cookieDomain, path: '/', sameSite: 'lax', secure: true }` — `.yunary.com` en prod, **absent en local**. Flux PKCE (imposé par `@supabase/ssr`) : un lien de reset ouvert dans un autre navigateur est invalide, la page le dit et renvoie vers « Mot de passe oublié ». Singleton paresseux ; **la déconnexion passe par `signOut()` de ce client**.
- **`useAuth()`**, **`useProfile()`**, **`useCredits()`** (solde + `period_end` dans `user_credits`, allocation par formule), **`useActionCosts()`** (coûts dans `actions`), **`useSubscription()`**, mutations de profil, avatar, suppression de compte, portail et checkout Stripe.
- **`<ProtectedRoute>`** — non connecté ou `onboarding_completed = false` → `hubUrl/login?next=<url courante>` (navigation client sur le Hub, pleine page ailleurs) ; `next` accepté **uniquement** en sous-domaine https de `yunary.com` (`isSafeNext`).
- **`<AppLayout tool="creator">` / `<HubSidebar>`** — `AppShell` + `Sidebar` du DS, non repliable : commutateur d'espace en tête (`Dropdown` du DS, `live` en lien, `soon` grisé « Bientôt »), `nav` de l'outil, puis « Mes outils » + Paramètres, carte crédits (`Progress`), carte compte. Sous 64rem : tiroir du DS ouvert par une barre haute. Prop `native` : pas de commutateur, nav réduite passée par l'app. Maître : `resources/screens/HubSidebar.dc.html`.
- **Registre des outils** — `TOOLS: [{ id, label, accent, description, subdomain, status }]` (Hub `live`, Creator `live`, Metrics `soon`, maquette C1) ; `toolUrl(id)` dérive `https://<sous-domaine>.yunary.com`, `hubUrl` pour le Hub, `toolUrls` en local. Ajouter un outil = une entrée ici + monter la version dans les apps.
- **Pages** — `<ParametresPage variant="web"|"native">` (C2-C5 : Infos avec réseau + handle en lecture seule · Notifications · **Abonnement** — formule actuelle, solde, grille `PLANS` → `create-checkout-session`, portail → `create-portal-session` — · Légal avec Supprimer mon compte → `delete-account` ; déconnexion ; natif = Infos + Légal + slot `extra`) ; **pages d'auth** (A1-A4 + `/reset`, montées par le Hub seul) ; `<CguPage>`, `<MentionsLegalesPage>`, `<ConfidentialitePage>`, `<SuppressionDonneesPage>` (contenu verbatim de la v1, figé App Review).
- **`fr`** et **`getErrorMessage`** — chaînes communes (erreurs, auth, layout, paramètres, formules, légal, audit, profil) ; toute erreur devient une phrase FR.
- **`<AuditBilan>`** — synthèse, profil et bio annotée, chiffres clés, verdicts par axe, prose, marche / à améliorer ; variantes `non_evaluable` et erreur. **Une métrique absente = une tuile absente.** Maître : `resources/screens/AuditBilan.dc.html` ; `useAccountAudit` lit la ligne la plus récente.
- **Cartes du profil créateur** — `NicheCard` (tuiles radio = `Radio` du DS stylé), `VoixCard` (`SegmentedControl` + `ChoiceChip`), `AvatarCibleCard`, `PrisesDePositionCard` — contrôlées (`value` / `onChange`), l'autosave reste dans l'app hôte. Valeurs canoniques reprises de `legacy-v1/app/src/constants/onboarding.ts`, jamais traduites.
- **Composés faute de composant DS** (consignés dans `apps/packages/ds/BACKLOG.md`) : `SegmentedControl`, `ChoiceChip`, la tuile radio, l'avatar utilisateur, les marques Google / Apple / Instagram / TikTok en SVG inline, la barre haute + tiroir en guise de tab bar mobile.
- Chaque page existe en **vue** (props seules, rendue par la démo avec des fixtures) et en **page câblée** (hooks).

---

## 3. Ce qu'une app doit faire

- Variables d'env, côté app : `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_HUB_URL`, `VITE_COOKIE_DOMAIN` (`.yunary.com` en prod, vide en local) — passées à `configureShell` dans `main.tsx`.
- Peers à installer : `react`, `react-dom`, `react-router-dom`, `@yunary/ds`, `@tanstack/react-query` (le `QueryClient` est celui de l'app), `lucide-react`, `tailwind-merge`.
- CSS d'entrée : `@import '@yunary/ds/theme.css';` puis `@source '../node_modules/@yunary/shell/src';` — la coque n'a pas de CSS, Tailwind doit voir ses sources.
- Montage : `<QueryClientProvider>` + `<BrowserRouter>` ; les routes protégées sous `<ProtectedRoute>` ; `<AppLayout>` en layout de route.

---

## 4. Spécificités

- Aucune app ne crée son propre client Supabase ni ne touche au stockage de session.
- Le flux d'auth (login, OAuth Google/Apple, reset) est **dans le shell** ; le Hub ne fait que monter les pages. Politique de mot de passe = celle du projet Supabase (8 caractères, minuscule + majuscule + chiffre), reflétée exactement par `passwordSchema`.
- Tout coût affiché est lu dans `actions` ; les allocations de formule vivent dans `PLANS` (Gratuite 50 crédits ; payantes sans prix, `available: false` → « Bientôt » tant que le checkout n'est pas ouvert). **`available` passe à `true` au lot qui déploie `create-checkout-session`**, avec les prix et allocations calés, puis montée de version dans les apps.
- Écarts aux maquettes validés : sidebar à `--sidebar-w` du DS (16rem, maquette 264 px) ; carte d'auth sur `max-w-narrow` (30rem, maquette 27,5rem — jeton de largeur du DS, définitif) ; e-mail verrouillé sans icône cadenas ; carte « Ton réseau » en lecture seule depuis le dernier `account_audits` (la persistance dans `profiles` est une décision du lot Hub, `onReseauChange` est réservé) ; libellés de formule et date de recharge en `text-caption`.
- Paliers typographiques du DS uniquement : aucun palier inventé ni amputé.
- Versionné et taggé ; une app monte de version volontairement (jamais `latest`). Démo : `npm run demo` (port 5274), vues avec fixtures, sans back.

## 5. Décisions ouvertes

- Aucune. L'entrée unique `@yunary/shell` est tranchée (pas de sous-chemins).
