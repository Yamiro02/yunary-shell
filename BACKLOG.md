# Backlog — évolutions demandées à la coque

Ce que les apps ont constaté en usage réel et qui relève de la coque. Une ligne par point :
qui le demande, ce qui se passe aujourd'hui, ce que la coque devra faire. Une entrée sort de
cette liste quand elle entre dans une version, avec sa ligne de CHANGELOG.

| Manque | Demandé par | Aujourd'hui | Ce que la coque devra faire |
|---|---|---|---|
| **`AuditBilan` : secours quand la photo de profil ne charge pas** — les avatars TikTok (`p16-*.tiktokcdn-us.com`) répondent avec `Cross-Origin-Resource-Policy`, le navigateur bloque l'image (`ERR_BLOCKED_BY_RESPONSE.NotSameOrigin`) | hub (onboarding 4/5, recette du 08/09/2026) | l'`<img>` échoue en silence, la carte « Ton profil » reste sans photo | afficher l'initiale du handle (même recette que `UserAvatar`) sur `onError` de l'image, et ne jamais compter sur le CDN |
