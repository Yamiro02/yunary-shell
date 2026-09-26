import { useState, type JSX, type ReactNode } from 'react';
import {
  CancelSubscriptionModal, CheckoutActivationCard, DeleteAccountModal, InfosView, LegalView,
  NotificationsView, ParametresLayout, PasswordModal, PaymentFailedBannerView, TabError, TabSkeleton,
  type ParametresTab,
} from '@yunary/shell';
import { Section } from '../ui';

const noop = () => undefined;
const never = () => new Promise<void>(() => undefined);
const PROFILE = { prenom: 'Julien', nom: 'Fernandes', email: 'julien@julienfernandes.com', avatarUrl: null };

/* C2-C5 : chaque onglet dans la page, en repos ; puis les états chargement / erreur, les modales. La fenêtre de paiement vit sur la page Paiement. */
export function ParametresPage(): JSX.Element {
  const [tab, setTab] = useState<ParametresTab>('infos');
  return (
    <div className="flex flex-col gap-space-7">
      <Section title="Paramètres" note="Artboards C2, C3, C5 (11/09) : « Comptes connectés » en subheading, rangées en filet 1,5 px ; padding des cartes gardé à 24. Change d'onglet ici comme dans l'app ; les données sont des fixtures. Plus de variante native depuis 0.3.0, plus d'onglet Abonnement depuis 0.4.0 (page Facturation du hub).">
        <Frame>
          <ParametresLayout tab={tab} onTabChange={setTab}>
            {tab === 'infos' ? <InfosView profile={PROFILE} reseau={{ platform: 'instagram', handle: 'julien.crea' }} onSave={noop} saveState="saved" onChoosePhoto={noop} onRemovePhoto={noop} onChangePassword={noop} onLogout={noop} /> : null}
            {tab === 'notifications' ? <NotificationsView prefs={{ analyse_terminee: true, nouveaux_templates: true }} onToggle={noop} /> : null}
            {tab === 'legal' ? <LegalView onDelete={noop} /> : null}
          </ParametresLayout>
        </Frame>
      </Section>

      <Section title="Infos · autres états" note="Réseau absent, enregistrement en cours, erreur photo.">
        <Frame>
          <InfosView profile={{ ...PROFILE, avatarUrl: null }} reseau={null} onSave={noop} saveState="saving" photoError="Image trop lourde : 2 Mo maximum." onChoosePhoto={noop} onRemovePhoto={noop} onChangePassword={noop} onLogout={noop} />
        </Frame>
      </Section>

      <Frame label="Paiement en échec (past_due) : le bandeau, rendu par AppLayout en haut de l'app ; l'accès n'est pas coupé">
        <PaymentFailedBannerView onPortal={noop} />
      </Frame>

      <Section title="Retour d'un paiement · activation" note="`?paiement=1` (retour de `create-payment`) ou `?checkout=<session_id>` (ancien checkout) dans l'URL : l'onglet cède la place à cette carte. Sonde de `tool_entitlements` chaque seconde, 20 s au plus (le droit précis si `?tool=` ou `?pack=` est là) ; pendant ce temps la sidebar dit « Activation en cours… », jamais « Gratuit ». Passé 20 s : le message calme — le paiement a réussi, pas d'erreur rouge.">
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

      <Section title="Modale de résiliation" note="Résiliation COMPLÈTE (tous les outils) en une étape, au texte exact ; puis le résultat. Retirer un seul outil se fait sur la page des outils du hub (`useRemoveTool`).">
        <div className="grid grid-cols-1 gap-space-5 xl:grid-cols-2">
          <Frame label="Se désabonner ?"><CancelSubscriptionModal open inline onClose={noop} onConfirm={never} periodEnd="2026-10-23T10:00:00Z" /></Frame>
          <Frame label="Résiliation · résultat"><CancelSubscriptionModal open inline onClose={noop} onConfirm={never} periodEnd="2026-10-23T10:00:00Z" phase="result" result={{ status: 'success', title: 'Abonnement résilié', message: "Tu gardes l'accès jusqu'au 23 octobre 2026." }} /></Frame>
        </div>
      </Section>
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
