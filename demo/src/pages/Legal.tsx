import type { JSX, ReactNode } from 'react';
import { LEGAL_DOCS, LegalDocView, SuppressionDonneesView } from '@yunary/shell';
import { Section } from '../ui';

/* Les pages publiques : le document complet des CGU, les deux autres en aperçu, et les états de la page de suppression. */
export function LegalPage(): JSX.Element {
  return (
    <div className="flex flex-col gap-space-7">
      <Section title="CGU · document complet" note="Contenu verbatim de la v1 (figé App Review). Coque publique : mot-marque, colonne de lecture.">
        <Frame><LegalDocView doc={LEGAL_DOCS.cgu} /></Frame>
      </Section>
      <Section title="Mentions légales · Politique de confidentialité" note="Mêmes coque et rythme ; aperçu limité en hauteur.">
        <div className="grid grid-cols-1 gap-space-5 xl:grid-cols-2">
          <Frame clip><LegalDocView doc={LEGAL_DOCS.mentions} /></Frame>
          <Frame clip><LegalDocView doc={LEGAL_DOCS.confidentialite} /></Frame>
        </div>
      </Section>
      <Section title="Suppression des données · états" note="Vérification, code absent, demande traitée, demande introuvable.">
        <div className="grid grid-cols-1 gap-space-5 xl:grid-cols-2">
          <Frame clip small><SuppressionDonneesView state={{ kind: 'loading' }} /></Frame>
          <Frame clip small><SuppressionDonneesView state={{ kind: 'missing' }} /></Frame>
          <Frame clip small><SuppressionDonneesView state={{ kind: 'found', status: 'completed', requestedAt: '2026-08-30T09:12:00Z' }} /></Frame>
          <Frame clip small><SuppressionDonneesView state={{ kind: 'not_found' }} /></Frame>
        </div>
      </Section>
    </div>
  );
}

function Frame({ clip = false, small = false, children }: { clip?: boolean; small?: boolean; children: ReactNode }): JSX.Element {
  return <div className={`overflow-hidden rounded-xl border border-border ${clip ? (small ? 'h-[22rem]' : 'h-[36rem]') : ''}`}>{children}</div>;
}
