import { useEffect, useState, type JSX } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Banner, Button, FormField, Input } from '@yunary/ds';
import { fr } from '../i18n/fr';
import { getErrorMessage } from '../lib/errors';
import { AuthHeading, AuthShell } from './AuthShell';
import { PageLoader } from './ProtectedRoute';
import { newPasswordSchema, type NewPasswordValues } from './schemas';
import { useAuth } from './useAuth';
import { usePasswordReset } from './usePasswordReset';

export interface ResetPasswordViewProps {
  onSubmit: (values: NewPasswordValues) => void;
  loading?: boolean;
  error?: string | null;
  /** Lien inutilisable (expiré, déjà consommé, ouvert dans un autre navigateur) : le formulaire cède la place au renvoi vers A3. */
  linkInvalid?: boolean;
  forgotHref?: string;
  loginHref?: string;
  className?: string;
}

/** Nouveau mot de passe — la vue (hors maquette, même coque que A3). */
export function ResetPasswordView({ onSubmit, loading = false, error = null, linkInvalid = false, forgotHref = '/mot-de-passe-oublie', loginHref = '/login', className }: ResetPasswordViewProps): JSX.Element {
  const form = useForm<NewPasswordValues>({ resolver: zodResolver(newPasswordSchema), defaultValues: { password: '', confirm: '' } });
  const e = form.formState.errors;
  const f = fr.auth;
  return (
    <AuthShell className={className}>
      <AuthHeading title={f.reset.title} subtitle={linkInvalid ? undefined : f.reset.subtitle} />
      {linkInvalid ? (
        <>
          <Banner tone="danger">{f.reset.linkInvalid}</Banner>
          <Button as="a" href={forgotHref} variant="primary" fullWidth>{f.forgot.title}</Button>
        </>
      ) : (
        <>
          {error ? <Banner tone="danger">{error}</Banner> : null}
          <form className="flex flex-col gap-space-4" noValidate onSubmit={form.handleSubmit(onSubmit)}>
            <FormField label={f.fields.password} htmlFor="reset-password" help={f.fields.passwordHint} error={e.password?.message}>
              <Input id="reset-password" type="password" autoComplete="new-password" placeholder={f.fields.passwordChoose} invalid={!!e.password} {...form.register('password')} />
            </FormField>
            <FormField label={f.fields.passwordConfirm} htmlFor="reset-confirm" error={e.confirm?.message}>
              <Input id="reset-confirm" type="password" autoComplete="new-password" placeholder={f.fields.passwordConfirmPlaceholder} invalid={!!e.confirm} {...form.register('confirm')} />
            </FormField>
            <Button type="submit" variant="primary" fullWidth loading={loading} disabled={loading}>{f.reset.submit}</Button>
          </form>
        </>
      )}
      <p className="text-center text-caption">
        <Link to={loginHref} className="font-semibold text-primary-readable">{f.actions.backToLogin}</Link>
      </p>
    </AuthShell>
  );
}

/* Délai laissé au client pour échanger le code du lien contre une session de recovery. */
const LINK_GRACE_MS = 2_500;

/**
 * `/reset` câblée. Le lien pose une session de recovery (PKCE, même navigateur) ; sans
 * session après la grâce, ou avec `?error=` dans l'URL, le lien est déclaré invalide.
 */
export function ResetPasswordPage({ forgotHref, loginHref, homePath = '/' }: { forgotHref?: string; loginHref?: string; homePath?: string } = {}): JSX.Element {
  const { updatePassword } = usePasswordReset();
  const { session, loading: authLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [graceOver, setGraceOver] = useState(false);
  const urlError = new URLSearchParams(location.search).get('error') ?? new URLSearchParams(location.hash.replace(/^#/, '')).get('error');

  useEffect(() => {
    const t = window.setTimeout(() => setGraceOver(true), LINK_GRACE_MS);
    return () => window.clearTimeout(t);
  }, []);

  const onSubmit = async (values: NewPasswordValues) => {
    setError(null);
    setLoading(true);
    try {
      await updatePassword(values.password);
      navigate(homePath, { replace: true });
    } catch (e) {
      setError(getErrorMessage(e));
      setLoading(false);
    }
  };

  if (!urlError && !session && (authLoading || !graceOver)) return <PageLoader />;
  return <ResetPasswordView onSubmit={onSubmit} loading={loading} error={error} linkInvalid={!!urlError || !session} forgotHref={forgotHref} loginHref={loginHref} />;
}
