import type { ElementType, JSX, ReactNode } from 'react';
import { Badge, Button, Card, Halo, Icon, Logo, cn } from '@yunary/ds';
import { fr } from '../i18n/fr';
import { formatDateNumerique, formatEuros, formatJourMois } from '../lib/format';
import { DS_MOBILE_QUERY, useMediaQuery } from '../lib/useMediaQuery';
import { ToolLabel } from '../layout/ToolLabel';
import { AnimatedCheck, Reveal } from './motion';

/** Une ligne de la liste des outils : nom, légende (composée par le conteneur), état. */
export interface ResultToolView {
  name: string;
  /** « 2 audits par mois · renouvelé le 23/10/2026 », « Encore 9 analyses jusque-là », « Pas encore ajouté »… */
  meta?: string | null;
  /** `active` : badge Actif · `ending` : « Se termine le … » (ambre) · `failed` : « Non ajouté ». */
  status: 'active' | 'ending' | 'failed';
  endsOn?: string | null;
}

export interface SubscriptionResultViewProps {
  /** `added` (ajout, ou ajout + retrait : l'outil retiré en badge ambre) · `removed` · `failed`. */
  variant: 'added' | 'removed' | 'failed';
  /** Les outils dont parle le titre : ajoutés (added), retiré (removed). Un seul = son lockup, plusieurs = « Tes N outils sont actifs ». */
  subjects: string[];
  tools: ResultToolView[];
  /** Payé (added) ou refusé (failed), en centimes. */
  todayCents?: number | null;
  next?: { cents: number; from: string } | null;
  /** removed : la fin d'accès de l'outil retiré. */
  periodEnd?: string | null;
  email?: string | null;
  /** « Facturation » dans la note de bas de page (added). */
  invoicesHref?: string;
  /** Le lien du routeur (`Link`) — `href` lui arrive en `to`. */
  linkAs?: ElementType;
  onBack: () => void;
  /** Le libellé du bouton de retour. Défaut « Retour à mes outils » ; l'onboarding passe « Continuer ». */
  backLabel?: string;
  /** failed : « Réessayer avec une autre carte ». */
  onRetry?: () => void;
  /** Démo : force la disposition ; sinon, mobile sous 64 rem. */
  layout?: 'desktop' | 'mobile';
  /** Démo : la page remplit son cadre au lieu de la fenêtre. */
  inline?: boolean;
}

function StatusBadge({ tool }: { tool: ResultToolView }): JSX.Element {
  const r = fr.paiement.result;
  if (tool.status === 'failed') return <Badge tone="danger" pad="dense">{r.badgeFailed}</Badge>;
  if (tool.status === 'ending' && tool.endsOn) return <Badge tone="amber" pad="dense">{r.badgeEnds(formatDateNumerique(tool.endsOn))}</Badge>;
  return <Badge tone="success" pad="dense" icon={<Icon name="check" strokeWidth={3} />}>{r.badgeActive}</Badge>;
}

/**
 * L'écran de retour pleine page, en trois variantes (artboards Hub-03b-Retour-Ajout, -Retrait,
 * -Echec, -Ajout-Mobile) — la VUE. Halo central, mot-marque en haut à gauche, colonne centrée : la
 * coche (ou la croix) se dessine, puis le titre, puis les outils un par un, puis les totaux et les
 * actions (`Reveal`, `prefers-reduced-motion` respecté). Pour rejouer, l'appelant change la `key`.
 * Colonne à `max-w-[35rem]` : les 560 px de la maquette, provisoire faute de rôle `--container-form`
 * au DS (écart validé par Julien le 25/09/2026, consigné au BACKLOG du DS).
 */
export function SubscriptionResultView({
  variant, subjects, tools, todayCents = null, next = null, periodEnd = null, email = null, invoicesHref, linkAs, onBack, backLabel, onRetry, layout, inline,
}: SubscriptionResultViewProps): JSX.Element {
  const r = fr.paiement.result;
  const back = backLabel ?? r.back;
  const isMobile = useMediaQuery(DS_MOBILE_QUERY);
  const mobile = layout ? layout === 'mobile' : isMobile;
  const failed = variant === 'failed';
  /* La cascade de la maquette : titre à 820 ms (900 pour l'échec), outils +120 chacun, puis totaux et actions. */
  const t0 = failed ? 900 : 820;
  const toolAt = (i: number) => t0 + 260 + i * 120;
  const afterTools = toolAt(tools.length);
  const actionsAt = afterTools + (failed ? 60 : 160);

  const title: ReactNode = variant === 'added'
    ? subjects.length > 1 ? r.addedMany(subjects.length) : <><ToolLabel name={subjects[0] ?? ''} /> {r.addedOne}</>
    : variant === 'removed' ? r.removedTitle : r.failedTitle;
  const lead = variant === 'added'
    ? subjects.length > 1 ? r.addedLeadMany : r.addedLeadOne
    : variant === 'removed' ? r.removedLead(subjects[0] ?? '', periodEnd ? formatDateNumerique(periodEnd) : '')
      : r.failedLead(formatEuros(todayCents ?? 0));

  const Link = (linkAs ?? 'a') as ElementType;
  const footnote: ReactNode = variant === 'added' ? (
    <>
      {r.invoicesBefore}
      {invoicesHref ? <Link {...(linkAs ? { to: invoicesHref } : { href: invoicesHref })} className="font-semibold text-primary">{r.invoicesLink}</Link> : r.invoicesLink}
      {email ? r.invoicesAfter(email) : r.invoicesNoEmail}
    </>
  ) : variant === 'removed' && periodEnd ? r.changeMind(formatJourMois(periodEnd)) : null;

  return (
    <div className={cn('relative flex flex-col overflow-hidden bg-background', inline ? 'h-full min-h-full' : 'min-h-dvh')}>
      <Halo placement="center" />
      <div className={cn('relative z-10', mobile ? 'px-space-5 pt-space-5' : 'px-space-6 pt-space-6')}>
        <Logo variant="wordmark" height={mobile ? '1.25rem' : '1.5rem'} />
      </div>
      <main className={cn('relative z-10 mx-auto flex w-full max-w-[35rem] flex-1 flex-col items-center justify-center text-center', mobile ? 'gap-space-5 px-space-4 py-space-6' : 'gap-space-6 px-space-4 py-space-7')}>
        <AnimatedCheck tone={failed ? 'danger' : 'success'} size={mobile ? 'sm' : 'md'} />
        <Reveal delay={t0} className="flex w-full flex-col gap-space-3">
          <h1 className={cn('leading-heading text-foreground', mobile ? 'text-heading' : 'text-heading-xl')}>{title}</h1>
          <p className={cn('text-text-muted', mobile ? 'text-body' : 'text-body-lg')}>{lead}</p>
        </Reveal>
        <Card className="w-full gap-0 overflow-hidden p-0 text-left">
          {tools.map((tool, i) => (
            <Reveal key={`${tool.name}-${i}`} delay={toolAt(i)}>
              <div className={cn('flex items-center justify-between gap-space-4 px-space-5 py-space-4', i > 0 && 'border-t border-border')}>
                <span className="flex min-w-0 flex-col gap-space-1">
                  <span className="font-display text-body font-bold text-foreground">{tool.name}</span>
                  {tool.meta ? <span className="text-caption text-text-muted">{tool.meta}</span> : null}
                </span>
                <StatusBadge tool={tool} />
              </div>
            </Reveal>
          ))}
          {!failed && next ? (
            <Reveal delay={afterTools}>
              <div className={cn('flex gap-space-4 border-t border-border bg-background px-space-5 py-space-4 text-body-sm', mobile ? 'flex-col' : 'flex-wrap items-baseline justify-between')}>
                <span className="text-text-muted">
                  {variant === 'added' && todayCents ? <>{r.paidToday} <strong className="text-foreground">{formatEuros(todayCents)}</strong></> : fr.paiement.nothingToday}
                </span>
                <span className="text-text-muted">
                  {r.nextFrom(formatDateNumerique(next.from))} <strong className="text-foreground">{fr.paiement.perMonth(formatEuros(next.cents))}</strong>
                </span>
              </div>
            </Reveal>
          ) : null}
        </Card>
        <Reveal delay={actionsAt} className="flex w-full flex-col items-center gap-space-4">
          {failed ? (
            <div className={cn('flex gap-space-3', mobile ? 'w-full flex-col' : 'flex-wrap justify-center')}>
              {onRetry ? <Button variant="primary" size="lg" fullWidth={mobile} onClick={onRetry}>{r.retry}</Button> : null}
              <Button variant="secondary" size="lg" fullWidth={mobile} onClick={onBack}>{back}</Button>
            </div>
          ) : (
            <Button variant="primary" size="lg" fullWidth={mobile} onClick={onBack}>{back}</Button>
          )}
          {footnote ? <span className="text-caption text-text-muted">{footnote}</span> : null}
        </Reveal>
      </main>
    </div>
  );
}
