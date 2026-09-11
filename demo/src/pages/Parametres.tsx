import { useState, type JSX, type ReactNode } from 'react';
import {
  AbonnementView, DeleteAccountModal, InfosView, LegalView, NotificationsView, ParametresLayout, PasswordModal,
  TabError, TabSkeleton, planFor, type ParametresTab, type ParametresVariant,
} from '@yunary/shell';
import { CREDITS } from '../fixtures';
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
            {tab === 'abonnement' ? <AbonnementView credits={CREDITS} plan={planFor('free')} hasSubscription={false} onPortal={noop} onChoose={noop} /> : null}
            {tab === 'legal' ? <LegalView onDelete={noop} /> : null}
          </ParametresLayout>
        </Frame>
      </Section>

      <Section title="Infos · autres états" note="Réseau absent, enregistrement en cours, erreur photo.">
        <Frame>
          <InfosView profile={{ ...PROFILE, avatarUrl: null }} reseau={null} onSave={noop} saveState="saving" photoError="Image trop lourde : 2 Mo maximum." onChoosePhoto={noop} onRemovePhoto={noop} onChangePassword={noop} onLogout={noop} />
        </Frame>
      </Section>

      <Section title="Abonnement · formule payante" note="Portail ouvert, recharge mensuelle, formule courante marquée dans la grille.">
        <Frame>
          <AbonnementView credits={{ remaining: 120, total: null, periodEnd: '2026-10-01T00:00:00Z' }} plan={planFor('createur')} hasSubscription onPortal={noop} onChoose={noop} />
        </Frame>
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

function Frame({ children }: { children: ReactNode }): JSX.Element {
  return <div className="rounded-xl border border-border bg-background p-space-6">{children}</div>;
}
