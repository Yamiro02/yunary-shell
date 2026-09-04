/* Formats FR partagés — via Intl, pas de dépendance de dates. */

const nombre = new Intl.NumberFormat('fr-FR');
const nombreCompact = new Intl.NumberFormat('fr-FR', { notation: 'compact', maximumFractionDigits: 1 });
const dateCourte = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' });
const dateLongue = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

export function formatNombre(n: number): string {
  return nombre.format(n);
}

/** 12 400 → « 12,4 k », comme les compteurs des réseaux. */
export function formatCompact(n: number): string {
  return nombreCompact.format(n);
}

/** « 15 sept. » — la date de recharge de la carte crédits. */
export function formatDateCourte(iso: string): string {
  return dateCourte.format(new Date(iso));
}

/** « 9 août 2026 ». */
export function formatDateLongue(iso: string): string {
  return dateLongue.format(new Date(iso));
}

/** Initiales d'un nom pour l'avatar de repli : « Julien Fernandes » → « JF ». */
export function initiales(prenom?: string | null, nom?: string | null, email?: string | null): string {
  const a = prenom?.trim().charAt(0) ?? '';
  const b = nom?.trim().charAt(0) ?? '';
  const result = (a + b).toUpperCase();
  if (result) return result;
  return (email?.trim().charAt(0) ?? '?').toUpperCase();
}
