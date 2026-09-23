import type { JSX } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ParametresLayout, parametresTabs, type ParametresTab } from './ParametresLayout';
import { InfosTab } from './InfosTab';
import { NotificationsTab } from './NotificationsTab';
import { AbonnementTab } from './AbonnementTab';
import { LegalTab, type LegalHrefs } from './LegalTab';

export interface ParametresPageProps {
  /** Onglet contrôlé par l'app ; sans lui, la page lit et écrit `?tab=` (cible des liens « abonnement »). */
  tab?: ParametresTab;
  onTabChange?: (tab: ParametresTab) => void;
  hrefs?: LegalHrefs;
  /** La route LOCALE de la page des outils du hub — « Gérer mes outils » y mène. Défaut `/outils`, comme `AppLayout`. */
  toolsHref?: string;
  onDeleted?: () => void;
}

/** Paramètres (C2-C5) — montée par le hub. */
export function ParametresPage({ tab: controlledTab, onTabChange, hrefs, toolsHref = '/outils', onDeleted }: ParametresPageProps): JSX.Element {
  const [params, setParams] = useSearchParams();
  const allowed = parametresTabs().map(t => t.value);
  const fromUrl = params.get('tab') as ParametresTab | null;
  const tab: ParametresTab = controlledTab ?? (fromUrl && allowed.includes(fromUrl) ? fromUrl : 'infos');
  const change = (next: ParametresTab) => {
    if (onTabChange) onTabChange(next);
    else {
      const p = new URLSearchParams(params);
      if (next === 'infos') p.delete('tab');
      else p.set('tab', next);
      setParams(p, { replace: true });
    }
  };
  return (
    <ParametresLayout tab={tab} onTabChange={change}>
      {tab === 'infos' ? <InfosTab /> : null}
      {tab === 'notifications' ? <NotificationsTab /> : null}
      {tab === 'abonnement' ? <AbonnementTab toolsHref={toolsHref} /> : null}
      {tab === 'legal' ? <LegalTab hrefs={hrefs} onDeleted={onDeleted} /> : null}
    </ParametresLayout>
  );
}
