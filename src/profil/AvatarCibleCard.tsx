import { useId, type JSX } from 'react';
import { Target } from 'lucide-react';
import { Icon, Input } from '@yunary/ds';
import { fr } from '../i18n/fr';
import { ProfilCard } from './ProfilCard';
import type { AvatarCible } from './types';

export interface AvatarCibleCardProps {
  value: AvatarCible;
  onChange: (value: AvatarCible) => void;
}

/** « Ton avatar cible » — Qui / Quoi / Son problème (colonnes `avatar_qui`, `transformation_b`, `avatar_galere`). */
export function AvatarCibleCard({ value, onChange }: AvatarCibleCardProps): JSX.Element {
  const id = useId();
  const a = fr.profil.avatar;
  const rows: { key: keyof AvatarCible; label: string }[] = [
    { key: 'qui', label: a.qui },
    { key: 'quoi', label: a.quoi },
    { key: 'probleme', label: a.probleme },
  ];
  return (
    <ProfilCard icon={<Icon glyph={Target} />} title={a.title}>
      <div className="flex flex-col gap-space-5">
        {rows.map(r => (
          <div key={r.key} className="flex flex-col gap-space-2">
            <label htmlFor={`${id}-${r.key}`} className="text-body-sm font-semibold text-foreground">{r.label}</label>
            <Input id={`${id}-${r.key}`} value={value[r.key]} onChange={e => onChange({ ...value, [r.key]: e.target.value })} />
          </div>
        ))}
      </div>
    </ProfilCard>
  );
}
