import type { JSX, ReactNode } from 'react';
import { Badge, Card, Progress } from '@yunary/ds';
import { formatDateCourte, formatEuros, fr, toolByIdIn, type CanUseResult, type EntitlementSummary, type ToolRule, type ToolRun } from '@yunary/shell';
import { CATALOG, RULES, RUNS, SUMMARIES_FREE, SUMMARIES_SUBSCRIBED, SUMMARIES_WITH_PACK } from '../fixtures';
import { Section } from '../ui';

/* Ce que `can_use` répond, tel quel (`{ allowed, reason, source, remaining, link }`) — les trois cas utiles. */
const CAN_USE: { label: string; result: CanUseResult }[] = [
  { label: 'Abonné, quota restant', result: { allowed: true, reason: 'ok', source: 'subscription', remaining: 38, link: null } },
  { label: 'Quota épuisé', result: { allowed: false, reason: 'quota_exhausted', source: null, remaining: 0, link: 'https://yunary.com/outils?ajouter=analyse' } },
  { label: 'Pas souscrit', result: { allowed: false, reason: 'not_subscribed', source: null, remaining: null, link: 'https://yunary.com/outils?ajouter=script' } },
];

/**
 * Les nouveaux hooks, rendus depuis des fixtures de la forme exacte qu'ils retournent : catalogue
 * (`useToolCatalog`), résumés de droits (`useEntitlements`), `can_use` (`useCanUse`), règles
 * (`useToolRules`), historique (`useToolRuns`). Aucune page ici : elles arrivent au lot 2 du hub, sur
 * maquettes. La vitrine ne prouve que les types et les libellés FR communs (`fr.tools`).
 */
export function OutilsPage(): JSX.Element {
  const t = fr.tools;
  return (
    <div className="flex flex-col gap-space-7">
      <Section title="useToolCatalog · le catalogue en base" note="`tools` + `tool_packs`, triés par position. Noms, descriptions, quotas et prix ne vivent QUE là (fixture = valeurs de la base au 23/09/2026 ; `analyse` publié à titre d'exemple).">
        <div className="grid grid-cols-1 gap-space-4 md:grid-cols-2">
          {CATALOG.tools.map(tool => (
            <Card key={tool.id} gap={3} className="shadow-none">
              <div className="flex items-center justify-between gap-space-3">
                <span className="font-display text-heading-sm">{tool.name}</span>
                <Badge tone={tool.status === 'mvp' ? 'coral' : 'neutral'} pad="dense" className="chip">{tool.status === 'mvp' ? 'MVP' : 'À venir'}</Badge>
              </div>
              <p className="text-body-sm text-text-secondary">{tool.description}</p>
              <span className="caption">
                {tool.monthlyQuota === null ? t.unlimited : `${tool.monthlyQuota} / mois`}
                {tool.priceCents !== null ? ` · ${formatEuros(tool.priceCents)}/mois` : ''}
                {tool.isPublished ? ' · publié' : ' · non publié'}
              </span>
            </Card>
          ))}
          {CATALOG.packs.map(pack => (
            <Card key={pack.id} gap={3} className="shadow-none">
              <div className="flex items-center justify-between gap-space-3">
                <span className="font-display text-heading-sm">{pack.name}</span>
                <Badge tone="neutral" pad="dense" className="chip">{t.source.pack}</Badge>
              </div>
              <span className="caption">{toolByIdIn(CATALOG, pack.toolId)?.name} · {pack.units} unités{pack.priceCents !== null ? ` · ${formatEuros(pack.priceCents)}` : ''}</span>
            </Card>
          ))}
        </div>
      </Section>

      <Section title="useEntitlements · un résumé par outil" note="Le droit que le serveur consommerait (`subscription` → `pack` → `free`, actif, en période, non épuisé), sinon le premier actif. Source, utilisé / total, échéance.">
        <div className="grid grid-cols-1 gap-space-4 xl:grid-cols-3">
          <Block label="Gratuit"><Summaries list={SUMMARIES_FREE} /></Block>
          <Block label="Abonné à Analyse"><Summaries list={SUMMARIES_SUBSCRIBED} /></Block>
          <Block label="Abonnement épuisé + pack"><Summaries list={SUMMARIES_WITH_PACK} /></Block>
        </div>
      </Section>

      <Section title="useCanUse · la vérité d'accès" note="`select can_use(tool)` avec le jeton de l'utilisateur, lecture seule. Le hub montre ; le serveur décide. Sur refus, `link` = la page d'ajout pré-remplie.">
        <div className="grid grid-cols-1 gap-space-4 xl:grid-cols-3">
          {CAN_USE.map(c => (
            <Block key={c.label} label={c.label}>
              <div className="flex flex-col gap-space-1 text-body-sm">
                <span><Badge tone={c.result.allowed ? 'success' : 'warning'} pad="dense" className="chip">{c.result.allowed ? 'allowed' : c.result.reason}</Badge></span>
                <span className="caption">{c.result.source ? t.source[c.result.source] : '—'} · {c.result.remaining === null ? t.unlimited : t.remaining(c.result.remaining)}</span>
                {c.result.link ? <a href={c.result.link} className="text-body-sm">{c.result.link}</a> : null}
                {!c.result.allowed ? <span className="text-body-sm text-text-secondary">{fr.errors.tools[c.result.reason === 'quota_exhausted' ? 'quotaExhausted' : 'notSubscribed']}</span> : null}
              </div>
            </Block>
          ))}
        </div>
      </Section>

      <Section title="useToolRules · les règles personnelles" note="`user_tool_rules`, owner : par outil, ou par étape d'un outil. Ajout, modification, suppression (`useAddToolRule`, `useUpdateToolRule`, `useDeleteToolRule`). Texte 1..500 caractères.">
        <div className="flex flex-col gap-space-3">
          {RULES.map(r => <RuleRow key={r.id} rule={r} />)}
        </div>
      </Section>

      <Section title="useToolRuns · l'historique" note="`tool_runs`, plus récent d'abord, filtrable par outil. Le hub l'affiche ; dans Claude, on le demande en langage naturel.">
        <div className="flex flex-col gap-space-3">
          {RUNS.map(r => <RunRow key={r.id} run={r} />)}
        </div>
      </Section>
    </div>
  );
}

function Summaries({ list }: { list: EntitlementSummary[] }): JSX.Element {
  const t = fr.tools;
  return (
    <div className="flex flex-col gap-space-3">
      {list.map(e => (
        <div key={`${e.toolId}-${e.source}`} className="flex flex-col gap-space-2 rounded-md border-[1.5px] border-input bg-background p-space-4">
          <div className="flex items-center justify-between gap-space-3">
            <div className="flex items-center gap-space-2">
              <span className="text-control font-bold">{toolByIdIn(CATALOG, e.toolId)?.name ?? e.toolId}</span>
              <Badge tone={e.source === 'free' ? 'neutral' : 'coral'} pad="dense" className="chip">{t.source[e.source]}</Badge>
            </div>
            <span className="caption">{e.total === null ? t.unlimited : t.usage(e.used, e.total)}</span>
          </div>
          {e.total ? <Progress value={Math.min(e.used, e.total)} max={e.total} label={t.usage(e.used, e.total)} className="bg-card" /> : null}
          <span className="caption">{e.usable ? 'utilisable' : 'épuisé'}{e.periodEnd ? ` · ${e.endsAtPeriodEnd ? t.endsOn(formatDateCourte(e.periodEnd)) : t.renewsOn(formatDateCourte(e.periodEnd))}` : ''}</span>
        </div>
      ))}
    </div>
  );
}

function RuleRow({ rule }: { rule: ToolRule }): JSX.Element {
  const t = fr.tools;
  return (
    <Card gap={3} className="shadow-none">
      <div className="flex flex-wrap items-center gap-space-2">
        <span className="text-control font-bold">{toolByIdIn(CATALOG, rule.toolId)?.name ?? rule.toolId}</span>
        <Badge tone="neutral" pad="dense" className="chip">{rule.stepKey ? t.ruleStep(rule.stepKey) : t.ruleWholeTool}</Badge>
      </div>
      <p className="text-body-sm text-text-secondary">{rule.text}</p>
    </Card>
  );
}

function RunRow({ run }: { run: ToolRun }): JSX.Element {
  const t = fr.tools;
  const tone = run.status === 'termine' ? 'success' : run.status === 'erreur' ? 'danger' : run.status === 'abandonne' ? 'neutral' : 'coral';
  return (
    <Card className="flex flex-wrap items-center justify-between gap-space-3 shadow-none">
      <div className="flex min-w-0 flex-col gap-space-1">
        <span className="text-control font-bold">{toolByIdIn(CATALOG, run.toolId)?.name ?? run.toolId}</span>
        <span className="caption">{formatDateCourte(run.startedAt)}{run.currentStepKey ? ` · ${t.ruleStep(run.currentStepKey)}` : ''}</span>
      </div>
      <Badge tone={tone} pad="dense" className="chip">{t.runStatus[run.status]}</Badge>
    </Card>
  );
}

function Block({ label, children }: { label: string; children: ReactNode }): JSX.Element {
  return (
    <div className="flex flex-col gap-space-2">
      <span className="chip text-text-muted">{label}</span>
      {children}
    </div>
  );
}
