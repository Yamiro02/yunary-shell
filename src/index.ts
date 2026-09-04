/**
 * @yunary/shell — la coque partagée des apps Yunary.
 *
 * Une app = `@yunary/ds` + `@yunary/shell` + ses écrans métier. Ce paquet porte ce qu'aucune
 * app ne doit réécrire : le client Supabase unique, la session, les crédits, le layout, le
 * commutateur d'outil, les pages Paramètres, auth et légales, le bilan d'audit, les cartes
 * du profil créateur, les chaînes FR communes.
 *
 * Aucune fondation ici : couleurs, rayons, typo et composants génériques viennent du DS.
 * L'API publique, symbole par symbole → EXPORTS.md.
 */
export const SHELL_VERSION = '0.1.0';

/* configuration */
export { configureShell, getShellConfig, isShellConfigured } from './config';
export type { ShellConfig, ToolId } from './config';

/* client Supabase — le seul de l'écosystème */
export { supabase, getSupabase, signOut } from './lib/supabase';
export type { ShellSupabaseClient } from './lib/supabase';
export type { Database, Tables, TablesInsert, TablesUpdate, Json } from './integrations/supabase/types';

/* session et auth */
export { useAuth } from './auth/useAuth';
export type { AuthState } from './auth/useAuth';
export { useLogin } from './auth/useLogin';
export type { OAuthProvider } from './auth/useLogin';
export { useSignup } from './auth/useSignup';
export { usePasswordReset } from './auth/usePasswordReset';
export { useLogout } from './auth/useLogout';
export { ProtectedRoute, PageLoader } from './auth/ProtectedRoute';
export type { ProtectedRouteProps } from './auth/ProtectedRoute';
export { isSafeNext, readSafeNext, buildLoginUrl } from './lib/next';

/* compte */
export { useProfile, parseNotificationPrefs, DEFAULT_NOTIFICATION_PREFS, profileKey } from './account/useProfile';
export type { Profile, NotificationPrefs } from './account/useProfile';
export { useUpdateProfile } from './account/useUpdateProfile';
export type { ProfileUpdate } from './account/useUpdateProfile';
export { useUpdateAvatar, useDeleteAvatar } from './account/useAvatar';
export { useCredits, useActionCosts, creditsKey } from './account/useCredits';
export type { CreditsInfo, ActionCost } from './account/useCredits';
export { useSubscription, subscriptionKey } from './account/useSubscription';
export type { SubscriptionInfo } from './account/useSubscription';
export { useDeleteAccount } from './account/useDeleteAccount';
export { usePortalSession, useCheckoutSession } from './account/useStripe';

/* formules et outils */
export { PLANS, FREE_PLAN, planFor } from './parametres/plans';
export type { PlanDef, PlanId } from './parametres/plans';
export { TOOLS, toolById, toolUrl, toolFullName } from './layout/tools';
export type { ToolDef } from './layout/tools';

/* audit de compte */
export { useAccountAudit, accountAuditKey } from './audit/useAccountAudit';
export {
  parseAccountAudit, parseAuditStats, parseAuditVerdicts, parseAuditPoints, parseAuditProfil, AUDIT_MIN_SAMPLE,
} from './audit/types';
export type {
  AccountAuditRow, AccountAuditStatus, ParsedAccountAudit, AuditStats, AuditVerdicts, AuditAxe, AuditEtatMesure,
  AuditEtatEstime, AuditPoint, AuditPoints, AuditProfil, AuditBioConstat, AuditBioDimension, AuditBioEtat,
} from './audit/types';

/* profil créateur — valeurs canoniques et types */
export { NICHES, NICHE_OTHER, NIVEAUX_LANGUE, VULGARITES, HUMOURS, HUMOUR_EXCLUSIF } from './profil/constants';
export { parseVoix, EMPTY_VOIX } from './profil/types';
export type { Voix, NiveauLangue, Vulgarite, Humour, AvatarCible, PrisesDePosition } from './profil/types';

/* chaînes et erreurs */
export { fr } from './i18n/fr';
export type { Fr } from './i18n/fr';
export { getErrorMessage } from './lib/errors';
export { formatNombre, formatCompact, formatDateCourte, formatDateLongue, initiales } from './lib/format';
