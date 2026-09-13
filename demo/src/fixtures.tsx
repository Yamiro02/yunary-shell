import type { AccountView, CreditsView, PlanCatalog, ShellNavItem, SubscriptionInfo } from '@yunary/shell';
import { Icon } from '@yunary/ds';

/* Les données de la vitrine — celles des maquettes. Aucune n'est lue en base. */
export const ACCOUNT: AccountView = {
  name: 'Julien Fernandes',
  initials: 'JF',
  avatarUrl: null,
  planLabel: 'Formule Gratuite',
};

/* Gratuite (13/09/2026) : 50 crédits une fois, allocation 0, jamais rechargée → pas de barre, pas de date. */
export const CREDITS: CreditsView = { remaining: 37, total: 0, periodEnd: null };
/* Abonné Créateur : allocation mensuelle et date de recharge. */
export const CREDITS_PAID: CreditsView = { remaining: 212, total: 300, periodEnd: '2026-10-13T00:00:00Z' };
export const CREDITS_LOW: CreditsView = { remaining: 41, total: 300, periodEnd: '2026-10-13T00:00:00Z' };
export const CREDITS_ZERO: CreditsView = { remaining: 0, total: 0, periodEnd: null };

/* Le catalogue tel que le lit `usePlanCatalog` — prix et allocations viennent de la base, jamais du shell. */
export const CATALOG: PlanCatalog = {
  allocations: [
    { plan: 'free', label: 'Gratuite', creditsPerMonth: 0, signupCredits: 50, priceCents: 0 },
    { plan: 'createur', label: 'Créateur', creditsPerMonth: 300, signupCredits: 0, priceCents: 1900 },
  ],
  founder: { slotsRemaining: 37, total: 100, priceCents: 1200 },
  launch: { total: 100, taken: 63, priceCents: 1200 },
};
/* Places écoulées : l'offre passe à `null`, le compteur reste lisible (« Tu fais partie des 100 premiers »). */
export const CATALOG_SOLD_OUT: PlanCatalog = { ...CATALOG, founder: null, launch: { total: 100, taken: 100, priceCents: 1200 } };

/* 🔒 `amountCents` = le montant réellement facturé : c'est LUI que l'onglet montre à un abonné, jamais le catalogue. */
export const SUB_ACTIVE: SubscriptionInfo = { plan: 'createur', status: 'active', currentPeriodEnd: '2026-10-13T00:00:00Z', cancelAtPeriodEnd: false, amountCents: 1200 };
export const SUB_FULL_PRICE: SubscriptionInfo = { ...SUB_ACTIVE, amountCents: 1900 };
export const SUB_ENDING: SubscriptionInfo = { ...SUB_ACTIVE, cancelAtPeriodEnd: true };
export const SUB_PAST_DUE: SubscriptionInfo = { ...SUB_ACTIVE, status: 'past_due' };

/* La nav réelle de Creator (routes `/scripts*`, libellé « Générateur » depuis le 10/09/2026) :
   la coque l'accepte telle quelle, avec les icônes du DS — rien de propre à Creator ici. */
export const CREATOR_ITEMS: ShellNavItem[] = [
  { label: 'Vidéos', href: '/videos', icon: <Icon name="video" />, active: true },
  { label: 'Générateur', href: '/scripts', icon: <Icon name="file-text" /> },
  { label: 'Profil créateur', href: '/profil', icon: <Icon name="user" /> },
];

export const CREATOR_NATIVE_ITEMS: ShellNavItem[] = [
  { label: 'Vidéos', href: '/videos', icon: <Icon name="video" />, active: true },
];
