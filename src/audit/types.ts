/**
 * Miroir front du contrat de l'audit de compte (`audit-account`), repris de la v1.
 * RÈGLE : un champ ABSENT n'est pas un zéro. La disponibilité des métriques varie par
 * plateforme (enregistrements et watch time sont Instagram seulement) : les parseurs
 * rendent `undefined`, jamais 0 — c'est au rendu de faire disparaître la carte.
 */
import type { Tables } from '../integrations/supabase/types';

export type AccountAuditRow = Tables<'account_audits'>;
export type AccountAuditStatus = 'ok' | 'non_evaluable' | 'error';
export type AuditEtatMesure = 'surperforme' | 'dans_la_moyenne' | 'sous_performe' | 'non_evaluable';
export type AuditEtatEstime = 'faible' | 'correct' | 'fort' | 'non_evaluable';

export interface AuditAxe<E> { etat: E; ecart?: string }

export interface AuditVerdicts {
  portee?: AuditAxe<AuditEtatMesure>;
  engagement?: AuditAxe<AuditEtatMesure>;
  regularite?: AuditAxe<AuditEtatMesure>;
  education?: AuditAxe<AuditEtatEstime>;
  profil?: AuditAxe<AuditEtatEstime>;
}

export interface AuditStats {
  portee?: {
    vues_moyennes?: number; vues_max?: number; ecart_max?: string; vues_min?: number; ecart_min?: string;
    tendance?: 'hausse' | 'stable' | 'baisse'; ecart_tendance?: string;
  };
  engagement?: {
    likes_moyens?: number; commentaires_moyens?: number; partages_moyens?: number; saves_moyens?: number;
    taux_global?: number; ratio_commentaires_vues?: number;
  };
  rythme?: {
    publications?: number; periode_jours?: number; frequence_hebdo?: number; intervalle_moyen_jours?: number;
    ecart_type_intervalles_jours?: number; plus_long_trou_jours?: number;
  };
  retention?: { watch_time_moyen_sec?: number; taux_completion?: number };
  profil_meta?: { followers?: number; following?: number; bio?: string; avatar_url?: string };
}

export interface AuditPoint { nom: string; explication: string }
export interface AuditPoints { a_marche: AuditPoint[]; a_ameliorer: AuditPoint[] }

export type AuditBioDimension = 'clarte' | 'structure' | 'coherence_contenu';
export type AuditBioEtat = 'solide' | 'a_travailler';
export interface AuditBioConstat { dimension: AuditBioDimension; constat: string; etat?: AuditBioEtat }
export interface AuditProfil { bio_texte: string; bio_constats: AuditBioConstat[]; photo_constat: string | null; photo_etat?: AuditBioEtat }

/** Vue prête à rendre, dérivée d'une ligne. */
export interface ParsedAccountAudit {
  id: string;
  status: AccountAuditStatus;
  platform: string;
  handle: string;
  synthese: string | null;
  prose: string | null;
  stats: AuditStats;
  verdicts: AuditVerdicts;
  points: AuditPoints;
  profil: AuditProfil | null;
  createdAt: string;
}

const rec = (v: unknown): Record<string, unknown> => (typeof v === 'object' && v !== null ? (v as Record<string, unknown>) : {});
const num = (v: unknown): number | undefined => (typeof v === 'number' && Number.isFinite(v) ? v : undefined);
const str = (v: unknown): string | undefined => {
  if (typeof v !== 'string') return undefined;
  const t = v.trim();
  return t.length ? t : undefined;
};
/* Une famille de stats est ABSENTE si aucun champ n'a de valeur : jamais d'objet vide qui ferait afficher une carte sans contenu. */
function family<T extends object>(obj: T): T | undefined {
  return Object.values(obj).some(v => v !== undefined) ? obj : undefined;
}

export function parseAuditStats(raw: unknown): AuditStats {
  const s = rec(raw);
  const portee = rec(s.portee), engagement = rec(s.engagement), rythme = rec(s.rythme), retention = rec(s.retention), meta = rec(s.profil_meta);
  const tendance = str(portee.tendance);
  return {
    portee: family({
      vues_moyennes: num(portee.vues_moyennes), vues_max: num(portee.vues_max), ecart_max: str(portee.ecart_max),
      vues_min: num(portee.vues_min), ecart_min: str(portee.ecart_min),
      tendance: tendance === 'hausse' || tendance === 'stable' || tendance === 'baisse' ? tendance : undefined,
      ecart_tendance: str(portee.ecart_tendance),
    }),
    engagement: family({
      likes_moyens: num(engagement.likes_moyens), commentaires_moyens: num(engagement.commentaires_moyens),
      partages_moyens: num(engagement.partages_moyens), saves_moyens: num(engagement.saves_moyens),
      taux_global: num(engagement.taux_global), ratio_commentaires_vues: num(engagement.ratio_commentaires_vues),
    }),
    rythme: family({
      publications: num(rythme.publications), periode_jours: num(rythme.periode_jours), frequence_hebdo: num(rythme.frequence_hebdo),
      intervalle_moyen_jours: num(rythme.intervalle_moyen_jours), ecart_type_intervalles_jours: num(rythme.ecart_type_intervalles_jours),
      plus_long_trou_jours: num(rythme.plus_long_trou_jours),
    }),
    retention: family({ watch_time_moyen_sec: num(retention.watch_time_moyen_sec), taux_completion: num(retention.taux_completion) }),
    profil_meta: family({ followers: num(meta.followers), following: num(meta.following), bio: str(meta.bio), avatar_url: str(meta.avatar_url) }),
  };
}

const ETATS_MESURE = ['surperforme', 'dans_la_moyenne', 'sous_performe', 'non_evaluable'];
const ETATS_ESTIME = ['faible', 'correct', 'fort', 'non_evaluable'];

function parseAxe<E extends string>(raw: unknown, vocab: string[]): AuditAxe<E> | undefined {
  const a = rec(raw);
  const etat = str(a.etat);
  /* Hors vocabulaire : l'axe est absent, jamais rapproché du plus proche. */
  if (!etat || !vocab.includes(etat)) return undefined;
  return { etat: etat as E, ecart: str(a.ecart) };
}

export function parseAuditVerdicts(raw: unknown): AuditVerdicts {
  const v = rec(raw);
  return {
    portee: parseAxe<AuditEtatMesure>(v.portee, ETATS_MESURE),
    engagement: parseAxe<AuditEtatMesure>(v.engagement, ETATS_MESURE),
    regularite: parseAxe<AuditEtatMesure>(v.regularite, ETATS_MESURE),
    education: parseAxe<AuditEtatEstime>(v.education, ETATS_ESTIME),
    profil: parseAxe<AuditEtatEstime>(v.profil, ETATS_ESTIME),
  };
}

function parsePointList(raw: unknown): AuditPoint[] {
  if (!Array.isArray(raw)) return [];
  const out: AuditPoint[] = [];
  for (const item of raw) {
    const p = rec(item);
    const nom = str(p.nom), explication = str(p.explication);
    if (nom && explication) out.push({ nom, explication });
  }
  return out;
}

export function parseAuditPoints(raw: unknown): AuditPoints {
  const p = rec(raw);
  return { a_marche: parsePointList(p.a_marche), a_ameliorer: parsePointList(p.a_ameliorer) };
}

const DIMENSIONS: AuditBioDimension[] = ['clarte', 'structure', 'coherence_contenu'];

export function parseAuditProfil(raw: unknown): AuditProfil | null {
  const p = rec(raw);
  const bioTexte = typeof p.bio_texte === 'string' ? p.bio_texte : null;
  const constats: AuditBioConstat[] = [];
  if (Array.isArray(p.bio_constats)) {
    for (const item of p.bio_constats) {
      const c = rec(item);
      const dimension = str(c.dimension), constat = str(c.constat);
      if (!dimension || !constat || !DIMENSIONS.includes(dimension as AuditBioDimension)) continue;
      const etat = str(c.etat);
      constats.push({ dimension: dimension as AuditBioDimension, constat, etat: etat === 'solide' || etat === 'a_travailler' ? etat : undefined });
    }
  }
  const photoConstat = str(p.photo_constat) ?? null;
  const photoEtatRaw = str(p.photo_etat);
  if (bioTexte === null && !constats.length && !photoConstat) return null;
  return {
    bio_texte: bioTexte ?? '',
    bio_constats: constats,
    photo_constat: photoConstat,
    photo_etat: photoEtatRaw === 'solide' || photoEtatRaw === 'a_travailler' ? photoEtatRaw : undefined,
  };
}

export function parseAccountAudit(row: AccountAuditRow): ParsedAccountAudit {
  const status = row.status as AccountAuditStatus;
  return {
    id: row.id,
    status: status === 'ok' || status === 'non_evaluable' ? status : 'error',
    platform: row.platform,
    handle: row.handle,
    synthese: str(row.synthese) ?? null,
    prose: str(row.prose) ?? null,
    stats: parseAuditStats(row.stats),
    verdicts: parseAuditVerdicts(row.verdicts),
    points: parseAuditPoints(row.points),
    profil: parseAuditProfil(row.profil),
    createdAt: row.created_at,
  };
}

/** Miroir front de `AUDIT_MIN_SAMPLE` de l'Edge (3) — à garder aligné. */
export const AUDIT_MIN_SAMPLE = 3;
