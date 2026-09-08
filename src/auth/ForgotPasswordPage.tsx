import { useEffect, useRef, useState, type JSX } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Banner, Button, FormField, Input } from '@yunary/ds';
import { fr } from '../i18n/fr';
import { getErrorMessage } from '../lib/errors';
import { AuthHeading, AuthShell } from './AuthShell';
import { LinkSentView } from './LinkSentView';
import { forgotSchema, type ForgotValues } from './schemas';
import { usePasswordReset } from './usePasswordReset';

export interface ForgotPasswordViewProps {
  onSubmit: (values: ForgotValues) => void;
  loading?: boolean;
  error?: string | null;
  loginHref?: string;
  className?: string;
}

/** A3 — la vue. */
export function ForgotPasswordView({ onSubmit, loading = false, error = null, loginHref = '/login', className }: ForgotPasswordViewProps): JSX.Element {
  const form = useForm<ForgotValues>({ resolver: zodResolver(forgotSchema), defaultValues: { email: '' } });
  const f = fr.auth;
  return (
    <AuthShell className={className}>
      <AuthHeading title={f.forgot.title} subtitle={f.forgot.subtitle} />
      {error ? <Banner tone="danger">{error}</Banner> : null}
      {/* Maquette A3 : champ et CTA au rythme de la carte (1,5 rem), pas le pas serré d'un formulaire. */}
      <form className="flex flex-col gap-space-5" noValidate onSubmit={form.handleSubmit(onSubmit)}>
        <FormField label={f.fields.email} htmlFor="forgot-email" error={form.formState.errors.email?.message}>
          <Input id="forgot-email" type="email" autoComplete="email" placeholder={f.fields.emailPlaceholder} invalid={!!form.formState.errors.email} {...form.register('email')} />
        </FormField>
        <Button type="submit" variant="primary" fullWidth loading={loading} disabled={loading}>{f.forgot.submit}</Button>
      </form>
      <p className="text-center text-caption">
        <Link to={loginHref} className="font-semibold text-primary">{f.actions.backToLogin}</Link>
      </p>
    </AuthShell>
  );
}

/* Anti-rafale sur « Renvoyer » : le bouton se rouvre après ce délai. */
const RESEND_COOLDOWN_MS = 30_000;

/** A3 → A4 câblées — montées par le Hub sur `/mot-de-passe-oublie`. */
export function ForgotPasswordPage({ loginHref }: { loginHref?: string } = {}): JSX.Element {
  const { requestReset } = usePasswordReset();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [resendState, setResendState] = useState<'idle' | 'sending' | 'sent'>('idle');
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const onSubmit = async (values: ForgotValues) => {
    setError(null);
    setLoading(true);
    try {
      await requestReset(values.email);
      setSentTo(values.email);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };
  const onResend = async () => {
    if (!sentTo) return;
    setResendState('sending');
    try {
      await requestReset(sentTo);
    } catch {
      /* L'e-mail est peut-être déjà parti : on ne casse pas l'écran, le bouton se rouvre. */
    }
    setResendState('sent');
    timer.current = window.setTimeout(() => setResendState('idle'), RESEND_COOLDOWN_MS);
  };

  if (sentTo) return <LinkSentView kind="reset" email={sentTo} onResend={onResend} resendState={resendState} loginHref={loginHref} />;
  return <ForgotPasswordView onSubmit={onSubmit} loading={loading} error={error} loginHref={loginHref} />;
}
