import { useState, type JSX, type ReactNode } from 'react';
import {
  AbonnementView, CancelSubscriptionModal, CheckoutActivationCard, CheckoutModal, DeleteAccountModal, InfosView, LegalView,
  NotificationsView, ParametresLayout, PasswordModal, PaymentFailedBannerView, TabError, TabSkeleton, planFor,
  type ParametresTab, type ParametresVariant,
} from '@yunary/shell';
import { CATALOG, CATALOG_SOLD_OUT, CREDITS, CREDITS_LOW, CREDITS_PAID, CREDITS_ZERO, SUB_ACTIVE, SUB_ENDING, SUB_PAST_DUE } from '../fixtures';
import { Section } from '../ui';

const noop = () => undefined;
const never = () => new Promise<void>(() => undefined);
const PROFILE = { prenom: 'Julien', nom: 'Fernandes', email: 'julien@julienfernandes.com', avatarUrl: null };

/* C2-C5 : chaque onglet dans la page, en repos ; puis les états chargement / erreur, la variante native, les modales. */
export function ParametresPage(): JSX.Element {
  const [tab, setTab] = useState<ParametresTab>('infos');
  return (
    <div className="flex flex-col gap-space-7">
      <Section title="Paramètres · web" note="Artboards C2 à C5 (11/09) : « Comptes connectés » en subheading, rangées et cartes de formule en filet 1,5 px, nom / solde / prix en 800, recommandée en shadow-md ; padding des cartes gardé à 24. Change d'onglet ici comme dans l'app ; les données sont des fixtures.">
        <Frame>
          <ParametresLayout variant="web" tab={tab} onTabChange={setTab}>
            {tab === 'infos' ? <InfosView profile={PROFILE} reseau={{ platform: 'instagram', handle: 'julien.crea' }} onSave={noop} saveState="saved" onChoosePhoto={noop} onRemovePhoto={noop} onChangePassword={noop} onLogout={noop} /> : null}
            {tab === 'notifications' ? <NotificationsView prefs={{ analyse_terminee: true, nouveaux_templates: true }} onToggle={noop} /> : null}
            {tab === 'abonnement' ? <AbonnementView credits={CREDITS} plan={planFor('free')} subscription={null} catalog={CATALOG} onPortal={noop} onChoose={noop} onCancel={noop} onResume={noop} /> : null}
            {tab === 'legal' ? <LegalView onDelete={noop} /> : null}
          </ParametresLayout>
        </Frame>
      </Section>

      <Section title="Infos · autres états" note="Réseau absent, enregistrement en cours, erreur photo.">
        <Frame>
          <InfosView profile={{ ...PROFILE, avatarUrl: null }} reseau={null} onSave={noop} saveState="saving" photoError="Image trop lourde : 2 Mo maximum." onChoosePhoto={noop} onRemovePhoto={noop} onChangePassword={noop} onLogout={noop} />
        </Frame>
      </Section>

      <Section title="Abonnement · les six états" note="0.2.0 — deux offres, prix et allocations lus en base (fixtures `CATALOG` : Créateur 19 € plein, 12 € fondateur, 300 crédits/mois ; Gratuite 0). Sans abonnement : solde seul, « Crédits offerts à l'inscription, non renouvelés », tarif fondateur avec les places restantes. Actif : barre sur l'allocation, « Recharge le… », « Se désabonner » sous la ligne de recharge. Résilié : « Se termine le… » + « Réactiver mon abonnement ». past_due : le bandeau (rendu par AppLayout en haut de l'app, ici au-dessus de la vue), rien d'autre ne change. Crédits à zéro. Places épuisées : le prix plein seul.">
        <div className="flex flex-col gap-space-5">
          <Frame label="Sans abonnement · fondateur">
            <AbonnementView credits={CREDITS} plan={planFor('free')} subscription={null} catalog={CATALOG} onPortal={noop} onChoose={noop} onCancel={noop} onResume={noop} />
          </Frame>
          <Frame label="Abonnement actif">
            <AbonnementView credits={CREDITS_PAID} plan={planFor('createur')} subscription={SUB_ACTIVE} catalog={CATALOG} onPortal={noop} onChoose={noop} onCancel={noop} onResume={noop} />
          </Frame>
          <Frame label="Résilié en cours de période">
            <AbonnementView credits={CREDITS_PAID} plan={planFor('createur')} subscription={SUB_ENDING} catalog={CATALOG} onPortal={noop} onChoose={noop} onCancel={noop} onResume={noop} />
          </Frame>
          <Frame label="Paiement en échec (past_due)">
            <div className="flex flex-col gap-space-5">
              <PaymentFailedBannerView onPortal={noop} />
              <AbonnementView credits={CREDITS_LOW} plan={planFor('createur')} subscription={SUB_PAST_DUE} catalog={CATALOG} onPortal={noop} onChoose={noop} onCancel={noop} onResume={noop} />
            </div>
          </Frame>
          <Frame label="Crédits à zéro (gratuit)">
            <AbonnementView credits={CREDITS_ZERO} plan={planFor('free')} subscription={null} catalog={CATALOG} onPortal={noop} onChoose={noop} onCancel={noop} onResume={noop} />
          </Frame>
          <Frame label="Places épuisées · prix plein seul">
            <AbonnementView credits={CREDITS} plan={planFor('free')} subscription={null} catalog={CATALOG_SOLD_OUT} onPortal={noop} onChoose={noop} onCancel={noop} onResume={noop} />
          </Frame>
          <Frame label="Catalogue pas encore lu · « — € »">
            <AbonnementView credits={CREDITS} plan={planFor('free')} subscription={null} onPortal={noop} onChoose={noop} onCancel={noop} onResume={noop} />
          </Frame>
        </div>
      </Section>

      <Section title="Retour de Stripe · activation" note="`?checkout=<session_id>` dans l'URL : l'onglet cède la place à cette carte. Sonde de `subscriptions` chaque seconde, 20 s au plus ; pendant ce temps la sidebar dit « Activation en cours… », jamais « Formule Gratuite ». Passé 20 s : le message calme — le paiement a réussi, pas d'erreur rouge.">
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

      <Section title="Paramètres · natif" note="Creator sous Capacitor : Infos sans photo ni réseau, Légal, pas d'Abonnement ; slot `extra` pour la clé de partage.">
        <NativeDemo />
      </Section>

      <Section title="Modales" note="Mot de passe (saisie) · suppression de compte (saisie, puis résultat d'erreur). Sans pastille depuis 0.1.9 : le titre partage la ligne de la croix (DS 0.1.4), « Annuler » en secondary.">
        <div className="grid grid-cols-1 gap-space-5 xl:grid-cols-3">
          <Frame><PasswordModal open inline onClose={noop} onSubmit={never} /></Frame>
          <Frame><DeleteAccountModal open inline onClose={noop} onConfirm={never} /></Frame>
          <Frame><DeleteAccountModal open inline onClose={noop} onConfirm={never} phase="result" result={{ status: 'error', message: 'La suppression du compte a échoué. Réessaie.', onRetry: noop }} /></Frame>
        </div>
      </Section>

      <Section title="Modales Stripe" note="Checkout embarqué (0.2.0, modale lg) : préparation, erreur (fermer / réessayer), puis le formulaire Stripe monté dans la modale — ici sans Stripe.js, l'en-tête montre le montant renvoyé par l'Edge (`amountCents`, tarif fondateur). Résiliation : confirmation en une étape, au texte exact.">
        <div className="grid grid-cols-1 gap-space-5 xl:grid-cols-2">
          <Frame label="Checkout · préparation"><CheckoutModal open inline onClose={noop} demo={{ loading: true }} /></Frame>
          <Frame label="Checkout · erreur"><CheckoutModal open inline onClose={noop} demo={{ error: "Impossible d'ouvrir le paiement. Réessaie." }} /></Frame>
          <Frame label="Checkout · session prête (Stripe non chargé)"><CheckoutModal open inline onClose={noop} demo={{ session: { clientSecret: 'cs_test_demo', amountCents: 1200, isFondateur: true, slotsRemaining: 36 } }} /></Frame>
          <Frame label="Se désabonner ?"><CancelSubscriptionModal open inline onClose={noop} onConfirm={never} periodEnd="2026-10-13T00:00:00Z" /></Frame>
          <Frame label="Résiliation · résultat"><CancelSubscriptionModal open inline onClose={noop} onConfirm={never} periodEnd="2026-10-13T00:00:00Z" phase="result" result={{ status: 'success', title: 'Abonnement résilié', message: "Tu gardes l'accès jusqu'au 13 octobre 2026." }} /></Frame>
        </div>
      </Section>
    </div>
  );
}

function NativeDemo(): JSX.Element {
  const [tab, setTab] = useState<ParametresTab>('infos');
  const variant: ParametresVariant = 'native';
  return (
    <Frame>
      <ParametresLayout variant={variant} tab={tab} onTabChange={setTab}>
        {tab === 'infos' ? <InfosView variant={variant} profile={PROFILE} reseau={null} onSave={noop} onChangePassword={noop} onLogout={noop} /> : null}
        {tab === 'legal' ? <LegalView variant={variant} onDelete={noop} /> : null}
      </ParametresLayout>
    </Frame>
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
