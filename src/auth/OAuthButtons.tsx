import type { JSX } from 'react';
import { Button, Separator } from '@yunary/ds';
import { fr } from '../i18n/fr';
import type { OAuthProvider } from './useLogin';
import { AppleMark, GoogleMark } from './BrandMarks';

export interface OAuthButtonsProps {
  onOAuth: (provider: OAuthProvider) => void;
  /** Le fournisseur en cours — son bouton passe en chargement, l'autre se désactive. */
  loading?: OAuthProvider | null;
  disabled?: boolean;
}

/** « ou » + Google + Apple — Google et Apple ne se retirent jamais (règle du Hub). */
export function OAuthButtons({ onOAuth, loading = null, disabled = false }: OAuthButtonsProps): JSX.Element {
  return (
    <>
      <Separator label={fr.common.or} />
      <div className="flex flex-col gap-space-3">
        <Button variant="secondary" fullWidth icon={<GoogleMark />} loading={loading === 'google'} disabled={disabled || (!!loading && loading !== 'google')} onClick={() => onOAuth('google')}>
          {fr.auth.actions.google}
        </Button>
        <Button variant="secondary" fullWidth icon={<AppleMark />} loading={loading === 'apple'} disabled={disabled || (!!loading && loading !== 'apple')} onClick={() => onOAuth('apple')}>
          {fr.auth.actions.apple}
        </Button>
      </div>
    </>
  );
}
