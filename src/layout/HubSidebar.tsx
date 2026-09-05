import type { ElementType, JSX, MouseEventHandler, ReactNode } from 'react';
import { Icon, Sidebar, type SidebarItem } from '@yunary/ds';
import { Wrench } from 'lucide-react';
import { fr } from '../i18n/fr';
import type { ToolId } from '../config';
import { toolUrl } from './tools';
import { SpaceSwitcher, SpaceName } from './SpaceSwitcher';
import { CreditsCard, type CreditsView } from './CreditsCard';
import { AccountCard, type AccountView } from './AccountCard';

export interface ShellNavItem {
  label: string;
  href: string;
  icon: ReactNode;
  active?: boolean;
  onClick?: MouseEventHandler;
}

export interface HubSidebarProps {
  /** L'espace courant — pilote le commutateur. */
  tool: ToolId;
  /** La navigation de l'outil (vide pour le Hub, dont la seule destination est « Mes outils »). */
  items?: ShellNavItem[];
  settingsHref?: string;
  settingsActive?: boolean;
  /** « Mes outils » — le Hub. Défaut : `toolUrl('hub')`. */
  toolsHref?: string;
  toolsActive?: boolean;
  /** Capacitor : pas de commutateur, pas de « Mes outils » ; la nav réduite est celle passée en `items`. */
  native?: boolean;
  credits: CreditsView | null | undefined;
  account: AccountView;
  /** Le lien du routeur (`NavLink`) — `href` lui arrive en `to`. */
  linkAs?: ElementType;
  /** Tiroir mobile (sous 64rem). */
  open?: boolean;
  onClose?: () => void;
  /** Démo : la barre reste dans le flux. */
  staticLayout?: boolean;
  className?: string;
}

/**
 * La sidebar des maquettes (HubSidebar.dc.html) : commutateur en tête, nav de l'outil,
 * puis « Mes outils » + Paramètres, la carte crédits et le compte. C'est la `Sidebar` du
 * DS, non repliable, avec ses slots — rien n'est redessiné.
 */
export function HubSidebar({
  tool, items = [], settingsHref = '/parametres', settingsActive = false, toolsHref, toolsActive = false,
  native = false, credits, account, linkAs, open, onClose, staticLayout = false, className,
}: HubSidebarProps): JSX.Element {
  const sections = items.length ? [{ items: items.map(toSidebarItem) }] : [];
  const footerItems: SidebarItem[] = [
    ...(native ? [] : [{
      label: fr.layout.tools,
      href: toolsHref ?? toolUrl('hub'),
      icon: <Icon glyph={Wrench} />,
      active: toolsActive,
    }]),
    { label: fr.layout.settings, href: settingsHref, icon: <Icon name="settings" />, active: settingsActive },
  ];
  return (
    <Sidebar
      collapsible={false}
      brand={native ? <span className="flex min-h-[3rem] items-center gap-space-3 px-space-2"><SpaceName tool={tool} /></span> : <SpaceSwitcher current={tool} />}
      sections={sections}
      footerItems={footerItems}
      footer={
        <div className="flex w-full flex-col gap-space-3">
          <CreditsCard credits={credits} />
          <AccountCard account={account} />
        </div>
      }
      linkAs={linkAs}
      open={open}
      onClose={onClose}
      staticLayout={staticLayout}
      className={className}
    />
  );
}

function toSidebarItem(item: ShellNavItem): SidebarItem {
  return { label: item.label, href: item.href, icon: item.icon, active: item.active, onClick: item.onClick };
}
