import { useState, type JSX } from 'react';
import { Badge, Banner, Button, Card, Icon, Progress, cn } from '@yunary/ds';
import { fr } from '../i18n/fr';
import { formatDateCourte } from '../lib/format';
import { getErrorMessage } from '../lib/errors';
import { useCredits } from '../account/useCredits';
import { useSubscription } from '../account/useSubscription';
import { useCheckoutSession, usePortalSession } from '../account/useStripe';
import { PLANS, planFor, type PlanDef, type PlanId } from './plans';
import type { CreditsView } from '../layout/CreditsCard';
import { TabError, TabSkeleton } from './states';

export interface AbonnementViewProps {
  /** `null` = solde indisponible. */
  credits: CreditsView | null;
  plan: PlanDef;
  /** Une ligne `subscriptions` existe → portail Stripe ouvert. */
  hasSubscription: boolean;
  onPortal: () => void;
  portalBusy?: boolean;
  onChoose: (plan: PlanId) => void;
  checkoutBusy?: PlanId | null;
  error?: string | null;
  plans?: readonly PlanDef[];
}

/** C4 — la vue : facturation, formule actuelle + solde, grille des offres. Aucun prix en dur : tout vient de `PLANS`. */
export function AbonnementView({ credits, plan, hasSubscription, onPortal, portalBusy = false, onChoose, checkoutBusy = null, error = null, plans = PLANS }: AbonnementViewProps): JSX.Element {
  const a = fr.parametres.abonnement;
  const isFree = plan.id === 'free';
  return (
    <div className="flex max-w-wide flex-col gap-space-5">
      {error ? <Banner tone="danger">{error}</Banner> : null}

      <Card className="flex flex-wrap items-center justify-between gap-space-4 px-space-6 py-space-4 shadow-none">
        <div className="flex flex-col gap-space-1">
          <span className="text-body font-semibold">{a.billingTitle}</span>
          <span className="caption">{hasSubscription ? a.billingSubtitle : a.billingLocked}</span>
        </div>
        <Button variant="secondary" size="sm" icon={<Icon name="external-link" size="1rem" />} disabled={!hasSubscription} loading={portalBusy} onClick={onPortal} className="flex-none">
          {a.billingCta}
        </Button>
      </Card>

      <Card variant="feature" className="flex flex-col gap-space-3 px-space-6 py-space-5 shadow-none">
        <div className="flex items-start justify-between gap-space-4">
          <div className="flex flex-col gap-space-1">
            <span className="eyebrow">{a.yourPlan}</span>
            <span className="font-display text-heading font-bold">{plan.name}</span>
            <span className="text-body font-medium text-text-secondary">{isFree ? a.activationPlan : a.monthlyPlan}</span>
          </div>
          <div className="flex flex-col items-end gap-space-1">
            <span className="font-display text-heading font-bold">
              {credits ? credits.remaining : '—'}
              <span className="font-body text-body font-regular text-text-muted"> / {credits?.total ?? plan.creditsPerMonth ?? '—'}</span>
            </span>
            <span className="caption">{a.creditsThisMonth}</span>
          </div>
        </div>
        <Progress value={credits?.remaining ?? 0} max={credits?.total ?? plan.creditsPerMonth ?? Math.max(credits?.remaining ?? 0, 1)} label={a.creditsThisMonth} className="bg-card" />
        {credits?.periodEnd ? (
          <span className="text-body font-medium text-text-secondary">{isFree ? a.resetOnFree(formatDateCourte(credits.periodEnd)) : a.resetOnPaid(formatDateCourte(credits.periodEnd))}</span>
        ) : null}
      </Card>

      <div className="flex flex-col gap-space-4">
        <h3 className="text-heading-sm">{a.changePlan}</h3>
        <div className="grid grid-cols-1 gap-space-5 pt-space-2 md:grid-cols-3">
          {plans.map(p => {
            const current = p.id === plan.id;
            return (
              <Card key={p.id} className={cn('flex flex-col gap-space-4 px-space-6 py-space-5', p.recommended ? 'border-primary shadow-md' : 'shadow-none')}>
                <div className="flex flex-col gap-space-1">
                  <div className="flex items-center justify-between gap-space-3">
                    <span className="font-display text-body-lg font-(--heading-weight) tracking-heading-sm">{p.name}</span>
                    {p.recommended ? <Badge tone="coral" pad="dense">{a.recommended}</Badge> : null}
                  </div>
                  <span className="caption">
                    <strong className="font-display text-subheading font-bold text-foreground">{p.priceMonthly === null ? a.priceUnknown : `${p.priceMonthly} €`}</strong> {a.perMonth}
                  </span>
                </div>
                <ul className="flex flex-1 flex-col gap-space-2 text-body-sm text-text-secondary">
                  {p.features.map(fe => (
                    <li key={fe} className="flex items-start gap-space-2">
                      <Icon name="check" size="1rem" strokeWidth={3} className="mt-[0.125rem] flex-none text-pill-success-fg" />
                      <span>{fe}</span>
                    </li>
                  ))}
                </ul>
                {current ? (
                  <Button variant="secondary" size="sm" fullWidth disabled>{a.currentPlan}</Button>
                ) : p.available ? (
                  <Button variant={p.recommended ? 'primary' : 'secondary'} size="sm" fullWidth loading={checkoutBusy === p.id} disabled={!!checkoutBusy} onClick={() => onChoose(p.id)}>{a.choose}</Button>
                ) : (
                  <Button variant="secondary" size="sm" fullWidth disabled>{a.soon}</Button>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/** C4 câblée : `user_credits`, `subscriptions`, portail et checkout Stripe. */
export function AbonnementTab(): JSX.Element {
  const credits = useCredits();
  const subscription = useSubscription();
  const portal = usePortalSession();
  const checkout = useCheckoutSession();
  const [error, setError] = useState<string | null>(null);
  if (credits.isPending || subscription.isPending) return <TabSkeleton lines={5} />;
  if (credits.isError || subscription.isError) return <TabError message={fr.parametres.abonnement.loadError} onRetry={() => { credits.refetch(); subscription.refetch(); }} />;
  const c = credits.data;
  return (
    <AbonnementView
      credits={c ? { remaining: c.creditsRemaining, total: c.creditsTotal, periodEnd: c.periodEnd } : null}
      plan={planFor(subscription.data?.plan)}
      hasSubscription={!!subscription.data}
      onPortal={() => { setError(null); portal.mutate(undefined, { onError: e => setError(getErrorMessage(e)) }); }}
      portalBusy={portal.isPending}
      onChoose={plan => { setError(null); checkout.mutate({ plan }, { onError: e => setError(getErrorMessage(e)) }); }}
      checkoutBusy={checkout.isPending ? (checkout.variables?.plan ?? null) : null}
      error={error}
    />
  );
}
