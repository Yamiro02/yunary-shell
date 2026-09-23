import { useState, type JSX, type ReactNode } from 'react';
import { Button } from '@yunary/ds';
import {
  AbonnementView, CancelSubscriptionModal, CheckoutActivationCard, CheckoutModal, DeleteAccountModal, InfosView, LegalView,
  NotificationsView, ParametresLayout, PasswordModal, PaymentFailedBannerView, TabError, TabSkeleton,
  type ParametresTab,
} from '@yunary/shell';
import {
  CATALOG, SUB_ACTIVE, SUB_ENDING, SUB_PAST_DUE, SUMMARIES_ENDING, SUMMARIES_FREE, SUMMARIES_SUBSCRIBED, SUMMARIES_WITH_PACK,
} from '../fixtures';
import { Section } from '../ui';

const noop = () => undefined;
const never = () => new Promise<void>(() => undefined);
const PROFILE = { prenom: 'Julien', nom: 'Fernandes', email: 'julien@julienfernandes.com', avatarUrl: null };

/* C2-C5 : chaque onglet dans la page, en repos ; puis les états chargement / erreur, les modales, le checkout. */
export function ParametresPage(): JSX.Element {
  const [tab, setTab] = useState<ParametresTab>('infos');
  return (
    <div className="flex flex-col gap-space-7">
      <Section title="Paramètres" note="Artboards C2 à C5 (11/09) : « Comptes connectés » en subheading, rangées en filet 1,5 px, titre d'abonnement en 800 ; padding des cartes gardé à 24. Change d'onglet ici comme dans l'app ; les données sont des fixtures. Plus de variante native depuis 0.3.0.">
        <Frame>
          <ParametresLayout tab={tab} onTabChange={setTab}>
            {tab === 'infos' ? <InfosView profile={PROFILE} reseau={{ platform: 'instagram', handle: 'julien.crea' }} onSave={noop} saveState="saved" onChoosePhoto={noop} onRemovePhoto={noop} onChangePassword={noop} onLogout={noop} /> : null}
            {tab === 'notifications' ? <NotificationsView prefs={{ analyse_terminee: true, nouveaux_templates: true }} onToggle={noop} /> : null}
            {tab === 'abonnement' ? <AbonnementView subscription={SUB_ACTIVE} entitlements={SUMMARIES_SUBSCRIBED} catalog={CATALOG} toolsHref="/outils" onPortal={noop} onCancel={noop} onResume={noop} /> : null}
            {tab === 'legal' ? <LegalView onDelete={noop} /> : null}
          </ParametresLayout>
        </Frame>
      </Section>

      <Section title="Infos · autres états" note="Réseau absent, enregistrement en cours, erreur photo.">
        <Frame>
          <InfosView profile={{ ...PROFILE, avatarUrl: null }} reseau={null} onSave={noop} saveState="saving" photoError="Image trop lourde : 2 Mo maximum." onChoosePhoto={noop} onRemovePhoto={noop} onChangePassword={noop} onLogout={noop} />
        </Frame>
      </Section>

      <Section title="Abonnement · les six états" note="0.3.0 — un abonnement Stripe par client, un article par outil, packs en achat unique. L'onglet montre trois choses et rien d'autre : la ligne d'abonnement (statut, échéance, résiliation), les outils (nom lu en base, source Inclus / Abonnement / Pack, quota utilisé / total, échéance) et « Gérer mes outils » vers la page des outils du hub. 🔒 Aucun prix ni chiffre d'offre dans la coque. Les noms viennent du catalogue (fixture `CATALOG`, valeurs de la base).">
        <div className="flex flex-col gap-space-5">
          <Frame label="Gratuit · jamais abonné : droits « Inclus » (1 / 1 audit, 2 / 5 analyses)">
            <AbonnementView subscription={null} entitlements={SUMMARIES_FREE} catalog={CATALOG} toolsHref="/outils" onPortal={noop} onCancel={noop} onResume={noop} />
          </Frame>
          <Frame label="Abonné à Analyse · 12 / 50 · renouvelé le 23 octobre">
            <AbonnementView subscription={SUB_ACTIVE} entitlements={SUMMARIES_SUBSCRIBED} catalog={CATALOG} toolsHref="/outils" onPortal={noop} onCancel={noop} onResume={noop} />
          </Frame>
          <Frame label="Abonnement épuisé + pack : le résumé montre le pack (3 / 20), celui que le serveur consomme">
            <AbonnementView subscription={SUB_ACTIVE} entitlements={SUMMARIES_WITH_PACK} catalog={CATALOG} toolsHref="/outils" onPortal={noop} onCancel={noop} onResume={noop} />
          </Frame>
          <Frame label="Outil retiré, gardé jusqu'à la fin de période (`ends_at_period_end`) : « Se termine le … »">
            <AbonnementView subscription={SUB_ACTIVE} entitlements={SUMMARIES_ENDING} catalog={CATALOG} toolsHref="/outils" onPortal={noop} onCancel={noop} onResume={noop} />
          </Frame>
          <Frame label="Résiliation complète en cours de période · « Réactiver mon abonnement »">
            <AbonnementView subscription={SUB_ENDING} entitlements={SUMMARIES_SUBSCRIBED} catalog={CATALOG} toolsHref="/outils" onPortal={noop} onCancel={noop} onResume={noop} />
          </Frame>
          <Frame label="Paiement en échec (past_due) : le bandeau (rendu par AppLayout en haut de l'app), rien d'autre ne change">
            <div className="flex flex-col gap-space-5">
              <PaymentFailedBannerView onPortal={noop} />
              <AbonnementView subscription={SUB_PAST_DUE} entitlements={SUMMARIES_SUBSCRIBED} catalog={CATALOG} toolsHref="/outils" onPortal={noop} onCancel={noop} onResume={noop} />
            </div>
          </Frame>
          <Frame label="Catalogue pas encore lu : l'identifiant de l'outil en attendant son nom">
            <AbonnementView subscription={SUB_ACTIVE} entitlements={SUMMARIES_SUBSCRIBED} toolsHref="/outils" onPortal={noop} onCancel={noop} onResume={noop} />
          </Frame>
        </div>
      </Section>

      <Section title="Retour de Stripe · activation" note="`?checkout=<session_id>` dans l'URL : l'onglet cède la place à cette carte. Sonde de `tool_entitlements` chaque seconde, 20 s au plus (le droit précis si `?tool=` ou `?pack=` est là) ; pendant ce temps la sidebar dit « Activation en cours… », jamais « Gratuit ». Passé 20 s : le message calme — le paiement a réussi, pas d'erreur rouge.">
        <div className="grid grid-cols-1 gap-space-5 xl:grid-cols-3">
          <Frame label="pending"><CheckoutActivationCard state="pending" onContinue={noop} /></Frame>
          <Frame label="active"><CheckoutActivationCard state="active" onContinue={noop} /></Frame>
          <Frame label="late (20 s)"><CheckoutActivationCard state="late" onContinue={noop} /></Frame>
        </div>
      </Section>

      <Section title="Chargement et erreur d'onglet">
        <div className="grid grid-cols-1 gap-space-5 xl:grid-cols-2">
          <Frame><TabSkeleton /></Frame>
          <Frame><TabError message="Impossible de charger tes infos." onRetry={noop} /></Frame>
        </div>
      </Section>

      <Section title="Modales" note="Mot de passe (saisie) · suppression de compte (saisie, puis résultat d'erreur). Sans pastille depuis 0.1.9 : le titre partage la ligne de la croix (DS 0.1.4), « Annuler » en secondary.">
        <div className="grid grid-cols-1 gap-space-5 xl:grid-cols-3">
          <Frame><PasswordModal open inline onClose={noop} onSubmit={never} /></Frame>
          <Frame><DeleteAccountModal open inline onClose={noop} onConfirm={never} /></Frame>
          <Frame><DeleteAccountModal open inline onClose={noop} onConfirm={never} phase="result" result={{ status: 'error', message: 'La suppression du compte a échoué. Réessaie.', onRetry: noop }} /></Frame>
        </div>
      </Section>

      <Section title="Checkout Stripe · en vrai" note="Ouvre le composant tel qu'une app le monte : modale sur bureau (> 64 rem), page plein écran sur mobile (≤ 64 rem) — redimensionne la fenêtre. Session factice, Stripe.js non chargé : le cadre du formulaire est vide, mais le plafond, l'en-tête fixe et le défilement sont les vrais.">
        <CheckoutLive />
      </Section>

      <Section title="Checkout Stripe · bureau (artboard D2)" note="La Modal lg du DS (520 px) plafonnée à ~80 % de la hauteur d'écran, en-tête fixe « S'abonner à Yunary Analyse » + « 9 €/mois » (nom et montant du catalogue, puis de l'Edge), corps défilant. Préparation, erreur (fermer / réessayer), session prête — ici sans Stripe.js — et `mode: 'added'` (abonnement vivant : l'outil est ajouté au prorata, rien à payer ici).">
        <div className="grid grid-cols-1 gap-space-5 xl:grid-cols-2">
          <Frame label="Préparation"><CheckoutModal open inline onClose={noop} target={{ tool: 'analyse' }} demo={{ layout: 'modal', loading: true, catalog: CATALOG }} /></Frame>
          <Frame label="Erreur"><CheckoutModal open inline onClose={noop} target={{ tool: 'analyse' }} demo={{ layout: 'modal', error: "Impossible d'ouvrir le paiement. Réessaie.", catalog: CATALOG }} /></Frame>
          <Frame label="Session prête (Stripe non chargé)"><CheckoutModal open inline onClose={noop} target={{ tool: 'analyse' }} demo={{ layout: 'modal', catalog: CATALOG, start: { mode: 'checkout', clientSecret: 'cs_test_demo', amountCents: 900, tool: 'analyse' } }} /></Frame>
          <Frame label="Ajouté au prorata (`mode: 'added'`)"><CheckoutModal open inline onClose={noop} target={{ tool: 'analyse' }} demo={{ layout: 'modal', catalog: CATALOG, start: { mode: 'added', tool: 'analyse', amountCents: 900 } }} /></Frame>
        </div>
      </Section>

      <Section title="Checkout Stripe · mobile plein écran (artboard D2b)" note="Sous 64 rem, ce n'est plus une modale : la page occupe tout l'écran, aucun voile, en-tête fixe (titre, sous-titre, croix), zone Stripe qui défile, bord bas visible — exception assumée au traitement modal du DS : payer isole complètement (Julien, 13/09/2026). Cadres à 390 × 844 pour la vitrine. Le pack : son nom en titre, « 15 €, en une fois ».">
        <div className="flex flex-wrap gap-space-5">
          <PhoneFrame label="Préparation · outil"><CheckoutModal open inline onClose={noop} target={{ tool: 'analyse' }} demo={{ layout: 'fullscreen', loading: true, catalog: CATALOG }} /></PhoneFrame>
          <PhoneFrame label="Erreur"><CheckoutModal open inline onClose={noop} target={{ tool: 'analyse' }} demo={{ layout: 'fullscreen', error: "Impossible d'ouvrir le paiement. Réessaie.", catalog: CATALOG }} /></PhoneFrame>
          <PhoneFrame label="Session prête · pack"><CheckoutModal open inline onClose={noop} target={{ pack: 'analyse-20' }} demo={{ layout: 'fullscreen', catalog: CATALOG, start: { mode: 'checkout', clientSecret: 'cs_test_demo', amountCents: 1500, tool: 'analyse', pack: 'analyse-20' } }} /></PhoneFrame>
        </div>
      </Section>

      <Section title="Modale de résiliation" note="Résiliation COMPLÈTE (tous les outils) en une étape, au texte exact ; puis le résultat. Retirer un seul outil se fait sur la page des outils du hub (`useRemoveTool`).">
        <div className="grid grid-cols-1 gap-space-5 xl:grid-cols-2">
          <Frame label="Se désabonner ?"><CancelSubscriptionModal open inline onClose={noop} onConfirm={never} periodEnd="2026-10-23T10:00:00Z" /></Frame>
          <Frame label="Résiliation · résultat"><CancelSubscriptionModal open inline onClose={noop} onConfirm={never} periodEnd="2026-10-23T10:00:00Z" phase="result" result={{ status: 'success', title: 'Abonnement résilié', message: "Tu gardes l'accès jusqu'au 23 octobre 2026." }} /></Frame>
        </div>
      </Section>
    </div>
  );
}

/* La modale / page réelle, ouverte par un bouton — avec un faux contenu de la hauteur d'un formulaire Stripe (~820 px) pour éprouver le défilement. */
function CheckoutLive(): JSX.Element {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex flex-col gap-space-4">
      <div className="flex"><Button variant="primary" onClick={() => setOpen(true)}>Ouvrir le checkout</Button></div>
      <CheckoutModal open={open} onClose={() => setOpen(false)} target={{ tool: 'analyse' }} demo={{ catalog: CATALOG, start: { mode: 'checkout', clientSecret: 'cs_test_demo', amountCents: 900, tool: 'analyse' }, filler: true }} />
    </div>
  );
}

/* Un téléphone de 390 × 844 (l'artboard D2b) : la page plein écran s'y rend en `inline`, sans `position: fixed`. */
function PhoneFrame({ label, children }: { label: string; children: ReactNode }): JSX.Element {
  return (
    <div className="flex flex-col gap-space-3">
      <span className="eyebrow">{label}</span>
      <div className="h-[52.75rem] w-[24.375rem] overflow-hidden rounded-xl border border-border shadow-md">{children}</div>
    </div>
  );
}

function Frame({ label, children }: { label?: string; children: ReactNode }): JSX.Element {
  return (
    <div className="flex flex-col gap-space-3 rounded-xl border border-border bg-background p-space-6">
      {label ? <span className="eyebrow">{label}</span> : null}
      {children}
    </div>
  );
}
