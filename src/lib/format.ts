/* Formats FR partagés — via Intl, pas de dépendance de dates. */

const nombre = new Intl.NumberFormat('fr-FR');
const nombreCompact = new Intl.NumberFormat('fr-FR', { notation: 'compact', maximumFractionDigits: 1 });
const dateCourte = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' });
const dateLongue = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
const dateNumerique = new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
const jourMois = new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: '2-digit' });

const eurosEntiers = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
const eurosCentimes = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2 });

export function formatNombre(n: number): string {
  return nombre.format(n);
}

/** Un prix en centimes → « 9 € » ou « 9,90 € » (pas de décimales inutiles). Le montant vient toujours de la base ou de l'Edge. */
export function formatEuros(cents: number): string {
  return cents % 100 === 0 ? eurosEntiers.format(cents / 100) : eurosCentimes.format(cents / 100);
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

/** « 23/10/2026 » — les échéances du paiement (maquettes Hub-03, Hub-Outils). */
export function formatDateNumerique(iso: string): string {
  return dateNumerique.format(new Date(iso));
}

/** « 23/10 » — une borne de prorata (« du 10/10 au 23/10 »). */
export function formatJourMois(iso: string): string {
  return jourMois.format(new Date(iso));
}

/** Initiales d'un nom pour l'avatar de repli : « Julien Fernandes » → « JF ». */
export function initiales(prenom?: string | null, nom?: string | null, email?: string | null): string {
  const a = prenom?.trim().charAt(0) ?? '';
  const b = nom?.trim().charAt(0) ?? '';
  const result = (a + b).toUpperCase();
  if (result) return result;
  return (email?.trim().charAt(0) ?? '?').toUpperCase();
}
