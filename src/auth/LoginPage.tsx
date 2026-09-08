import { useEffect, useState, type JSX } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Banner, Button, FormField, Input } from '@yunary/ds';
import { fr } from '../i18n/fr';
import { getErrorMessage } from '../lib/errors';
import { readSafeNext } from '../lib/next';
import { AuthHeading, AuthShell } from './AuthShell';
import { OAuthButtons } from './OAuthButtons';
import { loginSchema, type LoginValues } from './schemas';
import { useLogin, type OAuthProvider } from './useLogin';
import { useAfterAuthRedirect } from './useAfterAuthRedirect';

export interface LoginViewProps {
  onSubmit: (values: LoginValues) => void;
  onOAuth: (provider: OAuthProvider) => void;
  loading?: boolean;
  oauthLoading?: OAuthProvider | null;
  error?: string | null;
  signupHref?: string;
  forgotHref?: string;
  /** Démo : la coque en hauteur libre. */
  className?: string;
}

/** A1 — la vue, pilotée par props. */
export function LoginView({
  onSubmit, onOAuth, loading = false, oauthLoading = null, error = null,
  signupHref = '/inscription', forgotHref = '/mot-de-passe-oublie', className,
}: LoginViewProps): JSX.Element {
  const form = useForm<LoginValues>({ resolver: zodResolver(loginSchema), defaultValues: { email: '', password: '' } });
  const busy = loading || !!oauthLoading;
  const f = fr.auth;
  return (
    <AuthShell className={className}>
      {/* Pas de sous-titre : la maquette A1 en avait un (« Connecte-toi pour continuer à faire des
          vues. »), retiré sur décision de Julien (08/09/2026). Ne pas le réintroduire. */}
      <AuthHeading title={f.login.title} />
      {error ? <Banner tone="danger">{error}</Banner> : null}
      <form className="flex flex-col gap-space-4" noValidate onSubmit={form.handleSubmit(onSubmit)}>
        <FormField label={f.fields.email} htmlFor="login-email" error={form.formState.errors.email?.message}>
          <Input id="login-email" type="email" autoComplete="email" placeholder={f.fields.emailPlaceholder} invalid={!!form.formState.errors.email} {...form.register('email')} />
        </FormField>
        {/* Le lien « Mot de passe oublié ? » vit DANS le libellé du FormField (maquette : à droite
            du label) — aucune classe interne du DS n'est recomposée ici. Couleur : `--primary`,
            annoté tel quel sur la maquette A1 (pas le jumeau lisible, réservé aux liens courants). */}
        <FormField
          htmlFor="login-password"
          label={
            <span className="flex w-full items-baseline justify-between gap-space-3">
              <span>{f.fields.password}</span>
              <Link to={forgotHref} className="text-caption font-semibold text-primary">{f.login.forgot}</Link>
            </span>
          }
          error={form.formState.errors.password?.message}
        >
          <Input id="login-password" type="password" autoComplete="current-password" placeholder={f.fields.passwordPlaceholder} invalid={!!form.formState.errors.password} {...form.register('password')} />
        </FormField>
        <Button type="submit" variant="primary" fullWidth loading={loading} disabled={busy} className="mt-space-1">
          {f.login.submit}
        </Button>
      </form>
      <OAuthButtons onOAuth={onOAuth} loading={oauthLoading} disabled={loading} />
      <p className="text-center text-caption text-text-muted">
        {f.login.noAccount}{' '}
        <Link to={signupHref} className="font-semibold text-primary">{f.login.signupLink}</Link>
      </p>
    </AuthShell>
  );
}

export interface AuthPageProps {
  signupHref?: string;
  loginHref?: string;
  forgotHref?: string;
  /** Où va un compte non onboardé. Défaut `/onboarding`. */
  onboardingPath?: string;
  /** Où va un compte onboardé sans `?next=`. Défaut `/`. */
  homePath?: string;
}

/** A1 câblée — montée par le Hub sur `/login`. Une session déjà là redirige tout de suite. */
export function LoginPage(props: AuthPageProps = {}): JSX.Element {
  const { signInWithEmail, signInWithOAuth } = useLogin();
  const location = useLocation();
  const next = readSafeNext(location.search);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<OAuthProvider | null>(null);
  const [error, setError] = useState<string | null>(null);
  useAfterAuthRedirect({ next, onboardingPath: props.onboardingPath, homePath: props.homePath });

  /* Retour OAuth en erreur (`?error_description=`) : Supabase le pose dans l'URL. */
  useEffect(() => {
    const desc = new URLSearchParams(location.search).get('error_description');
    if (desc) setError(getErrorMessage(desc));
  }, [location.search]);

  const onSubmit = async (values: LoginValues) => {
    setError(null);
    setLoading(true);
    try {
      await signInWithEmail(values.email, values.password);
    } catch (e) {
      setError(getErrorMessage(e));
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
  return <LoginView onSubmit={onSubmit} onOAuth={onOAuth} loading={loading} oauthLoading={oauthLoading} error={error} signupHref={props.signupHref} forgotHref={props.forgotHref} />;
}
