import { getShellConfig, type ToolId } from '../config';

/**
 * LE registre des outils — ce que liste le commutateur d'espace et la page « Mes outils »
 * du Hub. Ajouter un outil = une entrée ici + monter la version du shell dans les apps.
 * Libellés et descriptions : maquette C1 (maître).
 */
export interface ToolDef {
  id: ToolId;
  /** Le premier mot, toujours « Yunary ». */
  label: string;
  /** Le mot accentué (« Creator ») — absent pour le Hub, dont l'espace s'appelle « Yunary ». */
  accent?: string;
  description: string;
  /** Sous-domaine de yunary.com ; le Hub prend `hubUrl` de la config. */
  subdomain: string;
  status: 'live' | 'soon';
}

export const TOOLS: readonly ToolDef[] = [
  {
    id: 'hub',
    label: 'Yunary',
    description: 'Ton compte, tes outils, ta formule.',
    subdomain: 'app',
    status: 'live',
  },
  {
    id: 'creator',
    label: 'Yunary',
    accent: 'Creator',
    description:
      'Analyse les vidéos qui marchent, puis réutilise leurs hooks et leurs structures pour réécrire tes scripts, dans ta voix.',
    subdomain: 'creator',
    status: 'live',
  },
  {
    id: 'metrics',
    label: 'Yunary',
    accent: 'Metrics',
    description: 'Suis les chiffres de ton compte : vues, engagement, évolution de tes posts et de ton audience.',
    subdomain: 'metrics',
    status: 'soon',
  },
];

export function toolById(id: ToolId): ToolDef {
  const tool = TOOLS.find(t => t.id === id);
  if (!tool) throw new Error(`Outil inconnu : ${id}`);
  return tool;
}

/** L'origine d'un outil : `hubUrl` pour le Hub, `toolUrls` de la config en local, sinon `https://<sous-domaine>.yunary.com`. */
export function toolUrl(id: ToolId): string {
  const config = getShellConfig();
  if (id === 'hub') return config.hubUrl;
  const override = config.toolUrls?.[id];
  if (override) return override.replace(/\/+$/, '');
  return `https://${toolById(id).subdomain}.yunary.com`;
}

/** Nom complet d'un espace : « Yunary Creator ». */
export function toolFullName(tool: ToolDef): string {
  return tool.accent ? `${tool.label} ${tool.accent}` : tool.label;
}
