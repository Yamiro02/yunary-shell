import { useState, type JSX, type ReactNode } from 'react';
import { Button } from '@yunary/ds';
import {
  EMPTY_BILLING, PaymentView, countryOptions, paymentRecap,
  type BillingForm, type CardField, type FieldErrors, type PaymentTarget, type PaymentViewPhase,
} from '@yunary/shell';
import { CATALOG } from '../fixtures';
import { Section } from '../ui';

const noop = () => undefined;
/* Ce que l'aperçu `preview-subscription-change` rend sans abonnement vivant : aucun montant n'est calculé côté front. */
const preview = (cents: number) => ({
  checkoutRequis: true, aPayerAujourdhui: cents, detail: [], prochainPrelevement: { date: '2026-10-27T10:00:00Z', montant: cents },
  carte: null, fin: 'aucune' as const, abonnement: null,
});
const ONE: PaymentTarget = { tool: 'analyse' };
const TWO: PaymentTarget = { tools: ['analyse', 'audit'] };
const PACK: PaymentTarget = { pack: 'analyse-20' };
const recapOf = (target: PaymentTarget) => paymentRecap(target, CATALOG, target.pack ? undefined : preview(target.tools ? 1400 : 900));
const TYPED: Record<CardField, string> = { number: '4000 0000 0000 0002', expiry: '08 / 28', cvc: '•••' };
const FILLED: BillingForm = { ...EMPTY_BILLING, name: 'Julien Fernandes' };

/**
 * Un faux champ carte : la vitrine ne charge pas Stripe.js. Le vrai champ est une iframe de Stripe dans le même
 * `.ds-input`, écrite en `--font-mono` à la taille du champ, placeholder en `--text-muted` (style lu dans les jetons).
 */
function fakeCard(values?: Partial<Record<CardField, string>>) {
  return function FakeCard(field: CardField, placeholder: string): ReactNode {
    const value = values?.[field];
    return <span className={value ? 'font-mono text-foreground' : 'font-mono text-text-muted'}>{value ?? placeholder}</span>;
  };
}

function View({ target, phase = 'ready', form = EMPTY_BILLING, values, errors, banner, layout = 'desktop' }: {
  target: PaymentTarget;
  phase?: PaymentViewPhase;
  form?: BillingForm;
  values?: Partial<Record<CardField, string>>;
  errors?: FieldErrors;
  banner?: string;
  layout?: 'desktop' | 'mobile';
}): JSX.Element {
  const [state, setState] = useState(form);
  return (
    <PaymentView
      open
      inline
      layout={layout}
      onClose={noop}
      recap={recapOf(target)}
      phase={phase}
      form={state}
      onFormChange={patch => setState(f => ({ ...f, ...patch }))}
      errors={errors}
      banner={banner}
      countries={countryOptions()}
      renderCard={fakeCard(values)}
      onPay={noop}
    />
  );
}

/** La fenêtre de paiement intégrée (0.5.0) : un cadre par artboard Hub-Paiement-*, puis les états hors maquette. */
export function PaymentWindowSections(): JSX.Element {
  return (
    <>
      <Section
        title="PaymentModal · la fenêtre de paiement intégrée (Hub-Paiement-*)"
        note="0.5.0 — remplace le Checkout Stripe embarqué. Trois champs carte Stripe séparés dans des `.ds-input` du DS (ici des faux champs : la vitrine ne charge pas Stripe.js), pays obligatoire, adresse facultative. « Payer » crée le paiement (`create-payment`, qui vaut acceptation des CGV) puis le confirme ; un refus s'affiche sous son champ et le clic suivant réessaie le même paiement. Hauteur fixe : rien ne saute d'un état à l'autre. Tu peux cocher « Ajouter une adresse » dans chaque cadre."
      >
        <ArtboardFrame id="Hub-Paiement-Preparation-1outil"><View target={ONE} phase="preparing" /></ArtboardFrame>
        <ArtboardFrame id="Hub-Paiement-Pret-1outil"><View target={ONE} /></ArtboardFrame>
        <ArtboardFrame id="Hub-Paiement-Adresse-1outil"><View target={ONE} form={{ ...EMPTY_BILLING, withAddress: true, company: 'Studio Fernandes' }} /></ArtboardFrame>
        <ArtboardFrame id="Hub-Paiement-Envoi-1outil"><View target={ONE} phase="sending" form={FILLED} values={TYPED} /></ArtboardFrame>
        <ArtboardFrame id="Hub-Paiement-Refus-1outil">
          <View target={ONE} form={FILLED} values={TYPED} errors={{ number: 'Ta carte a été refusée. Essaie une autre carte ou appelle ta banque.' }} />
        </ArtboardFrame>
        <ArtboardFrame id="Hub-Paiement-3DS-1outil"><View target={ONE} phase="bank" form={FILLED} values={TYPED} /></ArtboardFrame>
        <ArtboardFrame id="Hub-Paiement-Preparation-2outils"><View target={TWO} phase="preparing" /></ArtboardFrame>
        <ArtboardFrame id="Hub-Paiement-Pret-2outils"><View target={TWO} /></ArtboardFrame>
        <div className="flex flex-wrap gap-space-5">
          <PhoneArtboard id="Hub-Paiement-Mobile"><View target={ONE} layout="mobile" /></PhoneArtboard>
          <PhoneArtboard id="Mobile · 2 outils (hors maquette)"><View target={TWO} layout="mobile" /></PhoneArtboard>
          <PhoneArtboard id="Mobile · pack (hors maquette)"><View target={PACK} layout="mobile" /></PhoneArtboard>
        </div>
      </Section>

      <Section title="PaymentModal · états hors maquette" note="Le pack (même fenêtre, « Paiement unique, sans abonnement. », pas de prochain prélèvement, mention « pack »), les erreurs de saisie posées avant tout appel, un refus du serveur (message au-dessus de « Payer », le bouton reste le geste pour réessayer), et `payment_processing` (on attend les droits, jamais de nouveau paiement).">
        <ArtboardFrame id="Pack · prêt"><View target={PACK} /></ArtboardFrame>
        <ArtboardFrame id="Erreurs de saisie">
          <View
            target={ONE}
            form={{ ...EMPTY_BILLING, withAddress: true, line1: '12 rue des Lilas' }}
            errors={{ name: 'Indique le nom sur la carte.', number: 'Le numéro de carte est incomplet.', expiry: "La date d'expiration est incomplète.", cvc: 'Le code de sécurité est incomplet.', postalCode: 'Indique le code postal.', city: 'Indique la ville.' }}
          />
        </ArtboardFrame>
        <ArtboardFrame id="Refus du serveur (already_subscribed)">
          <View target={ONE} form={FILLED} values={TYPED} banner="Cet outil est déjà dans ton abonnement." />
        </ArtboardFrame>
        <ArtboardFrame id="Paiement en cours de validation (payment_processing)">
          <View target={ONE} phase="activating" form={FILLED} values={TYPED} banner="Ton paiement est en cours de validation. Tes outils s'activent dès qu'il est confirmé, inutile de payer à nouveau." />
        </ArtboardFrame>
        <LiveDemo />
      </Section>
    </>
  );
}

/* La vraie disposition : modale sur bureau (> 64 rem), plein écran sur mobile (≤ 64 rem). Redimensionne la fenêtre. */
function LiveDemo(): JSX.Element {
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<PaymentViewPhase>('preparing');
  const [form, setForm] = useState(EMPTY_BILLING);
  return (
    <div className="flex flex-col gap-space-3">
      <span className="eyebrow">En vrai (voile, croix, disposition selon la largeur)</span>
      <div className="flex">
        <Button variant="primary" onClick={() => { setPhase('preparing'); setOpen(true); window.setTimeout(() => setPhase('ready'), 1200); }}>Ouvrir la fenêtre de paiement</Button>
      </div>
      <PaymentView
        open={open}
        onClose={() => setOpen(false)}
        recap={recapOf(ONE)}
        phase={phase}
        form={form}
        onFormChange={patch => setForm(f => ({ ...f, ...patch }))}
        countries={countryOptions()}
        renderCard={fakeCard()}
        onPay={() => { setPhase('sending'); window.setTimeout(() => setPhase('ready'), 1500); }}
      />
    </div>
  );
}

/* 1100 × 1060 comme l'artboard : la modale s'y rend en `inline`, centrée comme sous son voile. */
function ArtboardFrame({ id, children }: { id: string; children: ReactNode }): JSX.Element {
  return (
    <div className="flex flex-col gap-space-3">
      <span className="eyebrow">{id}</span>
      <div data-artboard={id} className="flex h-[66.25rem] w-[68.75rem] max-w-full items-center justify-center overflow-hidden rounded-xl border border-border bg-background">
        {children}
      </div>
    </div>
  );
}

/* 390 × 955 comme l'artboard Hub-Paiement-Mobile : la page plein écran s'y rend en `inline`. */
function PhoneArtboard({ id, children }: { id: string; children: ReactNode }): JSX.Element {
  return (
    <div className="flex flex-col gap-space-3">
      <span className="eyebrow">{id}</span>
      <div data-artboard={id} className="relative h-[59.6875rem] w-[24.375rem] overflow-hidden rounded-xl border border-border shadow-md">{children}</div>
    </div>
  );
}
