import type { JSX } from 'react';
import { Banner, Button, Modal } from '@yunary/ds';
import { fr } from '../i18n/fr';
import { formatDateNumerique, formatEuros } from '../lib/format';
import { ToolLabel } from '../layout/ToolLabel';
import { AmountRows } from './AmountRows';
import { SavedCardLine, type SavedCardView } from './SavedCardLine';
import { BankConfirmOverlay } from './BankConfirmOverlay';
import type { PaymentPhase } from './ModifySubscriptionView';

/** Les montants d'une activation, tels que l'aperçu du back les rend. */
export interface ActivateAmountsView {
  todayCents: number;
  /** « Yunary Audit du 10/10 au 23/10 ». */
  todayDetail?: string | null;
  nextCents: number;
  nextDate: string;
  /** « Yunary Analyse 9 € + Yunary Audit 5 € ». */
  nextDetail?: string | null;
}

export interface ActivateToolViewProps {
  open: boolean;
  onClose: () => void;
  /** `tools.name`. */
  name: string;
  /** `null` = aperçu en cours. */
  amounts: ActivateAmountsView | null;
  card: SavedCardView | null;
  /** Les phases de la grande modale, plus `done` : succès après une arrivée depuis Claude. */
  phase?: PaymentPhase | 'done';
  error?: string | null;
  onConfirm: () => void;
  onChangeCard?: () => void;
  onAddCard?: () => void;
  cardBusy?: boolean;
  onCancelBank?: () => void;
  inline?: boolean;
}

/** « Activer Yunary Audit ? », « Réactiver Yunary Analyse ? » : le verbe, le lockup, le point d'interrogation. */
function ToolQuestion({ verb, name }: { verb: string; name: string }): JSX.Element {
  return <span className="text-subheading">{verb} <ToolLabel name={name} /> ?</span>;
}

/**
 * « Activer un outil » (artboard Hub-Outils-Activer-Confirmation, 25/09/2026) — la VUE : un seul
 * outil, le prorata du jour mis en avant, le prochain prélèvement, la carte enregistrée, « Payer … ».
 * Mêmes phases que la grande modale (paiement, banque, carte refusée) ; carte absente : « Ajoute une
 * carte pour continuer » (portail), CTA inactif. `done` = arrivée depuis Claude (`?ajouter=`) : le
 * résultat de la Modal du DS, « Tu peux retourner dans Claude ». Sans abonnement ni carte
 * (`checkoutRequis`), le conteneur rend le `CheckoutModal` existant à la place de cette vue.
 * `Modal` lg du DS : 520 pour les 480 de la maquette (écart validé) ; feuille basse sous 64 rem.
 */
export function ActivateToolView({
  open, onClose, name, amounts, card, phase = 'edit', error = null, onConfirm, onChangeCard, onAddCard, cardBusy = false, onCancelBank, inline,
}: ActivateToolViewProps): JSX.Element | null {
  const p = fr.paiement;
  const busy = phase === 'paying' || phase === 'bank';
  const mustPay = !!amounts && amounts.todayCents > 0;
  if (phase === 'done') {
    return (
      <Modal
        open={open}
        inline={inline}
        size="lg"
        onClose={onClose}
        phase="result"
        result={{ status: 'success', title: p.activate.done(name), message: p.activate.doneClaude }}
      />
    );
  }
  return (
    <Modal
      open={open}
      inline={inline}
      size="lg"
      onClose={busy ? undefined : onClose}
      dismissable={false}
      className="relative"
      title={<ToolQuestion verb={p.activate.title} name={name} />}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={busy}>{p.cancel}</Button>
          <Button variant="primary" loading={busy} disabled={!amounts || busy || (mustPay && !card)} onClick={onConfirm}>
            {phase === 'bank' ? p.bank.cta : phase === 'paying' ? p.paying : mustPay ? p.pay(formatEuros(amounts!.todayCents)) : p.confirm}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-space-5 text-body text-foreground">
        <AmountRows
          rows={[
            { label: p.todayLabel, caption: amounts?.todayDetail, amountCents: amounts ? amounts.todayCents : null, highlight: true },
            { label: amounts ? p.nextCharge(formatDateNumerique(amounts.nextDate)) : p.nextLabel, caption: amounts?.nextDetail, amountCents: amounts ? amounts.nextCents : null },
          ]}
        />
        {mustPay || !amounts ? <SavedCardLine card={card} size="compact" onChange={onChangeCard} onAdd={onAddCard} busy={cardBusy} /> : null}
        {phase === 'declined' ? <Banner tone="danger" title={p.declined.title}>{p.declined.body}</Banner> : error ? <Banner tone="danger">{error}</Banner> : null}
      </div>
      {phase === 'bank' && amounts ? <BankConfirmOverlay amountCents={amounts.todayCents} onCancel={onCancelBank} /> : null}
    </Modal>
  );
}

export interface ReactivateToolViewProps {
  open: boolean;
  onClose: () => void;
  name: string;
  /** La date de fin programmée qui est annulée. */
  periodEnd: string;
  /** Le prochain prélèvement, lu dans l'aperçu ; `null` = en cours. */
  next: { cents: number; date: string; detail?: string | null } | null;
  phase?: 'edit' | 'saving';
  error?: string | null;
  onConfirm: () => void;
  inline?: boolean;
}

/**
 * « Réactiver Yunary Analyse ? » (artboard Hub-Outils-Reactiver-Confirmation, retouché le
 * 25/09/2026) — la VUE : la phrase, 0 € aujourd'hui mis en avant (« La période en cours est déjà
 * payée »), le prochain prélèvement et son détail, « Annuler » / « Réactiver ». Rien à payer : pas de
 * carte. Après coup, le hub affiche son `Banner` success (pas d'hôte de toasts) : la vue n'a que
 * `onConfirm`, le conteneur appelle `onDone`.
 */
export function ReactivateToolView({ open, onClose, name, periodEnd, next, phase = 'edit', error = null, onConfirm, inline }: ReactivateToolViewProps): JSX.Element | null {
  const p = fr.paiement;
  const saving = phase === 'saving';
  return (
    <Modal
      open={open}
      inline={inline}
      size="lg"
      onClose={saving ? undefined : onClose}
      title={<ToolQuestion verb={p.reactivate.title} name={name} />}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={saving}>{p.cancel}</Button>
          <Button variant="primary" loading={saving} disabled={!next || saving} onClick={onConfirm}>{p.reactivate.cta}</Button>
        </>
      }
    >
      <div className="flex flex-col gap-space-5 text-body text-foreground">
        <p className="text-body leading-body text-text-secondary">{p.reactivate.body(formatDateNumerique(periodEnd))}</p>
        <AmountRows
          rows={[
            { label: p.todayLabel, caption: p.reactivate.alreadyPaid, amountCents: 0, highlight: true },
            { label: next ? p.nextCharge(formatDateNumerique(next.date)) : p.nextLabel, caption: next?.detail, amountCents: next ? next.cents : null },
          ]}
        />
        {error ? <Banner tone="danger">{error}</Banner> : null}
      </div>
    </Modal>
  );
}
