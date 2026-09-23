# Backlog — évolutions demandées à la coque

Ce que les apps ont constaté en usage réel et qui relève de la coque. Une ligne par point :
qui le demande, ce qui se passe aujourd'hui, ce que la coque devra faire. Une entrée sort de
cette liste quand elle entre dans une version, avec sa ligne de CHANGELOG.

Vidé le 23/09/2026 (lot 0a) : les deux entrées (`formatRelative`, `formatRate`) venaient de
Creator, gelé dans `legacy-v2/`. Les retraits du pivot MCP ne sont pas un backlog : ils sont
décrits dans `PROJECT-CONTEXT.md` § 3 et constituent le lot shell (0.3.0).

| Manque | Demandé par | Aujourd'hui | Ce que la coque devra faire |
|---|---|---|---|
| **`useAccountAudit({ poll })` ne re-interroge que tant qu'AUCUNE ligne n'existe** — après une correction d'identifiant, l'ancienne ligne `error` reste la plus récente : le polling s'arrête et la nouvelle ligne n'est jamais vue | hub (Audit en cours, lot 2) | le hub relance `refetch()` lui-même toutes les 4 s tant que la ligne pertinente manque (`isAuditRelevant` sur `sessionStorage`, `apps/hub/src/pages/parcours/AuditEnCoursPage.tsx`) | un `poll` qui accepte `{ since }` (ou un `until`) et continue tant que la ligne la plus récente est antérieure |
