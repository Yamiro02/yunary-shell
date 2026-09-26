import { useEffect, useRef, type JSX, type ReactNode } from 'react';
import { Icon, IconButton, cn } from '@yunary/ds';
import { fr } from '../i18n/fr';

export interface FullScreenSheetProps {
  title: string;
  /** Une chaîne (rendue en `body-sm` muted) ou un bloc (le récap replié du checkout multi-outils). */
  subtitle?: ReactNode;
  onClose: () => void;
  /** Démo : rendu dans le flux, sans `position: fixed` ni verrou du document. */
  inline?: boolean;
  /** Le pied fixe (récap + CTA de la modale « Modifier mon abonnement » sur mobile). Absent : le corps va jusqu'en bas. */
  footer?: ReactNode;
  className?: string;
  children: ReactNode;
}

/**
 * La page plein écran des paiements sur mobile (artboards D2b, Hub-03-ModifierOutils-Mobile) :
 * `fixed inset-0` au rang `--z-modal`, fond `--card`, aucun voile. En-tête fixe sous la zone sûre
 * (titre `heading-sm`, sous-titre, croix), corps `flex-1` qui défile seul, pied fixe facultatif.
 * Échap ferme, le focus arrive sur la croix, le document ne défile plus derrière.
 * ⚠ Exception ASSUMÉE au traitement modal du DS (feuille basse) : payer isole complètement
 * (décision Julien, 13/09/2026). Sert la fenêtre de paiement (`PaymentView`) et les modales d'abonnement.
 */
export function FullScreenSheet({ title, subtitle, onClose, inline, footer, className, children }: FullScreenSheetProps): JSX.Element {
  const headRef = useRef<HTMLElement>(null);
  useEffect(() => {
    if (inline) return;
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    /* L'`IconButton` du DS ne transmet pas de ref : on vise la croix depuis l'en-tête. */
    headRef.current?.querySelector('button')?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener('keydown', onKey);
      previous?.focus?.();
    };
  }, [inline, onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className={cn('flex flex-col bg-card text-foreground', inline ? 'relative h-full min-h-full' : 'fixed inset-0 z-(--z-modal)', className)}
    >
      {/* Artboard D2b : en-tête 56 / 20 / 16 — les 56 du haut sont la barre d'état de la maquette : ici `space-5` sous la
          zone sûre (`env(safe-area-inset-top)`), 20 → `space-5`, 16 → `space-4`. La croix est l'`IconButton` ghost du DS
          (2,75 rem sous 64 rem : la cible tactile) là où l'artboard dessine la croix de modale à 2 rem. */}
      <header
        ref={headRef}
        className="flex flex-none items-start justify-between gap-space-3 border-b border-border px-space-5 pb-space-4 pt-space-5"
        style={inline ? undefined : { paddingTop: 'max(var(--space-5), env(safe-area-inset-top))' }}
      >
        <div className="flex min-w-0 flex-1 flex-col gap-space-1">
          <h2 className="text-heading-sm">{title}</h2>
          {subtitle ? typeof subtitle === 'string' ? <span className="text-body-sm text-text-muted">{subtitle}</span> : subtitle : null}
        </div>
        <IconButton variant="ghost" label={fr.common.close} onClick={onClose} className="-mr-space-2 -mt-space-2">
          <Icon name="x" size="1.125rem" />
        </IconButton>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto px-space-5 pb-space-5 pt-space-4">{children}</div>
      {footer ? (
        <footer
          className="flex flex-none flex-col gap-space-3 border-t border-border bg-card px-space-5 pt-space-4"
          style={{ paddingBottom: inline ? 'var(--space-5)' : 'max(var(--space-5), env(safe-area-inset-bottom))' }}
        >
          {footer}
        </footer>
      ) : null}
    </div>
  );
}
