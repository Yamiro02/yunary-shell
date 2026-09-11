import type { JSX } from 'react';
import { Avatar, cn } from '@yunary/ds';

export interface AccountView {
  name: string;
  initials: string;
  avatarUrl?: string | null;
  /** « Formule Gratuite ». */
  planLabel: string;
}

/**
 * L'avatar utilisateur — photo ronde, ou initiales sur le dégradé de marque (maquette).
 * Composé ici, sans halo ; manque DS consigné (mode photo sur `Avatar`).
 */
export function UserAvatar({ account, size = '2.25rem', className }: { account: Pick<AccountView, 'name' | 'initials' | 'avatarUrl'>; size?: string; className?: string }): JSX.Element {
  if (account.avatarUrl) {
    return <Avatar src={account.avatarUrl} alt={account.name} initials={account.initials} size={size} halo={false} className={className} />;
  }
  return (
    <span
      role="img"
      aria-label={account.name}
      className={cn('inline-flex flex-none items-center justify-center rounded-pill bg-brand-gradient font-display text-caption font-(--heading-weight) tracking-heading text-primary-foreground', className)}
      style={{ width: size, height: size }}
    >
      {account.initials}
    </span>
  );
}

/** Carte compte de la sidebar (maître HubSidebar, 11/09/2026 : 10 / 12 → `space-2` / `space-3`, min 52 px, avatar 36, nom caption 600) : avatar, nom, formule. */
export function AccountCard({ account }: { account: AccountView }): JSX.Element {
  return (
    <div className="flex w-full min-h-[3.25rem] items-center gap-space-3 rounded-md bg-accent px-space-3 py-space-2 text-left">
      <UserAvatar account={account} />
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-caption font-semibold text-foreground">{account.name}</span>
        {/* Libellé de formule en `caption` (13 px) — le rendu de la 0.1.8 : le maître dit 12, l'eyebrow ne va pas à Julien (11/09/2026). */}
        <span className="truncate text-caption font-medium text-text-muted">{account.planLabel}</span>
      </span>
    </div>
  );
}
