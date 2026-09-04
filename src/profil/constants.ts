/**
 * Valeurs CANONIQUES du profil créateur — reprises telles quelles de
 * `legacy-v1/app/src/constants/onboarding.ts` (lecture seule). 🔒 Jamais traduites :
 * elles sont stockées dans `personas` et injectées telles quelles dans les prompts.
 * « Autre » n'est PAS dans NICHES : c'est un sentinel d'UI (dernière case de la grille)
 * qui ouvre un champ libre → la valeur saisie est stockée dans `personas.niche`.
 */
export const NICHES = [
  'Business & entrepreneuriat',
  'Marketing & contenu',
  'Tech & IA',
  'Finance perso',
  'Immobilier',
  'Développement personnel',
  'Éducation',
  'Carrière & emploi',
  'Fitness & santé',
  'Cuisine & food',
  'Mode & beauté',
  'Lifestyle',
  'Voyage',
  'Art & créativité',
  'Humour & divertissement',
] as const;

export const NICHE_OTHER = 'Autre';

/* Codes stables stockés dans `personas.voix` — les libellés vivent dans `fr.profil.voix`. */
export const NIVEAUX_LANGUE = ['soutenu', 'naturel', 'familier', 'cru'] as const;
export const VULGARITES = ['jamais', 'rare', 'assumee'] as const;
export const HUMOURS = ['autoderision', 'noir', 'ironie_second_degre', 'pince_sans_rire', 'absurde', 'aucun'] as const;
/** « aucun » est exclusif : le choisir désélectionne tous les autres. */
export const HUMOUR_EXCLUSIF = 'aucun';
