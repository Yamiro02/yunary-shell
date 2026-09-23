import { useState, type JSX, type MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge, Banner, Button, Card, Icon, Progress } from '@yunary/ds';
import { fr } from '../i18n/fr';
import { formatDateLongue } from '../lib/format';
import { getErrorMessage } from '../lib/errors';
import { isSubscriptionActive, useSubscription, type SubscriptionInfo } from '../account/useSubscription';
import { useCancelSubscription, usePortalSession, useResumeSubscription } from '../account/useStripe';
import { useEntitlements, type EntitlementSummary } from '../tools/useEntitlements';
import { toolByIdIn, useToolCatalog, type ToolCatalog } from '../tools/useToolCatalog';
import { CancelSubscriptionModal } from '../abonnement/CancelSubscriptionModal';
import { CheckoutActivationCard } from '../abonnement/CheckoutActivationCard';
import { useCheckoutActivation } from '../abonnement/useCheckoutActivation';
import { TabError, TabSkeleton } from './states';

export interface AbonnementViewProps {
  /** La ligne `subscriptions` (`null` = jamais abonné) : statut, échéance, résiliation en cours. */
  subscription: SubscriptionInfo | null;
  /** Un résumé par outil (`useEntitlements().summaries`) : droits gratuits, d'abonnement et packs. */
  entitlements: EntitlementSummary[];
  /** Le catalogue, pour les noms — `undefined` = pas encore lu (l'identifiant est affiché en attendant). */
  catalog?: ToolCatalog;
  /** « Gérer mes outils » → la page des outils du hub (route locale). */
  toolsHref: string;
  /** « Gérer le paiement » — le portail Stripe. */
  onPortal: () => void;
  portalBusy?: boolean;
  /** « Se désabonner » — ouvre la confirmation (résiliation complète, fin de période). */
  onCancel: () => void;
  /** « Réactiver mon abonnement » — `resume-subscription`. */
  onResume: () => void;
  resumeBusy?: boolean;
  error?: string | null;
}

/** Le libellé FR d'un statut Stripe ; un statut inconnu est affiché tel quel. */
export function subscriptionStatusLabel(status: string | null): string {
  const s = fr.parametres.abonnement.status as Record<string, string>;
  return (status && s[status]) || status || s.none;
}

/**
 * C4 depuis 0.3.0 (pivot MCP) — trois blocs, rien d'autre : la ligne d'abonnement (statut, prochaine
 * échéance, résiliation programmée, « Gérer le paiement »), la liste des outils (nom, source, quota
 * utilisé / total, échéance) et « Gérer mes outils ». 🔒 Aucun prix, aucun chiffre d'offre ici :
 * souscrire, ajouter un outil, un pack, retirer — c'est la page des outils du hub, sur la base.
 */
export function AbonnementView({
  subscription, entitlements, catalog, toolsHref, onPortal, portalBusy = false, onCancel, onResume, resumeBusy = false, error = null,
}: AbonnementViewProps): JSX.Element {
  const a = fr.parametres.abonnement;
  const navigate = useNavigate();
  const hasSubscription = subscription !== null;
  const active = isSubscriptionActive(subscription);
  const ending = active && !!subscription?.cancelAtPeriodEnd;
  const periodEnd = subscription?.currentPeriodEnd ?? null;
  /* « Gérer mes outils » reste une vraie `<a href>` (clic-milieu, lecteur d'écran) dont le clic simple navigue côté
     client : le `as` de `Button` n'accepte que des éléments intrinsèques (BACKLOG du DS). */
  const onTools = (e: MouseEvent<HTMLElement>) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    navigate(toolsHref);
  };
  return (
    <div className="flex max-w-wide flex-col gap-space-5">
      {error ? <Banner tone="danger">{error}</Banner> : null}

      {/* Artboard C4 : carte formule 20 / 24, titre en `heading` **800** (Julien, 11/09/2026 — Onest 800 est chargé par la marque). */}
      <Card variant="feature" gap={3} className="px-space-5 py-space-5 shadow-none">
        <div className="flex flex-wrap items-start justify-between gap-space-4">
          <div className="flex flex-col gap-space-1">
            <span className="eyebrow">{a.yourSubscription}</span>
            <span className="font-display text-heading font-extrabold">{hasSubscription ? subscriptionStatusLabel(subscription.status) : a.status.none}</span>
            <span className="text-body font-medium text-text-secondary">
              {!hasSubscription
                ? a.noneBody
                : ending && periodEnd
                  ? a.endsOn(formatDateLongue(periodEnd))
                  : active && periodEnd
                    ? a.nextBilling(formatDateLongue(periodEnd))
                    : a.inactiveBody}
            </span>
          </div>
          {/* « Gérer le paiement » : carte, factures — le portail Stripe. Désactivé sans client Stripe. */}
          <Button variant="secondary" surface="card" size="sm" icon={<Icon name="external-link" size="1rem" />} disabled={!hasSubscription} loading={portalBusy} onClick={onPortal} className="flex-none">
            {a.portalCta}
          </Button>
        </div>
        {ending && periodEnd ? <span className="text-body font-medium text-text-secondary">{a.endsOnBody(formatDateLongue(periodEnd))}</span> : null}
        {/* « Se désabonner » ici, dans la carte d'abonnement (Julien, 13/09/2026) — jamais dans la liste des outils. */}
        {active ? (
          <div className="flex">
            {ending ? (
              <Button variant="primary" surface="card" size="sm" loading={resumeBusy} onClick={onResume}>{a.resume}</Button>
            ) : (
              <Button variant="secondary" surface="card" size="sm" onClick={onCancel}>{a.unsubscribe}</Button>
            )}
          </div>
        ) : null}
      </Card>

      <Card className="shadow-none" title={a.toolsTitle} titleSize="lg" subtitle={a.toolsSubtitle}>
        <div className="flex flex-col gap-space-4">
          {entitlements.length === 0 ? (
            <p className="text-body font-medium text-text-secondary">{a.toolsEmpty}</p>
          ) : (
            entitlements.map(e => <EntitlementRow key={`${e.toolId}-${e.source}`} entitlement={e} catalog={catalog} />)
          )}
          <div className="flex">
            <Button variant="primary" size="sm" as="a" href={toolsHref} onClick={onTools}>{a.manageTools}</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

/** Une ligne d'outil : nom (catalogue), source, « utilisé / total » (barre s'il y a un quota), échéance. */
function EntitlementRow({ entitlement: e, catalog }: { entitlement: EntitlementSummary; catalog?: ToolCatalog }): JSX.Element {
  const t = fr.tools;
  const name = toolByIdIn(catalog, e.toolId)?.name ?? e.toolId;
  const meta = e.source === 'subscription'
    ? e.endsAtPeriodEnd && e.periodEnd
      ? t.endsOn(formatDateLongue(e.periodEnd))
      : e.periodEnd
        ? t.renewsOn(formatDateLongue(e.periodEnd))
        : null
    : e.source === 'pack'
      ? t.packNoDeadline
      : t.freeOnce;
  return (
    <div className="flex flex-col gap-space-2 rounded-md border-[1.5px] border-input bg-background p-space-4">
      <div className="flex flex-wrap items-center justify-between gap-space-3">
        <div className="flex min-w-0 items-center gap-space-2">
          <span className="truncate text-control font-bold">{name}</span>
          <Badge tone={e.source === 'free' ? 'neutral' : 'coral'} pad="dense" className="chip">{t.source[e.source]}</Badge>
        </div>
        <span className="caption font-regular">{e.total === null ? t.unlimited : t.usage(e.used, e.total)}</span>
      </div>
      {e.total !== null && e.total > 0 ? <Progress value={Math.min(e.used, e.total)} max={e.total} label={t.usage(e.used, e.total)} className="bg-card" /> : null}
      {meta ? <span className="caption font-regular">{meta}</span> : null}
    </div>
  );
}

/**
 * C4 câblée : `subscriptions` + `subscription_items`, `tool_entitlements`, catalogue, portail,
 * résiliation et réactivation. Au retour de Stripe (`?checkout=`), l'écran d'activation remplace l'onglet.
 */
export function AbonnementTab({ toolsHref = '/outils' }: { toolsHref?: string }): JSX.Element {
  const subscription = useSubscription();
  const entitlements = useEntitlements();
  const catalog = useToolCatalog();
  const portal = usePortalSession();
  const cancel = useCancelSubscription();
  const resume = useResumeSubscription();
  const activation = useCheckoutActivation();
  const [error, setError] = useState<string | null>(null);
  const [cancelOpen, setCancelOpen] = useState(false);

  if (activation.state !== 'idle') {
    return <CheckoutActivationCard state={activation.state} onContinue={activation.clear} className="max-w-wide" />;
  }
  if (subscription.isPending || entitlements.isPending) return <TabSkeleton lines={5} />;
  if (subscription.isError || entitlements.isError) {
    return <TabError message={fr.parametres.abonnement.loadError} onRetry={() => { subscription.refetch(); entitlements.refetch(); catalog.refetch(); }} />;
  }
  return (
    <>
      <AbonnementView
        subscription={subscription.data.subscription}
        entitlements={entitlements.data.summaries}
        /* Un catalogue en erreur ne bloque pas l'onglet : l'identifiant de l'outil s'affiche à la place du nom. */
        catalog={catalog.data}
        toolsHref={toolsHref}
        onPortal={() => { setError(null); portal.mutate(undefined, { onError: e => setError(getErrorMessage(e)) }); }}
        portalBusy={portal.isPending}
        onCancel={() => { setError(null); setCancelOpen(true); }}
        onResume={() => { setError(null); resume.mutate(undefined, { onError: e => setError(getErrorMessage(e)) }); }}
        resumeBusy={resume.isPending}
        error={error}
      />
      <CancelSubscriptionModal
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        periodEnd={subscription.data.subscription?.currentPeriodEnd ?? null}
        onConfirm={async () => { await cancel.mutateAsync(); }}
      />
    </>
  );
}
