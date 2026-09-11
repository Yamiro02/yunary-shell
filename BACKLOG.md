# Backlog — évolutions demandées à la coque

Ce que les apps ont constaté en usage réel et qui relève de la coque. Une ligne par point :
qui le demande, ce qui se passe aujourd'hui, ce que la coque devra faire. Une entrée sort de
cette liste quand elle entre dans une version, avec sa ligne de CHANGELOG.

| Manque | Demandé par | Aujourd'hui | Ce que la coque devra faire |
|---|---|---|---|
| **`formatRelative`** (« il y a 14 heures », « Collé à l'instant ») — la coque a `formatDateCourte` / `formatDateLongue`, pas de forme relative, alors que toute app qui date un objet récent en a besoin | creator (fiche vidéo « Analysé », page script « Collé ») | `src/lib/format.ts` de Creator | `formatRelative(iso)` à côté des autres formats FR, via `Intl.RelativeTimeFormat` |
| **`formatRate`** (« 5,1 % » — un taux, une décimale, virgule française) | creator (carte vidéo, fiche, chiffres) | `src/lib/format.ts` de Creator | `formatRate(n)` à côté de `formatNombre` / `formatCompact` — à promouvoir dès qu'un second outil affiche un taux (Metrics) |
| **Glyphes de pastille à 18 px partout** — les artboards du 11/09 dessinent les pastilles `carte` avec un `<svg 18>` (AuditBilan, profil) ; la coque n'a passé que `VoixCard` à `size="1.125rem"` (0.1.11), les en-têtes de section et tuiles de chiffres d'`AuditBilan` et les autres `ProfilCard` (niche, avatar cible, prises de position) restent au repli 20 de la pastille. **Décision Julien (12/09/2026) : on ne touche pas maintenant** | shell (constat du 12/09) | `AuditBilan.tsx` (`TitledCard`, tuiles), `NicheCard`, `AvatarCibleCard`, `PrisesDePositionCard` | **en 0.1.12**, avec les points que remonteront les passes 07, 08 et 09 (À propos, Niche & avatar, Audit) — chaque carte vérifiée contre son artboard, jamais une règle globale posée à l'aveugle |
