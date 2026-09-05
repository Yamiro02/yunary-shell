import type { AccountView, CreditsView, ShellNavItem } from '@yunary/shell';
import { Icon } from '@yunary/ds';

/* Les données de la vitrine — celles des maquettes. Aucune n'est lue en base. */
export const ACCOUNT: AccountView = {
  name: 'Julien Fernandes',
  initials: 'JF',
  avatarUrl: null,
  planLabel: 'Formule Gratuite',
};

export const CREDITS: CreditsView = { remaining: 37, total: 50, periodEnd: '2026-09-15T00:00:00Z' };

export const CREATOR_ITEMS: ShellNavItem[] = [
  { label: 'Vidéos', href: '/videos', icon: <Icon name="video" />, active: true },
  { label: 'Scripts', href: '/scripts', icon: <Icon name="file-text" /> },
  { label: 'Profil créateur', href: '/profil', icon: <Icon name="user" /> },
];

export const CREATOR_NATIVE_ITEMS: ShellNavItem[] = [
  { label: 'Vidéos', href: '/videos', icon: <Icon name="video" />, active: true },
];
