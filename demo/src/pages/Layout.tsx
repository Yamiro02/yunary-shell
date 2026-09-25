import { useState, type JSX, type ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { AppShell, Button, Card, Icon, IconButton, StateCard, cn } from '@yunary/ds';
import {
  APP_GUTTER_X, AppBleed, AppContent, HubSidebar, InfosView, NotificationsView, ParametresLayout, ScheduledCancellationCard,
  type ParametresTab,
} from '@yunary/shell';
import { ACCOUNT, ACCOUNT_SUBSCRIBED, HUB_ITEMS } from '../fixtures';
import { Section } from '../ui';

const noop = () => undefined;

/* La même sidebar pour la coquille web : lockup « Yunary », nav de l'app, Mes outils + Paramètres, compte. */
export function LayoutPage(): JSX.Element {
  const [tab, setTab] = useState<ParametresTab>('infos');
  return (
    <div className="flex flex-col gap-space-7">
      <Section title="HubSidebar" note="Maître HubSidebar.dc.html (11/09) · C6. Sidebar du DS, non repliable : lockup statique (monogramme 1,5 rem + « Yunary » en display 18), nav de l'app, Mes outils + Paramètres, carte compte. Depuis 0.3.0 : plus de carte crédits (les quotas sont par outil, dans Paramètres › Abonnement), plus de nom d'outil ni de variante native. 0.3.1 : `showToolsLink={false}` retire « Mes outils » du pied quand l'app met Outils dans sa nav. 0.4.0 : carte compte « 2 outils · 14 €/mois » ou « Gratuit ». État actif = celui du DS 0.1.5 : corail sur `--accent`, même graisse.">
        <div className="grid grid-cols-1 gap-space-5 xl:grid-cols-3">
          <Frame label="Gratuit · Mes outils actif">
            <HubSidebar toolsActive account={ACCOUNT} linkAs={NavLink} staticLayout />
          </Frame>
          <Frame label="Abonné · nav du hub · Mes règles actif">
            <HubSidebar items={HUB_ITEMS.map((it, i) => ({ ...it, active: i === 0 }))} account={ACCOUNT_SUBSCRIBED} linkAs={NavLink} staticLayout />
          </Frame>
          <Frame label="showToolsLink={false} · Outils dans items, Paramètres actif">
            <HubSidebar items={[{ label: 'Outils', href: '/outils', icon: <Icon name="zap" /> }, ...HUB_ITEMS]} showToolsLink={false} settingsActive account={ACCOUNT_SUBSCRIBED} linkAs={NavLink} staticLayout />
          </Frame>
        </div>
      </Section>
      <Section title="AppLayout · contenu pleine largeur" note="Depuis 0.1.6, le contenu remplit la colonne (plus de `.page` à 70 rem). Gouttières de la v1 depuis 0.1.7 : 16 px de côté et 24 px en haut et en bas sous 64 rem, 24 px partout dès que la sidebar est à demeure. Le plafond `max-w-read` d'Infos reste : ce sont ceux du bloc, pas de la page. Redimensionne la fenêtre.">
        <Bleed>
          <AppFrame className="min-h-[52rem]" sidebar={<HubSidebar items={HUB_ITEMS} settingsActive account={ACCOUNT_SUBSCRIBED} linkAs={NavLink} staticLayout />}>
            <AppContent>
              <ParametresLayout tab={tab} onTabChange={setTab}>
                {tab === 'notifications' ? (
                  <NotificationsView prefs={{ analyse_terminee: true, nouveaux_templates: true }} onToggle={noop} />
                ) : (
                  <InfosView profile={{ prenom: 'Julien', nom: 'Fernandes', email: 'julien@julienfernandes.com', avatarUrl: null }} reseau={{ platform: 'instagram', handle: 'julien.crea' }} onSave={noop} saveState="saved" onChoosePhoto={noop} onRemovePhoto={noop} onChangePassword={noop} onLogout={noop} />
                )}
              </ParametresLayout>
            </AppContent>
          </AppFrame>
        </Bleed>
      </Section>
      <Section title="AppLayout · résiliation programmée" note="0.4.0 : l'onglet Abonnement des Paramètres est retiré, la page Facturation du hub le remplace. Elle pose `ScheduledCancellationCard` en tête quand tout l'abonnement s'arrête à l'échéance. Carte compte : « 2 outils · 14 €/mois » (montants lus en base), « Gratuit » sans abonnement.">
        <Bleed>
          <AppFrame className="min-h-[24rem]" sidebar={<HubSidebar items={HUB_ITEMS} showToolsLink={false} account={ACCOUNT_SUBSCRIBED} linkAs={NavLink} staticLayout />}>
            <AppContent>
              <div className="flex max-w-wide flex-col gap-space-5">
                <h1 className="text-heading-xl">Facturation</h1>
                <ScheduledCancellationCard periodEnd="2026-10-23T10:00:00Z" toolCount={2} onKeep={noop} />
              </div>
            </AppContent>
          </AppFrame>
        </Bleed>
      </Section>
      <Section title="AppBleed · barre collante bord à bord" note="Une page entière (l'audit prêt, une fiche) sort des gouttières avec `AppBleed flush` : sa barre haute et son pied collent aux bords et au haut du contenu, tout ce qui est dedans y rentre avec `APP_GUTTER_X`. Le cadre défile, les deux barres restent. Une barre seule qui sort et rentre sur le même élément compose `APP_BLEED_X` + `APP_GUTTER_X`, sans wrapper.">
        <Bleed>
          {/* La rangée de la grille est bornée au cadre, sinon elle s'étire au contenu et rien ne défile. */}
          <AppFrame className="h-[52rem] grid-rows-[minmax(0,1fr)]" sidebar={<HubSidebar items={HUB_ITEMS} account={ACCOUNT_SUBSCRIBED} linkAs={NavLink} staticLayout />}>
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
                    <span className="caption">La suite dans Claude</span>
                    <Button>Ajouter le connecteur</Button>
                  </footer>
                </AppBleed>
              </AppContent>
            </div>
          </AppFrame>
        </Bleed>
      </Section>
      <Section title="AppContent · bloc centré verticalement" note="Depuis 0.1.14, la colonne « barre haute + contenu » d'AppLayout fait au moins la fenêtre et AppContent en prend le reste (colonne flex, flex-1) : un état vide ou une attente se centre avec `m-auto`. Ici le cadre joue la colonne d'AppLayout. Les pages qui ne centrent rien ne changent pas.">
        <Bleed>
          <AppFrame className="h-[40rem] grid-rows-[minmax(0,1fr)]" sidebar={<HubSidebar items={HUB_ITEMS} account={ACCOUNT_SUBSCRIBED} linkAs={NavLink} staticLayout />}>
            {/* La colonne d'`AppLayout` : hauteur du cadre au lieu de `min-h-dvh`. */}
            <div className="flex h-full flex-col">
              <AppContent>
                <StateCard
                  className="m-auto w-full max-w-dialog"
                  icon={<Icon name="zap" size="1.5rem" />}
                  title="Ton audit est en cours"
                  description="On lit tes dernières publications. Ça prend une à deux minutes."
                  action={<Button size="sm" variant="secondary">Actualiser</Button>}
                />
              </AppContent>
            </div>
          </AppFrame>
        </Bleed>
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
      <div className="flex h-[40rem] overflow-hidden rounded-xl border border-border bg-background">{children}</div>
    </div>
  );
}
