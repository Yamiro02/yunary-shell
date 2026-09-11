import type { ElementType, JSX, MouseEventHandler, ReactNode } from 'react';
import { Icon, Logo, Sidebar, type SidebarItem, type SidebarSection } from '@yunary/ds';
import { Wrench } from 'lucide-react';
import { fr } from '../i18n/fr';
import type { ToolId } from '../config';
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
  /** L'espace courant — gardé dans l'API (Creator le passe) ; plus rien ne le lit depuis le retrait du commutateur. */
  tool: ToolId;
  /** La navigation de l'outil (vide pour le Hub, dont la seule destination est « Mes outils »). */
  items?: ShellNavItem[];
  settingsHref?: string;
  settingsActive?: boolean;
  /**
   * « Mes outils » — la route LOCALE de la page, dans l'outil courant (décision Julien, 11/09/2026 :
   * on ne change ni de sous-domaine ni de menu). Défaut `/outils` ; le Hub passe `/`, son accueil.
   */
  toolsHref?: string;
  toolsActive?: boolean;
  /** Capacitor : pas de section « Mes outils » ; la nav réduite est celle passée en `items`. */
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
 * La sidebar du maître `HubSidebar.dc.html`, remaniée sur les décisions de Julien (08/09/2026) :
 * **plus de commutateur** — le logo est statique (un raccourci vers « Mes outils ») ; la nav de
 * l'outil, puis « Mes outils » + Paramètres (les outils ne vivent qu'en cartes sur la page « Mes
 * outils », qui s'ouvre DANS l'outil courant depuis 0.1.8 — `toolsHref` est une route locale, jamais
 * le Hub), la carte crédits et le compte. C'est la `Sidebar` du DS **sans son régime replié**
 * (retiré par Julien, 08/09/2026 : la barre est toujours dépliée), sa largeur `--sidebar-w` de la
 * marque, son tiroir sous 64rem — rien n'est redessiné.
 */
export function HubSidebar({
  tool: _tool, items = [], settingsHref = '/parametres', settingsActive = false, toolsHref = '/outils', toolsActive = false,
  native = false, credits, account, linkAs, open, onClose, staticLayout = false, className,
}: HubSidebarProps): JSX.Element {
  /* La nav = la nav de l'outil, puis « Mes outils » + Paramètres — rien d'autre (décision Julien,
     08/09/2026) : les outils ne vivent qu'en cartes sur la page « Mes outils ». */
  const sections: SidebarSection[] = items.length ? [{ items: items.map(toSidebarItem) }] : [];
  const footerItems: SidebarItem[] = [
    ...(native ? [] : [{ label: fr.layout.tools, href: toolsHref, icon: <Icon glyph={Wrench} />, active: toolsActive }]),
    { label: fr.layout.settings, href: settingsHref, icon: <Icon name="settings" />, active: settingsActive },
  ];
  /* Le logo en tête : mot à 18 px, icône au lockup du DS (maître : 30 / 18). Un raccourci vers
     « Mes outils » (la même route locale) sur le web, un simple mark en natif. */
  const BrandLink = (linkAs ?? 'a') as ElementType;
  const brand = native ? (
    <span className="flex min-h-[3rem] items-center px-space-2"><Logo variant="wordmark" height="0.9rem" /></span>
  ) : (
    <BrandLink {...(linkAs ? { to: toolsHref } : { href: toolsHref })} aria-label={fr.layout.openTools} className="flex min-h-[3rem] items-center px-space-2 text-foreground">
      <Logo variant="wordmark" height="0.9rem" />
    </BrandLink>
  );
  return (
    <Sidebar
      /* Jamais repliée — `defaultCollapsed` neutralise un état « replié » resté en localStorage. */
      collapsible={false}
      defaultCollapsed={false}
      brand={brand}
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
