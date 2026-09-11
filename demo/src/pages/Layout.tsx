import { useState, type JSX, type ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { AppShell, Button, Card, Icon, IconButton, cn } from '@yunary/ds';
import {
  APP_GUTTER_X, AbonnementView, AppBleed, AppContent, HubSidebar, InfosView, ParametresLayout, planFor, type ParametresTab,
} from '@yunary/shell';
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
      <Section title="AppLayout · contenu pleine largeur" note="Depuis 0.1.6, le contenu remplit la colonne (plus de `.page` à 70 rem). Gouttières de la v1 depuis 0.1.7 : 16 px de côté et 24 px en haut et en bas sous 64 rem, 24 px partout dès que la sidebar est à demeure. Le plafond `max-w-wide` d'Abonnement et `max-w-read` d'Infos restent : ce sont ceux du bloc, pas de la page. Redimensionne la fenêtre.">
        <Bleed>
          <AppFrame className="min-h-[52rem]" sidebar={<HubSidebar tool="hub" settingsActive credits={CREDITS} account={ACCOUNT} linkAs={NavLink} staticLayout />}>
            <AppContent>
              <ParametresLayout variant="web" tab={tab} onTabChange={setTab}>
                {tab === 'abonnement' ? (
                  <AbonnementView credits={CREDITS} plan={planFor('free')} hasSubscription={false} onPortal={noop} onChoose={noop} />
                ) : (
                  <InfosView profile={{ prenom: 'Julien', nom: 'Fernandes', email: 'julien@julienfernandes.com', avatarUrl: null }} reseau={{ platform: 'instagram', handle: 'julien.crea' }} onSave={noop} saveState="saved" onChoosePhoto={noop} onRemovePhoto={noop} onChangePassword={noop} onLogout={noop} />
                )}
              </ParametresLayout>
            </AppContent>
          </AppFrame>
        </Bleed>
      </Section>
      <Section title="AppBleed · barre collante bord à bord" note="Une fiche, un script ou un assistant sort des gouttières avec `AppBleed flush` : sa barre haute et son pied collent aux bords et au haut du contenu, tout ce qui est dedans y rentre avec `APP_GUTTER_X`. Le cadre défile, les deux barres restent. Une barre seule qui sort et rentre sur le même élément compose `APP_BLEED_X` + `APP_GUTTER_X`, sans wrapper.">
        <Bleed>
          {/* La rangée de la grille est bornée au cadre, sinon elle s'étire au contenu et rien ne défile. */}
          <AppFrame className="h-[52rem] grid-rows-[minmax(0,1fr)]" sidebar={<HubSidebar tool="creator" items={CREATOR_ITEMS} credits={CREDITS} account={ACCOUNT} linkAs={NavLink} staticLayout />}>
            {/* Le cadre défile à la place du document, et comme lui SANS padding : un scroller
                à gouttières décalerait le `sticky top-0` de la barre haute (Chrome cale le collant
                sur le bord intérieur du padding). `AppContent` reste dedans, comme dans une app. */}
            <div className="h-full overflow-y-auto">
              <AppContent>
                <AppBleed flush className="flex flex-col">
                  <header className={cn('sticky top-0 z-10 flex items-center gap-space-4 border-b border-border bg-card py-space-4', APP_GUTTER_X)}>
                    <IconButton label="Retour"><Icon name="chevron-left" /></IconButton>
                    <span className="min-w-0 truncate text-heading-sm font-semibold">Comment j'ai doublé mes vues en 30 jours</span>
                  </header>
                  <div className={cn('flex flex-col gap-space-5 py-space-6', APP_GUTTER_X)}>
                    {BLEED_BLOCKS.map(b => (
                      <Card key={b.title} className="flex flex-col gap-space-2">
                        <span className="text-eyebrow font-bold text-text-muted">{b.title}</span>
                        <p>{b.text}</p>
                      </Card>
                    ))}
                  </div>
                  <footer className={cn('sticky bottom-0 flex items-center justify-between gap-space-3 border-t border-border bg-card py-space-4', APP_GUTTER_X)}>
                    <span className="caption">3 propositions · 10 crédits</span>
                    <Button>Valider</Button>
                  </footer>
                </AppBleed>
              </AppContent>
            </div>
          </AppFrame>
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

/* Assez de blocs pour que le cadre défile et que les barres collantes se montrent. */
const BLEED_BLOCKS = [
  { title: 'Hook', text: 'Une promesse chiffrée dès la première seconde : le spectateur sait ce qu’il gagne à rester.' },
  { title: 'Structure', text: 'Trois étapes, une par écran, chacune close par une mini-révélation qui appelle la suivante.' },
  { title: 'Rythme', text: 'Un plan toutes les deux secondes sur la première moitié, plus lent sur la démonstration.' },
  { title: 'Appel', text: 'Le CTA arrive après la preuve, jamais avant : commenter un mot-clé pour recevoir le guide.' },
  { title: 'Rétention', text: '62 % à mi-vidéo, 41 % à la fin — le décrochage est sur la transition vers la démonstration.' },
  { title: 'À refaire', text: 'Couper les six secondes de contexte entre le hook et la première étape.' },
  { title: 'À garder', text: 'La preuve à l’écran (capture des statistiques) au moment où la promesse est rappelée.' },
  { title: 'Prochaine vidéo', text: 'Même structure, sujet voisin : le hook chiffré fonctionne, la niche répond aux résultats.' },
  { title: 'Titre', text: 'Le chiffre dans le titre reprend celui du hook : une seule promesse, répétée, jamais deux.' },
  { title: 'Miniature', text: 'Le visage à gauche, le chiffre à droite en gros ; le fond uni pour que le texte tienne à 120 px.' },
  { title: 'Description', text: 'La première ligne reformule la promesse, la deuxième pose la question qui ouvre les commentaires.' },
  { title: 'Commentaires', text: 'Répondre aux dix premiers dans l’heure : c’est là que l’algorithme décide de la seconde vague.' },
  { title: 'Cadence', text: 'Deux vidéos par semaine sur ce format tant que la rétention tient au-dessus de 55 % à mi-vidéo.' },
  { title: 'Mesure', text: 'Comparer à la médiane des dix dernières, pas à la meilleure : c’est l’écart qui compte, pas le record.' },
];

/* Une app dans un cadre : la sidebar à demeure dès le seuil du DS, retirée en dessous — dans une app
   c'est le tiroir d'`AppLayout` qui prend le relais, et il n'est pas monté ici (hooks). Sous le seuil
   le contenu prend toute la largeur du cadre, comme sur un téléphone. */
function AppFrame({ sidebar, className, children }: { sidebar: ReactNode; className?: string; children: ReactNode }): JSX.Element {
  return (
    <AppShell
      className={cn('overflow-hidden rounded-xl border border-border bg-background', className)}
      sidebar={<div className="hidden min-[64.0625rem]:contents">{sidebar}</div>}
    >
      {children}
    </AppShell>
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
