import type { JSX } from 'react';
import { Link } from 'react-router-dom';
import { Badge, Button, Icon, Pastille } from '@yunary/ds';
import { fr } from '../i18n/fr';
import { AuthShell } from './AuthShell';

export interface LinkSentViewProps {
  /** `reset` (A4, lien de réinitialisation) · `confirmation` (inscription, lien d'activation). */
  kind: 'reset' | 'confirmation';
  email: string;
  onResend?: () => void;
  /** `idle` · `sending` · `sent` — l'état du bouton « Renvoyer ». */
  resendState?: 'idle' | 'sending' | 'sent';
  loginHref?: string;
  className?: string;
}

/** A4 — « Lien envoyé », partagée par le reset et la confirmation d'inscription. */
export function LinkSentView({ kind, email, onResend, resendState = 'idle', loginHref = '/login', className }: LinkSentViewProps): JSX.Element {
  const f = fr.auth;
  const title = kind === 'reset' ? f.sent.title : f.signup.confirmTitle;
  return (
    <AuthShell className={className}>
      <div className="flex flex-col items-center gap-space-4 text-center">
        <Pastille size="heros" tone="brand" outlined>
          <Icon name="mail" size="1.75rem" />
        </Pastille>
        <div className="flex flex-col gap-space-2">
          <h1 className="text-heading">{title}</h1>
          <p className="text-body leading-body text-text-muted">
            {kind === 'reset' ? (
              <>
                {f.sent.bodyBefore}
                <strong className="font-semibold text-foreground">{email}</strong>
                {f.sent.bodyAfter}
              </>
            ) : f.signup.confirmBody(email)}
          </p>
        </div>
        <Badge tone="neutral" icon={<Icon name="info" strokeWidth={2.5} />}>{f.sent.spam}</Badge>
        <div className="mt-space-1 flex w-full flex-col gap-space-3">
          {onResend ? (
            <Button variant="secondary" fullWidth loading={resendState === 'sending'} disabled={resendState !== 'idle'} onClick={onResend}>
              {resendState === 'sent' ? f.sent.resent : f.sent.resend}
            </Button>
          ) : null}
          <Link to={loginHref} className="text-caption font-semibold text-primary-readable no-underline">{f.actions.backToLogin}</Link>
        </div>
      </div>
    </AuthShell>
  );
}
