import type { ReactNode } from 'react';
import { Card } from '@yunary/ds';

/* Échafaudage de la vitrine — composants du DS et utilitaires du preset seulement. */
export function Section({ title, note, children }: { title: string; note?: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-space-4">
      <div className="flex flex-col gap-space-1">
        <h2>{title}</h2>
        {note ? <p className="caption">{note}</p> : null}
      </div>
      {children}
    </section>
  );
}

export function Block({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <Card className="flex flex-col gap-space-4">
      <div className="flex flex-col gap-space-1">
        <span className="eyebrow">{label}</span>
        {hint ? <span className="caption">{hint}</span> : null}
      </div>
      <div className="flex flex-col gap-space-4">{children}</div>
    </Card>
  );
}
