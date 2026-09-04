import type { HUMOURS, NIVEAUX_LANGUE, VULGARITES } from './constants';

export type NiveauLangue = (typeof NIVEAUX_LANGUE)[number];
export type Vulgarite = (typeof VULGARITES)[number];
export type Humour = (typeof HUMOURS)[number];

/** `personas.voix` (jsonb). */
export interface Voix {
  niveau_langue: NiveauLangue | null;
  vulgarite: Vulgarite | null;
  humour: Humour[];
  tics: string[];
}

export const EMPTY_VOIX: Voix = { niveau_langue: null, vulgarite: null, humour: [], tics: [] };

/** Lecture tolérante d'une valeur jsonb `voix` (null ou mal formée). */
export function parseVoix(raw: unknown): Voix {
  if (!raw || typeof raw !== 'object') return { ...EMPTY_VOIX };
  const v = raw as Partial<Voix>;
  return {
    niveau_langue: v.niveau_langue ?? null,
    vulgarite: v.vulgarite ?? null,
    humour: Array.isArray(v.humour) ? v.humour : [],
    tics: Array.isArray(v.tics) ? v.tics : [],
  };
}

/** Les trois champs de l'avatar cible — colonnes `avatar_qui`, `transformation_b`, `avatar_galere`. */
export interface AvatarCible {
  qui: string;
  quoi: string;
  probleme: string;
}

/** Les prises de position 01-03 — colonnes `conviction_defend`, `conviction_faux`, `conviction_refus`. */
export type PrisesDePosition = [string, string, string];
