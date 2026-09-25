import type { JSX } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ParametresLayout, parametresTabs, type ParametresTab } from './ParametresLayout';
import { InfosTab } from './InfosTab';
import { NotificationsTab } from './NotificationsTab';
import { LegalTab, type LegalHrefs } from './LegalTab';

export interface ParametresPageProps {
  /** Onglet contrôlé par l'app ; sans lui, la page lit et écrit `?tab=` (un onglet inconnu retombe sur Infos). */
  tab?: ParametresTab;
  onTabChange?: (tab: ParametresTab) => void;
  hrefs?: LegalHrefs;
  onDeleted?: () => void;
}

/** Paramètres (C2, C3, C5) — montée par le hub. L'abonnement vit sur la page Facturation du hub depuis 0.4.0. */
export function ParametresPage({ tab: controlledTab, onTabChange, hrefs, onDeleted }: ParametresPageProps): JSX.Element {
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
      {tab === 'legal' ? <LegalTab hrefs={hrefs} onDeleted={onDeleted} /> : null}
    </ParametresLayout>
  );
}
