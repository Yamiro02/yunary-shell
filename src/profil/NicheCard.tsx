import { useId, useState, type JSX } from 'react';
import { Compass } from 'lucide-react';
import { Icon, Input, Radio, cn } from '@yunary/ds';
import { fr } from '../i18n/fr';
import { NICHES, NICHE_OTHER } from './constants';
import { ProfilCard } from './ProfilCard';

export interface NicheCardProps {
  /** La niche stockée — une valeur canonique, ou un texte libre (case « Autre »). */
  value: string;
  onChange: (value: string) => void;
}

/**
 * « Ta niche » — grille de tuiles radio (3 colonnes), valeurs canoniques jamais traduites,
 * case « Autre » qui ouvre un champ libre. Contrôlée : la valeur remontée est TOUJOURS la
 * niche elle-même, jamais le sentinel. La tuile EST le `Radio` du DS, stylé par `className`.
 */
export function NicheCard({ value, onChange }: NicheCardProps): JSX.Element {
  const name = useId();
  const isPreset = (NICHES as readonly string[]).includes(value);
  const [otherOpen, setOtherOpen] = useState(value.trim().length > 0 && !isPreset);
  const [autoFocus, setAutoFocus] = useState(false);
  const gridValue = isPreset ? value : otherOpen ? NICHE_OTHER : null;

  const select = (opt: string) => {
    if (opt === NICHE_OTHER) {
      setOtherOpen(true);
      setAutoFocus(true);
      if (isPreset) onChange('');
      return;
    }
    setOtherOpen(false);
    setAutoFocus(false);
    onChange(opt);
  };

  return (
    <ProfilCard icon={<Icon glyph={Compass} />} title={fr.profil.niche.title}>
      <div role="radiogroup" aria-label={fr.profil.niche.title} className="grid grid-cols-1 gap-space-2 md:grid-cols-2 lg:grid-cols-3 lg:gap-space-3">
        {[...NICHES, NICHE_OTHER].map(opt => {
          const selected = gridValue === opt;
          return (
            <Radio
              key={opt}
              name={name}
              value={opt}
              checked={selected}
              onChange={() => select(opt)}
              label={<span className="text-control font-medium">{opt === NICHE_OTHER ? fr.profil.niche.other : opt}</span>}
              className={cn(
                'flex gap-space-3 rounded-md border-[1.5px] px-space-4 py-space-3 transition-colors duration-[var(--duration-base)] ease-standard',
                selected ? 'border-primary bg-accent text-foreground' : 'border-border bg-background text-text-secondary hover:border-primary',
              )}
            />
          );
        })}
      </div>
      {otherOpen ? (
        <Input
          aria-label={fr.profil.niche.otherPlaceholder}
          placeholder={fr.profil.niche.otherPlaceholder}
          value={isPreset ? '' : value}
          autoFocus={autoFocus}
          onChange={e => onChange(e.target.value)}
        />
      ) : null}
    </ProfilCard>
  );
}
