import type { JSX, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '@yunary/ds';
import { fr } from '../i18n/fr';
import type { LegalBlock, LegalDoc } from './legalContent';

export interface LegalPageLayoutProps {
  title: string;
  /** « 9 août 2026 » — rend la ligne « Dernière mise à jour ». */
  updated?: string;
  intro?: string;
  /** Où mène le mot-marque. Défaut `/`. */
  homeHref?: string;
  children: ReactNode;
}

/**
 * La coque des pages légales PUBLIQUES (exigence stores et Meta) : en-tête avec le
 * mot-marque, colonne de lecture (`max-w-read`, interligne `prose`). Sans sidebar : ces
 * pages se lisent aussi sans compte.
 */
export function LegalPageLayout({ title, updated, intro, homeHref = '/', children }: LegalPageLayoutProps): JSX.Element {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <header className="border-b border-border bg-secondary">
        <div className="page flex items-center py-space-3">
          <Link to={homeHref} aria-label="Yunary" className="inline-flex"><Logo variant="wordmark" height="1.375rem" /></Link>
        </div>
      </header>
      <main className="page py-space-7">
        <article className="mx-auto flex max-w-read flex-col gap-space-6">
          <div className="flex flex-col gap-space-2">
            <h1 className="text-heading-xl">{title}</h1>
            {updated ? <span className="text-caption text-text-muted">{fr.legal.lastUpdated(updated)}</span> : null}
            {intro ? <p className="text-body-lg leading-prose text-text-secondary">{intro}</p> : null}
          </div>
          {children}
        </article>
      </main>
    </div>
  );
}

function Block({ block }: { block: LegalBlock }): JSX.Element {
  if (block.type === 'list') {
    return (
      <ul className="flex list-disc flex-col gap-space-2 pl-space-5 text-body leading-prose text-foreground">
        {block.items.map(item => <li key={item}>{item}</li>)}
      </ul>
    );
  }
  return <p className="text-body leading-prose text-foreground">{block.text}</p>;
}

/** Un document légal complet dans la coque. */
export function LegalDocView({ doc, homeHref }: { doc: LegalDoc; homeHref?: string }): JSX.Element {
  return (
    <LegalPageLayout title={doc.title} updated={doc.updated} intro={doc.intro} homeHref={homeHref}>
      {doc.sections.map(section => (
        <section key={section.heading} className="flex flex-col gap-space-3">
          <h2 className="text-subheading">{section.heading}</h2>
          {section.blocks.map((block, i) => <Block key={i} block={block} />)}
        </section>
      ))}
    </LegalPageLayout>
  );
}
