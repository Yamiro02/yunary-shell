import type { JSX, ReactNode } from 'react';
import { ForgotPasswordView, LinkSentView, LoginView, ResetPasswordView, SignupView } from '@yunary/shell';
import { Section } from '../ui';

const noop = () => undefined;

/* A1-A4 + reset : les vues, en repos et en erreur. La coque est en hauteur libre (min-h-full). */
export function AuthPage(): JSX.Element {
  return (
    <div className="flex flex-col gap-space-7">
      <Section title="A1 · Connexion" note="Repos, puis erreur de serveur (Banner) avec Google en cours.">
        <Grid>
          <Frame label="Repos"><LoginView onSubmit={noop} onOAuth={noop} className="min-h-full" /></Frame>
          <Frame label="Erreur · Google en cours"><LoginView onSubmit={noop} onOAuth={noop} error="E-mail ou mot de passe incorrect." oauthLoading="google" className="min-h-full" /></Frame>
        </Grid>
      </Section>
      <Section title="A2 · Inscription">
        <Grid>
          <Frame label="Repos"><SignupView onSubmit={noop} onOAuth={noop} className="min-h-full" /></Frame>
          <Frame label="Envoi en cours"><SignupView onSubmit={noop} onOAuth={noop} loading className="min-h-full" /></Frame>
        </Grid>
      </Section>
      <Section title="A3 · Mot de passe oublié → A4 · Lien envoyé">
        <Grid>
          <Frame label="A3"><ForgotPasswordView onSubmit={noop} className="min-h-full" /></Frame>
          <Frame label="A4 · reset"><LinkSentView kind="reset" email="julien@exemple.com" onResend={noop} className="min-h-full" /></Frame>
        </Grid>
      </Section>
      <Section title="Suite de l'inscription · Nouveau mot de passe" note="La confirmation d'e-mail reprend A4 ; le reset a sa page (hors maquette), avec l'état « lien invalide » qui renvoie vers A3.">
        <Grid>
          <Frame label="Confirmation d'inscription"><LinkSentView kind="confirmation" email="julien@exemple.com" className="min-h-full" /></Frame>
          <Frame label="Reset · repos"><ResetPasswordView onSubmit={noop} className="min-h-full" /></Frame>
          <Frame label="Reset · lien invalide"><ResetPasswordView onSubmit={noop} linkInvalid className="min-h-full" /></Frame>
        </Grid>
      </Section>
    </div>
  );
}

function Grid({ children }: { children: ReactNode }): JSX.Element {
  return <div className="grid grid-cols-1 gap-space-5 xl:grid-cols-2">{children}</div>;
}

function Frame({ label, children }: { label: string; children: ReactNode }): JSX.Element {
  return (
    <div className="flex flex-col gap-space-2">
      <span className="chip text-text-muted">{label}</span>
      <div className="h-[56rem] overflow-hidden rounded-xl border border-border">{children}</div>
    </div>
  );
}
