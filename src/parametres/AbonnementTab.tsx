import { useState, type JSX } from 'react';
import { Badge, Banner, Button, Card, Icon, Progress, cn } from '@yunary/ds';
import { fr } from '../i18n/fr';
import { formatDateLongue, formatEuros } from '../lib/format';
import { getErrorMessage } from '../lib/errors';
import { useCredits } from '../account/useCredits';
import { isSubscriptionActive, useSubscription, type SubscriptionInfo } from '../account/useSubscription';
import { useCancelSubscription, usePortalSession, useResumeSubscription } from '../account/useStripe';
import { allocationFor, isLaunchPrice, priceToShow, signupCreditsFor, usePlanCatalog, type PlanCatalog } from '../account/usePlanCatalog';
import { CheckoutModal } from '../abonnement/CheckoutModal';
import { CancelSubscriptionModal } from '../abonnement/CancelSubscriptionModal';
import { CheckoutActivationCard } from '../abonnement/CheckoutActivationCard';
import { useCheckoutActivation } from '../abonnement/useCheckoutActivation';
import { PLANS, planFeatures, planFor, type PlanDef, type PlanId } from './plans';
import type { CreditsView } from '../layout/CreditsCard';
import { TabError, TabSkeleton } from './states';

export type PaidPlanId = Exclude<PlanId, 'free'>;

export interface AbonnementViewProps {
  /** `null` = solde indisponible. */
  credits: CreditsView | null;
  plan: PlanDef;
  /** La ligne `subscriptions` (`null` = Gratuite) : statut, fin de période, résiliation en cours. */
  subscription: SubscriptionInfo | null;
  /** Prix et allocations, lus en base — `undefined` = pas encore lus (« — € »). */
  catalog?: PlanCatalog;
  onPortal: () => void;
  portalBusy?: boolean;
  onChoose: (plan: PaidPlanId) => void;
  /** « Se désabonner » — ouvre la confirmation. */
  onCancel: () => void;
  /** « Réactiver mon abonnement » — `resume-subscription`. */
  onResume: () => void;
  resumeBusy?: boolean;
  error?: string | null;
  plans?: readonly PlanDef[];
}

/**
 * C4 — la vue : facturation, formule actuelle + solde, grille des DEUX offres. 🔒 Aucun prix ni
 * allocation en dur : tout vient de `catalog` (`plan_allocations`, `launch_counter`).
 * Gratuite (13/09/2026) : 50 crédits une fois, jamais rechargés → pas de barre, pas de « X / Y »,
 * pas de date de recharge — juste le solde. La barre n'a de sens que face à une allocation mensuelle.
 */
export function AbonnementView({
  credits, plan, subscription, catalog, onPortal, portalBusy = false, onChoose, onCancel, onResume, resumeBusy = false,
  error = null, plans = PLANS,
}: AbonnementViewProps): JSX.Element {
  const a = fr.parametres.abonnement;
  const isFree = plan.id === 'free';
  const hasSubscription = subscription !== null;
  const active = isSubscriptionActive(subscription);
  const ending = active && !!subscription?.cancelAtPeriodEnd;
  const periodEnd = subscription?.currentPeriodEnd ?? null;
  /* Le dénominateur : l'allocation mensuelle lue en base (le `total` de la carte crédits). 0 ou inconnu = pas de barre. */
  const total = credits?.total ?? allocationFor(catalog, plan.id);
  const showBar = !isFree && !!total && total > 0;
  return (
    <div className="flex max-w-wide flex-col gap-space-5">
      {error ? <Banner tone="danger">{error}</Banner> : null}

      {/* Artboard C4 : carte facturation 16 / 24 (`space-4` / `space-5`), bouton secondaire sur la carte. Une RANGÉE : la prop `gap` du DS pose une colonne, le gap reste en className. */}
      <Card className="flex flex-wrap items-center justify-between gap-space-4 px-space-5 py-space-4 shadow-none">
        <div className="flex flex-col gap-space-1">
          {/* Une seule hiérarchie de titres de carte dans toute l'app : `heading-sm` (l'artboard le mettait en 16 DM Sans). */}
          <span className="font-display text-heading-sm">{a.billingTitle}</span>
          <span className="caption">{hasSubscription ? a.billingSubtitle : a.billingLocked}</span>
        </div>
        {/* « Gérer la facturation » reste : changer de carte, récupérer ses factures. */}
        <Button variant="secondary" surface="card" size="sm" icon={<Icon name="external-link" size="1rem" />} disabled={!hasSubscription} loading={portalBusy} onClick={onPortal} className="flex-none">
          {a.billingCta}
        </Button>
      </Card>

      {/* Artboard C4 : carte formule 20 / 24, nom et solde en `heading` **800** (Julien, 11/09/2026 — Onest 800 est chargé par la marque). */}
      <Card variant="feature" gap={3} className="px-space-5 py-space-5 shadow-none">
        <div className="flex items-start justify-between gap-space-4">
          <div className="flex flex-col gap-space-1">
            <span className="eyebrow">{a.yourPlan}</span>
            <span className="font-display text-heading font-extrabold">{plan.name}</span>
            <span className="text-body font-medium text-text-secondary">
              {isFree ? a.activationPlan : ending && periodEnd ? a.endsOn(formatDateLongue(periodEnd)) : a.monthlyPlan}
            </span>
          </div>
          <div className="flex flex-col items-end gap-space-1">
            <span className="font-display text-heading font-extrabold">
              {credits ? credits.remaining : '—'}
              {showBar ? <span className="font-body text-body font-regular text-text-muted"> / {total}</span> : null}
            </span>
            <span className="caption">{showBar ? a.creditsThisMonth : a.creditsLeft}</span>
          </div>
        </div>
        {showBar ? <Progress value={credits?.remaining ?? 0} max={total} label={a.creditsThisMonth} className="bg-card" /> : null}
        <span className="text-body font-medium text-text-secondary">
          {isFree
            ? a.offeredFree
            : ending && periodEnd
              ? a.endsOnBody(formatDateLongue(periodEnd))
              : credits?.periodEnd
                ? a.resetOnPaid(formatDateLongue(credits.periodEnd))
                : null}
        </span>
        {/* « Se désabonner » ici, sous la ligne de recharge — pas dans la grille ni dans la carte facturation (Julien, 13/09/2026). */}
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

      {/* Plus de titre « Changer de formule » (Julien, 08/09/2026) : la grille des offres suit directement la carte formule. */}
      <div className="grid grid-cols-1 gap-space-5 md:grid-cols-2">
        {/* Artboard C4 (11/09/2026) : filet 1,5 px (hairline en px, comme le DS), la recommandée en `--primary` + `shadow-md` ; padding 24 gardé (l'artboard dit 22). */}
        {plans.map(p => {
          const current = p.id === plan.id;
          /* 🔒 LA RÈGLE DU PRIX : pas encore abonné → le catalogue (offre de lancement s'il reste des places, sinon prix
             plein) ; DÉJÀ abonné → `subscriptions.amount_cents`, et rien d'autre. Le catalogue peut changer (places
             écoulées, tarif revu) sans que son abonnement bouge : afficher 19 € à qui paie 12 € serait l'inverse de la
             promesse « ce prix reste le tien tant que tu es abonné ». */
          const subscribed = hasSubscription && subscription.plan === p.id;
          const price = priceToShow(catalog, p.id, subscription);
          /* La mention d'offre de lancement se décide sur `amount < prix plein` — jamais sur une égalité avec le tarif de
             lancement, qui casserait s'il changeait. Abonné : « ce prix reste le tien » seul ; prospect : les places restantes. */
          const founder = !subscribed && p.id === 'createur' ? catalog?.founder ?? null : null;
          const keepsLaunchPrice = subscribed && isLaunchPrice(price, catalog, p.id);
          return (
            <Card key={p.id} gap={3} className={cn('border-[1.5px] px-space-5 py-space-5', p.recommended ? 'border-primary shadow-md' : 'shadow-none')}>
              <div className="flex flex-col gap-space-1">
                <div className="flex items-center justify-between gap-space-3">
                  <span className="font-display text-heading-sm">{p.name}</span>
                  {p.recommended ? <Badge tone="coral" pad="dense" className="chip">{a.recommended}</Badge> : null}
                </div>
                <span className="caption">
                  <strong className="font-display text-subheading font-extrabold text-foreground">{price === null ? a.priceUnknown : formatEuros(price)}</strong> {a.perMonth}
                </span>
                {/* Offre de lancement : tant qu'il reste des places ; à 0, tout disparaît et le prix plein s'affiche seul. */}
                {founder ? (
                  <span className="flex flex-col gap-space-1">
                    <span className="text-body-sm font-semibold text-primary">{a.founderSlots(founder.slotsRemaining)}</span>
                    <span className="text-caption text-text-muted">{a.founderKeep}</span>
                  </span>
                ) : keepsLaunchPrice ? (
                  <span className="flex flex-col gap-space-1">
                    <span className="text-body-sm font-semibold text-primary">{a.launchPriceKept}</span>
                    <span className="text-caption text-text-muted">{a.founderKeep}</span>
                  </span>
                ) : null}
              </div>
              <ul className="flex flex-1 flex-col gap-space-2 text-body-sm text-text-secondary">
                {planFeatures(p, { creditsPerMonth: allocationFor(catalog, p.id), signupCredits: signupCreditsFor(catalog, p.id) }).map(fe => (
                  <li key={fe} className="flex items-start gap-space-2">
                    <Icon name="check" size="1rem" strokeWidth={3} className="mt-[0.125rem] flex-none text-pill-success-fg" />
                    <span>{fe}</span>
                  </li>
                ))}
              </ul>
              {current ? (
                <Button variant="secondary" surface="card" size="sm" fullWidth disabled>{a.currentPlan}</Button>
              ) : p.id === 'free' ? null : p.available ? (
                <Button variant={p.recommended ? 'primary' : 'secondary'} surface="card" size="sm" fullWidth onClick={() => onChoose(p.id as PaidPlanId)}>{a.choose}</Button>
              ) : (
                <Button variant="secondary" surface="card" size="sm" fullWidth disabled>{a.soon}</Button>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

/**
 * C4 câblée : `user_credits`, `subscriptions`, catalogue, portail, checkout embarqué, résiliation
 * et réactivation. Au retour de Stripe (`?checkout=`), l'écran d'activation remplace l'onglet.
 */
export function AbonnementTab(): JSX.Element {
  const credits = useCredits();
  const subscription = useSubscription();
  const catalog = usePlanCatalog();
  const portal = usePortalSession();
  const cancel = useCancelSubscription();
  const resume = useResumeSubscription();
  const activation = useCheckoutActivation();
  const [error, setError] = useState<string | null>(null);
  const [checkoutPlan, setCheckoutPlan] = useState<PaidPlanId | null>(null);
  const [cancelOpen, setCancelOpen] = useState(false);

  if (activation.state !== 'idle') {
    return <CheckoutActivationCard state={activation.state} onContinue={activation.clear} className="max-w-wide" />;
  }
  if (credits.isPending || subscription.isPending || catalog.isPending) return <TabSkeleton lines={5} />;
  if (credits.isError || subscription.isError) return <TabError message={fr.parametres.abonnement.loadError} onRetry={() => { credits.refetch(); subscription.refetch(); catalog.refetch(); }} />;
  const c = credits.data;
  return (
    <>
      <AbonnementView
        credits={c ? { remaining: c.creditsRemaining, total: c.creditsTotal, periodEnd: c.periodEnd } : null}
        plan={planFor(subscription.data?.plan)}
        subscription={subscription.data ?? null}
        /* Un catalogue en erreur ne bloque pas l'onglet : les prix s'affichent en « — € ». */
        catalog={catalog.data}
        onPortal={() => { setError(null); portal.mutate(undefined, { onError: e => setError(getErrorMessage(e)) }); }}
        portalBusy={portal.isPending}
        onChoose={plan => { setError(null); setCheckoutPlan(plan); }}
        onCancel={() => { setError(null); setCancelOpen(true); }}
        onResume={() => { setError(null); resume.mutate(undefined, { onError: e => setError(getErrorMessage(e)) }); }}
        resumeBusy={resume.isPending}
        error={error}
      />
      <CheckoutModal open={checkoutPlan !== null} plan={checkoutPlan ?? 'createur'} onClose={() => setCheckoutPlan(null)} />
      <CancelSubscriptionModal
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        periodEnd={subscription.data?.currentPeriodEnd ?? null}
        onConfirm={async () => { await cancel.mutateAsync(); }}
      />
    </>
  );
}
