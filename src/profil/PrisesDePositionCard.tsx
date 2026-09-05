import { useId, type JSX } from 'react';
import { Megaphone } from 'lucide-react';
import { Icon, Input } from '@yunary/ds';
import { fr } from '../i18n/fr';
import { ProfilCard } from './ProfilCard';
import type { PrisesDePosition } from './types';

export interface PrisesDePositionCardProps {
  value: PrisesDePosition;
  onChange: (value: PrisesDePosition) => void;
}

/** « Tes prises de position » — 01 à 03 (colonnes `conviction_defend`, `conviction_faux`, `conviction_refus`). */
export function PrisesDePositionCard({ value, onChange }: PrisesDePositionCardProps): JSX.Element {
  const id = useId();
  const p = fr.profil.positions;
  return (
    <ProfilCard icon={<Icon glyph={Megaphone} />} title={p.title} description={p.subtitle}>
      <div className="flex flex-col gap-space-4">
        {value.map((v, i) => (
          <div key={i} className="flex items-center gap-space-4">
            {/* Numéro en dégradé : deux spans, l'externe porte la mise en page (piège 3 du DS). */}
            <label htmlFor={`${id}-${i}`} className="w-[2.5rem] flex-none text-center font-display text-subheading font-(--heading-weight)">
              <span className="accent">{String(i + 1).padStart(2, '0')}</span>
            </label>
            <Input
              id={`${id}-${i}`}
              className="flex-1"
              value={v}
              onChange={e => {
                const next = [...value] as PrisesDePosition;
                next[i] = e.target.value;
                onChange(next);
              }}
            />
          </div>
        ))}
      </div>
    </ProfilCard>
  );
}
