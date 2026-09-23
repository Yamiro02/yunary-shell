import type { ElementType, JSX, MouseEventHandler, ReactNode } from 'react';
import { Icon, Logo, Sidebar, type SidebarItem, type SidebarSection } from '@yunary/ds';
import { Wrench } from 'lucide-react';
import { fr } from '../i18n/fr';
import { AccountCard, type AccountView } from './AccountCard';

export interface ShellNavItem {
  label: string;
  href: string;
  icon: ReactNode;
  active?: boolean;
  onClick?: MouseEventHandler;
}

export interface HubSidebarProps {
  /** La navigation de l'app (le hub : Outils, Mes règles, Historique…). */
  items?: ShellNavItem[];
  settingsHref?: string;
  settingsActive?: boolean;
  /**
   * « Mes outils » — la route LOCALE de la page des outils (abonnements, packs), dans le hub. Le
   * lockup y mène aussi. Défaut `/outils`.
   */
  toolsHref?: string;
  toolsActive?: boolean;
  /** `false` masque « Mes outils » du pied de nav (le hub met Outils dans `items`) ; le lockup mène toujours à `toolsHref`. */
  showToolsLink?: boolean;
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
 * La sidebar du maître `HubSidebar.dc.html`, sur les décisions de Julien (08/09/2026) : **plus de
 * commutateur** — le lockup est statique (un raccourci vers « Mes outils ») ; la nav de l'app, puis
 * « Mes outils » + Paramètres, la carte compte. Depuis 0.3.0 (pivot MCP) : plus de carte crédits (les
 * quotas sont par outil, dans Paramètres › Abonnement) et plus de nom d'outil dans le lockup (la
 * coquille web s'appelle « Yunary », les outils vivent en base). C'est la `Sidebar` du DS **sans son
 * régime replié** (retiré par Julien, 08/09/2026 : la barre est toujours dépliée), sa largeur
 * `--sidebar-w` de la marque, son tiroir sous 64rem — rien n'est redessiné.
 */
export function HubSidebar({
  items = [], settingsHref = '/parametres', settingsActive = false, toolsHref = '/outils', toolsActive = false, showToolsLink = true,
  account, linkAs, open, onClose, staticLayout = false, className,
}: HubSidebarProps): JSX.Element {
  const sections: SidebarSection[] = items.length ? [{ items: items.map(toSidebarItem) }] : [];
  const footerItems: SidebarItem[] = [
    ...(showToolsLink ? [{ label: fr.layout.tools, href: toolsHref, icon: <Icon glyph={Wrench} />, active: toolsActive }] : []),
    { label: fr.layout.settings, href: settingsHref, icon: <Icon name="settings" />, active: settingsActive },
  ];
  /* Le lockup en tête (maître HubSidebar, 11/09/2026) : le monogramme du `Logo` à 1,5 rem, puis
     « Yunary » en display 18 px. SANS retrait propre (décision Julien, 11/09/2026) : le bord gauche du
     monogramme est celui des pilules de nav, comme le logo de la `Sidebar` du DS. Gap `space-2` — le
     maître dit 10, le palier le plus proche. `no-underline` : le lockup est une entrée de nav, pas un
     lien texte — `.ds-sidenav` pose lui aussi `text-decoration:none` ; la règle « jamais de
     no-underline » vise les liens de prose. */
  const BrandLink = (linkAs ?? 'a') as ElementType;
  const brand = (
    <BrandLink {...(linkAs ? { to: toolsHref } : { href: toolsHref })} aria-label={fr.layout.openTools} className="flex min-h-[3rem] items-center gap-space-2 text-foreground no-underline">
      <Logo variant="monogram" height="1.5rem" />
      <span className="whitespace-nowrap font-display text-heading-sm font-(--heading-weight) text-foreground">{fr.layout.brand}</span>
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
      footer={<AccountCard account={account} />}
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
