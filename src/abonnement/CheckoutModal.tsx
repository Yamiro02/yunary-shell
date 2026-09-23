import { useEffect, useMemo, useRef, type JSX, type ReactNode } from 'react';
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from '@stripe/react-stripe-js';
import { Lock } from 'lucide-react';
import { Banner, Button, Icon, IconButton, Modal, Separator, Spinner, StateCard, cn } from '@yunary/ds';
import { fr } from '../i18n/fr';
import { getErrorMessage } from '../lib/errors';
import { formatEuros } from '../lib/format';
import { getStripe, hasStripeKey } from '../lib/stripe';
import { DS_MOBILE_QUERY, useMediaQuery } from '../lib/useMediaQuery';
import { checkoutTools, useStartCheckout, type CheckoutStart, type CheckoutTarget } from '../account/useStripe';
import { packByIdIn, toolByIdIn, useToolCatalog, type ToolCatalog, type ToolDef } from '../tools/useToolCatalog';
import { ToolLabel } from '../layout/ToolLabel';

export interface CheckoutModalProps {
  open: boolean;
  onClose: () => void;
  /** Ce qu'on achète : `{ tool }`, `{ tools }` (articles d'abonnement) ou `{ pack }` (achat unique). */
  target: CheckoutTarget;
  /** Démo : rendu dans le flux, sans voile ni `position: fixed`. */
  inline?: boolean;
  /** Démo : état forcé, l'Edge n'est pas appelée. `catalog` alimente l'en-tête et le récap. */
  demo?: { start?: CheckoutStart; error?: string; loading?: boolean; catalog?: ToolCatalog; layout?: 'modal' | 'fullscreen'; filler?: boolean };
}

/** Une ligne du récap : l'outil (catalogue, ou l'identifiant seul en attendant) et son prix. */
interface RecapLine {
  id: string;
  name: string;
  tool: ToolDef | null;
}

/**
 * Le checkout Stripe EMBARQUÉ — l'utilisateur ne quitte pas l'app. À l'ouverture, l'Edge
 * `create-checkout-session` répond :
 * - `mode: 'checkout'` → un `clientSecret` ; Stripe.js (chargé paresseusement, clé de
 *   `configureShell`) monte son formulaire dedans. Après paiement, Stripe ramène sur
 *   `?checkout=<session_id>&tools=…` (`useCheckoutActivation`) ;
 * - `mode: 'added'` → abonnement vivant, les articles sont déjà ajoutés au prorata : PAS de
 *   formulaire, la modale le dit et « Continuer » ferme.
 * Trois autres états : préparation, erreur (réessayer / fermer), paiement indisponible (pas de clé).
 *
 * TROIS DISPOSITIONS :
 * - **un outil ou un pack, bureau** (> 64 rem) : la `Modal` lg du DS (520 px), plafonnée à ~80 % de
 *   la hauteur d'écran, en-tête « S'abonner à Yunary Analyse · 9 €/mois » (ou le nom du pack ·
 *   « 5 €, en une fois »), corps défilant (artboard D2) ;
 * - **plusieurs outils, bureau** : la variante LARGE (artboard Hub-03-Abonnement-Paiement) — la même
 *   `Modal` à la largeur `--container-wide` (900 ; la maquette dit 920, écart validé par Julien le
 *   23/09/2026), sans padding, deux colonnes : le RÉCAP à gauche (`--container-aside`, fond
 *   `--secondary` : « Activer tes outils », une ligne par outil — nom en lockup, quota, prix —, total
 *   par mois, mention Stripe), le PAIEMENT à droite (en-tête « Paiement » + croix, zone Stripe qui
 *   défile). Padding `space-6` (32) là où la maquette dit 28 : le palier le plus proche ;
 * - **mobile** (≤ 64 rem) : **PLEIN ÉCRAN, ce n'est plus une modale** — aucun voile, en-tête fixe
 *   (titre, sous-titre, croix) et zone Stripe qui défile (artboards D2b et Hub-03-…-Mobile). Pour
 *   plusieurs outils, le récap est REPLIÉ dans l'en-tête : un `<details>` natif (le DS n'a pas
 *   d'accordéon, consigné à son BACKLOG) dont le résumé dit « 2 outils · 14 €/mois ».
 *   ⚠ Exception ASSUMÉE au traitement modal du DS (feuille basse) : payer est un moment où l'on
 *   isole complètement. Décision Julien, 13/09/2026 — ne pas « corriger » en feuille.
 *
 * 🔒 Noms, quotas et montants viennent de la BASE (`tools`, `tool_packs` via `useToolCatalog`) puis de
 * l'Edge (`amountCents` = somme des articles, qui fait foi dès que la réponse est là) — jamais d'une
 * constante du paquet. Le mot d'unité du quota n'existe pas en base : « 50 par mois ».
 */
export function CheckoutModal({ open, onClose, target, inline, demo }: CheckoutModalProps): JSX.Element | null {
  const t = fr.parametres.abonnement.checkout;
  const checkout = useStartCheckout();
  const catalogQuery = useToolCatalog({ enabled: !demo });
  const isMobile = useMediaQuery(DS_MOBILE_QUERY);
  const fullscreen = demo?.layout ? demo.layout === 'fullscreen' : isMobile;
  const configured = demo ? true : hasStripeKey();
  const toolIds = checkoutTools(target);
  const targetKey = target.pack ? `pack:${target.pack}` : `tools:${toolIds.join(',')}`;

  /* Une session par ouverture ; on repart de zéro à la fermeture (un clientSecret ne se remonte pas). */
  useEffect(() => {
    if (demo) return;
    if (open && configured) checkout.mutate(target);
    if (!open) checkout.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, targetKey, demo, configured]);

  const stripe = useMemo(() => (open && configured && !demo ? getStripe() : null), [open, configured, demo]);

  const start = demo ? demo.start : checkout.data;
  const loading = demo ? !!demo.loading : checkout.isPending;
  const error = demo ? demo.error : !configured ? fr.errors.checkoutUnavailable : checkout.error ? getErrorMessage(checkout.error) : undefined;
  const retry = configured && !demo ? () => checkout.mutate(target) : undefined;

  const catalog = demo ? demo.catalog : catalogQuery.data;
  const pack = packByIdIn(catalog, target.pack);
  /* Les lignes du récap : le catalogue donne nom, quota, prix ; en attendant (ou id inconnu), l'identifiant lui-même. */
  const lines: RecapLine[] = toolIds.map(id => {
    const tool = toolByIdIn(catalog, id);
    return { id, name: tool?.name ?? id, tool };
  });
  const many = !target.pack && lines.length > 1;
  const single = lines[0];
  const singleTool = target.pack ? toolByIdIn(catalog, pack?.toolId) : single?.tool ?? null;
  const singleName = target.pack ? pack?.name ?? target.pack : single?.name ?? '';
  /* Le montant : l'Edge fait foi (somme facturée), le catalogue le précède le temps de la préparation — `null` tant qu'un prix manque. */
  const catalogTotal = target.pack
    ? pack?.priceCents ?? null
    : lines.length && lines.every(l => l.tool?.priceCents != null) ? lines.reduce((sum, l) => sum + (l.tool?.priceCents ?? 0), 0) : null;
  const amount = start ? start.amountCents : catalogTotal;
  const added = !!start && start.mode === 'added';

  const title = many ? t.multiTitle : target.pack ? t.packTitle(singleName) : t.subscribeTitle(singleName);
  const subtitle = amount === null ? undefined : target.pack ? t.once(formatEuros(amount)) : t.perMonth(formatEuros(amount));

  const body = error ? (
    <Banner tone="danger">{error}</Banner>
  ) : loading || !start ? (
    <span className="flex items-center gap-space-2 text-text-muted" role="status">
      <Spinner size="sm" />
      {t.loading}
    </span>
  ) : start.mode === 'added' ? (
    /* Abonnement vivant : rien à payer ici, les articles sont déjà dans l'abonnement (base mise à jour tout de suite). */
    <StateCard
      icon={<Icon name="circle-check" size="1.5rem" />}
      title={start.tools.length > 1 ? t.addedTitleMany(start.tools.length) : t.addedTitle(singleTool?.name ?? singleName)}
      description={start.tools.length > 1 ? t.addedBodyMany : t.addedBody}
      action={<Button variant="primary" onClick={onClose}>{t.continue}</Button>}
    />
  ) : demo ? (
    /* Démo : un gabarit de la hauteur d'un formulaire Stripe (l'artboard dit 820 px) pour éprouver le défilement. */
    demo.filler ? <div className="h-[51.25rem] rounded-md border-[1.5px] border-dashed border-border" aria-hidden="true" /> : null
  ) : (
    <EmbeddedCheckoutProvider stripe={stripe} options={{ clientSecret: start.clientSecret }}>
      <EmbeddedCheckout />
    </EmbeddedCheckoutProvider>
  );

  const errorActions = error ? (
    <div className="flex justify-end gap-space-2">
      <Button variant="secondary" onClick={onClose}>{fr.common.close}</Button>
      {retry ? <Button variant="primary" onClick={retry}>{fr.common.retry}</Button> : null}
    </div>
  ) : null;

  if (fullscreen) {
    if (!open) return null;
    return (
      <CheckoutFullScreen
        title={title}
        subtitle={many ? <MobileRecap lines={lines} amount={amount} /> : subtitle}
        onClose={onClose}
        inline={inline}
      >
        {error ? <div className="flex flex-col gap-space-4">{body}{errorActions}</div> : body}
      </CheckoutFullScreen>
    );
  }

  /* Plusieurs outils, avec une session à payer : la variante large à deux colonnes. Les autres états
     (préparation, erreur, `added`) gardent la disposition 520 — un récap sans formulaire n'apporte rien. */
  if (many && !error && !loading && start && !added) {
    return (
      <Modal
        open={open}
        inline={inline}
        size="lg"
        onClose={onClose}
        closeButton={false}
        dismissable={false}
        className="w-full max-w-wide gap-0 overflow-hidden p-0"
      >
        {/* La `Modal` enferme ses enfants dans `.ds-modal__desc` (colonne flex, gap `space-3`) : on en sort
            avec un seul enfant qui porte la grille. Plafond ~80 % de l'écran comme la disposition 520 ;
            chaque colonne défile pour elle-même. */}
        <div className="grid max-h-[80dvh] grid-cols-[var(--container-aside)_minmax(0,1fr)] text-foreground">
          <aside className="flex min-h-0 flex-col gap-space-5 overflow-y-auto border-r border-border bg-secondary p-space-6">
            <div className="flex flex-col gap-space-1">
              <h3 className="text-subheading text-foreground">{title}</h3>
              <span className="text-body-sm text-text-muted">{t.multiSubtitle}</span>
            </div>
            <Recap lines={lines} amount={amount} />
            <span className="mt-auto inline-flex items-center gap-space-2 text-caption text-text-muted">
              <Icon glyph={Lock} size="1rem" className="flex-none" />
              {t.secure}
            </span>
          </aside>
          <div className="flex min-h-0 flex-col">
            <header className="flex flex-none items-center justify-between gap-space-3 border-b border-border px-space-6 py-space-5">
              <span className="text-body-sm font-semibold text-text-secondary">{t.paymentHead}</span>
              <IconButton variant="ghost" label={fr.common.close} onClick={onClose} className="-my-space-2 -mr-space-2">
                <Icon name="x" size="1.125rem" />
              </IconButton>
            </header>
            <div className="min-h-0 flex-1 overflow-y-auto p-space-6">{body}</div>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      open={open}
      inline={inline}
      size="lg"
      onClose={onClose}
      /* Un clic à côté ne jette pas un paiement en cours de saisie : la croix reste le seul geste de fermeture. */
      dismissable={false}
      /* Artboard D2 : titre au palier `subheading` (22), sous-titre `body-sm` muted — la description de la Modal. */
      title={<span className="text-subheading">{title}</span>}
      description={subtitle}
      footer={error ? (
        <>
          <Button variant="secondary" onClick={onClose}>{fr.common.close}</Button>
          {retry ? <Button variant="primary" onClick={retry}>{fr.common.retry}</Button> : null}
        </>
      ) : undefined}
    >
      {/* Artboard D2 : la modale occupe ~80 % de la hauteur d'écran, en-tête fixe, corps défilant. La Modal du DS n'a
          pas de corps défilant (BACKLOG DS) : le cadre porte le plafond — 80dvh moins la hauteur du cadre de la modale
          (padding, en-tête, sous-titre, gaps : ~8,5 rem, mesuré). Valeur hors jeton admise (Julien, 13/09/2026). */}
      <div className="-mx-space-1 max-h-[calc(80dvh-8.5rem)] overflow-y-auto px-space-1">{body}</div>
    </Modal>
  );
}

/** Le récap des outils : une ligne par outil (lockup, quota, prix), filet, total par mois. */
function Recap({ lines, amount }: { lines: RecapLine[]; amount: number | null }): JSX.Element {
  const t = fr.parametres.abonnement.checkout;
  return (
    <div className="flex flex-col gap-space-3 text-body-sm">
      {lines.map(l => (
        <div key={l.id} className="flex items-start justify-between gap-space-4">
          <span className="flex min-w-0 flex-col">
            <ToolLabel name={l.name} className="text-foreground" />
            <span className="text-caption text-text-muted">{fr.tools.quotaPerMonth(l.tool?.monthlyQuota ?? null)}</span>
          </span>
          <span className="flex-none font-semibold text-foreground">{l.tool?.priceCents != null ? formatEuros(l.tool.priceCents) : fr.parametres.abonnement.priceUnknown}</span>
        </div>
      ))}
      <Separator />
      <div className="flex items-baseline justify-between gap-space-4">
        <span className="font-semibold text-foreground">{t.totalPerMonth}</span>
        <span className="font-display text-heading-sm font-bold text-foreground">{amount === null ? fr.parametres.abonnement.priceUnknown : formatEuros(amount)}</span>
      </div>
    </div>
  );
}

/**
 * Le récap REPLIÉ du plein écran mobile (artboard Hub-03-Abonnement-Paiement-Mobile) : la ligne
 * « 2 outils · 14 €/mois » dans l'en-tête, qui déplie le même récap qu'à gauche sur bureau. Un
 * `<details>` natif, stylé aux jetons — le DS n'a pas d'accordéon (BACKLOG DS).
 */
function MobileRecap({ lines, amount }: { lines: RecapLine[]; amount: number | null }): JSX.Element {
  const t = fr.parametres.abonnement.checkout;
  return (
    <details className="group text-body-sm text-text-muted">
      <summary className="flex cursor-pointer list-none items-center gap-space-2 [&::-webkit-details-marker]:hidden">
        <span>
          <span className="font-semibold text-foreground">{t.toolsCount(lines.length)}</span>
          {amount !== null ? ` · ${t.perMonth(formatEuros(amount))}` : null}
        </span>
        <Icon name="chevron-down" size="1rem" className="transition-transform duration-[var(--duration-fast)] group-open:rotate-180" aria-hidden="true" />
        <span className="sr-only">{t.showRecap}</span>
      </summary>
      <div className="pt-space-3">
        <Recap lines={lines} amount={amount} />
      </div>
    </details>
  );
}

interface CheckoutFullScreenProps {
  title: string;
  subtitle?: ReactNode;
  onClose: () => void;
  inline?: boolean;
  children: ReactNode;
}

/**
 * La page plein écran du paiement sur mobile (artboard D2b) : `fixed inset-0` au rang `--z-modal`,
 * fond `--card`, aucun voile. En-tête fixe sous la zone sûre (titre `heading-sm`, sous-titre
 * `body-sm` muted, croix à droite), corps `flex-1` qui défile seul — le bord bas de l'écran reste
 * visible. Échap ferme, le focus arrive sur la croix, le document ne défile plus derrière.
 */
function CheckoutFullScreen({ title, subtitle, onClose, inline, children }: CheckoutFullScreenProps): JSX.Element {
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
      className={cn('flex flex-col bg-card text-foreground', inline ? 'relative h-full min-h-full' : 'fixed inset-0 z-(--z-modal)')}
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
    </div>
  );
}
