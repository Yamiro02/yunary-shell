import type { JSX, ReactNode } from 'react';
import { Badge, Banner, Button, Icon, IconButton, Modal, Separator, Skeleton, Switch, cn } from '@yunary/ds';
import { fr } from '../i18n/fr';
import { formatDateNumerique, formatEuros } from '../lib/format';
import { DS_MOBILE_QUERY, useMediaQuery } from '../lib/useMediaQuery';
import { ToolLabel } from '../layout/ToolLabel';
import { FullScreenSheet } from './FullScreenSheet';
import { SavedCardLine, type SavedCardView } from './SavedCardLine';
import { BankConfirmOverlay } from './BankConfirmOverlay';

/** L'état d'un outil CÔTÉ SERVEUR : souscrit · retrait déjà programmé · pas souscrit. */
export type ToolRowState = 'active' | 'ending' | 'none';

/** Une ligne de la modale : ce que le serveur dit de l'outil, et ce que la personne a coché. */
export interface ToolSwitchRowView {
  toolId: string;
  /** `tools.name`, lu en base. */
  name: string;
  priceCents: number | null;
  monthlyQuota: number | null;
  state: ToolRowState;
  /** Le choix de la personne : coché = gardé, ajouté ou réactivé. */
  checked: boolean;
  /** Renouvellement (outil actif) ou fin d'accès (retrait programmé). */
  periodEnd: string | null;
  disabled?: boolean;
}

/** Ce que l'aperçu du back (`preview-subscription-change`) dit du changement. Aucun montant n'est calculé ici. */
export interface ChangeSummaryView {
  added: { name: string; priceCents: number | null }[];
  removed: { name: string; until: string }[];
  reactivated: string[];
  todayCents: number;
  /** « Yunary Audit du 10/10 au 23/10 » : le détail du prorata, composé par le conteneur. */
  todayDetail?: string | null;
  nextCents: number;
  nextFrom: string | null;
}

/** `edit` · `paying` (appel en cours) · `bank` (3D Secure, fenêtre Stripe par-dessus) · `declined` (carte refusée). */
export type PaymentPhase = 'edit' | 'paying' | 'bank' | 'declined';

export interface ModifySubscriptionViewProps {
  open: boolean;
  onClose: () => void;
  rows: ToolSwitchRowView[];
  onToggle: (toolId: string) => void;
  /** `null` = aperçu en cours (squelettes, CTA inactif). */
  summary: ChangeSummaryView | null;
  card: SavedCardView | null;
  phase?: PaymentPhase;
  /** Une erreur autre qu'un refus de carte, déjà en français. */
  error?: string | null;
  onConfirm: () => void;
  onChangeCard?: () => void;
  onAddCard?: () => void;
  cardBusy?: boolean;
  onCancelBank?: () => void;
  /** Démo : force la disposition ; sinon, plein écran sous 64 rem. */
  layout?: 'modal' | 'fullscreen';
  inline?: boolean;
}

function hasChange(s: ChangeSummaryView | null): boolean {
  return !!s && (s.added.length > 0 || s.removed.length > 0 || s.reactivated.length > 0);
}

/** La ligne sous le nom : ce qui change (ambre pour un retrait), ou l'échéance. Rien sur un ajout (maquette). */
function rowNote(row: ToolSwitchRowView): { text: string; tone: 'amber' | 'secondary' } | null {
  const m = fr.paiement.modify;
  const date = row.periodEnd ? formatDateNumerique(row.periodEnd) : null;
  if (row.state === 'active') {
    if (!row.checked && date) return { text: m.removalNote(date, row.name), tone: 'amber' };
    return date ? { text: m.renewsOn(date), tone: 'secondary' } : null;
  }
  if (row.state === 'ending' && date) return { text: row.checked ? m.reactivatedNote(date) : m.endingNote(date), tone: 'secondary' };
  return null;
}

function rowBadge(row: ToolSwitchRowView): ReactNode {
  const m = fr.paiement.modify;
  if (row.state === 'active' || (row.state === 'ending' && row.checked)) return <Badge tone="success" pad="dense">{m.active}</Badge>;
  if (row.state === 'ending') return <Badge tone="amber" pad="dense">{m.ending}</Badge>;
  return null;
}

function priceLine(row: ToolSwitchRowView): string {
  const quota = fr.tools.quotaPerMonth(row.monthlyQuota);
  return row.priceCents === null ? quota : fr.paiement.priceLine(formatEuros(row.priceCents), quota);
}

function ToolSwitch({ row, onToggle, disabled }: { row: ToolSwitchRowView; onToggle: (id: string) => void; disabled: boolean }): JSX.Element {
  return <Switch aria-label={row.name} checked={row.checked} disabled={disabled || row.disabled} onChange={() => onToggle(row.toolId)} />;
}

/** Bureau : grille « texte / badge / interrupteur » (artboard Hub-03-ModifierOutils). */
function ToolSwitchRow({ row, onToggle, disabled }: { row: ToolSwitchRowView; onToggle: (id: string) => void; disabled: boolean }): JSX.Element {
  const note = rowNote(row);
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto_4rem] items-center gap-space-5 bg-background px-space-5 py-space-4">
      <span className="flex min-w-0 flex-col gap-space-1">
        <span className="flex flex-wrap items-baseline gap-x-space-3">
          <ToolLabel name={row.name} className="text-body text-foreground" />
          <span className="text-caption text-text-muted">{priceLine(row)}</span>
        </span>
        {note ? <span className={cn('text-body-sm font-medium', note.tone === 'amber' ? 'text-pill-amber-fg' : 'text-text-secondary')}>{note.text}</span> : null}
      </span>
      <span>{rowBadge(row)}</span>
      <span className="flex justify-end"><ToolSwitch row={row} onToggle={onToggle} disabled={disabled} /></span>
    </div>
  );
}

/** Mobile : une carte par outil, nom et badge en haut, la ligne et l'interrupteur en bas (artboard …-Mobile). */
function ToolSwitchCard({ row, onToggle, disabled }: { row: ToolSwitchRowView; onToggle: (id: string) => void; disabled: boolean }): JSX.Element {
  const note = rowNote(row);
  return (
    <div className="flex flex-col gap-space-3 rounded-md border border-border bg-background p-space-4">
      <div className="flex items-start justify-between gap-space-3">
        <span className="flex min-w-0 flex-col gap-space-1">
          <ToolLabel name={row.name} className="text-body text-foreground" />
          <span className="text-caption text-text-muted">{priceLine(row)}</span>
        </span>
        {rowBadge(row)}
      </div>
      <div className="flex items-center justify-between gap-space-3">
        <span className={cn('text-body-sm font-medium', note?.tone === 'amber' ? 'text-pill-amber-fg' : 'text-text-secondary')}>{note?.text}</span>
        <ToolSwitch row={row} onToggle={onToggle} disabled={disabled} />
      </div>
    </div>
  );
}

/** « Tu ajoutes / Tu retires / Tu réactives », ou « Aucun changement ». */
function ChangeLines({ summary, dense = false }: { summary: ChangeSummaryView | null; dense?: boolean }): JSX.Element {
  const m = fr.paiement.modify;
  if (!summary) return <Skeleton width="70%" height="1rem" />;
  if (!hasChange(summary)) return <span className="text-body-sm text-text-muted">{m.noChange}</span>;
  const lines: [string, string][] = [
    ...summary.added.map(a => [m.adds, a.priceCents === null ? a.name : m.addedLine(a.name, formatEuros(a.priceCents))] as [string, string]),
    ...summary.removed.map(r => [m.removes, m.removedLine(r.name, formatDateNumerique(r.until))] as [string, string]),
    ...summary.reactivated.map(n => [m.reactivates, n] as [string, string]),
  ];
  return (
    <div className="flex flex-col gap-space-2">
      {lines.map(([label, value], i) => (
        <div key={i} className={cn('grid grid-cols-[6rem_minmax(0,1fr)] gap-space-4', dense ? 'text-caption' : 'text-body-sm')}>
          <span className="font-semibold text-text-muted">{label}</span>
          <span className="text-foreground">{value}</span>
        </div>
      ))}
    </div>
  );
}

/** « À payer aujourd'hui » : le montant de l'aperçu, et son détail (prorata) ou « Rien à payer aujourd'hui ». */
function TodayBlock({ summary, size }: { summary: ChangeSummaryView | null; size: 'lg' | 'sm' }): JSX.Element {
  const p = fr.paiement;
  return (
    <div className="flex flex-col gap-space-1">
      <span className={cn('font-semibold text-text-muted', size === 'lg' ? 'text-body-sm' : 'text-caption')}>{p.todayLabel}</span>
      {summary ? (
        <span className={cn('font-display font-(--heading-weight) text-foreground', size === 'lg' ? 'text-heading' : 'text-subheading')}>{formatEuros(summary.todayCents)}</span>
      ) : <Skeleton width="4rem" height="1.75rem" />}
      {summary && size === 'lg' ? (
        <span className="text-caption text-text-muted">{summary.todayCents > 0 ? summary.todayDetail : p.nothingToday}</span>
      ) : null}
    </div>
  );
}

function NextBlock({ summary, size }: { summary: ChangeSummaryView | null; size: 'lg' | 'sm' }): JSX.Element {
  const p = fr.paiement;
  return (
    <div className="flex flex-col gap-space-1">
      <span className={cn('font-semibold text-text-muted', size === 'lg' ? 'text-body-sm' : 'text-caption')}>{p.nextLabel}</span>
      {summary ? (
        <span className={cn('font-bold text-foreground', size === 'lg' ? 'text-body' : 'text-body-sm')}>{p.perMonth(formatEuros(summary.nextCents))}</span>
      ) : <Skeleton width="5rem" height="1rem" />}
      {summary?.nextFrom ? (
        <span className="text-caption text-text-muted">{size === 'lg' ? p.nextFrom(formatDateNumerique(summary.nextFrom)) : p.nextFromShort(formatDateNumerique(summary.nextFrom))}</span>
      ) : null}
    </div>
  );
}

/**
 * « Modifier mon abonnement » (artboards Hub-03-ModifierOutils : Ajout, Retrait, AjoutRetrait,
 * EnCours, Refus, 3DS, RetraitProgramme, Mobile) — la VUE, pilotée par props : un interrupteur par
 * outil, sa pastille d'état et sa ligne « ce qui change », le récapitulatif « À payer aujourd'hui /
 * Ensuite » lu dans l'aperçu du back, la carte enregistrée, UN seul CTA (« Payer 3,33 € », ou
 * « Confirmer » à 0 €). Le conteneur (lot suivant) la câble sur `preview-subscription-change` et
 * `update-subscription`.
 *
 * Bureau : la `Modal` du DS à `--container-wide` (900 ; la maquette dit 920, écart validé), sans
 * padding, en-tête / corps défilant / pied, plafond ~80 % de l'écran. Mobile (≤ 64 rem) : le plein
 * écran des paiements (`FullScreenSheet`), outils en cartes, récap et CTA dans le pied fixe.
 * Écarts : colonne des montants à `--container-aside` (320 ; la maquette dit 300), pas de 1,25 rem
 * entre colonnes porté à `space-5`, 28 px de bord à `space-6`.
 */
export function ModifySubscriptionView({
  open, onClose, rows, onToggle, summary, card, phase = 'edit', error = null, onConfirm, onChangeCard, onAddCard, cardBusy = false,
  onCancelBank, layout, inline,
}: ModifySubscriptionViewProps): JSX.Element | null {
  const p = fr.paiement;
  const m = p.modify;
  const isMobile = useMediaQuery(DS_MOBILE_QUERY);
  const fullscreen = layout ? layout === 'fullscreen' : isMobile;
  const busy = phase === 'paying' || phase === 'bank';
  const mustPay = !!summary && summary.todayCents > 0;
  const blockedByCard = mustPay && !card;
  const ctaDisabled = !hasChange(summary) || blockedByCard || busy;
  const ctaLabel = phase === 'bank' ? p.bank.cta : phase === 'paying' ? (mustPay ? p.paying : p.saving) : mustPay ? p.pay(formatEuros(summary!.todayCents)) : p.confirm;
  const cta = (
    <Button variant="primary" fullWidth={fullscreen} loading={busy} disabled={ctaDisabled} onClick={onConfirm}>{ctaLabel}</Button>
  );
  const banner = phase === 'declined' ? (
    <Banner tone="danger" title={p.declined.title}>{p.declined.body}</Banner>
  ) : error ? <Banner tone="danger">{error}</Banner> : null;
  const overlay = phase === 'bank' && summary ? <BankConfirmOverlay amountCents={summary.todayCents} onCancel={onCancelBank} /> : null;

  if (fullscreen) {
    if (!open) return null;
    return (
      <FullScreenSheet
        title={m.title}
        subtitle={<span className="text-caption text-text-muted">{m.subtitleMobile}</span>}
        onClose={onClose}
        inline={inline}
        footer={
          <>
            <ChangeLines summary={summary} dense />
            <div className="flex items-start justify-between gap-space-4 rounded-md border border-border bg-background px-space-4 py-space-3">
              <TodayBlock summary={summary} size="sm" />
              <NextBlock summary={summary} size="sm" />
            </div>
            {cta}
            {mustPay ? <SavedCardLine card={card} size="inline" onChange={onChangeCard} onAdd={onAddCard} busy={cardBusy} /> : null}
          </>
        }
      >
        <div className={cn('flex flex-col gap-space-3', busy && 'opacity-60')}>
          {banner}
          {rows.map(row => <ToolSwitchCard key={row.toolId} row={row} onToggle={onToggle} disabled={busy} />)}
        </div>
        {overlay}
      </FullScreenSheet>
    );
  }

  return (
    <Modal
      open={open}
      inline={inline}
      size="lg"
      onClose={onClose}
      closeButton={false}
      dismissable={false}
      className="relative w-full max-w-wide gap-0 overflow-hidden p-0"
    >
      {/* La `Modal` range ses enfants dans `.ds-modal__desc` (colonne, `body-sm` muted) : un seul enfant qui reprend la
          main sur la typo et porte l'en-tête, le corps défilant et le pied. */}
      <div className="flex max-h-[80dvh] flex-col text-body text-foreground">
        <header className="flex flex-none items-start justify-between gap-space-4 px-space-6 pb-space-5 pt-space-5">
          <div className="flex flex-col gap-space-1">
            <h2 className="font-display text-subheading font-(--heading-weight) text-foreground">{m.title}</h2>
            <span className="text-body-sm text-text-muted">{m.subtitle}</span>
          </div>
          <IconButton variant="ghost" label={fr.common.close} onClick={onClose} disabled={busy} className="-mr-space-2 -mt-space-1">
            <Icon name="x" size="1.125rem" />
          </IconButton>
        </header>
        <div className="flex min-h-0 flex-1 flex-col gap-space-5 overflow-y-auto px-space-6">
          <div className={cn('flex flex-col gap-px overflow-hidden rounded-lg border border-border bg-border', busy && 'opacity-60')}>
            {rows.map(row => <ToolSwitchRow key={row.toolId} row={row} onToggle={onToggle} disabled={busy} />)}
          </div>
          <div className="grid grid-cols-[minmax(0,1fr)_var(--container-aside)] overflow-hidden rounded-lg border border-border bg-background">
            <div className="flex flex-col gap-space-4 px-space-5 py-space-5">
              <span className="font-display text-heading-sm font-bold text-foreground">{m.recap}</span>
              <ChangeLines summary={summary} />
            </div>
            <div className="flex flex-col gap-space-4 border-l border-border px-space-5 py-space-5">
              <TodayBlock summary={summary} size="lg" />
              <Separator />
              <NextBlock summary={summary} size="lg" />
            </div>
          </div>
          {banner}
        </div>
        <footer className="flex flex-none flex-wrap items-center justify-between gap-space-5 px-space-6 py-space-5">
          {mustPay ? <SavedCardLine card={card} size="full" onChange={onChangeCard} onAdd={onAddCard} busy={cardBusy} className="min-w-0 flex-1" /> : <span />}
          <div className="flex flex-none gap-space-3">
            <Button variant="ghost" onClick={onClose} disabled={busy}>{p.cancel}</Button>
            {cta}
          </div>
        </footer>
      </div>
      {overlay}
    </Modal>
  );
}
