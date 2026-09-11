import { useState, type JSX, type ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { AppShell } from '@yunary/ds';
import { AbonnementView, AppContent, HubSidebar, InfosView, ParametresLayout, planFor, type ParametresTab } from '@yunary/shell';
import { ACCOUNT, CREATOR_ITEMS, CREATOR_NATIVE_ITEMS, CREDITS } from '../fixtures';
import { Section } from '../ui';

const noop = () => undefined;

/* Trois espaces, la même sidebar : Hub, Creator (Vidéos · Générateur · Profil créateur), Creator natif. */
export function LayoutPage(): JSX.Element {
  const [tab, setTab] = useState<ParametresTab>('abonnement');
  return (
    <div className="flex flex-col gap-space-7">
      <Section title="HubSidebar" note="Maquette HubSidebar.dc.html · C6. Sidebar du DS, non repliable : logo statique, nav de l'outil, Mes outils + Paramètres, crédits, compte.">
        <div className="grid grid-cols-1 gap-space-5 xl:grid-cols-3">
          <Frame label="Yunary (Hub) · Mes outils actif">
            <HubSidebar tool="hub" toolsActive credits={CREDITS} account={ACCOUNT} linkAs={NavLink} staticLayout />
          </Frame>
          <Frame label="Yunary Creator · Vidéos actif">
            <HubSidebar tool="creator" items={CREATOR_ITEMS} credits={CREDITS} account={ACCOUNT} linkAs={NavLink} staticLayout />
          </Frame>
          <Frame label="Creator natif · nav réduite">
            <HubSidebar tool="creator" native items={CREATOR_NATIVE_ITEMS} settingsActive credits={CREDITS} account={ACCOUNT} linkAs={NavLink} staticLayout />
          </Frame>
        </div>
      </Section>
      <Section title="AppLayout · contenu pleine largeur" note="Depuis 0.1.6, le contenu remplit la colonne (plus de `.page` à 70 rem) : gouttières `space-5` sous 64 rem, `space-7` dès que la sidebar est à demeure. Le plafond `max-w-wide` d'Abonnement et `max-w-read` d'Infos restent : ce sont ceux du bloc, pas de la page. Redimensionne la fenêtre.">
        <Bleed>
          <AppShell
            responsive={false}
            className="min-h-[52rem] overflow-hidden rounded-xl border border-border bg-background"
            sidebar={<HubSidebar tool="hub" settingsActive credits={CREDITS} account={ACCOUNT} linkAs={NavLink} staticLayout />}
          >
            <AppContent>
              <ParametresLayout variant="web" tab={tab} onTabChange={setTab}>
                {tab === 'abonnement' ? (
                  <AbonnementView credits={CREDITS} plan={planFor('free')} hasSubscription={false} onPortal={noop} onChoose={noop} />
                ) : (
                  <InfosView profile={{ prenom: 'Julien', nom: 'Fernandes', email: 'julien@julienfernandes.com', avatarUrl: null }} reseau={{ platform: 'instagram', handle: 'julien.crea' }} onSave={noop} saveState="saved" onChoosePhoto={noop} onRemovePhoto={noop} onChangePassword={noop} onLogout={noop} />
                )}
              </ParametresLayout>
            </AppContent>
          </AppShell>
        </Bleed>
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

/* La vitrine vit dans `.page` (70 rem) : ce cadre s'en échappe pour montrer une app sur toute la fenêtre. */
function Bleed({ children }: { children: ReactNode }): JSX.Element {
  return <div className="relative left-1/2 w-screen -translate-x-1/2 px-space-4">{children}</div>;
}

function Frame({ label, children }: { label: string; children: ReactNode }): JSX.Element {
  return (
    <div className="flex flex-col gap-space-2">
      <span className="chip text-text-muted">{label}</span>
      <div className="flex h-[52rem] overflow-hidden rounded-xl border border-border bg-background">{children}</div>
    </div>
  );
}
