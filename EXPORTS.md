# EXPORTS — l'API publique de `@yunary/shell`

Un seul point d'entrée : `import { … } from '@yunary/shell'`. Tout ce qui n'est pas listé ici
est interne et peut changer sans bump majeur. Les **vues** (`*View`) sont pilotées par props et
ne parlent pas au back ; les **pages** et **conteneurs** les câblent sur les hooks.

## Configuration

| Export | Rôle |
|---|---|
| `configureShell(config)` | À appeler UNE fois dans `main.tsx`, avant tout rendu. `supabaseUrl`, `supabasePublishableKey`, `hubUrl`, `cookieDomain?` (absent en local), `toolUrls?`, `extraNextOrigins?` (local seulement). |
| `getShellConfig()` · `isShellConfigured()` | Lecture de la config (lève si absente). |
| `ShellConfig` · `ToolId` | Types. |

## Client Supabase — le seul de l'écosystème

| Export | Rôle |
|---|---|
| `supabase` | Le client (`createBrowserClient` de `@supabase/ssr`, session en cookies `.yunary.com`). Singleton paresseux : l'utiliser avant `configureShell` lève. |
| `getSupabase()` | Le même, en fonction. |
| `signOut()` | La déconnexion — toujours par ici (`scope: 'global'`). |
| `Database` · `Tables` · `TablesInsert` · `TablesUpdate` · `Json` | Types générés du projet, jamais édités. |

## Session, auth, garde

| Export | Rôle |
|---|---|
| `useAuth()` → `{ session, user, loading }` | Source unique de la session (store module, un seul `onAuthStateChange`). |
| `useLogin()` → `{ signInWithEmail, signInWithOAuth }` | Connexion e-mail et OAuth Google / Apple (retour sur `${hubUrl}/login?next=`). |
| `useSignup()` → `{ signUpWithEmail }` | Inscription ; `needsConfirmation` quand aucune session n'est renvoyée. |
| `usePasswordReset()` → `{ requestReset, updatePassword }` | E-mail de reset (vers `${hubUrl}/reset`) et nouveau mot de passe. |
| `useLogout()` | Déconnexion via le client unique. |
| `<ProtectedRoute requireOnboarding?>` · `<PageLoader />` | Non connecté ou onboarding non terminé → `hubUrl/login?next=<url>` ; loader pendant la résolution. |
| `useAfterAuthRedirect({ next, onboardingPath?, homePath? })` | Après connexion : onboarding, puis `next` sûr, sinon l'accueil. |
| `isSafeNext(url)` · `readSafeNext(search)` · `buildLoginUrl(currentUrl)` | `?next=` accepté seulement en sous-domaine https de `yunary.com` (+ `extraNextOrigins`). |
| `loginSchema` · `signupSchema` · `forgotSchema` · `newPasswordSchema` · `PASSWORD_MIN` · `PASSWORD_RULE` | Schémas zod — mot de passe : 8 caractères, minuscule + majuscule + chiffre, la politique du projet Supabase. |

## Pages d'auth (montées par le Hub seul)

| Export | Rôle |
|---|---|
| `<LoginPage>` / `<LoginView>` | A1. Props de page : `signupHref`, `forgotHref`, `onboardingPath`, `homePath`. |
| `<SignupPage>` / `<SignupView>` | A2 ; confirmation d'e-mail → `LinkSentView kind="confirmation"`. |
| `<ForgotPasswordPage>` / `<ForgotPasswordView>` | A3 → A4 avec « Renvoyer » (cooldown 30 s). |
| `<LinkSentView kind="reset" \| "confirmation">` | A4. |
| `<ResetPasswordPage>` / `<ResetPasswordView>` | `/reset` ; lien invalide (autre navigateur, expiré) → renvoi vers A3. |
| `<AuthShell>` · `<AuthHeading>` · `<OAuthButtons>` · `<GoogleMark>` · `<AppleMark>` | La coque et les briques des pages d'auth. |

## Compte

| Export | Rôle |
|---|---|
| `useProfile()` | `profiles` de l'utilisateur (`Profile` : identité, `notification_prefs` parsées, `role`, `platform`, `handle`). `profileKey`, `parseNotificationPrefs`, `DEFAULT_NOTIFICATION_PREFS`. |
| `useUpdateProfile()` | Prénom, nom, `notification_prefs`. |
| `useUpdateAvatar()` · `useDeleteAvatar()` | Photo : recadrage carré 512 px WebP → bucket `avatars` → `profiles.avatar_url`. |
| `useCredits()` → `CreditsInfo \| null` | Solde et `period_end` (`user_credits`), allocation de la formule. `creditsKey`. |
| `useActionCosts()` → `ActionCost[]` | 🔒 Les coûts par action, lus dans `actions`. Jamais un coût en dur. |
| `useSubscription()` → `SubscriptionInfo \| null` | `subscriptions` (colonnes autorisées seulement). `subscriptionKey`. |
| `useDeleteAccount()` | Edge `delete-account`, puis déconnexion locale. |
| `usePortalSession()` · `useCheckoutSession()` | Edge `create-portal-session` / `create-checkout-session` (cette dernière pas encore déployée). |

## Formules et outils

| Export | Rôle |
|---|---|
| `PLANS` · `FREE_PLAN` · `planFor(code)` · `PlanDef` · `PlanId` | Le catalogue : Gratuite réelle (50 crédits), payantes sans prix (`— €`) et `available: false` → « Bientôt ». |
| `TOOLS` · `toolById` · `toolUrl` · `toolFullName` · `ToolDef` | Le registre des outils (Hub, Creator `live`, Metrics `soon`). Ajouter un outil = une entrée. |

## Layout

| Export | Rôle |
|---|---|
| `<AppLayout tool items? settingsHref? toolsHref? native?>` | `AppShell` + `HubSidebar` alimentés par le profil, les crédits et l'abonnement ; tiroir sous 64rem ; contenu dans `AppContent` ; `Outlet` sans enfants. `toolsHref` : la route locale de « Mes outils » (défaut `/outils`, le Hub passe `/`) — l'entrée et le logo y mènent, l'entrée est active dessus. |
| `<AppContent className?>` | Le conteneur du contenu : **pleine largeur, sans plafond**, gouttières de la v1 — `space-4` de côté et `space-5` en vertical sous 64 rem, `space-5` partout dès que la sidebar est à demeure (`64.0625rem`). Pour une page hors `AppLayout` qui veut les mêmes bords. |
| `APP_GUTTER_X` · `APP_BLEED_X` · `APP_BLEED_TOP` | Les gouttières d'`AppContent` en classes : y rentrer (`px-space-4 min-[64.0625rem]:px-space-5`, ce qu'`AppContent` pose), en sortir (le miroir négatif), coller au haut du contenu (`-mt-space-5`). Pour une barre collante bord à bord ; jamais recopiées dans une app. |
| `<AppBleed flush? className?>` | Un bloc qui sort des gouttières latérales (`APP_BLEED_X`) — le cas « page entière » : fiche, script, assistant ; `flush` colle aussi au haut (`APP_BLEED_TOP`). Ses enfants rentrent avec `APP_GUTTER_X`. `AppBleedProps`. |
| `<HubSidebar tool …>` | La sidebar en vue : lockup en tête (monogramme 1,5 rem + `ToolName` de `tool`, lien vers « Mes outils »), nav de l'outil, Mes outils + Paramètres en pied de nav, crédits, compte ; jamais repliée ; `native` sans « Mes outils » ; `linkAs` pour le routeur ; `toolsHref` local (défaut `/outils`), jamais le Hub. |
| `<ToolName tool className?>` | Le nom d'un outil en display 18 : « Yunary » puis le mot accentué en pochoir `.accent`. Le lockup de la sidebar et la carte de « Mes outils ». |
| `<CreditsCard credits>` · `<AccountCard account>` · `<UserAvatar account>` | Les cartes du bas de sidebar. `CreditsView`, `AccountView`. |
| `<SegmentedControl options value onChange label>` | Choix unique pleine largeur (`radiogroup`), sélection à la convention des Tabs (`--primary` sur `--accent`, même graisse). Manque DS consigné. |

## « Mes outils » (montée par chaque app sur `/outils`, le Hub sur `/`)

| Export | Rôle |
|---|---|
| `<OutilsPage tool homeHref?>` | La page câblée (C1) : prénom du profil, cartes du registre `TOOLS` sauf le Hub. `homeHref` = l'accueil de l'outil courant (`/videos` pour Creator) : sa carte navigue en interne, les autres ouvrent leur sous-domaine. `OutilsPageProps`. |
| `<OutilsView tool homeHref? prenom>` | La vue, props seules. `OutilsViewProps`. |

## Paramètres

| Export | Rôle |
|---|---|
| `<ParametresPage variant? tab? onTabChange? hrefs? extra? onDeleted?>` | C2–C5. `web` (4 onglets) ou `native` (Infos, Légal + slot `extra`). Sans `tab`, lit `?tab=`. |
| `<ParametresLayout>` · `parametresTabs(variant)` | En-tête + onglets. |
| `<InfosTab>` / `<InfosView>` | Photo, prénom / nom en autosave, e-mail verrouillé, mot de passe, réseau + handle (lecture seule depuis `profiles`, `onReseauChange` réservé), déconnexion. |
| `<NotificationsTab>` / `<NotificationsView>` | Deux préférences, interrupteurs du DS. |
| `<AbonnementTab>` / `<AbonnementView>` | Portail (si abonnement), formule + solde, grille `PLANS`. |
| `<LegalTab>` / `<LegalView>` · `DEFAULT_LEGAL_HREFS` | Liens légaux + zone danger. |
| `<PasswordModal>` · `<DeleteAccountModal>` | Modales du DS en 3 phases (confirm → loading → result). |
| `<TabSkeleton>` · `<TabError>` | États de chargement et d'erreur d'un onglet. |
| `<InstagramMark>` · `<TikTokMark>` | Glyphes réseau (SVG inline). |

## Bilan d'audit

| Export | Rôle |
|---|---|
| `<AuditBilan audit minSample? nonEvaluableNote?>` | Le bilan complet, la variante `non_evaluable` (jauge « n / min · Plus qu'une »), l'erreur. Une métrique absente = une tuile absente. La photo de profil retombe sur l'initiale du handle quand le CDN la bloque. `nonEvaluableNote` : appoint de l'hôte sous la jauge (le Hub y passe `fr.audit.nonEvaluable.profilReady`, Creator ne passe rien). |
| `<AuditStateCard tone? icon title description?>` | La carte d'état héros — la `StateCard` du DS (0.1.4 : `Card lg` centrée, pastille héros outlined carrée) — attente, indisponible, erreur, non évaluable ; `brand` ou `danger`. API de la coque inchangée. |
| `useAccountAudit({ poll? })` | Le dernier `account_audits`, parsé ; polling tant qu'aucune ligne. `accountAuditKey`. |
| `parseAccountAudit` · `parseAuditStats` · `parseAuditVerdicts` · `parseAuditPoints` · `parseAuditProfil` · `AUDIT_MIN_SAMPLE` | Le contrat, en lecture tolérante. Types `ParsedAccountAudit`, `AuditStats`, `AuditVerdicts`, `AuditPoints`, `AuditProfil`… |

## Profil créateur (cartes contrôlées, autosave dans l'app)

| Export | Rôle |
|---|---|
| `<NicheCard value onChange>` | Grille de `RadioTile` (DS 0.1.4) des `NICHES` + « Autre » → champ libre. |
| `<VoixCard voix onChange expressionsDetectees? expressions? onExpressionsChange?>` | Niveau de langue, vulgarité, humour (`aucun` exclusif), expressions signature. |
| `<AvatarCibleCard value onChange>` | Qui / Quoi / Son problème (`AvatarCible`). |
| `<PrisesDePositionCard value onChange>` | 01–03 (`PrisesDePosition`). |
| `<ProfilCard icon title description?>` · `<ChoiceChip>` | La coque des cartes (pastille de marque outlined, titre `heading-sm`) et la chip cochable. |
| `NICHES` · `NICHE_OTHER` · `NIVEAUX_LANGUE` · `VULGARITES` · `HUMOURS` · `HUMOUR_EXCLUSIF` | 🔒 Valeurs canoniques (v1), jamais traduites. |
| `parseVoix` · `EMPTY_VOIX` · types `Voix`, `NiveauLangue`, `Vulgarite`, `Humour` | `personas.voix`. |

## Pages légales (publiques)

| Export | Rôle |
|---|---|
| `<CguPage>` · `<MentionsLegalesPage>` · `<ConfidentialitePage>` | Contenu verbatim de la v1 (figé App Review). Prop `homeHref`. |
| `<SuppressionDonneesPage>` / `<SuppressionDonneesView state>` | `/suppression-donnees?code=` via GET `meta-data-deletion` (exigence Meta). |
| `<LegalPageLayout>` · `<LegalDocView doc>` · `LEGAL_DOCS` | La coque de lecture et les documents. |

## Chaînes, erreurs, formats

| Export | Rôle |
|---|---|
| `fr` | Toutes les chaînes communes (erreurs, auth, layout, paramètres, formules, légal, audit, profil). |
| `getErrorMessage(error)` | Une erreur (Supabase, réseau, inconnue) → une phrase FR. Jamais un message brut à l'écran. |
| `formatNombre` · `formatCompact` · `formatDateCourte` · `formatDateLongue` · `initiales` | Formats FR via `Intl`. |
| `SHELL_VERSION` | La version du paquet. |
