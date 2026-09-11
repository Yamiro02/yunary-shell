import { useState, type JSX, type ReactNode } from 'react';
import { ChartLine, Gauge, Heart, Sprout, TrendingDown, WifiOff } from 'lucide-react';
import { Badge, Card, Icon, Pastille, Progress, cn, type BadgeProps } from '@yunary/ds';
import { AuditStateCard } from './AuditStateCard';
import { withGlyphSize } from '../lib/icon';
import { fr } from '../i18n/fr';
import { formatCompact, formatNombre } from '../lib/format';
import { AUDIT_MIN_SAMPLE, type AuditBioEtat, type AuditEtatEstime, type AuditEtatMesure, type ParsedAccountAudit } from './types';

export interface AuditBilanProps {
  audit: ParsedAccountAudit;
  /** Miroir de `AUDIT_MIN_SAMPLE` de l'Edge. */
  minSample?: number;
  /**
   * Appoint rendu sous la jauge de la variante `non_evaluable` — une phrase qui n'a de sens que
   * dans le parcours de l'app hôte (l'onboarding du Hub parle d'« étape suivante », l'onglet Audit
   * de Creator n'a pas d'étape suivante). `fr.audit.nonEvaluable.profilReady` reste disponible.
   */
  nonEvaluableNote?: ReactNode;
}

/**
 * Le bilan d'audit — reconstruit (08/09/2026) depuis l'inventaire du maître `AuditBilan.dc.html`
 * et de l'artboard B4 du Hub : colonne au pas `space-5` ; synthèse (carte `feature`) ; profil
 * (carte : panneau bio 22,5 rem + constats) ; chiffres clés (tuiles sur un panneau à filets) ;
 * verdicts par axe (grille 3 + 2) ; prose (carte `feature`) ; ce qui marche / à améliorer (deux
 * cartes). Variante `non_evaluable` (artboard « données insuffisantes ») et erreur (bannière).
 * Petits libellés = palier `eyebrow` du DS en gras et muted (pas la classe `.eyebrow`, qui est le
 * surtitre au dégradé). Titres display jamais sous 18 px : les titres de badge restent en DM Sans.
 *
 * API : `audit` (une ligne parsée par `parseAccountAudit`) et `minSample` (miroir de l'Edge).
 * Le composant ne connaît ni la page, ni l'étape, ni le réseau : il rend ce que la ligne porte —
 * une métrique absente = une tuile absente, jamais un zéro. Utilisé par le Hub (onboarding 4/5)
 * et par Creator (Profil › Audit).
 */
export function AuditBilan({ audit, minSample = AUDIT_MIN_SAMPLE, nonEvaluableNote }: AuditBilanProps): JSX.Element {
  const a = fr.audit;
  /* Erreur : « c'est nous, pas toi » — la carte d'état héros de la v1, ton danger, glyphe wifi coupé. */
  if (audit.status === 'error') {
    return <AuditStateCard tone="danger" icon={<Icon glyph={WifiOff} size="1.625rem" />} title={a.error.title} description={a.error.body} />;
  }
  if (audit.status === 'non_evaluable') {
    return <NonEvaluable count={audit.stats.rythme?.publications ?? 0} min={minSample} note={nonEvaluableNote} />;
  }
  const { stats, verdicts, points, profil } = audit;
  return (
    <div className="flex flex-col gap-space-5">
      {audit.synthese ? (
        <FeatureCard title={a.synthese}>
          <p className="text-control leading-normal text-text-secondary">{audit.synthese}</p>
        </FeatureCard>
      ) : null}

      {profil ? <ProfilCard audit={audit} /> : null}

      <ChiffresCard stats={stats} />

      <VerdictsCard verdicts={verdicts} />

      {audit.prose ? (
        <FeatureCard title={a.prose}>
          {/* Pas de plafond : le texte prend toute la largeur de sa carte, règle générale des cartes (Julien, 12/09/2026). */}
          <div className="flex flex-col gap-space-4">
            {audit.prose.split(/\n\s*\n/).map((p, i) => (
              <p key={i} className="text-control leading-normal text-text-secondary">{p}</p>
            ))}
          </div>
        </FeatureCard>
      ) : null}

      {points.a_marche.length || points.a_ameliorer.length ? (
        <div className="grid grid-cols-1 items-start gap-space-5 lg:grid-cols-2">
          {points.a_marche.length ? (
            <Card size="lg" className="flex flex-col gap-space-5">
              <Badge tone="success" icon={<Icon name="circle-check" size={POINTS_BADGE_ICON} strokeWidth={2.5} />} className="self-start">
                <span className="text-control font-bold">{a.points.marche}</span>
              </Badge>
              <PointList items={points.a_marche} icon={<Icon name="check" strokeWidth={3} size="0.9375rem" className="mt-[0.1875rem] flex-none text-pill-success-fg" />} />
            </Card>
          ) : null}
          {points.a_ameliorer.length ? (
            <Card size="lg" className="flex flex-col gap-space-5">
              <Badge tone="warning" icon={<Icon name="trending-up" size={POINTS_BADGE_ICON} strokeWidth={2.5} />} className="self-start">
                <span className="text-control font-bold">{a.points.ameliorer}</span>
              </Badge>
              <PointList items={points.a_ameliorer} icon={<Icon name="arrow-right" strokeWidth={2.5} size="0.9375rem" className="mt-[0.1875rem] flex-none text-pill-warning-fg" />} />
            </Card>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

/* ───────────────────────── blocs ───────────────────────── */

function FeatureCard({ title, children }: { title: string; children: ReactNode }): JSX.Element {
  return (
    <Card variant="feature" size="lg" className="flex flex-col gap-space-2">
      <span className="font-display text-heading-sm font-bold text-foreground">{title}</span>
      {children}
    </Card>
  );
}

/* En-tête de section du bilan : pastille outlined au glyphe de 18 px (maître AuditBilan, `<svg 18>` — les
   tuiles de chiffres, elles, sont dessinées à 15 et gardent leur `size="0.9375rem"`). */
function TitledCard({ icon, title, suffix, children }: { icon: ReactNode; title: string; suffix?: string; children: ReactNode }): JSX.Element {
  return (
    <Card size="lg" className="flex flex-col gap-space-5">
      <div className="flex items-center gap-space-3">
        <Pastille size="carte" tone="brand" outlined>{withGlyphSize(icon)}</Pastille>
        <span className="font-display text-heading-sm font-bold text-foreground">{title}</span>
        {suffix ? <span className="font-display text-heading-sm font-bold text-foreground">{suffix}</span> : null}
      </div>
      {children}
    </Card>
  );
}

function PointList({ items, icon }: { items: { nom: string; explication: string }[]; icon: ReactNode }): JSX.Element {
  return (
    <ul className="flex flex-col gap-space-4">
      {items.map(p => (
        <li key={p.nom} className="flex gap-space-3">
          {icon}
          <span className="text-control leading-normal text-text-secondary">
            <strong className="font-bold text-foreground">{p.nom.replace(/\.?$/, '.')}</strong> {p.explication}
          </span>
        </li>
      ))}
    </ul>
  );
}

const BIO_TONE: Record<AuditBioEtat, BadgeProps['tone']> = { solide: 'success', a_travailler: 'warning' };

function ProfilCard({ audit }: { audit: ParsedAccountAudit }): JSX.Element {
  const a = fr.audit;
  const p = audit.profil!;
  const meta = audit.stats.profil_meta;
  const publications = audit.stats.rythme?.publications;
  const metaLine = [
    publications !== undefined ? `${formatNombre(publications)} publications` : null,
    meta?.followers !== undefined ? `${formatCompact(meta.followers)} abonnés` : null,
    meta?.following !== undefined ? `${formatNombre(meta.following)} suivi(e)s` : null,
  ].filter(Boolean).join(' · ');
  const initials = audit.handle.replace(/[^a-z0-9]/gi, '').slice(0, 2).toUpperCase() || '?';
  return (
    <Card size="lg" className="flex flex-col gap-space-5">
      {/* Tous les titres de section à la même taille, `heading-sm` (maître du 11/09/2026 — « Ton profil » compris). */}
      <span className="font-display text-heading-sm font-bold text-foreground">{a.profil.title}</span>
      <div className="grid grid-cols-1 items-start gap-space-6 lg:grid-cols-[22.5rem_1fr]">
        <div className="flex flex-col gap-space-3 rounded-lg border border-border bg-background p-space-5">
          {/* Libellé à 10 px sur le maître : palier `eyebrow` (12 px) du DS, le plus proche. */}
          <span className="inline-flex items-center gap-space-2 text-eyebrow font-bold uppercase text-text-muted"><Icon name="eye" size="0.75rem" strokeWidth={2.5} />{a.profil.bioTitle}</span>
          <div className="flex items-center gap-space-4">
            <ProfilAvatar src={meta?.avatar_url} initials={initials} />
            <div className="flex min-w-0 flex-col gap-space-1">
              <span className="truncate text-control font-bold text-foreground">{audit.handle}</span>
              {metaLine ? <span className="text-caption text-text-muted">{metaLine}</span> : null}
            </div>
          </div>
          {p.bio_texte ? (
            <div className="flex flex-col gap-space-1 text-body-sm leading-normal text-foreground">
              {p.bio_texte.split('\n').map((line, i) => <span key={i} className={i === 0 ? 'font-bold' : undefined}>{line}</span>)}
            </div>
          ) : null}
        </div>
        <div className="flex flex-col gap-space-6 pt-space-1">
          {p.bio_constats.map(c => (
            <Constat key={c.dimension} label={a.dimensions[c.dimension]} etat={c.etat} text={c.constat} />
          ))}
          {p.photo_constat ? <Constat label={a.profil.photo} etat={p.photo_etat} text={p.photo_constat} /> : null}
        </div>
      </div>
    </Card>
  );
}

/**
 * La photo du profil, ou l'initiale du handle. Les avatars TikTok (`p16-*.tiktokcdn-us.com`)
 * répondent avec `Cross-Origin-Resource-Policy` : le navigateur bloque l'image et l'`<img>`
 * échouait en silence, laissant la carte sans photo. `onError` bascule sur la même recette de
 * secours que `UserAvatar` — on ne compte jamais sur le CDN.
 */
function ProfilAvatar({ src, initials }: { src?: string | null; initials: string }): JSX.Element {
  const [failed, setFailed] = useState(false);
  if (src && !failed) {
    return <img src={src} alt="" onError={() => setFailed(true)} className="h-[3.25rem] w-[3.25rem] flex-none rounded-pill border border-border object-cover" />;
  }
  return <span className="inline-flex h-[3.25rem] w-[3.25rem] flex-none items-center justify-center rounded-pill border border-border bg-grad-soft font-display text-body-lg font-(--heading-weight) text-primary">{initials}</span>;
}

function Constat({ label, etat, text }: { label: string; etat?: AuditBioEtat; text: string }): JSX.Element {
  return (
    <div className="flex flex-col gap-space-2">
      <div className="flex items-center gap-space-3">
        <span className="text-body font-bold text-foreground">{label}</span>
        {etat ? <Badge tone={BIO_TONE[etat]} pad="dense" className="flex-none">{fr.audit.bioEtat[etat]}</Badge> : null}
      </div>
      <span className="text-control leading-normal text-text-secondary">{text}</span>
    </div>
  );
}

function ChiffresCard({ stats }: { stats: ParsedAccountAudit['stats'] }): JSX.Element | null {
  const a = fr.audit;
  const tiles: JSX.Element[] = [];
  if (stats.portee?.vues_moyennes !== undefined) {
    const t = stats.portee.tendance;
    tiles.push(
      <Tile key="vues" icon={<Icon name="eye" size="0.9375rem" />} label={a.tiles.vuesMoyennes} value={formatNombre(stats.portee.vues_moyennes)}>
        {t ? (
          <Badge tone={t === 'hausse' ? 'success' : t === 'baisse' ? 'warning' : 'amber'} icon={t === 'hausse' ? <Icon name="trending-up" size={TILE_BADGE_ICON} strokeWidth={2.5} /> : t === 'baisse' ? <Icon glyph={TrendingDown} size={TILE_BADGE_ICON} strokeWidth={2.5} /> : <Icon name="minus" size={TILE_BADGE_ICON} strokeWidth={2.5} />} className="self-start">
            {a.tiles.tendance[t]}
          </Badge>
        ) : null}
      </Tile>,
    );
  }
  if (stats.rythme?.frequence_hebdo !== undefined) {
    tiles.push(
      <Tile key="rythme" icon={<Icon name="calendar" size="0.9375rem" />} label={a.tiles.rythme} value={<>{formatNombre(Math.round(stats.rythme.frequence_hebdo * 10) / 10)}<span className="text-control font-bold text-text-muted"> {a.tiles.parSemaine}</span></>}>
        {stats.rythme.plus_long_trou_jours !== undefined ? (
          <Badge tone="amber" icon={<Icon name="clock" size={TILE_BADGE_ICON} strokeWidth={2.5} />} className="self-start">{a.tiles.creux(stats.rythme.plus_long_trou_jours)}</Badge>
        ) : null}
      </Tile>,
    );
  }
  if (stats.retention?.watch_time_moyen_sec !== undefined) {
    tiles.push(
      <Tile key="watch" icon={<Icon name="play" size="0.9375rem" />} label={a.tiles.watchTime} value={`${formatNombre(Math.round(stats.retention.watch_time_moyen_sec * 10) / 10)} s`} />,
    );
  }
  const e = stats.engagement;
  const engagement = e
    ? ([
        e.likes_moyens !== undefined ? [e.likes_moyens, a.engagement.likes] : null,
        e.commentaires_moyens !== undefined ? [e.commentaires_moyens, a.engagement.commentaires] : null,
        e.partages_moyens !== undefined ? [e.partages_moyens, a.engagement.partages] : null,
        e.saves_moyens !== undefined ? [e.saves_moyens, a.engagement.enregistrements] : null,
      ].filter(Boolean) as [number, string][])
    : [];
  if (!tiles.length && !engagement.length) return null;
  const cols = tiles.length === 1 ? 'md:grid-cols-1' : tiles.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3';
  return (
    <TitledCard icon={<Icon glyph={ChartLine} />} title={a.chiffres.title} suffix={a.chiffres.suffix}>
      <div className={cn('grid grid-cols-1 overflow-hidden rounded-lg border border-border bg-background', cols)}>
        {tiles.map((tile, i) => (
          <div key={tile.key} className={cn('flex flex-col gap-space-3 p-space-5', i > 0 && 'border-t border-border md:border-l md:border-t-0')}>{tile}</div>
        ))}
        {engagement.length ? (
          <div className={cn('flex flex-col gap-space-3 p-space-5', tiles.length > 0 && 'border-t border-border', 'md:col-span-full')}>
            <div className="flex items-center gap-space-2">
              <Pastille size="carte" tone="brand" outlined><Icon glyph={Heart} size="0.9375rem" /></Pastille>
              <span className="text-eyebrow font-bold uppercase text-text-muted">{a.engagement.title}</span>
            </div>
            <div className="grid grid-cols-2 gap-space-4 md:grid-cols-4">
              {engagement.map(([n, label]) => (
                <span key={label} className="flex items-baseline gap-space-2">
                  <span className="font-display text-subheading font-(--heading-weight) text-foreground">{formatNombre(n)}</span>
                  <span className="text-caption text-text-muted">{label}</span>
                </span>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </TitledCard>
  );
}

function Tile({ icon, label, value, children }: { icon: ReactNode; label: string; value: ReactNode; children?: ReactNode }): JSX.Element {
  return (
    <>
      <div className="flex items-center gap-space-2">
        <Pastille size="carte" tone="brand" outlined>{icon}</Pastille>
        <span className="text-eyebrow font-bold uppercase text-text-muted">{label}</span>
      </div>
      <span className="font-display text-heading font-(--heading-weight) text-foreground">{value}</span>
      {children}
    </>
  );
}

/* Icônes de badge à la taille du maître AuditBilan, posées par `size` au site d'appel (jamais une règle
   globale) : 12 px dans les tuiles de chiffres, 13 px dans les verdicts, 16 px sur « Ce qui marche » /
   « À améliorer ». */
const TILE_BADGE_ICON = '0.75rem';
const VERDICT_BADGE_ICON = '0.8125rem';
const POINTS_BADGE_ICON = '1rem';

const MESURE: Record<AuditEtatMesure, { tone: BadgeProps['tone']; icon: ReactNode }> = {
  surperforme: { tone: 'success', icon: <Icon name="trending-up" size={VERDICT_BADGE_ICON} strokeWidth={2.5} /> },
  dans_la_moyenne: { tone: 'amber', icon: <Icon name="minus" size={VERDICT_BADGE_ICON} strokeWidth={2.5} /> },
  sous_performe: { tone: 'warning', icon: <Icon glyph={TrendingDown} size={VERDICT_BADGE_ICON} strokeWidth={2.5} /> },
  non_evaluable: { tone: 'neutral', icon: null },
};
const ESTIME_DOTS: Record<AuditEtatEstime, number> = { fort: 3, correct: 2, faible: 1, non_evaluable: 0 };

function VerdictsCard({ verdicts }: { verdicts: ParsedAccountAudit['verdicts'] }): JSX.Element | null {
  const a = fr.audit;
  const axes: { key: keyof typeof verdicts; badge: ReactNode; ecart?: string }[] = [];
  const mesure = (key: 'portee' | 'engagement' | 'regularite') => {
    const v = verdicts[key];
    if (!v) return;
    const m = MESURE[v.etat];
    axes.push({ key, ecart: v.ecart, badge: <Badge tone={m.tone} icon={m.icon} className="self-start">{a.verdicts[v.etat]}</Badge> });
  };
  const estime = (key: 'education' | 'profil') => {
    const v = verdicts[key];
    if (!v) return;
    const filled = ESTIME_DOTS[v.etat];
    axes.push({
      key, ecart: v.ecart,
      badge: (
        <Badge tone="neutral" className="self-start">
          {a.verdicts[v.etat]}
          {filled ? (
            <span className="inline-flex items-center gap-[0.1875rem]" aria-hidden="true">
              {[1, 2, 3].map(i => <span key={i} className={cn('h-[0.3125rem] w-[0.3125rem] rounded-pill bg-current', i > filled && 'opacity-30')} />)}
            </span>
          ) : null}
        </Badge>
      ),
    });
  };
  mesure('portee'); mesure('engagement'); estime('education'); mesure('regularite'); estime('profil');
  if (!axes.length) return null;
  /* Cinq axes : 3 puis 2, comme la maquette (grille de 6). Sinon, une grille régulière. */
  const five = axes.length === 5;
  return (
    <TitledCard icon={<Icon glyph={Gauge} />} title={a.verdicts.title}>
      <div className={cn('grid grid-cols-1 overflow-hidden rounded-lg border border-border bg-background', five ? 'md:grid-cols-6' : 'md:grid-cols-3')}>
        {axes.map((axe, i) => {
          const span = five ? (i < 3 ? 'md:col-span-2' : 'md:col-span-3') : '';
          const leftBorder = five ? i !== 0 && i !== 3 : i % 3 !== 0;
          const topBorder = five ? i >= 3 : i >= 3;
          return (
            <div key={axe.key} className={cn('flex flex-col gap-space-3 px-space-5 py-space-4', span, i > 0 && 'border-t border-border', 'md:border-t-0', leftBorder && 'md:border-l md:border-border', topBorder && 'md:border-t md:border-border')}>
              <span className="text-eyebrow font-bold uppercase text-text-muted">{a.axes[axe.key]}</span>
              {axe.badge}
              {axe.ecart ? <span className="text-caption leading-normal text-text-muted">{axe.ecart}</span> : null}
            </div>
          );
        })}
      </div>
    </TitledCard>
  );
}

/**
 * Pas assez de matière : un état NORMAL, rassurant — ton marque, pousse. Sous la carte d'état,
 * la **jauge** de l'artboard 09b de Creator (« 2 / 3 publications récentes · Plus qu'une ») : elle
 * dit ce qu'il reste à faire là où le badge ne faisait que répéter la description. Bloc à 20 rem
 * sur `--background`, compteur `mono` au palier `subheading`, `Progress` du DS. Les 18 px de côté
 * et le gap de 10 px de la maquette sont ramenés aux paliers du DS (`space-4`, `space-2`).
 * La pastille reste `Sprout` (choix du 08/09) là où la maquette dessine une horloge ; son glyphe est à
 * 24 px (1,5 rem), comme l'`Icon size="1.5rem"` de l'artboard 09b.
 */
function NonEvaluable({ count, min, note }: { count: number; min: number; note?: ReactNode }): JSX.Element {
  const a = fr.audit.nonEvaluable;
  const reste = Math.max(min - count, 0);
  return (
    <AuditStateCard tone="brand" icon={<Icon glyph={Sprout} size="1.5rem" />} title={a.title} description={a.body(count, min)}>
      <div className="flex w-[20rem] max-w-full flex-col gap-space-2 rounded-md bg-background p-space-4 text-left">
        <div className="flex items-baseline justify-between gap-space-3">
          <span className="inline-flex items-baseline gap-space-1">
            <span className="mono text-subheading font-semibold text-foreground">{formatNombre(count)}</span>
            <span className="text-caption text-text-muted">{a.compteur(min)}</span>
          </span>
          {reste ? <span className="flex-none text-caption font-semibold text-primary">{a.reste(reste)}</span> : null}
        </div>
        <Progress value={count} max={min} label={`${count} / ${min}`} />
      </div>
      {note}
    </AuditStateCard>
  );
}
