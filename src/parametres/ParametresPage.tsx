import type { JSX, ReactNode } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ParametresLayout, parametresTabs, type ParametresTab, type ParametresVariant } from './ParametresLayout';
import { InfosTab } from './InfosTab';
import { NotificationsTab } from './NotificationsTab';
import { AbonnementTab } from './AbonnementTab';
import { LegalTab, type LegalHrefs } from './LegalTab';

export interface ParametresPageProps {
  variant?: ParametresVariant;
  /** Onglet contrôlé par l'app ; sans lui, la page lit et écrit `?tab=` (cible des CTA « plus de crédits »). */
  tab?: ParametresTab;
  onTabChange?: (tab: ParametresTab) => void;
  hrefs?: LegalHrefs;
  /** Natif : la carte « clé de partage » de Creator, rendue sous Infos. */
  extra?: ReactNode;
  onDeleted?: () => void;
}

/** Paramètres (C2-C5) — montée par le Hub et par Creator (variante native). */
export function ParametresPage({ variant = 'web', tab: controlledTab, onTabChange, hrefs, extra, onDeleted }: ParametresPageProps): JSX.Element {
  const [params, setParams] = useSearchParams();
  const allowed = parametresTabs(variant).map(t => t.value);
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
    <ParametresLayout variant={variant} tab={tab} onTabChange={change}>
      {tab === 'infos' ? (
        <>
          <InfosTab variant={variant} />
          {extra}
        </>
      ) : null}
      {tab === 'notifications' ? <NotificationsTab /> : null}
      {tab === 'abonnement' ? <AbonnementTab /> : null}
      {tab === 'legal' ? <LegalTab variant={variant} hrefs={hrefs} onDeleted={onDeleted} /> : null}
    </ParametresLayout>
  );
}
