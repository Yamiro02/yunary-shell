import type { JSX, ReactNode } from 'react';
import { Lock } from 'lucide-react';
import { Banner, Button, Checkbox, FormField, Icon, IconButton, Input, Modal, Select, Separator, Skeleton, Spinner, cn } from '@yunary/ds';
import { fr } from '../i18n/fr';
import { formatDateNumerique, formatEuros } from '../lib/format';
import { DS_MOBILE_QUERY, useMediaQuery } from '../lib/useMediaQuery';
import { ToolLabel } from '../layout/ToolLabel';
import { AmountRows } from './AmountRows';
import { BankConfirmOverlay } from './BankConfirmOverlay';
import { FullScreenSheet } from './FullScreenSheet';
import { CGV_URL, monthlyDay, payLabel, type BillingForm, type CardField, type FieldErrors, type PaymentRecap } from './payment';

/**
 * `preparing` : Stripe.js et les champs carte se chargent (squelettes à leur place finale, « Payer » inactif) ·
 * `ready` : saisie · `sending` : le paiement part (champs figés, « Paiement en cours… ») · `bank` : la 3D Secure
 * (la fenêtre de la banque est celle de Stripe, par-dessus) · `activating` : payé, on attend les droits.
 */
export type PaymentViewPhase = 'preparing' | 'ready' | 'sending' | 'bank' | 'activating';

export interface PaymentViewProps {
  open: boolean;
  onClose: () => void;
  recap: PaymentRecap;
  phase: PaymentViewPhase;
  form: BillingForm;
  onFormChange: (patch: Partial<BillingForm>) => void;
  errors?: FieldErrors;
  /** Un refus du serveur ou une panne : au-dessus de « Payer ». */
  banner?: string | null;
  countries: { value: string; label: string }[];
  /** Le contenu d'un champ carte : l'élément Stripe (conteneur), ou un faux champ (démo). */
  renderCard: (field: CardField, placeholder: string) => ReactNode;
  /** Le champ carte qui a le focus (l'iframe de Stripe ne le donne pas au conteneur). */
  cardFocus?: CardField | null;
  onPay: () => void;
  /** « Payer » inactif en plus des phases (paiement indisponible, paiement en attente de validation). */
  payDisabled?: boolean;
  /** Démo : force la disposition ; sinon, plein écran sous 64 rem. */
  layout?: 'desktop' | 'mobile';
  /** Démo : rendu dans le flux, sans voile ni `position: fixed`. */
  inline?: boolean;
}

/**
 * La fenêtre de paiement intégrée (artboards Hub-Paiement-*, 26/09/2026) — la VUE, pilotée par ses props.
 * - **bureau** : la `Modal` du DS à `--container-wide` (900 ; la maquette dit 920, écart validé le 23/09), deux
 *   colonnes. À gauche, `--container-aside` sur `--secondary` : titre, « Facturé chaque mois… », une ligne par
 *   outil (lockup, quota, prix), puis « À payer aujourd'hui » et « Prochain prélèvement » (`AmountRows`). À droite :
 *   « Paiement » et la croix, puis le formulaire, et « Payer » poussé en bas de la colonne (`mt-auto`) ;
 * - **mobile** (≤ 64 rem) : plein écran (`FullScreenSheet`), le récap en tête du corps, « Payer » dans le pied fixe.
 * Hauteur de la modale FIXE (80 % de l'écran, 940 px au plus) : rien ne saute entre préparation, saisie et refus.
 * Les champs carte sont des `.ds-input` du DS qui encadrent les iframes de Stripe (focus, erreur, désactivé par
 * les classes d'état du DS). Sous « Payer » : la mention de consentement, mot pour mot, lien « CGV ».
 */
export function PaymentView(props: PaymentViewProps): JSX.Element | null {
  const { open, onClose, recap, phase, layout, inline } = props;
  const isMobile = useMediaQuery(DS_MOBILE_QUERY);
  const mobile = layout ? layout === 'mobile' : isMobile;
  const busy = phase === 'sending' || phase === 'bank' || phase === 'activating';
  const close = busy ? () => undefined : onClose;
  const overlay = phase === 'bank' && recap.todayCents !== null ? <BankConfirmOverlay amountCents={recap.todayCents} /> : null;

  if (mobile) {
    if (!open) return null;
    return (
      <FullScreenSheet title={recap.title} subtitle={recap.subtitle} onClose={close} inline={inline} footer={<Actions {...props} mobile />}>
        <div className="flex flex-col gap-space-5">
          <MobileRecap recap={recap} />
          <PaymentForm {...props} mobile />
        </div>
        {overlay}
      </FullScreenSheet>
    );
  }

  return (
    <Modal
      open={open}
      inline={inline}
      size="lg"
      onClose={close}
      closeButton={false}
      /* Un clic à côté ne jette pas un paiement en cours de saisie : la croix reste le seul geste de fermeture. */
      dismissable={false}
      className="w-full max-w-wide gap-0 overflow-hidden p-0"
    >
      {/* La `Modal` enferme ses enfants dans `.ds-modal__desc` : un seul enfant porte la grille. Hauteur fixe
          (80dvh, plafond 58,75 rem = les 940 px de l'artboard) : valeurs hors jeton, comme la modale de paiement 0.3. */}
      <div className="relative grid h-[min(80dvh,58.75rem)] grid-cols-[var(--container-aside)_minmax(0,1fr)] text-left text-foreground">
        <aside className="flex min-h-0 flex-col gap-space-5 overflow-y-auto border-r border-border bg-secondary p-space-6">
          <div className="flex flex-col gap-space-2">
            <h3 className="text-subheading text-foreground">{recap.title}</h3>
            <span className="text-body-sm text-text-muted">{recap.subtitle}</span>
          </div>
          <RecapLines recap={recap} />
          <AmountRows rows={amountRows(recap)} />
        </aside>
        <div className="flex min-h-0 flex-col">
          <header className="flex flex-none items-center justify-between gap-space-3 border-b border-border px-space-6 py-space-5">
            <span className="text-body-sm font-semibold text-text-secondary">{fr.paiement.form.head}</span>
            <IconButton variant="ghost" label={fr.common.close} onClick={onClose} disabled={busy} className="-my-space-2 -mr-space-2">
              <Icon name="x" size="1.125rem" />
            </IconButton>
          </header>
          <div className="flex min-h-0 flex-1 flex-col gap-space-5 overflow-y-auto p-space-6">
            <PaymentForm {...props} />
            <div className="mt-auto">
              <Actions {...props} />
            </div>
          </div>
        </div>
        {overlay}
      </div>
    </Modal>
  );
}

/** Les lignes d'outils du récap : lockup, légende (quota, ou nom du pack), prix. */
function RecapLines({ recap, perMonth = false }: { recap: PaymentRecap; perMonth?: boolean }): JSX.Element {
  return (
    <div className="flex flex-col gap-space-4 text-body-sm">
      {recap.lines.map(l => (
        <div key={l.id} className="flex items-start justify-between gap-space-4">
          <span className="flex min-w-0 flex-col gap-space-1">
            <ToolLabel name={l.name} className="font-semibold text-foreground" />
            {l.caption ? <span className="text-caption text-text-secondary">{l.caption}</span> : null}
          </span>
          <span className="flex-none font-semibold text-foreground">
            {l.priceCents === null
              ? fr.parametres.abonnement.priceUnknown
              : perMonth && recap.kind === 'abonnement' ? fr.paiement.form.perMonth(formatEuros(l.priceCents)) : formatEuros(l.priceCents)}
          </span>
        </div>
      ))}
    </div>
  );
}

/** « À payer aujourd'hui » (mis en avant) et, pour un abonnement, « Prochain prélèvement le … · Puis le 27 de chaque mois ». */
function amountRows(recap: PaymentRecap) {
  const p = fr.paiement;
  const rows = [{ label: p.todayLabel, amountCents: recap.todayCents, highlight: true }];
  if (recap.next === null) return rows;
  return [
    ...rows,
    recap.next
      ? { label: p.nextCharge(formatDateNumerique(recap.next.date)), caption: p.form.thenMonthly(monthlyDay(recap.next.date)), amountCents: recap.next.cents }
      : { label: p.nextLabel, amountCents: null },
  ];
}

/** Le récap mobile (artboard Hub-Paiement-Mobile) : en tête du corps, filet dessous, montants en lignes nues. */
function MobileRecap({ recap }: { recap: PaymentRecap }): JSX.Element {
  return (
    <div className="-mx-space-5 -mt-space-4 flex flex-col gap-space-4 border-b border-border px-space-5 pb-space-5 pt-space-4">
      <RecapLines recap={recap} perMonth />
      <Separator />
      {amountRows(recap).map((row, i) => (
        <div key={i} className="flex items-center justify-between gap-space-4 text-body-sm">
          <span className="flex min-w-0 flex-col gap-space-1">
            <span className="font-bold text-foreground">{row.label}</span>
            {'caption' in row && row.caption ? <span className="text-caption text-text-secondary">{row.caption}</span> : null}
          </span>
          {row.amountCents === null
            ? <Skeleton width="3.5rem" height="1.25rem" />
            : <span className="whitespace-nowrap font-display text-heading-sm font-bold text-foreground">{formatEuros(row.amountCents)}</span>}
        </div>
      ))}
    </div>
  );
}

/** Un champ carte : le `.ds-input` du DS autour de l'iframe Stripe ; en préparation, un squelette à la même place. */
function CardBox({ label, error, focus, disabled, preparing, children }: {
  label: string;
  error?: string;
  focus: boolean;
  disabled: boolean;
  preparing: boolean;
  children: ReactNode;
}): JSX.Element {
  return (
    <FormField label={label} error={error}>
      <div className="relative">
        <div
          className={cn('ds-input flex items-center', focus && 'is-focus', error && 'is-error', disabled && 'is-disabled')}
          aria-invalid={error ? true : undefined}
        >
          <div className={cn('min-w-0 flex-1', preparing && 'invisible')}>{children}</div>
        </div>
        {preparing ? <Skeleton width="100%" height="100%" radius="calc(var(--control-md) / 3)" className="absolute inset-0" /> : null}
      </div>
    </FormField>
  );
}

function PaymentForm({ phase, form, onFormChange, errors = {}, countries, renderCard, cardFocus = null, mobile = false }: PaymentViewProps & { mobile?: boolean }): JSX.Element {
  const t = fr.paiement.form;
  const preparing = phase === 'preparing';
  const locked = phase === 'sending' || phase === 'bank' || phase === 'activating';
  const card = (field: CardField, label: string, placeholder: string) => (
    <CardBox label={label} error={errors[field]} focus={cardFocus === field} disabled={locked} preparing={preparing}>
      {renderCard(field, placeholder)}
    </CardBox>
  );
  /* Artboards : 92 px d'un libellé au suivant = libellé + champ + `space-4` (le palier de la maquette). */
  return (
    <div className="flex flex-col gap-space-4">
      {/* Même hauteur pour le titre et la ligne de préparation : rien ne bouge quand les champs arrivent. */}
      <div className="flex h-space-6 items-center">
        {preparing ? (
          <span className="flex items-center gap-space-3 text-body-sm text-text-secondary" role="status">
            <Spinner size="sm" />
            {t.preparing}
          </span>
        ) : (
          <h4 className="text-body font-bold text-foreground">{t.cardTitle}</h4>
        )}
      </div>
      <FormField label={t.name} htmlFor="paiement-nom" error={errors.name}>
        <Input
          id="paiement-nom"
          autoComplete="cc-name"
          placeholder={t.namePlaceholder}
          value={form.name}
          invalid={!!errors.name}
          disabled={locked}
          onChange={e => onFormChange({ name: e.target.value })}
        />
      </FormField>
      {card('number', t.number, t.numberPlaceholder)}
      <div className="grid grid-cols-2 gap-space-4">
        {card('expiry', t.expiry, t.expiryPlaceholder)}
        {card('cvc', t.cvc, mobile ? t.cvcPlaceholderShort : t.cvcPlaceholder)}
      </div>
      <FormField label={t.country} htmlFor="paiement-pays" error={errors.country}>
        <Select
          id="paiement-pays"
          autoComplete="country"
          options={countries}
          value={form.country}
          invalid={!!errors.country}
          disabled={locked}
          onChange={e => onFormChange({ country: e.target.value })}
        />
      </FormField>
      <div className="flex flex-col gap-space-1">
        <Checkbox label={t.addAddress} checked={form.withAddress} disabled={locked} onChange={e => onFormChange({ withAddress: e.target.checked })} />
        {/* L'aide s'aligne sous le libellé : la case (`--choice-box`) + l'écart de `.ds-choice` (0,5625 rem, valeur du DS). */}
        <span className="pl-[calc(var(--choice-box)+0.5625rem)] text-caption text-text-secondary">{t.addAddressHelp}</span>
      </div>
      {form.withAddress ? (
        <>
          <FormField label={<>{t.company}<span className="font-normal text-text-muted">{t.optional}</span></>} htmlFor="paiement-entreprise">
            <Input id="paiement-entreprise" autoComplete="organization" value={form.company} disabled={locked} onChange={e => onFormChange({ company: e.target.value })} />
          </FormField>
          <FormField label={t.line1} htmlFor="paiement-adresse" error={errors.line1}>
            <Input id="paiement-adresse" autoComplete="address-line1" placeholder={t.line1Placeholder} value={form.line1} invalid={!!errors.line1} disabled={locked} onChange={e => onFormChange({ line1: e.target.value })} />
          </FormField>
          {/* Artboard Hub-Paiement-Adresse : code postal à un tiers, ville aux deux tiers. */}
          <div className="grid grid-cols-[1fr_2fr] gap-space-4">
            <FormField label={t.postalCode} htmlFor="paiement-cp" error={errors.postalCode}>
              <Input id="paiement-cp" autoComplete="postal-code" placeholder={t.postalCodePlaceholder} value={form.postalCode} invalid={!!errors.postalCode} disabled={locked} onChange={e => onFormChange({ postalCode: e.target.value })} />
            </FormField>
            <FormField label={t.city} htmlFor="paiement-ville" error={errors.city}>
              <Input id="paiement-ville" autoComplete="address-level2" placeholder={t.cityPlaceholder} value={form.city} invalid={!!errors.city} disabled={locked} onChange={e => onFormChange({ city: e.target.value })} />
            </FormField>
          </div>
        </>
      ) : null}
    </div>
  );
}

/** « Payer 9 € », la mention de consentement (mot pour mot, lien « CGV »), puis « Paiement sécurisé par Stripe ». */
function Actions({ recap, phase, banner, onPay, payDisabled = false, mobile = false }: PaymentViewProps & { mobile?: boolean }): JSX.Element {
  const t = fr.paiement.form;
  const busy = phase === 'sending' || phase === 'bank' || phase === 'activating';
  const label = phase === 'bank' ? fr.paiement.bank.cta
    : phase === 'sending' ? fr.paiement.paying
      : phase === 'activating' ? t.activating
        : payLabel(recap.todayCents);
  const consent = t.consent[recap.kind];
  return (
    <div className="flex flex-col gap-space-3">
      {banner ? <Banner tone="danger">{banner}</Banner> : null}
      <div className={cn('flex', mobile ? 'flex-col' : 'justify-start')}>
        <Button
          variant="primary"
          loading={busy}
          disabled={busy || payDisabled || phase === 'preparing' || recap.todayCents === null}
          onClick={onPay}
          className={mobile ? 'w-full' : undefined}
        >
          {label}
        </Button>
      </div>
      <p className="text-caption text-text-muted">
        {consent.before}
        <a href={CGV_URL} target="_blank" rel="noopener noreferrer" className="text-text-secondary underline underline-offset-2 hover:text-foreground">{consent.link}</a>
        {consent.after}
      </p>
      <span className="inline-flex items-center justify-center gap-space-2 text-caption text-text-muted">
        <Icon glyph={Lock} size="1rem" className="flex-none" />
        {t.secure}
      </span>
    </div>
  );
}
