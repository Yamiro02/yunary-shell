# EXPORTS — l'API publique de `@yunary/shell` (0.4.1)

Un seul point d'entrée : `import { … } from '@yunary/shell'`. Tout ce qui n'est pas listé ici
est interne et peut changer sans bump majeur. Les **vues** (`*View`) sont pilotées par props et
ne parlent pas au back ; les **pages** et **conteneurs** les câblent sur les hooks.

🔒 Rien du catalogue dans le paquet : noms d'outils, quotas, prix viennent de la base (`tools`,
`tool_packs`), l'accès de `can_use`, l'abonnement de `subscriptions` / `subscription_items` /
`tool_entitlements`. Aucun achat n'est possible depuis Claude : tout ce qui touche Stripe ne vit
que dans le web.

## Configuration

| Export | Rôle |
|---|---|
| `configureShell(config)` | À appeler UNE fois dans `main.tsx`, avant tout rendu. `supabaseUrl`, `supabasePublishableKey`, `hubUrl`, `cookieDomain?` (absent en local), `stripePublishableKey?` (`VITE_STRIPE_PUBLISHABLE_KEY`, pour le checkout embarqué), `extraNextOrigins?` (local seulement). |
| `getShellConfig()` · `isShellConfigured()` | Lecture de la config (lève si absente). |
| `ShellConfig` | Type. |

## Client Supabase — le seul de l'écosystème

| Export | Rôle |
|---|---|
| `supabase` | Le client (`createBrowserClient` de `@supabase/ssr`, session en cookies `.yunary.com`). Singleton paresseux : l'utiliser avant `configureShell` lève. |
| `getSupabase()` | Le même, en fonction. |
| `signOut()` | La déconnexion — toujours par ici (`scope: 'global'`). |
| `Database` · `Tables` · `TablesInsert` · `TablesUpdate` · `Json` | Types générés du projet (lot 7, 25/09/2026), jamais édités. |

## Session, auth, garde

| Export | Rôle |
|---|---|
| `useAuth()` → `{ session, user, loading }` | Source unique de la session (store module, un seul `onAuthStateChange`). |
| `useLogin()` → `{ signInWithEmail, signInWithOAuth(provider, next) }` | Connexion e-mail et OAuth Google / Apple (retour sur `${hubUrl}/login?next=`). |
| `useSignup()` → `{ signUpWithEmail(email, password, next?) }` · `signupNextStep(hasSession)` | Inscription → `{ next: 'redirect' \| 'confirm', needsConfirmation }`. Session renvoyée (confirmation désactivée) = `redirect` : la page enchaîne avec `resolveAfterAuth` (0.4.1) ; sans session = « Vérifie ta boîte mail », dont le lien ramène sur `${hubUrl}/login?next=`. |
| `usePasswordReset()` → `{ requestReset(email, next?), updatePassword }` | E-mail de reset (vers `${hubUrl}/reset?next=`, 0.3.2) et nouveau mot de passe. |
| `useLogout()` | Déconnexion via le client unique. |
| `<ProtectedRoute requireOnboarding?>` · `<PageLoader />` | Non connecté ou onboarding non terminé → `hubUrl/login?next=<url>` ; loader pendant la résolution. |
| `useAfterAuthRedirect({ next, onboardingPath?, homePath? })` | Après connexion : la règle de `resolveAfterAuth`. `next` vers `/autoriser` part dès que la session est là, le reste attend le profil. `homePath` par défaut `/outils`. |
| `resolveAfterAuth({ next, onboardingCompleted, hubUrl, onboardingPath?, homePath? })` → `AfterAuthTarget \| null` | (0.3.2) 🔒 LA règle, dans l'ordre : 1. `next` sûr vers `/autoriser` (chemin exact, origine du hub, requête intacte) quel que soit l'onboarding ; 2. onboarding pas terminé → `onboardingPath` ; 3. `next` sûr → `next` ; 4. sinon `homePath` (`/outils`). `null` tant que le profil manque et qu'on en a besoin. `AfterAuthTarget` = `{ type: 'url', url }` (pleine page) ou `{ type: 'route', path }`. `AfterAuthInput`. |
| `isAuthorizeNext(next, hubUrl)` · `AUTHORIZE_PATH` | (0.3.2) `next` sûr qui vise exactement `/autoriser` sur l'origine du hub : la seule exception à l'onboarding. |
| `withNextParam(href, next)` | (0.3.2) Reporte `next` sur un lien ou une URL de retour (confirmation d'e-mail, OAuth, reset) s'il n'y est pas déjà ; garde les autres paramètres et le fragment. |
| `isSafeNext(url)` · `readSafeNext(search)` · `buildLoginUrl(currentUrl)` | `?next=` accepté seulement en sous-domaine https de `yunary.com` (+ `extraNextOrigins`). |
| `loginSchema` · `signupSchema` · `forgotSchema` · `newPasswordSchema` · `PASSWORD_MIN` · `PASSWORD_RULE` | Schémas zod — mot de passe : 8 caractères, minuscule + majuscule + chiffre, la politique du projet Supabase. |

## Pages d'auth (montées par le hub seul)

| Export | Rôle |
|---|---|
| `<LoginPage>` / `<LoginView>` | A1. Props de page : `signupHref`, `forgotHref`, `onboardingPath`, `homePath` (défaut `/outils`). La page reporte `?next=` sur ses liens (`withNextParam`, sans doubler celui que l'app a déjà mis). |
| `<SignupPage>` / `<SignupView>` | A2 ; confirmation d'e-mail → `LinkSentView kind="confirmation"`. `next` part dans le lien de confirmation et sur « Se connecter ». |
| `<ForgotPasswordPage>` / `<ForgotPasswordView>` | A3 → A4 avec « Renvoyer » (cooldown 30 s). Lit `?next=` et le met dans le lien de reset. |
| `<LinkSentView kind="reset" \| "confirmation">` | A4. |
| `<ResetPasswordPage forgotHref? loginHref? onboardingPath? homePath?>` / `<ResetPasswordView>` | `/reset` ; lien invalide (autre navigateur, expiré) → renvoi vers A3 (avec `next`). Après le nouveau mot de passe : `resolveAfterAuth` avec le `next` du lien (0.3.2 ; avant : toujours l'accueil). |
| `<AuthShell>` · `<AuthHeading>` · `<OAuthButtons>` · `<GoogleMark>` · `<AppleMark>` | La coque et les briques des pages d'auth. |

## Compte

| Export | Rôle |
|---|---|
| `useProfile()` | `profiles` de l'utilisateur (`Profile` : identité, `notification_prefs` parsées, `role`, `platform`, `handle`). `profileKey`, `parseNotificationPrefs`, `DEFAULT_NOTIFICATION_PREFS`. |
| `useUpdateProfile()` | Prénom, nom, `notification_prefs`. |
| `useUpdateAvatar()` · `useDeleteAvatar()` | Photo : recadrage carré 512 px WebP → bucket `avatars` → `profiles.avatar_url`. |
| `useSubscription()` → `SubscriptionState` | `{ subscription: SubscriptionInfo \| null, items: SubscriptionItem[] }` — la ligne `subscriptions` (colonnes autorisées seulement : `status`, `currentPeriodEnd`, `cancelAtPeriodEnd`) et les articles ACTIFS de `subscription_items` (`id`, `toolId`, `amountCents`, `status`). `null` = jamais abonné. `subscriptionKey`, `isSubscriptionActive(sub)`, `isPaymentFailed(sub)`. |
| `useDeleteAccount()` | Edge `delete-account`, puis déconnexion locale. |

## Outils, droits, règles, historique (0.3.0 — tout vient de la base)

| Export | Rôle |
|---|---|
| `useToolCatalog({ enabled? })` → `ToolCatalog` | `tools` (`ToolDef` : `id`, `name`, `description`, `position`, `monthlyQuota`, `priceCents`, `isPublished`, `status`) + `tool_packs` (`ToolPackDef` : `id`, `toolId`, `name`, `units`, `priceCents`, `isPublished`), lecture publique, triés par `position`. `toolCatalogKey`, `toolByIdIn(catalog, id)`, `packByIdIn(catalog, id)`. |
| `useEntitlements()` → `EntitlementsInfo` | `rows` : les lignes `tool_entitlements` de l'utilisateur (`Entitlement` : `toolId`, `source`, `status`, `quotaTotal`, `quotaUsed`, `periodStart`, `periodEnd`, `endsAtPeriodEnd`) ; `summaries` : un `EntitlementSummary` par outil (`toolId`, `source`, `status`, `used`, `total`, `remaining`, `periodEnd`, `endsAtPeriodEnd`, `usable`) = le droit que le serveur consommerait (`subscription` → `pack` → `free`, actif, en période, non épuisé), sinon le premier actif. `entitlementsKey`, `isEntitlementUsable(row)`, `summarizeEntitlements(rows)`. Types `EntitlementSource`, `EntitlementStatus`. |
| `useCanUse(tool)` → `CanUseResult` | 🔒 `select can_use(tool)` avec le jeton de l'utilisateur, lecture seule : `{ allowed, reason, source, remaining, link }`. `canUseKey`, `CanUseReason` (`ok`, `not_subscribed`, `quota_exhausted`, `unknown_tool`, `unauthorized`). |
| `useToolRules({ tool? })` → `ToolRule[]` | `user_tool_rules` (owner), les plus récentes d'abord ; `toolId` null = règle commune à tous les outils (0.4.0). `useAddToolRule()` (`{ toolId: string \| null, stepKey?, text }`), `useUpdateToolRule()` (`{ id, text, stepKey? }`), `useDeleteToolRule()` (`{ id }`) ; texte nettoyé, 1..`RULE_TEXT_MAX` (500). `toolRulesKey`. |
| `useToolRuns({ tool?, limit? })` → `ToolRun[]` | `tool_runs` (owner), plus récent d'abord, 50 par défaut. `ToolRun` : `toolId`, `status` (`ToolRunStatus`), `currentStepKey`, `data`, `refId`, `startedAt`, `updatedAt`, `finishedAt`. `toolRunsKey`. |

## Abonnement Stripe — un abonnement par client, un article par outil, packs (web seulement)

| Export | Rôle |
|---|---|
| `useStartCheckout()` · `checkoutTools(target)` | Edge `create-checkout-session` avec un `CheckoutTarget` (`{ tool }`, **`{ tools: string[] }`** — 1..10 outils publiés, distincts, non souscrits — ou `{ pack }`) → `CheckoutStart` : `{ mode: 'added', tools, tool?, amountCents }` (abonnement vivant, articles ajoutés au prorata en un appel, caches invalidés) ou `{ mode: 'checkout', clientSecret, amountCents, tools, tool?, pack? }` (checkout embarqué à N line items ; `amountCents` = somme). `checkoutTools` rend les outils d'une cible. Codes traduits : `not_published`, `already_subscribed`, `invalid_input`, `rate_limited`, `unauthorized`, `stripe_error`. |
| `<CheckoutModal open onClose target inline? demo?>` | Le checkout Stripe **embarqué** : appelle l'Edge à l'ouverture, charge Stripe.js paresseusement (`stripePublishableKey`), gère préparation / erreur / fermeture / `added` (singulier ou pluriel). **Un outil ou un pack, bureau** : Modal lg du DS (520) à ~80 % de la hauteur, en-tête « S'abonner à {tools.name} · 9 €/mois » ou « {tool_packs.name} · 5 €, en une fois » (artboard D2). **Plusieurs outils, bureau** (0.3.1, artboard Hub-03-Abonnement-Paiement) : la même Modal à `--container-wide` (900), deux colonnes — récap (`--container-aside`, fond secondary : « Activer tes outils », une ligne par outil avec `ToolLabel`, quota « 50 par mois », prix, total par mois, mention Stripe) et paiement (« Paiement » + croix, zone Stripe qui défile). **Mobile (≤ 64 rem) : page plein écran**, sans voile — exception assumée au modal du DS (D2b) ; plusieurs outils = récap **replié** dans l'en-tête (`<details>` natif, « 2 outils · 14 €/mois »). Noms, quotas et montants du catalogue puis de l'Edge. `CheckoutModalProps`. |
| `useCheckoutActivation()` → `{ state, clear }` · `CHECKOUT_PARAM` · `CHECKOUT_TOOLS_PARAM` · `CHECKOUT_TOOL_PARAM` · `CHECKOUT_PACK_PARAM` | Le retour de Stripe (`?checkout=<session_id>&tools=a,b`, `&tool=` / `&pack=` selon l'achat) : sonde `tool_entitlements` chaque seconde, 20 s au plus — un droit `subscription` actif **pour chaque** outil de `tools` (ou `tool`), un droit `pack` de l'outil du pack si `pack`, sinon un droit `subscription` / `pack` écrit depuis l'arrivée sur la page — `pending` · `active` · `late` (`idle` sans paramètre). Invalide abonnement et droits à l'activation ; `clear()` retire les paramètres. `AppLayout` affiche « Activation en cours… » pendant `pending`. `CheckoutActivationState`. |
| `<CheckoutActivationCard state onContinue>` | L'écran de retour : « On active ton outil… », succès, ou le message calme passé 20 s — jamais une erreur. |
| `useRemoveTool()` | Edge `remove-subscription-item { tool }` → `RemoveToolResult` : `{ mode: 'removed' }`, `{ mode: 'ends_at_period_end', periodEnd }` (l'outil reste jusqu'à la fin de la période, sans avoir) ou `{ mode: 'cancel_at_period_end', currentPeriodEnd }` (dernier article : tout l'abonnement s'arrête en fin de période). Codes : `no_subscription`, `not_subscribed`. Libellés dans `fr.parametres.abonnement.remove`. |
| `useCancelSubscription()` · `useResumeSubscription()` | Résiliation COMPLÈTE en fin de période (`cancel-subscription`) / réactivation (`resume-subscription`) ; invalident abonnement et droits. |
| `<CancelSubscriptionModal open onClose onConfirm periodEnd>` | « Se désabonner ? » en une étape, texte exact ; 3 phases. |
| `usePortalSession()` | Edge `create-portal-session` → le portail limité (carte, adresse, factures ; ni résiliation ni changement d'offre). `mutate()` redirige ; `mutate({ target })` le charge dans un onglet ouvert au clic par l'appelant. |
| `<PaymentFailedBanner>` / `<PaymentFailedBannerView onPortal>` | `past_due` / `unpaid` : bandeau « Ton dernier paiement n'est pas passé… » + bouton portail. Rendu par `AppLayout` en haut de l'app ; l'accès n'est pas coupé. |

## Abonnement v2 (0.4.0) — contrats du back § 8

Le premier abonnement reste le `CheckoutModal`. Tout changement d'un abonnement existant passe par `update-subscription`.

**Conteneurs câblés** (ce que le hub monte)

| Export | Rôle |
|---|---|
| `<ModifySubscriptionModal open onClose onDone>` | « Modifier mon abonnement » : outils publiés ou souscrits, état lu dans les droits, aperçu à chaque geste, paiement avec la 3D Secure. `onDone(outcome: SubscriptionChangeOutcome)` après un succès. `checkoutRequis` (pas d'abonnement vivant) → `CheckoutModal` des outils ajoutés. `ModifySubscriptionModalProps`. |
| `<ActivateToolModal open onClose toolId onDone? fromClaude?>` | « Activer un outil » : aperçu `{ tool }`, `update-subscription { ajouter: [tool] }`. `checkoutRequis` → `CheckoutModal`. Abonnement actif sans carte → « Ajouter une carte » (portail dans un nouvel onglet, aperçu relu au retour). `fromClaude` → « Tu peux retourner dans Claude » dans la modale au lieu d'`onDone`. `ActivateToolModalProps`. |
| `<ReactivateToolModal open onClose toolId onDone>` | « Réactiver » : `{ garder: [tool] }`, 0 € aujourd'hui, `onDone()` (le hub affiche son `Banner`). `ReactivateToolModalProps`. |
| `<SubscriptionResultScreen outcome onBack backLabel? onRetry? invoicesHref? linkAs?>` | L'écran de retour pleine page, avec l'e-mail du profil. `backLabel` (0.4.1) : défaut « Retour à mes outils », l'onboarding passe « Continuer ». `SubscriptionResultScreenProps`. |

**Hooks**

| Export | Rôle |
|---|---|
| `usePreviewSubscriptionChange(body: PreviewRequest \| null)` → `SubscriptionPreview` | `preview-subscription-change`. `PreviewRequest` = `SubscriptionChange` (`{ ajouter?, retirer?, garder? }`) ou `{ tool }`. 250 ms de délai ; `data` vide tant que la sélection bouge. `SubscriptionPreview` = `checkoutRequis`, `aPayerAujourdhui`, `detail[{ outil, libelle, montant, du, au }]`, `prochainPrelevement { date, montant } \| null`, `carte { marque, last4, expMois, expAnnee } \| null`, `fin`, `abonnement { statut, finPeriode, resiliation, outils[{ outil, nom, retraitProgramme }] } \| null`. `subscriptionPreviewKey`. |
| `useApplySubscriptionChange()` | 🔒 Un changement complet selon la règle du back : `mutate({ change, expectedTodayCents?, onBank? })` → `ChangeRunResult` = `{ status: 'ok', data, paidCents, confirmedByBank }` ou `{ status: 'declined', declineCode }`. 3DS confirmée → relance avec les seuls retraits / garder ; abandonnée → rien n'a changé. `ApplyChangeVars`. |
| `useUpdateSubscription()` · `updateSubscription(change)` | UN appel à `update-subscription` → `UpdateCallResult` = `{ status: 'ok', data: SubscriptionUpdateResult }` (`statut`, `finPeriode`, `resiliation`, `outils`, `ajoutes`, `montantPaye`), `{ status: 'requires_action', clientSecret, invoiceId }`, `{ status: 'card_declined', declineCode }` ; les autres codes (`past_due`, `no_subscription`, `already_subscribed`, `not_subscribed`, `not_published`…) lèvent leur phrase FR. |
| `useReactivateTool()` | `mutate(tool)` = `{ garder: [tool] }`. |
| `confirmBankPayment(clientSecret)` | La 3D Secure : `stripe.confirmCardPayment` (fenêtre Stripe par-dessus la page) ; `true` = confirmé. |
| `useInvoices()` → `InvoicesInfo` | `list-invoices` : `factures[{ date, numero, montant, statut, pdfUrl, hostedUrl, lignes[{ libelle, montant, du, au }] }]`, `prochainPrelevement`, `moyenDePaiement { marque, last4, expiration }`, `adresse`. `no_customer` = vide. `Invoice`, `InvoiceLine`, `invoicesKey`. |
| `callEdge(name, body, fallback)` · `invokeEdge(…)` | L'appel des Edge : `callEdge` rend `EdgeResult` (`{ ok: true, data }` ou `{ ok: false, code, data }`, refus métier compris) ; `invokeEdge` lève la phrase du code. |

**Logique pure** (testée) : `diffSelection(rows)` (coché + pas souscrit = ajouter, décoché + actif = retirer, coché + en retrait = garder), `withoutAdditions`, `normalizeChange`, `runSubscriptionChange(change, deps)`, `summaryFromPreview`, `unchangedSummary`, `activateAmountsFromPreview`, `prorataDetail` (« Yunary Audit du 10/10 au 23/10 »), `nextChargeDetail` (« Yunary Analyse 9 € + Yunary Audit 5 € »), `rowState`, `buildOutcome` → `SubscriptionChangeOutcome` (`variant`, `subjects`, `tools`, `todayCents`, `next`, `periodEnd`). Types `SubscriptionChange`, `SubscriptionSnapshot`, `SubscriptionToolState`, `PreviewCard`, `PreviewDetailLine`, `ChangeRunDeps`, `OutcomeInput`.

**Vues** (pilotées par props)

| Export | Rôle |
|---|---|
| `<ModifySubscriptionView open onClose rows onToggle summary card phase? error? onConfirm onChangeCard? onAddCard? cardBusy? onCancelBank? layout? inline?>` | « Modifier mon abonnement » (Hub-03-ModifierOutils). `rows: ToolSwitchRowView[]` (`toolId`, `name`, `priceCents`, `monthlyQuota`, `state: ToolRowState` = `active` · `ending` · `none`, `checked`, `periodEnd`, `disabled?`) ; `summary: ChangeSummaryView \| null` (`added`, `removed`, `reactivated`, `todayCents`, `todayDetail?`, `nextCents`, `nextFrom` ; `null` = aperçu en cours) ; `phase: PaymentPhase` = `edit` · `paying` · `bank` · `declined`. CTA « Payer X € » / « Confirmer », inactif sans changement ou sans carte quand il faut payer. Plein écran sous 64 rem. |
| `<ActivateToolView open onClose name amounts card phase? error? onConfirm onChangeCard? onAddCard? cardBusy? onCancelBank? inline?>` | « Activer Yunary Audit ? » (Hub-Outils-Activer-Confirmation). `amounts: ActivateAmountsView \| null` (`todayCents`, `todayDetail?`, `nextCents`, `nextDate`, `nextDetail?`). Phases de la grande modale + `done` (arrivée depuis Claude : « Tu peux retourner dans Claude »). |
| `<ReactivateToolView open onClose name periodEnd next phase? error? onConfirm inline?>` | « Réactiver Yunary Analyse ? » (Hub-Outils-Reactiver-Confirmation) : 0 € aujourd'hui, `next: { cents, date, detail? } \| null`, `phase` = `edit` · `saving`. |
| `<SubscriptionResultView variant subjects tools todayCents? next? periodEnd? email? invoicesHref? linkAs? onBack backLabel? onRetry? layout? inline?>` | L'écran de retour pleine page (Hub-03b-Retour) : `variant` = `added` · `removed` · `failed` ; `tools: ResultToolView[]` (`name`, `meta?`, `status` = `active` · `ending` · `failed`, `endsOn?`). Coche qui se dessine, puis titre, puis outils un par un. |
| `<AmountRows rows>` | Le tableau de montants des petites modales ; `AmountRow` = `label`, `caption?`, `amountCents` (`null` = squelette), `highlight?` (`bg-grad-soft`). |
| `<SavedCardLine card size? onChange? onAdd? busy?>` · `cardBrandLabel(brand)` | La carte enregistrée (`SavedCardView` = `brand`, `last4`, `expMonth`, `expYear`), tailles `full` · `compact` · `inline` ; `card: null` = « Ajoute une carte pour continuer » + « Ajouter une carte ». |
| `<ScheduledCancellationCard periodEnd toolCount onKeep keepBusy?>` | « Tout s'arrête le … » + « Garder mes outils » (Hub-Facturation-ResiliationProgrammee). |
| `<BankConfirmOverlay amountCents onCancel?>` | L'attente 3D Secure posée dans une modale ; la fenêtre de la banque est celle de Stripe.js, par-dessus. |
| `<FullScreenSheet title subtitle? onClose inline? footer?>` | Le plein écran des paiements sous 64 rem (extrait du `CheckoutModal`, avec un pied fixe). |
| `<AnimatedCheck tone? size? delay?>` · `<Reveal delay?>` · `useReducedMotion()` · `REDUCED_MOTION_QUERY` | Le mouvement de l'écran de retour, par `element.animate` sur `--ease-standard` ; rien d'animé sous `prefers-reduced-motion`. |

## Layout

| Export | Rôle |
|---|---|
| `<AppLayout items? settingsHref? toolsHref? showToolsLink?>` | `AppShell` + `HubSidebar` alimentés par le profil et l'abonnement ; tiroir sous 64rem ; contenu dans `AppContent` ; `Outlet` sans enfants. `toolsHref` (défaut `/outils`) : la route locale de la page des outils du hub — l'entrée du pied de nav et le lockup y mènent ; `showToolsLink={false}` (0.3.1) retire l'entrée du pied quand l'app met Outils dans `items`, le lockup garde sa cible. Rend le `PaymentFailedBanner` sous la barre haute ; carte compte « 2 outils · 14 €/mois » ou « Gratuit » (`accountPlanLabel`), « Activation en cours… » pendant un retour de checkout. |
| `<AppContent className?>` | Le conteneur du contenu : **pleine largeur, sans plafond**, gouttières de la v1 — `space-4` de côté et `space-5` en vertical sous 64 rem, `space-5` partout dès que la sidebar est à demeure (`64.0625rem`). Colonne flex qui remplit la hauteur restante sous la barre dans `AppLayout` : un bloc se centre avec `m-auto`. |
| `APP_GUTTER_X` · `APP_BLEED_X` · `APP_BLEED_TOP` | Les gouttières d'`AppContent` en classes : y rentrer, en sortir (le miroir négatif), coller au haut du contenu. Jamais recopiées dans une app. |
| `<AppBleed flush? className?>` | Un bloc qui sort des gouttières latérales — le cas « page entière » ; `flush` colle aussi au haut. `AppBleedProps`. |
| `<HubSidebar items? settingsHref? settingsActive? toolsHref? toolsActive? showToolsLink? account linkAs? open? onClose? staticLayout?>` | La sidebar en vue : lockup en tête (monogramme 1,5 rem + « Yunary » en display 18, lien vers `toolsHref`), nav de l'app, Mes outils (sauf `showToolsLink={false}`) + Paramètres en pied de nav, carte compte ; jamais repliée ; `linkAs` pour le routeur. `HubSidebarProps`, `ShellNavItem`. |
| `<AccountCard account>` · `<UserAvatar account>` | La carte du bas de sidebar (avatar, nom, libellé de formule) et l'avatar composé. `AccountView`. |
| `accountPlanLabel(subscriptionState)` | (0.4.0) Le libellé posé par `AppLayout` : « 2 outils · 14 €/mois » (articles actifs, montants facturés lus en base), « 2 outils » si un montant manque, « Gratuit » sans abonnement actif. |
| `<ToolLabel name className?>` | (0.3.1) Le nom d'un outil en lockup sur un nom LU EN BASE : « Yunary » puis le mot accentué en pochoir `.accent` ; un nom qui ne commence pas par « Yunary » est rendu tel quel. Aucune taille propre : celle de l'appelant. Le récap du checkout, les pages Outils du hub. `ToolLabelProps`. |
| `<SegmentedControl options value onChange label>` | Choix unique pleine largeur (`radiogroup`), sélection à la convention des Tabs. Manque DS consigné. |

## Paramètres

| Export | Rôle |
|---|---|
| `<ParametresPage tab? onTabChange? hrefs? onDeleted?>` | C2, C3, C5 : trois onglets (plus d'Abonnement depuis 0.4.0, la page Facturation du hub le remplace). Sans `tab`, lit `?tab=` ; un onglet inconnu retombe sur Infos. |
| `<ParametresLayout tab onTabChange>` · `parametresTabs()` | En-tête + onglets. `ParametresTab`. |
| `<InfosTab>` / `<InfosView>` | Photo, prénom / nom en autosave, e-mail verrouillé, mot de passe, carte « Comptes connectés » (réseau + handle en lecture seule depuis `profiles`, `onReseauChange` réservé), déconnexion. |
| `<NotificationsTab>` / `<NotificationsView>` | Deux préférences, interrupteurs du DS. |
| `<LegalTab>` / `<LegalView>` · `DEFAULT_LEGAL_HREFS` | Liens légaux + zone danger. |
| `<PasswordModal>` · `<DeleteAccountModal>` | Modales du DS en 3 phases (confirm → loading → result). |
| `<TabSkeleton>` · `<TabError>` | États de chargement et d'erreur d'un onglet. |
| `<InstagramMark>` · `<TikTokMark>` | Glyphes réseau (SVG inline). |

## Bilan d'audit

| Export | Rôle |
|---|---|
| `<AuditBilan audit minSample? nonEvaluableNote?>` | Le bilan complet, la variante `non_evaluable` (jauge « n / min · Plus qu'une »), l'erreur. Une métrique absente = une tuile absente. `nonEvaluableNote` : appoint de l'hôte sous la jauge. |
| `<AuditStateCard tone? icon title description?>` | La carte d'état héros — la `StateCard` du DS — attente, indisponible, erreur, non évaluable ; `brand` ou `danger`. |
| `useAccountAudit({ poll? })` | Le dernier `account_audits`, parsé ; polling tant qu'aucune ligne. `accountAuditKey`. |
| `parseAccountAudit` · `parseAuditStats` · `parseAuditVerdicts` · `parseAuditPoints` · `parseAuditProfil` · `AUDIT_MIN_SAMPLE` | Le contrat, en lecture tolérante. Types `ParsedAccountAudit`, `AuditStats`, `AuditVerdicts`, `AuditPoints`, `AuditProfil`… |

## Pages légales (publiques)

| Export | Rôle |
|---|---|
| `<CguPage>` · `<MentionsLegalesPage>` · `<ConfidentialitePage>` | Contenu figé. Prop `homeHref`. |
| `<SuppressionDonneesPage>` / `<SuppressionDonneesView state>` | `/suppression-donnees?code=` via GET `meta-data-deletion` (exigence Meta, frigo). |
| `<LegalPageLayout>` · `<LegalDocView doc>` · `LEGAL_DOCS` | La coque de lecture et les documents. |

## Chaînes, erreurs, formats

| Export | Rôle |
|---|---|
| `fr` | Toutes les chaînes communes (erreurs, auth, layout, outils et droits — `fr.tools` : sources, statuts, « Sans limite », « utilisé / total », « 50 par mois », échéances —, paramètres, checkout multi-outils, légal, audit). Jamais un nom d'outil : ils viennent de la base. |
| `getErrorMessage(error)` | Une erreur (Supabase, réseau, code métier brut du back, inconnue) → une phrase FR. Jamais un message brut à l'écran. |
| `messageForCode(code, fallback)` | 🔒 La phrase FR d'un code du back (`not_subscribed`, `quota_exhausted`, `not_published`, `already_subscribed`, `card_declined`, `past_due`, `requires_action`, `no_subscription`, `no_customer`, `unknown_tool`, `rate_limited`, `unauthorized`, `stripe_error`, `invalid_input`) ; inconnu → `fallback`. |
| `formatNombre` · `formatCompact` · `formatDateCourte` · `formatDateLongue` · `formatDateNumerique` (« 23/10/2026 ») · `formatJourMois` (« 23/10 ») · `formatEuros(cents)` · `initiales` | Formats FR via `Intl` ; `formatEuros` : centimes → « 9 € » / « 9,90 € ». |
| `useMediaQuery(query)` · `DS_MOBILE_QUERY` | `matchMedia` en `useSyncExternalStore` ; `DS_MOBILE_QUERY` = `(max-width: 64rem)`, le seuil unique du DS. |
| `withGlyphSize(icon, size?)` · `CARD_GLYPH_SIZE` | Pose `size` (18 px par défaut) sur un `<Icon />` reçu en prop, sauf si l'appelant l'a fixé. |
| `SHELL_VERSION` | La version du paquet. |

## Retiré en 0.3.0 (pivot MCP)

`ToolId`, `toolUrls` de la config · `useCredits`, `useActionCosts`, `creditsKey`, `isPaidPlan` · `usePlanCatalog` et ses helpers (`allocationFor`, `signupCreditsFor`, `priceFor`, `fullPriceFor`, `priceToShow`, `isLaunchPrice`) · `useCheckoutSession` (→ `useStartCheckout`) · `PLANS`, `FREE_PLAN`, `CREATEUR_PLAN`, `planFor`, `planFeatures` · `TOOLS`, `toolById`, `toolUrl`, `toolFullName`, `<ToolName>` · `<CreditsCard>`, `isCreditsLow`, `shouldLinkCredits` · `<OutilsPage>` / `<OutilsView>` · prop `native` d'`AppLayout` / `HubSidebar`, `ParametresVariant`, prop `extra` de `ParametresPage` · `PaidPlanId` · tout le profil créateur (`NicheCard`, `VoixCard`, `AvatarCibleCard`, `PrisesDePositionCard`, `ProfilCard`, `ChoiceChip`, `NICHES`, `NICHE_OTHER`, `NIVEAUX_LANGUE`, `VULGARITES`, `HUMOURS`, `HUMOUR_EXCLUSIF`, `parseVoix`, `EMPTY_VOIX`, types `Voix`…).
