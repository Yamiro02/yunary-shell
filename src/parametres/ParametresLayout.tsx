import type { JSX, ReactNode } from 'react';
import { Tabs } from '@yunary/ds';
import { fr } from '../i18n/fr';

export type ParametresTab = 'infos' | 'notifications' | 'abonnement' | 'legal';
export type ParametresVariant = 'web' | 'native';

/** Les onglets d'une variante : le natif n'a pas d'Abonnement (pas d'achat in-app). */
export function parametresTabs(variant: ParametresVariant): { value: ParametresTab; label: string }[] {
  const t = fr.parametres.tabs;
  return variant === 'native'
    ? [{ value: 'infos', label: t.infos }, { value: 'legal', label: t.legal }]
    : [{ value: 'infos', label: t.infos }, { value: 'notifications', label: t.notifications }, { value: 'abonnement', label: t.abonnement }, { value: 'legal', label: t.legal }];
}

export interface ParametresLayoutProps {
  variant: ParametresVariant;
  tab: ParametresTab;
  onTabChange: (tab: ParametresTab) => void;
  children: ReactNode;
}

/** En-tête + barre d'onglets de Paramètres (C2-C5). Le contenu de l'onglet vient en enfant. */
export function ParametresLayout({ variant, tab, onTabChange, children }: ParametresLayoutProps): JSX.Element {
  /* Artboards C2-C5 : en-tête (titre + chapô muted, gap 6 → `space-2`), barre d'onglets du DS, contenu au pas `space-5`. */
  return (
    <div className="flex flex-col gap-space-5">
      <div className="flex flex-col gap-space-2">
        <h1 className="text-heading-xl">{fr.parametres.title}</h1>
        <p className="text-body text-text-muted">{fr.parametres.subtitle}</p>
      </div>
      {/* Sous 64 rem, quatre onglets (419 px) ne tiennent pas sur 375 px : la barre défile
          horizontalement dans son rail, la page ne s'élargit pas. Les artboards sont desktop. */}
      <div className="max-w-full self-start overflow-x-auto">
        <Tabs
          aria-label={fr.parametres.tabsAria}
          className="w-max flex-none"
          items={parametresTabs(variant)}
          value={tab}
          onChange={v => onTabChange(v as ParametresTab)}
        />
      </div>
      {children}
    </div>
  );
}
