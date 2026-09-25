import { useLayoutEffect, useRef, type CSSProperties, type JSX, type ReactNode } from 'react';
import { cn } from '@yunary/ds';
import { useMediaQuery } from '../lib/useMediaQuery';

/**
 * Le mouvement des écrans de paiement (maquette « Yunary Hub Dashboard », `yreveal.js`) : la coche
 * se dessine, puis le titre, puis les outils un par un. Pas de CSS ni de `@keyframes` dans la coque
 * (ce sont des fondations, au DS) : l'API d'animation du navigateur (`element.animate`), avec
 * l'easing du DS (`--ease-standard`). « Keyframes d'entrée » est consigné au BACKLOG du DS.
 *
 * `prefers-reduced-motion` : rien n'est animé, tout est visible tout de suite. Le DS réduit les
 * DURÉES globalement, pas les DÉLAIS : sans ce garde, un élément resterait invisible pendant sa
 * cascade (jusqu'à 1,5 s).
 */
export const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

export function useReducedMotion(): boolean {
  return useMediaQuery(REDUCED_MOTION_QUERY);
}

/** L'easing du DS, lu sur la racine ; repli sur un easing du navigateur si le jeton manque (vitrine sans DS). */
function easeStandard(): string {
  if (typeof document === 'undefined') return 'ease-out';
  return getComputedStyle(document.documentElement).getPropertyValue('--ease-standard').trim() || 'ease-out';
}

function supportsAnimate(el: Element | null): el is HTMLElement {
  return !!el && typeof (el as HTMLElement).animate === 'function';
}

export interface RevealProps {
  /** Le moment d'apparition, en ms, depuis le montage (maquette : titre 820, outils +120 chacun…). */
  delay?: number;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

/**
 * Une apparition : fondu + remontée de 12 px, 560 ms. Pour rejouer la cascade, l'appelant change la
 * `key` du parent.
 */
export function Reveal({ delay = 0, className, style, children }: RevealProps): JSX.Element {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  useLayoutEffect(() => {
    const el = ref.current;
    if (reduced || !supportsAnimate(el)) return;
    const anim = el.animate(
      [{ opacity: 0, transform: 'translateY(12px)' }, { opacity: 1, transform: 'none' }],
      { duration: 560, delay, easing: easeStandard(), fill: 'both' },
    );
    return () => anim.cancel();
  }, [delay, reduced]);
  return <div ref={ref} className={className} style={style}>{children}</div>;
}

export interface AnimatedCheckProps {
  /** `success` : la coche · `danger` : la croix. */
  tone?: 'success' | 'danger';
  /** `md` = 5 rem (bureau, la `Pastille` écran) · `sm` = 4 rem (mobile). La maquette dit 88 / 72 px : écart validé (25/09/2026). */
  size?: 'md' | 'sm';
  delay?: number;
  className?: string;
}

/**
 * La pastille ronde qui apparaît (pop), puis son cercle qui se trace, puis la coche (ou les deux
 * traits de la croix) qui se dessine. Couleurs des paires `--pill-*` du DS. Décorative : le titre
 * qui suit porte le sens (`aria-hidden`).
 */
export function AnimatedCheck({ tone = 'success', size = 'md', delay = 0, className }: AnimatedCheckProps): JSX.Element {
  const rootRef = useRef<HTMLSpanElement>(null);
  const circleRef = useRef<SVGCircleElement>(null);
  const aRef = useRef<SVGPathElement>(null);
  const bRef = useRef<SVGPathElement>(null);
  const reduced = useReducedMotion();
  const ok = tone === 'success';

  useLayoutEffect(() => {
    const root = rootRef.current;
    const strokes = [circleRef.current, aRef.current, bRef.current].filter(Boolean) as SVGElement[];
    if (reduced || !supportsAnimate(root)) {
      strokes.forEach(s => { s.style.strokeDashoffset = '0'; });
      return;
    }
    const easing = easeStandard();
    const draw = (el: SVGElement | null, duration: number, at: number) =>
      el && typeof el.animate === 'function'
        ? el.animate([{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { duration, delay: delay + at, easing, fill: 'both' })
        : null;
    const anims = [
      root.animate(
        [{ opacity: 0, transform: 'scale(0.6)' }, { opacity: 1, transform: 'scale(1.06)', offset: 0.65 }, { opacity: 1, transform: 'scale(1)' }],
        { duration: 420, delay, easing, fill: 'both' },
      ),
      draw(circleRef.current, 620, 140),
      ...(ok ? [draw(aRef.current, 420, 560)] : [draw(aRef.current, 260, 560), draw(bRef.current, 260, 760)]),
    ];
    return () => anims.forEach(a => a?.cancel());
  }, [delay, ok, reduced]);

  const dash = { strokeDasharray: 1, strokeDashoffset: 1 } as const;
  return (
    <span
      ref={rootRef}
      aria-hidden="true"
      className={cn(
        'relative inline-flex flex-none rounded-pill',
        size === 'md' ? 'size-20' : 'size-16',
        ok ? 'bg-pill-success-bg text-pill-success-fg' : 'bg-pill-danger-bg text-pill-danger-fg',
        className,
      )}
    >
      <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" className="absolute inset-0 size-full">
        <circle ref={circleRef} cx="24" cy="24" r="22.5" strokeWidth="1.5" pathLength={1} transform="rotate(-90 24 24)" opacity="0.45" style={dash} />
        <g strokeWidth="3.2">
          {ok ? (
            <path ref={aRef} d="M15 25.5l6.5 6.5L34 18.5" pathLength={1} style={dash} />
          ) : (
            <>
              <path ref={aRef} d="M17 17l14 14" pathLength={1} style={dash} />
              <path ref={bRef} d="M31 17L17 31" pathLength={1} style={dash} />
            </>
          )}
        </g>
      </svg>
    </span>
  );
}
