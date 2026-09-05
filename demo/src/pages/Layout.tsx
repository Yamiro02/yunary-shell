import type { JSX, ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { HubSidebar } from '@yunary/shell';
import { ACCOUNT, CREATOR_ITEMS, CREATOR_NATIVE_ITEMS, CREDITS } from '../fixtures';
import { Section } from '../ui';

/* Trois espaces, la même sidebar : Hub, Creator, Creator natif (sans commutateur). */
export function LayoutPage(): JSX.Element {
  return (
    <div className="flex flex-col gap-space-7">
      <Section title="HubSidebar" note="Maquette HubSidebar.dc.html · C6. Sidebar du DS, non repliable : commutateur en tête, nav de l'outil, Mes outils + Paramètres, crédits, compte.">
        <div className="grid grid-cols-1 gap-space-5 xl:grid-cols-3">
          <Frame label="Yunary (Hub) · Mes outils actif">
            <HubSidebar tool="hub" toolsActive credits={CREDITS} account={ACCOUNT} linkAs={NavLink} staticLayout />
          </Frame>
          <Frame label="Yunary Creator · Vidéos actif">
            <HubSidebar tool="creator" items={CREATOR_ITEMS} credits={CREDITS} account={ACCOUNT} linkAs={NavLink} staticLayout />
          </Frame>
          <Frame label="Creator natif · nav réduite, sans commutateur">
            <HubSidebar tool="creator" native items={CREATOR_NATIVE_ITEMS} settingsActive credits={CREDITS} account={ACCOUNT} linkAs={NavLink} staticLayout />
          </Frame>
        </div>
      </Section>
      <Section title="États de la carte crédits" note="Chargement (squelette), solde indisponible, allocation inconnue (barre pleine).">
        <div className="grid grid-cols-1 gap-space-5 xl:grid-cols-3">
          <Frame label="Chargement"><HubSidebar tool="hub" credits={undefined} account={ACCOUNT} linkAs={NavLink} staticLayout /></Frame>
          <Frame label="Solde indisponible"><HubSidebar tool="hub" credits={null} account={ACCOUNT} linkAs={NavLink} staticLayout /></Frame>
          <Frame label="Allocation inconnue"><HubSidebar tool="hub" credits={{ remaining: 120, total: null, periodEnd: null }} account={{ ...ACCOUNT, planLabel: 'Formule Créateur' }} linkAs={NavLink} staticLayout /></Frame>
        </div>
      </Section>
    </div>
  );
}

function Frame({ label, children }: { label: string; children: ReactNode }): JSX.Element {
  return (
    <div className="flex flex-col gap-space-2">
      <span className="chip text-text-muted">{label}</span>
      <div className="flex h-[52rem] overflow-hidden rounded-xl border border-border bg-background">{children}</div>
    </div>
  );
}
