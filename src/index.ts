/**
 * @yunary/shell — la coque partagée des apps Yunary.
 *
 * Une app = `@yunary/ds` + `@yunary/shell` + ses écrans métier. Ce paquet porte ce qu'aucune
 * app ne doit réécrire : le client Supabase unique, la session, les crédits, le layout, le
 * commutateur d'outil, les pages Paramètres, auth et légales, le bilan d'audit, les cartes
 * du profil créateur, les chaînes FR communes.
 *
 * Aucune fondation ici : couleurs, rayons, typo et composants génériques viennent du DS.
 */
export const SHELL_VERSION = '0.1.0';
