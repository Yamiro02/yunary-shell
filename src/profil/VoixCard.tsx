import type { JSX } from 'react';
import { Bot } from 'lucide-react';
import { Icon } from '@yunary/ds';
import { fr } from '../i18n/fr';
import { SegmentedControl } from '../layout/SegmentedControl';
import { ChoiceChip } from './ChoiceChip';
import { ProfilCard } from './ProfilCard';
import { HUMOURS, HUMOUR_EXCLUSIF, NIVEAUX_LANGUE, VULGARITES } from './constants';
import type { Humour, NiveauLangue, Voix, Vulgarite } from './types';

export interface VoixCardProps {
  voix: Voix;
  onChange: (voix: Voix) => void;
  /** Les expressions captées (empreinte de voix) — celles qu'on peut cocher. */
  expressionsDetectees?: string[];
  /** Celles retenues. */
  expressions?: string[];
  onExpressionsChange?: (next: string[]) => void;
}

/**
 * « Ta voix » — niveau de langue et vulgarité (choix unique, `SegmentedControl`), humour
 * (chips, « aucun » exclusif), expressions signature (chips italiques, on retire, on n'ajoute pas).
 * Artboard « 06 Profil Ta voix » (Creator) : glyphe de la pastille à 18 px (posé par `ProfilCard`), chips à filet 1,5 px.
 */
export function VoixCard({ voix, onChange, expressionsDetectees = [], expressions = [], onExpressionsChange }: VoixCardProps): JSX.Element {
  const v = fr.profil.voix;
  /* « Tes expressions signature » s'affiche dès qu'il y a quelque chose à montrer : les expressions
     captées par l'empreinte de voix ET celles déjà retenues (`voix.tics`, ou `expressions` quand
     l'hôte les porte à part) — même sans empreinte captée (Julien, 12/09/2026). Masquée seulement
     si la liste est vide. Les retenues absentes de l'empreinte restent cochables : on peut les retirer. */
  const candidats = [...new Set([...expressionsDetectees, ...expressions, ...voix.tics])];
  const toggleHumour = (h: Humour) => {
    if (h === HUMOUR_EXCLUSIF) {
      onChange({ ...voix, humour: voix.humour.includes(h) ? [] : [h] });
      return;
    }
    const base = voix.humour.filter(x => x !== HUMOUR_EXCLUSIF);
    onChange({ ...voix, humour: base.includes(h) ? base.filter(x => x !== h) : [...base, h] });
  };
  const toggleExpression = (e: string) => {
    onExpressionsChange?.(expressions.includes(e) ? expressions.filter(x => x !== e) : [...expressions, e]);
  };
  return (
    <ProfilCard icon={<Icon glyph={Bot} />} title={v.title}>
      <div className="grid grid-cols-1 gap-space-5 lg:grid-cols-2">
        <Field label={v.niveauLabel}>
          <SegmentedControl<NiveauLangue> label={v.niveauLabel} options={NIVEAUX_LANGUE.map(n => ({ value: n, label: v.niveau[n] }))} value={voix.niveau_langue} onChange={niveau_langue => onChange({ ...voix, niveau_langue })} />
        </Field>
        <Field label={v.vulgariteLabel}>
          <SegmentedControl<Vulgarite> label={v.vulgariteLabel} options={VULGARITES.map(n => ({ value: n, label: v.vulgarite[n] }))} value={voix.vulgarite} onChange={vulgarite => onChange({ ...voix, vulgarite })} />
        </Field>
      </div>
      <Field label={v.humourLabel}>
        <div className="flex flex-wrap gap-space-2">
          {HUMOURS.map(h => (
            <ChoiceChip key={h} selected={voix.humour.includes(h)} onToggle={() => toggleHumour(h)}>{v.humour[h]}</ChoiceChip>
          ))}
        </div>
      </Field>
      {candidats.length ? (
        <Field label={v.expressions}>
          <div className="flex flex-wrap gap-space-2">
            {candidats.map(e => (
              <ChoiceChip key={e} italic selected={expressions.includes(e)} onToggle={() => toggleExpression(e)}>{v.quoted(e)}</ChoiceChip>
            ))}
          </div>
        </Field>
      ) : null}
    </ProfilCard>
  );
}

/** Libellé de bloc des cartes profil (maquette : body-sm, semi-gras, encre). */
export function Field({ label, children }: { label: string; children: JSX.Element }): JSX.Element {
  return (
    <div className="flex flex-col gap-space-2">
      <span className="text-body-sm font-semibold text-foreground">{label}</span>
      {children}
    </div>
  );
}
