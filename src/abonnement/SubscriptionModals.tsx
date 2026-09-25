import { useEffect, useMemo, useState, type ElementType, type JSX } from 'react';
import { fr } from '../i18n/fr';
import { getErrorMessage } from '../lib/errors';
import { usePortalSession } from '../account/useStripe';
import { useProfile } from '../account/useProfile';
import { isSubscriptionActive, useSubscription } from '../account/useSubscription';
import { useEntitlements, type Entitlement } from '../tools/useEntitlements';
import { useToolCatalog } from '../tools/useToolCatalog';
import { CheckoutModal } from './CheckoutModal';
import { ModifySubscriptionView, type PaymentPhase, type ToolSwitchRowView } from './ModifySubscriptionView';
import { ActivateToolView, ReactivateToolView } from './ToolPaymentModals';
import { SubscriptionResultView } from './SubscriptionResultView';
import type { SavedCardView } from './SavedCardLine';
import {
  activateAmountsFromPreview, buildOutcome, diffSelection, nextChargeDetail, rowState, summaryFromPreview, unchangedSummary,
  type PreviewCard, type SubscriptionChange, type SubscriptionChangeOutcome, type SubscriptionPreview,
} from './subscriptionChange';
import { useApplySubscriptionChange, usePreviewSubscriptionChange } from './useSubscriptionChange';

function toCard(c: PreviewCard | null | undefined): SavedCardView | null {
  return c ? { brand: c.marque, last4: c.last4, expMonth: c.expMois, expYear: c.expAnnee } : null;
}

/** Le droit d'abonnement actif d'un outil (en période), s'il existe. */
function subscriptionRight(rows: Entitlement[] | undefined, toolId: string): Entitlement | null {
  const now = Date.now();
  return rows?.find(r => r.toolId === toolId && r.source === 'subscription' && r.status === 'active' && (!r.periodEnd || new Date(r.periodEnd).getTime() >= now)) ?? null;
}

/**
 * « Changer » / « Ajouter une carte » : le portail Stripe dans un NOUVEL onglet, ouvert au clic (sinon bloqué comme
 * pop-up). La modale reste ouverte ; au retour sur l'onglet, l'aperçu est relu et la nouvelle carte apparaît.
 */
function usePortalInNewTab() {
  const portal = usePortalSession();
  return {
    busy: portal.isPending,
    open: (onError: (message: string) => void) => {
      const target = window.open('', '_blank');
      portal.mutate({ target }, { onError: e => onError(getErrorMessage(e)) });
    },
  };
}

function useOutcomeInputs() {
  const catalog = useToolCatalog();
  const entitlements = useEntitlements();
  const remaining = (ids: string[]) => Object.fromEntries(ids.map(id => [id, entitlements.data?.summaries.find(s => s.toolId === id)?.remaining ?? null]));
  return { catalog: catalog.data, remaining };
}

export interface ModifySubscriptionModalProps {
  open: boolean;
  onClose: () => void;
  /** Après un changement réussi : le hub affiche l'écran de retour (`SubscriptionResultScreen`). */
  onDone: (outcome: SubscriptionChangeOutcome) => void;
}

/**
 * « Modifier mon abonnement », câblée : les outils du catalogue (publiés, ou déjà souscrits), leur état lu dans les
 * droits (`tool_entitlements`) et l'abonnement, l'aperçu `preview-subscription-change` à chaque geste, puis
 * `update-subscription` avec la règle de la 3D Secure (`useApplySubscriptionChange`). Sans abonnement vivant
 * (`checkoutRequis`), le `CheckoutModal` prend le relais pour les outils ajoutés.
 */
export function ModifySubscriptionModal({ open, onClose, onDone }: ModifySubscriptionModalProps): JSX.Element | null {
  const catalog = useToolCatalog();
  const entitlements = useEntitlements();
  const subscription = useSubscription();
  const apply = useApplySubscriptionChange();
  const portal = usePortalInNewTab();
  const { remaining } = useOutcomeInputs();
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [phase, setPhase] = useState<PaymentPhase>('edit');
  const [error, setError] = useState<string | null>(null);

  const sub = subscription.data?.subscription ?? null;
  const cancelAll = !!sub?.cancelAtPeriodEnd && isSubscriptionActive(sub);
  const base = useMemo(() => (catalog.data?.tools ?? [])
    .map(t => {
      const right = subscriptionRight(entitlements.data?.rows, t.id);
      return { tool: t, right, state: rowState({ subscribed: !!right, endsAtPeriodEnd: !!right?.endsAtPeriodEnd, cancelAtPeriodEnd: cancelAll }) };
    })
    .filter(r => r.tool.isPublished || r.right), [catalog.data, entitlements.data, cancelAll]);

  /* À chaque ouverture : l'état du serveur (actif = coché, en retrait ou pas souscrit = décoché). */
  const ready = catalog.isSuccess && entitlements.isSuccess;
  useEffect(() => {
    if (!open || !ready) return;
    setChecked(Object.fromEntries(base.map(r => [r.tool.id, r.state === 'active'])));
    setPhase('edit');
    setError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, ready]);

  const rows: ToolSwitchRowView[] = base.map(r => ({
    toolId: r.tool.id, name: r.tool.name, priceCents: r.tool.priceCents, monthlyQuota: r.tool.monthlyQuota, state: r.state,
    checked: checked[r.tool.id] ?? r.state === 'active', periodEnd: r.right?.periodEnd ?? sub?.currentPeriodEnd ?? null,
  }));
  const change = diffSelection(rows);
  const preview = usePreviewSubscriptionChange(open && change ? change : null);
  const items = subscription.data?.items ?? [];
  const summary = change
    ? preview.data ? summaryFromPreview(preview.data, change, catalog.data) : null
    : unchangedSummary(items.reduce((s, i) => s + (i.amountCents ?? 0), 0), sub?.currentPeriodEnd ?? null);
  const previewError = preview.error ? getErrorMessage(preview.error) : null;

  if (preview.data?.checkoutRequis && change?.ajouter?.length) {
    return <CheckoutModal open={open} onClose={onClose} target={{ tools: change.ajouter }} />;
  }

  const confirm = async () => {
    if (!change || !preview.data) return;
    setError(null);
    setPhase('paying');
    try {
      const r = await apply.mutateAsync({ change, expectedTodayCents: preview.data.aPayerAujourdhui, onBank: () => setPhase('bank') });
      if (r.status === 'declined') { setPhase('declined'); return; }
      const unchanged = rows.filter(row => row.checked && row.state === 'active').map(row => row.toolId);
      onDone(buildOutcome({ change, preview: preview.data, catalog: catalog.data, unchanged, paidCents: r.paidCents, remaining: remaining(change.retirer ?? []) }));
    } catch (e) {
      setError(getErrorMessage(e));
      setPhase('edit');
    }
  };

  return (
    <ModifySubscriptionView
      open={open}
      onClose={onClose}
      rows={rows}
      onToggle={id => { setChecked(c => ({ ...c, [id]: !(c[id] ?? false) })); if (phase === 'declined') setPhase('edit'); setError(null); }}
      summary={summary}
      card={toCard(preview.data?.carte)}
      phase={phase}
      error={error ?? previewError}
      onConfirm={() => void confirm()}
      onChangeCard={() => portal.open(setError)}
      onAddCard={() => portal.open(setError)}
      cardBusy={portal.busy}
    />
  );
}

export interface ActivateToolModalProps {
  open: boolean;
  onClose: () => void;
  toolId: string;
  /** Après le paiement (hors arrivée depuis Claude) : le hub affiche l'écran de retour. */
  onDone?: (outcome: SubscriptionChangeOutcome) => void;
  /** Arrivée depuis Claude (`?ajouter=…`) : après le paiement, « Tu peux retourner dans Claude » dans la modale. */
  fromClaude?: boolean;
}

/**
 * « Activer un outil », câblée : l'aperçu `preview-subscription-change { tool }`, puis `update-subscription
 * { ajouter: [tool] }` avec la 3D Secure. Sans abonnement vivant (`checkoutRequis`) : le `CheckoutModal` existant.
 * Abonnement actif sans carte : « Ajouter une carte » ouvre le portail (jamais le Checkout, qui créerait un second
 * abonnement), l'aperçu est relu au retour.
 */
export function ActivateToolModal({ open, onClose, toolId, onDone, fromClaude = false }: ActivateToolModalProps): JSX.Element | null {
  const catalog = useToolCatalog();
  const entitlements = useEntitlements();
  const apply = useApplySubscriptionChange();
  const portal = usePortalInNewTab();
  const preview = usePreviewSubscriptionChange(open ? { tool: toolId } : null);
  const [phase, setPhase] = useState<PaymentPhase | 'done'>('edit');
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (open) { setPhase('edit'); setError(null); }
  }, [open, toolId]);

  const name = catalog.data?.tools.find(t => t.id === toolId)?.name ?? toolId;
  if (preview.data?.checkoutRequis) return <CheckoutModal open={open} onClose={onClose} target={{ tool: toolId }} />;

  const confirm = async (p: SubscriptionPreview) => {
    setError(null);
    setPhase('paying');
    const change: SubscriptionChange = { ajouter: [toolId] };
    try {
      const r = await apply.mutateAsync({ change, expectedTodayCents: p.aPayerAujourdhui, onBank: () => setPhase('bank') });
      if (r.status === 'declined') { setPhase('declined'); return; }
      if (fromClaude) { setPhase('done'); return; }
      const unchanged = (catalog.data?.tools ?? []).filter(t => t.id !== toolId && subscriptionRight(entitlements.data?.rows, t.id) && !subscriptionRight(entitlements.data?.rows, t.id)?.endsAtPeriodEnd).map(t => t.id);
      onDone?.(buildOutcome({ change, preview: p, catalog: catalog.data, unchanged, paidCents: r.paidCents }));
    } catch (e) {
      setError(getErrorMessage(e));
      setPhase('edit');
    }
  };

  return (
    <ActivateToolView
      open={open}
      onClose={onClose}
      name={name}
      amounts={preview.data ? activateAmountsFromPreview(preview.data, toolId, catalog.data) : null}
      card={toCard(preview.data?.carte)}
      phase={phase}
      error={error ?? (preview.error ? getErrorMessage(preview.error) : null)}
      onConfirm={() => { if (preview.data) void confirm(preview.data); }}
      onChangeCard={() => portal.open(setError)}
      onAddCard={() => portal.open(setError)}
      cardBusy={portal.busy}
    />
  );
}

export interface ReactivateToolModalProps {
  open: boolean;
  onClose: () => void;
  toolId: string;
  /** Après la réactivation : le hub affiche son `Banner` success en haut de Mes outils. */
  onDone: () => void;
}

/** « Réactiver », câblée : l'aperçu `{ garder: [tool] }` (0 € aujourd'hui), puis `update-subscription { garder: [tool] }`. */
export function ReactivateToolModal({ open, onClose, toolId, onDone }: ReactivateToolModalProps): JSX.Element | null {
  const catalog = useToolCatalog();
  const entitlements = useEntitlements();
  const apply = useApplySubscriptionChange();
  const change: SubscriptionChange = { garder: [toolId] };
  const preview = usePreviewSubscriptionChange(open ? change : null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (open) setError(null);
  }, [open, toolId]);
  const p = preview.data;
  const periodEnd = p?.abonnement?.finPeriode ?? subscriptionRight(entitlements.data?.rows, toolId)?.periodEnd ?? null;
  const confirm = async () => {
    setError(null);
    try {
      const r = await apply.mutateAsync({ change });
      if (r.status === 'ok') onDone();
      else setError(fr.errors.tools.cardDeclined);
    } catch (e) {
      setError(getErrorMessage(e));
    }
  };
  return (
    <ReactivateToolView
      open={open}
      onClose={onClose}
      name={catalog.data?.tools.find(t => t.id === toolId)?.name ?? toolId}
      periodEnd={periodEnd ?? new Date().toISOString()}
      next={p?.prochainPrelevement ? { cents: p.prochainPrelevement.montant, date: p.prochainPrelevement.date, detail: nextChargeDetail(p, change, catalog.data) } : null}
      phase={apply.isPending ? 'saving' : 'edit'}
      error={error ?? (preview.error ? getErrorMessage(preview.error) : null)}
      onConfirm={() => void confirm()}
    />
  );
}

export interface SubscriptionResultScreenProps {
  outcome: SubscriptionChangeOutcome;
  onBack: () => void;
  /** Défaut « Retour à mes outils » ; l'onboarding passe « Continuer ». */
  backLabel?: string;
  onRetry?: () => void;
  invoicesHref?: string;
  linkAs?: ElementType;
}

/** L'écran de retour, câblé : l'issue rendue par une modale + l'e-mail du profil pour « un reçu est parti sur … ». */
export function SubscriptionResultScreen({ outcome, onBack, backLabel, onRetry, invoicesHref, linkAs }: SubscriptionResultScreenProps): JSX.Element {
  const profile = useProfile();
  return (
    <SubscriptionResultView
      {...outcome}
      email={profile.data?.email ?? null}
      invoicesHref={invoicesHref}
      linkAs={linkAs}
      onBack={onBack}
      backLabel={backLabel}
      onRetry={onRetry}
    />
  );
}
