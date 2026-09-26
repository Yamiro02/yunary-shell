import { useQuery } from '@tanstack/react-query';
import { getSupabase } from '../lib/supabase';

/**
 * 🔒 Le catalogue des outils vit EN BASE (`tools`, `tool_packs`), jamais dans le paquet : noms,
 * descriptions, quotas mensuels, prix. Lecture publique (`anon` + `authenticated`), aucune
 * écriture hors migration. Un outil non publié reste visible (le serveur MCP le montre aussi) :
 * c'est `isPublished` qui dit si on peut l'acheter.
 */
export interface ToolDef {
  /** `tools.id` — `audit`, `analyse`, `script`, `programmation`… */
  id: string;
  /** « Yunary Analyse » — le nom complet, tel qu'il est en base. */
  name: string;
  description: string;
  position: number;
  /** `null` = outil sans quota. */
  monthlyQuota: number | null;
  /** L'unité du quota, au singulier et au pluriel (`tools.unit_label*`, 0.4.2) : « analyse » / « analyses ». */
  unitLabel: string;
  unitLabelPlural: string;
  /** Prix mensuel en centimes — `null` tant que l'outil n'est pas tarifé. Vient de la base, jamais d'ici. */
  priceCents: number | null;
  /** Publié = achetable (prix + price Stripe posés). */
  isPublished: boolean;
  /** `mvp` ou `a_venir`. */
  status: string;
}

export interface ToolPackDef {
  /** `tool_packs.id` — `analyse-20`… */
  id: string;
  toolId: string;
  /** « 20 analyses supplémentaires ». */
  name: string;
  units: number;
  priceCents: number | null;
  isPublished: boolean;
}

export interface ToolCatalog {
  /** Triés par `position`. */
  tools: ToolDef[];
  /** Triés par outil (position), puis par unités. */
  packs: ToolPackDef[];
}

export const toolCatalogKey = ['tool-catalog'] as const;

/** Le catalogue : `tools` + `tool_packs`, lus en parallèle. Cache long : ça ne bouge qu'à une migration. `enabled: false` = pas de lecture (démo). */
export function useToolCatalog({ enabled = true }: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: toolCatalogKey,
    enabled,
    staleTime: 60 * 60 * 1000,
    queryFn: async (): Promise<ToolCatalog> => {
      const supabase = getSupabase();
      const [toolsRes, packsRes] = await Promise.all([
        supabase.from('tools').select('id, name, description, position, monthly_quota, unit_label, unit_label_plural, price_cents, is_published, status').order('position'),
        supabase.from('tool_packs').select('id, tool_id, name, units, price_cents, is_published').order('units'),
      ]);
      if (toolsRes.error) throw toolsRes.error;
      if (packsRes.error) throw packsRes.error;
      const tools = toolsRes.data.map(row => ({
        id: row.id, name: row.name, description: row.description, position: row.position, monthlyQuota: row.monthly_quota,
        unitLabel: row.unit_label, unitLabelPlural: row.unit_label_plural,
        priceCents: row.price_cents, isPublished: row.is_published, status: row.status,
      }));
      const positionOf = (toolId: string) => tools.find(t => t.id === toolId)?.position ?? Number.MAX_SAFE_INTEGER;
      const packs = packsRes.data
        .map(row => ({ id: row.id, toolId: row.tool_id, name: row.name, units: row.units, priceCents: row.price_cents, isPublished: row.is_published }))
        .sort((a, b) => positionOf(a.toolId) - positionOf(b.toolId) || a.units - b.units);
      return { tools, packs };
    },
  });
}

/** Un outil du catalogue par son id — `null` si le catalogue n'est pas lu ou l'id inconnu. */
export function toolByIdIn(catalog: ToolCatalog | undefined, toolId: string | null | undefined): ToolDef | null {
  return catalog?.tools.find(t => t.id === toolId) ?? null;
}

/** Un pack du catalogue par son id. */
export function packByIdIn(catalog: ToolCatalog | undefined, packId: string | null | undefined): ToolPackDef | null {
  return catalog?.packs.find(p => p.id === packId) ?? null;
}
