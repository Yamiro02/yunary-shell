# PROJECT-CONTEXT.md — @yunary/shell

> Contexte du package **coque** partagé par tous les fronts Yunary. Yunary en général → `../../../PROJECT-CONTEXT.md`. Données → `../../supabase/PROJECT-CONTEXT.md`.
> Repo GitHub cloné ici, installé **épinglé** dans chaque app. Dépend de `@yunary/ds`. Un état, pas un journal.

---

## 1. Rôle

Tout ce qu'une app Yunary a en commun avec les autres et ne doit **jamais** réécrire : la session partagée entre sous-domaines, l'auth côté client, le solde de crédits, le layout (sidebar / tab bar), le **commutateur d'outil**, les pages Paramètres (dont Abonnement), auth et légales, les chaînes FR communes. Une app = `@yunary/ds` + `@yunary/shell` + ses écrans métier.

---

## 2. Ce que le package exporte

- **`supabase`** — client unique, `createBrowserClient` de `@supabase/ssr` avec `cookieOptions: { domain: VITE_COOKIE_DOMAIN, path: '/', sameSite: 'lax', secure: true }` — `domain = '.yunary.com'` en prod, **absent en local** (`domain` ne fonctionne pas sur `localhost`) ; `httpOnly` impossible côté client. Connecté sur un front = connecté partout ; **la déconnexion passe par ce client** (sinon des cookies traînent sur un sous-domaine).
- **`useAuth()`**, **`useProfile()`**, **`useCredits()`** (solde + date de recharge, lus dans `user_credits` ; `actions` pour les coûts).
- **`<ProtectedRoute>`** — non connecté ou `onboarding_completed = false` → redirection `VITE_HUB_URL/login?next=<url courante>` ; `next` accepté **uniquement** en sous-domaine de `yunary.com`.
- **`<AppLayout tool="creator">` / `HubSidebar`** — le squelette des maquettes : sidebar desktop (≥ `lg`) avec commutateur en tête, `nav` de l'outil, puis carte crédits, Paramètres et compte en bas ; tab bar mobile ; prop `native` (Capacitor) : navigation réduite, pas de commutateur. Maître : `resources/screens/HubSidebar.dc.html`.
- **Registre des outils** — `tools: [{ id, label, icon, url, status: 'live'|'soon' }]` ; le commutateur liste les `live` (liens absolus) et les `soon` (grisés, badge « bientôt »). Ajouter un outil = une entrée ici + monter sa version dans les apps.
- **Pages** — `<ParametresPage variant="web"|"native">` (maquettes C2-C5 : Infos avec handle + réseau · Notifications · **Abonnement** — formule actuelle, solde, grille des offres → `create-checkout-session`, portail → `create-portal-session` — · Légal avec Supprimer mon compte → `delete-account` ; déconnexion) ; **pages d'auth** (maquettes A1-A4 : connexion, inscription, mot de passe oublié, lien envoyé — montées par le Hub seul) ; `<CguPage>`, `<MentionsLegalesPage>`, `<ConfidentialitePage>`, `<SuppressionDonneesPage>`.
- **`fr`** — chaînes communes (erreurs, auth, paramètres, formules, légal).
- **`<AuditBilan>`** — le bilan d'audit complet (synthèse, profil/bio annotée, chiffres clés, verdicts par axe, prose, marche / à améliorer, variante `non_evaluable`) ; utilisé par Hub (onboarding 4/5) et Creator (Profil › Audit). Maître : `resources/screens/AuditBilan.dc.html`.
- **Cartes du profil créateur** — radio-grid niches, voix (segmented niveau de langue + vulgarité, chips humour, expressions signature), avatar cible (Qui / Quoi / Son problème), prises de position 01-03 ; utilisées par Hub (onboarding 5/5) et Creator (Profil). Autosave géré par l'app hôte.

---

## 3. Variables d'env attendues par les apps

`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_HUB_URL`, `VITE_COOKIE_DOMAIN` (`.yunary.com` en prod, vide en local).

---

## 4. Spécificités

- Aucune app ne crée son propre client Supabase ni ne touche au stockage de session.
- Le flux d'auth (login, OAuth Google/Apple, reset) est **dans le shell** ; le Hub ne fait que monter les pages.
- Tout coût affiché (Abonnement, Paramètres) est lu dans `actions` / la config de plans du back, jamais en dur.
- Versionné et taggé ; une app monte de version volontairement (jamais `latest`).

## 5. Décisions ouvertes

- Découpage exact des exports (un seul point d'entrée vs sous-chemins `@yunary/shell/pages`).
