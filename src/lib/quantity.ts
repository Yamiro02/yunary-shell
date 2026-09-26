import { fr } from '../i18n/fr';
import { formatNombre } from './format';

/** Les libellés d'unité d'un outil, lus en base (`tools.unit_label`, `tools.unit_label_plural`). */
export interface UnitLabels {
  unitLabel: string;
  unitLabelPlural: string;
}

/**
 * Une quantité avec son unité, accordée : 0 et 1 au singulier, au-delà au pluriel (règle française) —
 * « 0 analyse », « 1 audit », « 50 analyses ». Le nombre est formaté à la française (espace fine des milliers).
 */
export function formatQuantite(n: number, singulier: string, pluriel: string): string {
  return `${formatNombre(n)} ${Math.abs(n) < 2 ? singulier : pluriel}`;
}

/** La quantité d'un outil dans son unité : « 2 audits », « 1 analyse ». */
export function formatQuota(n: number, unit: UnitLabels): string {
  return formatQuantite(n, unit.unitLabel, unit.unitLabelPlural);
}

/**
 * Le quota mensuel d'un outil : « 50 analyses par mois », « 2 audits par mois », « Sans limite » sans quota.
 * 🔒 Quota et unité viennent du catalogue (`tools.monthly_quota`, `tools.unit_label*`), jamais d'une constante.
 */
export function formatQuotaParMois(tool: { monthlyQuota: number | null } & UnitLabels): string {
  return tool.monthlyQuota === null ? fr.tools.unlimited : fr.tools.perMonth(formatQuota(tool.monthlyQuota, tool));
}
