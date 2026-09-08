import { useState, type JSX } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Banner, Button, FormField, Input } from '@yunary/ds';
import { fr } from '../i18n/fr';
import { getErrorMessage } from '../lib/errors';
import { readSafeNext } from '../lib/next';
import { AuthHeading, AuthShell } from './AuthShell';
import { OAuthButtons } from './OAuthButtons';
import { LinkSentView } from './LinkSentView';
import { signupSchema, type SignupValues } from './schemas';
import { useSignup } from './useSignup';
import { useLogin, type OAuthProvider } from './useLogin';
import { useAfterAuthRedirect } from './useAfterAuthRedirect';
import type { AuthPageProps } from './LoginPage';

export interface SignupViewProps {
  onSubmit: (values: SignupValues) => void;
  onOAuth: (provider: OAuthProvider) => void;
  loading?: boolean;
  oauthLoading?: OAuthProvider | null;
  error?: string | null;
  loginHref?: string;
  cguHref?: string;
  confidentialiteHref?: string;
  className?: string;
}

/** A2 — la vue. */
export function SignupView({
  onSubmit, onOAuth, loading = false, oauthLoading = null, error = null,
  loginHref = '/login', cguHref = '/cgu', confidentialiteHref = '/confidentialite', className,
}: SignupViewProps): JSX.Element {
  const form = useForm<SignupValues>({ resolver: zodResolver(signupSchema), defaultValues: { email: '', password: '', confirm: '' } });
  const e = form.formState.errors;
  const f = fr.auth;
  return (
    <AuthShell className={className}>
      <AuthHeading title={f.signup.title} subtitle={f.signup.subtitle} />
      {error ? <Banner tone="danger">{error}</Banner> : null}
      <form className="flex flex-col gap-space-4" noValidate onSubmit={form.handleSubmit(onSubmit)}>
        <FormField label={f.fields.email} htmlFor="signup-email" error={e.email?.message}>
          <Input id="signup-email" type="email" autoComplete="email" placeholder={f.fields.emailPlaceholder} invalid={!!e.email} {...form.register('email')} />
        </FormField>
        <FormField label={f.fields.password} htmlFor="signup-password" help={f.fields.passwordHint} error={e.password?.message}>
          <Input id="signup-password" type="password" autoComplete="new-password" placeholder={f.fields.passwordChoose} invalid={!!e.password} {...form.register('password')} />
        </FormField>
        <FormField label={f.fields.passwordConfirm} htmlFor="signup-confirm" error={e.confirm?.message}>
          <Input id="signup-confirm" type="password" autoComplete="new-password" placeholder={f.fields.passwordConfirmPlaceholder} invalid={!!e.confirm} {...form.register('confirm')} />
        </FormField>
        <Button type="submit" variant="primary" fullWidth loading={loading} disabled={loading || !!oauthLoading} className="mt-space-1">
          {f.signup.submit}
        </Button>
      </form>
      <OAuthButtons onOAuth={onOAuth} loading={oauthLoading} disabled={loading} />
      {/* Liens de la carte d'auth en `--primary`, comme l'annotation des maquettes A1-A2. La mention
          légale n'est pas sur la maquette A2 : elle reste (exigence des reviews Meta/TikTok), écart
          signalé à Julien au jalon A2. */}
      <p className="text-center text-caption text-text-muted">
        {f.signup.legalNoticeBefore}
        <Link to={cguHref} className="font-semibold text-primary">{f.signup.legalNoticeCgu}</Link>
        {f.signup.legalNoticeBetween}
        <Link to={confidentialiteHref} className="font-semibold text-primary">{f.signup.legalNoticePrivacy}</Link>
        {f.signup.legalNoticeAfter}
      </p>
      <p className="text-center text-caption text-text-muted">
        {f.signup.hasAccount}{' '}
        <Link to={loginHref} className="font-semibold text-primary">{f.signup.loginLink}</Link>
      </p>
    </AuthShell>
  );
}

/** A2 câblée — montée par le Hub sur `/inscription`. Confirmation d'e-mail requise → vue « Vérifie ta boîte mail ». */
export function SignupPage(props: AuthPageProps & { cguHref?: string; confidentialiteHref?: string } = {}): JSX.Element {
  const { signUpWithEmail } = useSignup();
  const { signInWithOAuth } = useLogin();
  const location = useLocation();
  const next = readSafeNext(location.search);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<OAuthProvider | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);
  useAfterAuthRedirect({ next, onboardingPath: props.onboardingPath, homePath: props.homePath });

  const onSubmit = async (values: SignupValues) => {
    setError(null);
    setLoading(true);
    try {
      const { needsConfirmation } = await signUpWithEmail(values.email, values.password);
      if (needsConfirmation) setSentTo(values.email);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };
  const onOAuth = async (provider: OAuthProvider) => {
    setError(null);
    setOauthLoading(provider);
    try {
      await signInWithOAuth(provider, next);
    } catch (e) {
      setError(getErrorMessage(e));
      setOauthLoading(null);
    }
  };

  if (sentTo) {
    return <LinkSentView kind="confirmation" email={sentTo} loginHref={props.loginHref} />;
  }
  return <SignupView onSubmit={onSubmit} onOAuth={onOAuth} loading={loading} oauthLoading={oauthLoading} error={error} loginHref={props.loginHref} cguHref={props.cguHref} confidentialiteHref={props.confidentialiteHref} />;
}
