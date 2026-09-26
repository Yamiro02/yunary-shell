import { useState, type JSX, type ReactNode } from 'react';
import { Button } from '@yunary/ds';
import {
  ActivateToolView, AnimatedCheck, ModifySubscriptionView, ReactivateToolView, ScheduledCancellationCard, SubscriptionResultView,
  type ChangeSummaryView, type SavedCardView, type ToolSwitchRowView,
} from '@yunary/shell';
import { Section } from '../ui';
import { PaymentWindowSections } from './PaymentWindow';

const noop = () => undefined;
const END = '2026-10-23T10:00:00Z';
const CARD: SavedCardView = { brand: 'visa', last4: '4242', expMonth: 8, expYear: 2028 };

/* Les lignes telles que le conteneur les composera : catalogue (nom, prix, quota) + droits (état, échéance) + le choix. */
const analyse = (state: ToolSwitchRowView['state'], checked: boolean): ToolSwitchRowView => ({ toolId: 'analyse', name: 'Yunary Analyse', priceCents: 900, monthlyQuota: 50, unitLabel: 'analyse', unitLabelPlural: 'analyses', state, checked, periodEnd: END });
const audit = (state: ToolSwitchRowView['state'], checked: boolean): ToolSwitchRowView => ({ toolId: 'audit', name: 'Yunary Audit', priceCents: 500, monthlyQuota: 2, unitLabel: 'audit', unitLabelPlural: 'audits', state, checked, periodEnd: state === 'none' ? null : END });

/* Ce que les conteneurs tirent de `preview-subscription-change` (§ 8 du back) : aucun montant n'est calculé côté front. */
const ADD: ChangeSummaryView = { added: [{ name: 'Yunary Audit', priceCents: 500 }], removed: [], reactivated: [], todayCents: 333, todayDetail: 'Yunary Audit du 10/10 au 23/10', nextCents: 1400, nextFrom: END };
const REMOVE: ChangeSummaryView = { added: [], removed: [{ name: 'Yunary Analyse', until: END }], reactivated: [], todayCents: 0, nextCents: 500, nextFrom: END };
const ADD_REMOVE: ChangeSummaryView = { ...ADD, removed: [{ name: 'Yunary Analyse', until: END }], nextCents: 500 };
const NONE: ChangeSummaryView = { added: [], removed: [], reactivated: [], todayCents: 0, nextCents: 500, nextFrom: END };
const REACTIVATE: ChangeSummaryView = { ...NONE, reactivated: ['Yunary Analyse'], nextCents: 1400 };

/**
 * Abonnement v2 (0.4.0, maquette « Yunary Hub Dashboard ») : les VUES pilotées par props, dans les états des
 * artboards. Les conteneurs câblés (`ModifySubscriptionModal`, `ActivateToolModal`, `ReactivateToolModal`,
 * `SubscriptionResultScreen`) les alimentent depuis `preview-subscription-change` et `update-subscription` ; la vitrine,
 * sans back, montre les vues.
 */
export function PaiementPage(): JSX.Element {
  return (
    <div className="flex flex-col gap-space-7">
      <PaymentWindowSections />
      <ModifySection />
      <ResultSection />
      <ActivateSection />
      <Section title="ReactivateToolView (Hub-Outils-Reactiver-Confirmation)" note="Retouchée le 25/09 : 0 € aujourd'hui mis en avant (« La période en cours est déjà payée »), le prochain prélèvement et son détail. Pas de carte : rien à payer. Après coup, le hub affiche son Banner success en haut de Mes outils (pas d'hôte de toasts).">
        <div className="grid grid-cols-1 gap-space-5 xl:grid-cols-2">
          <Frame label="Confirmation"><ReactivateToolView open inline onClose={noop} name="Yunary Analyse" periodEnd={END} next={{ cents: 1400, date: END, detail: 'Yunary Analyse 9 € + Yunary Audit 5 €' }} onConfirm={noop} /></Frame>
          <Frame label="Enregistrement"><ReactivateToolView open inline onClose={noop} name="Yunary Analyse" periodEnd={END} next={{ cents: 1400, date: END, detail: 'Yunary Analyse 9 € + Yunary Audit 5 €' }} phase="saving" onConfirm={noop} /></Frame>
        </div>
      </Section>
      <Section title="ScheduledCancellationCard (Hub-Facturation-ResiliationProgrammee)" note="Pour la page Facturation du hub, quand tout l'abonnement s'arrête à l'échéance. « Garder mes outils » → resume-subscription.">
        <Frame><div className="flex flex-col gap-space-4"><ScheduledCancellationCard periodEnd={END} toolCount={2} onKeep={noop} /><ScheduledCancellationCard periodEnd={END} toolCount={1} onKeep={noop} keepBusy /></div></Frame>
      </Section>
    </div>
  );
}

function ModifySection(): JSX.Element {
  /* La démo interactive : les interrupteurs basculent vraiment ; l'aperçu suit la sélection (fixtures). */
  const [sel, setSel] = useState({ analyse: true, audit: false });
  const rows = [analyse('active', sel.analyse), audit('none', sel.audit)];
  const live = !sel.analyse && sel.audit ? ADD_REMOVE : sel.audit ? ADD : !sel.analyse ? REMOVE : NONE;
  const modal = (label: string, node: ReactNode) => <WideFrame label={label}>{node}</WideFrame>;
  const common = { open: true, inline: true, onClose: noop, onToggle: noop, onConfirm: noop, onChangeCard: noop, onAddCard: noop, onCancelBank: noop, layout: 'modal' as const };
  return (
    <Section title="ModifySubscriptionView (Hub-03-ModifierOutils)" note="Un interrupteur par outil, la pastille d'état, la ligne « ce qui change » (ambre pour un retrait), le récapitulatif « À payer aujourd'hui / Ensuite » lu dans l'aperçu, la carte enregistrée, UN seul CTA. Modal du DS à --container-wide (900 pour 920), colonne des montants à --container-aside (320 pour 300).">
      <div className="flex flex-col gap-space-5">
        {modal('Interactif : bascule les outils', <ModifySubscriptionView {...common} rows={rows} summary={live} card={CARD} onToggle={id => setSel(s => ({ ...s, [id]: !s[id as 'analyse' | 'audit'] }))} />)}
        {modal('Ajout · Payer 3,33 €', <ModifySubscriptionView {...common} rows={[analyse('active', true), audit('none', true)]} summary={ADD} card={CARD} />)}
        {modal('Retrait · 0 €, pas de carte, « Confirmer »', <ModifySubscriptionView {...common} rows={[analyse('active', false), audit('active', true)]} summary={REMOVE} card={CARD} />)}
        {modal('Ajout + retrait', <ModifySubscriptionView {...common} rows={[analyse('active', false), audit('none', true)]} summary={ADD_REMOVE} card={CARD} />)}
        {modal('Paiement en cours', <ModifySubscriptionView {...common} rows={[analyse('active', true), audit('none', true)]} summary={ADD} card={CARD} phase="paying" />)}
        {modal('Carte refusée', <ModifySubscriptionView {...common} rows={[analyse('active', true), audit('none', true)]} summary={ADD} card={CARD} phase="declined" />)}
        {modal('3D Secure (la fenêtre Stripe s’ouvre par-dessus)', <ModifySubscriptionView {...common} rows={[analyse('active', true), audit('none', true)]} summary={ADD} card={CARD} phase="bank" />)}
        {modal('Retrait déjà programmé · aucun changement', <ModifySubscriptionView {...common} rows={[analyse('ending', false), audit('active', true)]} summary={NONE} card={CARD} />)}
        {modal('Réactivation sélectionnée', <ModifySubscriptionView {...common} rows={[analyse('ending', true), audit('active', true)]} summary={REACTIVATE} card={CARD} />)}
        {modal('Carte absente, abonnement actif · « Ajouter une carte » (portail)', <ModifySubscriptionView {...common} rows={[analyse('active', true), audit('none', true)]} summary={ADD} card={null} />)}
        {modal('Aperçu en cours', <ModifySubscriptionView {...common} rows={[analyse('active', true), audit('none', true)]} summary={null} card={CARD} />)}
        <div className="flex flex-wrap gap-space-5">
          <PhoneFrame label="Mobile · ajout + retrait"><ModifySubscriptionView {...common} layout="fullscreen" rows={[analyse('active', false), audit('none', true)]} summary={ADD_REMOVE} card={CARD} /></PhoneFrame>
          <PhoneFrame label="Mobile · 3D Secure"><ModifySubscriptionView {...common} layout="fullscreen" rows={[analyse('active', true), audit('none', true)]} summary={ADD} card={CARD} phase="bank" /></PhoneFrame>
        </div>
      </div>
    </Section>
  );
}

function ResultSection(): JSX.Element {
  const [k, setK] = useState(0);
  const added = { variant: 'added' as const, subjects: ['Yunary Audit'], todayCents: 333, next: { cents: 1400, from: END }, email: 'julien@exemple.com', invoicesHref: '/facturation', onBack: noop };
  const addedTools = [
    { name: 'Yunary Audit', meta: '2 audits par mois · renouvelé le 23/10/2026', status: 'active' as const },
    { name: 'Yunary Analyse', meta: '50 analyses par mois · renouvelé le 23/10/2026', status: 'active' as const },
  ];
  return (
    <Section title="SubscriptionResultView (Hub-03b-Retour)" note="Pleine page : la coche se dessine, puis le titre, puis les outils un par un (element.animate, --ease-standard). Sous prefers-reduced-motion : tout est visible tout de suite. Colonne à max-w-[35rem] (560, provisoire). Coche 5 rem bureau, 4 rem mobile.">
      <div className="flex"><Button variant="secondary" onClick={() => setK(x => x + 1)}>Rejouer l'animation</Button></div>
      <div key={k} className="flex flex-col gap-space-5">
        <PageFrame label="Ajout"><SubscriptionResultView inline layout="desktop" {...added} tools={addedTools} /></PageFrame>
        <PageFrame label="Ajout de deux outils + un retrait (variante ajout, outil retiré en badge ambre)">
          <SubscriptionResultView inline layout="desktop" {...added} subjects={['Yunary Audit', 'Yunary Script']} todayCents={500} next={{ cents: 1000, from: END }}
            tools={[addedTools[0], { name: 'Yunary Script', meta: 'Sans limite · renouvelé le 23/10/2026', status: 'active' }, { name: 'Yunary Analyse', meta: 'Encore 9 analyses jusque-là', status: 'ending', endsOn: END }]} />
        </PageFrame>
        <PageFrame label="Retrait">
          <SubscriptionResultView inline layout="desktop" variant="removed" subjects={['Yunary Analyse']} periodEnd={END} next={{ cents: 500, from: END }} onBack={noop}
            tools={[{ name: 'Yunary Analyse', meta: 'Encore 9 analyses jusque-là', status: 'ending', endsOn: END }, { name: 'Yunary Audit', meta: '2 audits par mois · renouvelé le 23/10/2026', status: 'active' }]} />
        </PageFrame>
        <PageFrame label="Échec">
          <SubscriptionResultView inline layout="desktop" variant="failed" subjects={['Yunary Audit']} todayCents={333} onBack={noop} onRetry={noop}
            tools={[{ name: 'Yunary Audit', meta: 'Pas encore ajouté', status: 'failed' }, { name: 'Yunary Analyse', meta: '50 analyses par mois · renouvelé le 23/10/2026', status: 'active' }]} />
        </PageFrame>
        <div className="flex flex-wrap gap-space-5">
          <PhoneFrame label="Mobile · ajout"><SubscriptionResultView inline layout="mobile" {...added} tools={addedTools} /></PhoneFrame>
          <PhoneFrame label="Mobile · échec"><SubscriptionResultView inline layout="mobile" variant="failed" subjects={['Yunary Audit']} todayCents={333} onBack={noop} onRetry={noop} tools={[{ name: 'Yunary Audit', meta: 'Pas encore ajouté', status: 'failed' }]} /></PhoneFrame>
        </div>
        <Frame label="AnimatedCheck · md et sm, success et danger">
          <div className="flex items-center gap-space-6"><AnimatedCheck /><AnimatedCheck tone="danger" /><AnimatedCheck size="sm" /><AnimatedCheck size="sm" tone="danger" /></div>
        </Frame>
      </div>
    </Section>
  );
}

function ActivateSection(): JSX.Element {
  const amounts = { todayCents: 333, todayDetail: 'Yunary Audit du 10/10 au 23/10', nextCents: 1400, nextDate: END, nextDetail: 'Yunary Analyse 9 € + Yunary Audit 5 €' };
  const common = { open: true, inline: true, onClose: noop, name: 'Yunary Audit', onConfirm: noop, onChangeCard: noop, onAddCard: noop, onCancelBank: noop };
  return (
    <Section title="ActivateToolView (Hub-Outils-Activer-Confirmation)" note="Un seul outil, le prorata du jour mis en avant, le prochain prélèvement, la carte enregistrée, « Payer 3,33 € ». Mêmes phases que la grande modale. Sans abonnement vivant (checkoutRequis), ActivateToolModal rend la fenêtre de paiement (PaymentModal). « done » = arrivée depuis Claude.">
      <div className="grid grid-cols-1 gap-space-5 xl:grid-cols-2">
        <Frame label="Confirmation"><ActivateToolView {...common} amounts={amounts} card={CARD} /></Frame>
        <Frame label="Aperçu en cours"><ActivateToolView {...common} amounts={null} card={CARD} /></Frame>
        <Frame label="Paiement en cours"><ActivateToolView {...common} amounts={amounts} card={CARD} phase="paying" /></Frame>
        <Frame label="3D Secure"><div className="relative min-h-[30rem]"><ActivateToolView {...common} amounts={amounts} card={CARD} phase="bank" /></div></Frame>
        <Frame label="Carte refusée"><ActivateToolView {...common} amounts={amounts} card={CARD} phase="declined" /></Frame>
        <Frame label="Carte absente, abonnement actif"><ActivateToolView {...common} amounts={amounts} card={null} /></Frame>
        <Frame label="Arrivée depuis Claude · payé"><ActivateToolView {...common} amounts={amounts} card={CARD} phase="done" /></Frame>
      </div>
    </Section>
  );
}

function Frame({ label, children }: { label?: string; children: ReactNode }): JSX.Element {
  return (
    <div className="flex flex-col gap-space-3 rounded-xl border border-border bg-background p-space-6">
      {label ? <span className="eyebrow">{label}</span> : null}
      {children}
    </div>
  );
}

/* Un cadre à la largeur d'un écran : la grande modale s'y rend en `inline`, centrée comme sous son voile. */
function WideFrame({ label, children }: { label: string; children: ReactNode }): JSX.Element {
  return (
    <div className="flex flex-col gap-space-3">
      <span className="eyebrow">{label}</span>
      <div className="flex justify-center rounded-xl border border-border bg-background p-space-6">{children}</div>
    </div>
  );
}

/* Une page de 900 px de haut : l'écran de retour y remplit son cadre (`inline`). */
function PageFrame({ label, children }: { label: string; children: ReactNode }): JSX.Element {
  return (
    <div className="flex flex-col gap-space-3">
      <span className="eyebrow">{label}</span>
      <div className="h-[56.25rem] overflow-hidden rounded-xl border border-border">{children}</div>
    </div>
  );
}

function PhoneFrame({ label, children }: { label: string; children: ReactNode }): JSX.Element {
  return (
    <div className="flex flex-col gap-space-3">
      <span className="eyebrow">{label}</span>
      <div className="relative h-[52.75rem] w-[24.375rem] overflow-hidden rounded-xl border border-border shadow-md">{children}</div>
    </div>
  );
}
