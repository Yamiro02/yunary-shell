/**
 * @yunary/shell — la coque partagée de la coquille web Yunary.
 *
 * Une app = `@yunary/ds` + `@yunary/shell` + ses pages. Ce paquet porte ce qu'aucune app ne
 * doit réécrire : le client Supabase unique, la session, l'auth, le layout, les pages Paramètres
 * et légales, le bilan d'audit, les hooks du nouveau modèle (outils, droits, abonnement par
 * outil, règles, historique), les chaînes FR communes.
 *
 * Aucune fondation ici : couleurs, rayons, typo et composants génériques viennent du DS.
 * L'API publique, symbole par symbole → EXPORTS.md.
 */
/** ⚠ Se bumpe dans le MÊME commit que `package.json` : les deux ne doivent jamais diverger. */
export const SHELL_VERSION = '0.3.2';

/* configuration */
export { configureShell, getShellConfig, isShellConfigured } from './config';
export type { ShellConfig } from './config';

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
export { resolveAfterAuth, isAuthorizeNext, withNextParam, AUTHORIZE_PATH } from './lib/afterAuth';
export type { AfterAuthTarget, AfterAuthInput } from './lib/afterAuth';

/* compte */
export { useProfile, parseNotificationPrefs, DEFAULT_NOTIFICATION_PREFS, profileKey } from './account/useProfile';
export type { Profile, NotificationPrefs } from './account/useProfile';
export { useUpdateProfile } from './account/useUpdateProfile';
export type { ProfileUpdate } from './account/useUpdateProfile';
export { useUpdateAvatar, useDeleteAvatar } from './account/useAvatar';
export { useSubscription, subscriptionKey, isSubscriptionActive, isPaymentFailed } from './account/useSubscription';
export type { SubscriptionInfo, SubscriptionItem, SubscriptionState } from './account/useSubscription';
export { useDeleteAccount } from './account/useDeleteAccount';

/* outils, droits, règles, historique — le nouveau modèle (lot 1 base), tout vient de la base */
export { useToolCatalog, toolCatalogKey, toolByIdIn, packByIdIn } from './tools/useToolCatalog';
export type { ToolDef, ToolPackDef, ToolCatalog } from './tools/useToolCatalog';
export { useEntitlements, entitlementsKey, isEntitlementUsable, summarizeEntitlements } from './tools/useEntitlements';
export type { Entitlement, EntitlementSummary, EntitlementSource, EntitlementStatus, EntitlementsInfo } from './tools/useEntitlements';
export { useCanUse, canUseKey } from './tools/useCanUse';
export type { CanUseResult, CanUseReason } from './tools/useCanUse';
export { useToolRules, useAddToolRule, useUpdateToolRule, useDeleteToolRule, toolRulesKey, RULE_TEXT_MAX } from './tools/useToolRules';
export type { ToolRule } from './tools/useToolRules';
export { useToolRuns, toolRunsKey } from './tools/useToolRuns';
export type { ToolRun, ToolRunStatus } from './tools/useToolRuns';

/* abonnement Stripe — un abonnement par client, un article par outil, packs ; checkout embarqué, activation, résiliation */
export { usePortalSession, useStartCheckout, useRemoveTool, useCancelSubscription, useResumeSubscription, checkoutTools } from './account/useStripe';
export type { CheckoutTarget, CheckoutStart, RemoveToolResult } from './account/useStripe';
export { CheckoutModal } from './abonnement/CheckoutModal';
export type { CheckoutModalProps } from './abonnement/CheckoutModal';
export { useCheckoutActivation, CHECKOUT_PARAM, CHECKOUT_TOOLS_PARAM, CHECKOUT_TOOL_PARAM, CHECKOUT_PACK_PARAM } from './abonnement/useCheckoutActivation';
export type { CheckoutActivationState } from './abonnement/useCheckoutActivation';
export { CheckoutActivationCard } from './abonnement/CheckoutActivationCard';
export type { CheckoutActivationCardProps } from './abonnement/CheckoutActivationCard';
export { CancelSubscriptionModal } from './abonnement/CancelSubscriptionModal';
export type { CancelSubscriptionModalProps } from './abonnement/CancelSubscriptionModal';
export { PaymentFailedBanner, PaymentFailedBannerView } from './abonnement/PaymentFailedBanner';
export type { PaymentFailedBannerViewProps } from './abonnement/PaymentFailedBanner';

/* audit de compte */
export { useAccountAudit, accountAuditKey } from './audit/useAccountAudit';
export { AuditStateCard } from './audit/AuditStateCard';
export type { AuditStateCardProps } from './audit/AuditStateCard';
export {
  parseAccountAudit, parseAuditStats, parseAuditVerdicts, parseAuditPoints, parseAuditProfil, AUDIT_MIN_SAMPLE,
} from './audit/types';
export type {
  AccountAuditRow, AccountAuditStatus, ParsedAccountAudit, AuditStats, AuditVerdicts, AuditAxe, AuditEtatMesure,
  AuditEtatEstime, AuditPoint, AuditPoints, AuditProfil, AuditBioConstat, AuditBioDimension, AuditBioEtat,
} from './audit/types';

/* chaînes et erreurs */
export { fr } from './i18n/fr';
export type { Fr } from './i18n/fr';
export { getErrorMessage, messageForCode } from './lib/errors';
export { formatNombre, formatCompact, formatDateCourte, formatDateLongue, formatEuros, initiales } from './lib/format';
export { withGlyphSize, CARD_GLYPH_SIZE } from './lib/icon';
export { useMediaQuery, DS_MOBILE_QUERY } from './lib/useMediaQuery';

/* layout */
export { AppLayout, AppContent, AppBleed, APP_GUTTER_X, APP_BLEED_X, APP_BLEED_TOP } from './layout/AppLayout';
export type { AppLayoutProps, AppContentProps, AppBleedProps } from './layout/AppLayout';
export { HubSidebar } from './layout/HubSidebar';
export type { HubSidebarProps, ShellNavItem } from './layout/HubSidebar';
export { AccountCard, UserAvatar } from './layout/AccountCard';
export type { AccountView } from './layout/AccountCard';
export { ToolLabel } from './layout/ToolLabel';
export type { ToolLabelProps } from './layout/ToolLabel';
export { SegmentedControl } from './layout/SegmentedControl';
export type { SegmentedControlProps, SegmentedOption } from './layout/SegmentedControl';

/* pages d'auth — montées par le hub seul */
export { AuthShell, AuthHeading } from './auth/AuthShell';
export type { AuthShellProps } from './auth/AuthShell';
export { OAuthButtons } from './auth/OAuthButtons';
export type { OAuthButtonsProps } from './auth/OAuthButtons';
export { GoogleMark, AppleMark } from './auth/BrandMarks';
export { LoginPage, LoginView } from './auth/LoginPage';
export type { LoginViewProps, AuthPageProps } from './auth/LoginPage';
export { SignupPage, SignupView } from './auth/SignupPage';
export type { SignupViewProps } from './auth/SignupPage';
export { ForgotPasswordPage, ForgotPasswordView } from './auth/ForgotPasswordPage';
export type { ForgotPasswordViewProps } from './auth/ForgotPasswordPage';
export { LinkSentView } from './auth/LinkSentView';
export type { LinkSentViewProps } from './auth/LinkSentView';
export { ResetPasswordPage, ResetPasswordView } from './auth/ResetPasswordPage';
export type { ResetPasswordViewProps } from './auth/ResetPasswordPage';
export { useAfterAuthRedirect } from './auth/useAfterAuthRedirect';
export { loginSchema, signupSchema, forgotSchema, newPasswordSchema, PASSWORD_MIN, PASSWORD_RULE } from './auth/schemas';
export type { LoginValues, SignupValues, ForgotValues, NewPasswordValues } from './auth/schemas';

/* Paramètres */
export { ParametresPage } from './parametres/ParametresPage';
export type { ParametresPageProps } from './parametres/ParametresPage';
export { ParametresLayout, parametresTabs } from './parametres/ParametresLayout';
export type { ParametresTab, ParametresLayoutProps } from './parametres/ParametresLayout';
export { InfosTab, InfosView } from './parametres/InfosTab';
export type { InfosViewProps, ReseauView, SaveState } from './parametres/InfosTab';
export { NotificationsTab, NotificationsView } from './parametres/NotificationsTab';
export type { NotificationsViewProps } from './parametres/NotificationsTab';
export { AbonnementTab, AbonnementView, subscriptionStatusLabel } from './parametres/AbonnementTab';
export type { AbonnementViewProps } from './parametres/AbonnementTab';
export { LegalTab, LegalView, DeleteAccountModal, DEFAULT_LEGAL_HREFS } from './parametres/LegalTab';
export type { LegalViewProps, LegalHrefs, DeleteAccountModalProps } from './parametres/LegalTab';
export { PasswordModal } from './parametres/PasswordModal';
export type { PasswordModalProps } from './parametres/PasswordModal';
export { TabSkeleton, TabError } from './parametres/states';
export { InstagramMark, TikTokMark } from './auth/BrandMarks';

/* bilan d'audit */
export { AuditBilan } from './audit/AuditBilan';
export type { AuditBilanProps } from './audit/AuditBilan';

/* pages légales — publiques */
export { LEGAL_DOCS } from './legal/legalContent';
export type { LegalDoc, LegalDocId, LegalSection, LegalBlock } from './legal/legalContent';
export { LegalPageLayout, LegalDocView } from './legal/LegalPageLayout';
export type { LegalPageLayoutProps } from './legal/LegalPageLayout';
export { CguPage, MentionsLegalesPage, ConfidentialitePage, SuppressionDonneesPage, SuppressionDonneesView } from './legal/pages';
export type { LegalPageProps, DeletionState } from './legal/pages';
