import { useState, type JSX, type ReactNode } from 'react';
import { AvatarCibleCard, ChoiceChip, NicheCard, PrisesDePositionCard, SegmentedControl, VoixCard, type AvatarCible, type PrisesDePosition, type Voix } from '@yunary/shell';
import { Section } from '../ui';

/* B5 : les quatre cartes, contrôlées — la vitrine porte l'état, comme le ferait l'app hôte avec son autosave. */
export function ProfilPage(): JSX.Element {
  const [niche, setNiche] = useState('Business & entrepreneuriat');
  const [voix, setVoix] = useState<Voix>({ niveau_langue: 'naturel', vulgarite: 'rare', humour: ['autoderision', 'pince_sans_rire'], tics: [] });
  const [expressions, setExpressions] = useState(['Franchement', 'On se le dit', 'Simple, pas facile']);
  const [avatar, setAvatar] = useState<AvatarCible>({
    qui: 'Des salariés de 25-35 ans qui veulent lancer un business à côté de leur job.',
    quoi: 'Un premier revenu en ligne, avec des méthodes simples et sans budget pub.',
    probleme: "Trop d'infos contradictoires : il ne sait pas par où commencer, alors il ne commence pas.",
  });
  const [positions, setPositions] = useState<PrisesDePosition>(["L'action bat le plan parfait", "Pas besoin d'être expert pour se lancer", "L'organique avant la pub, toujours"]);
  const [seg, setSeg] = useState<'a' | 'b' | 'c' | null>(null);
  const [chip, setChip] = useState(false);

  return (
    <div className="flex flex-col gap-space-7">
      <Section title="Cartes du profil créateur" note="Maquette B5 (onboarding 5/5) et Creator › Profil. Valeurs canoniques reprises de la v1, jamais traduites. L'autosave reste dans l'app hôte.">
        <Frame>
          <div className="flex max-w-wide flex-col gap-space-6">
            <NicheCard value={niche} onChange={setNiche} />
            <AvatarCibleCard value={avatar} onChange={setAvatar} />
            <VoixCard voix={voix} onChange={setVoix} expressionsDetectees={['Franchement', 'On se le dit', 'Simple, pas facile', 'Note ça quelque part']} expressions={expressions} onExpressionsChange={setExpressions} />
            <PrisesDePositionCard value={positions} onChange={setPositions} />
          </div>
        </Frame>
      </Section>
      <Section title="Niche hors liste" note="Une niche détectée hors presets ouvre directement le champ libre.">
        <Frame><NicheCard value="Apiculture urbaine" onChange={() => undefined} /></Frame>
      </Section>
      <Section title="Primitives composées" note="SegmentedControl (choix unique, flèches au clavier ; sélection à la convention des Tabs du DS : corail sur `--accent`, même graisse) et ChoiceChip — manques consignés au backlog du DS. La tuile de niche, elle, est la RadioTile du DS depuis 0.1.9.">
        <Frame>
          <div className="flex max-w-narrow flex-col gap-space-5">
            <SegmentedControl label="Exemple" options={[{ value: 'a', label: 'Soutenu' }, { value: 'b', label: 'Naturel' }, { value: 'c', label: 'Cru' }]} value={seg} onChange={setSeg} />
            <SegmentedControl label="Désactivé" options={[{ value: 'a', label: 'Jamais' }, { value: 'b', label: 'Rare' }]} value="b" onChange={() => undefined} disabled />
            <div className="flex flex-wrap gap-space-2">
              <ChoiceChip selected={chip} onToggle={() => setChip(c => !c)}>Cochable</ChoiceChip>
              <ChoiceChip selected italic onToggle={() => undefined}>« Italique »</ChoiceChip>
              <ChoiceChip selected={false} disabled onToggle={() => undefined}>Désactivée</ChoiceChip>
            </div>
          </div>
        </Frame>
      </Section>
    </div>
  );
}

function Frame({ children }: { children: ReactNode }): JSX.Element {
  return <div className="rounded-xl border border-border bg-background p-space-6">{children}</div>;
}
