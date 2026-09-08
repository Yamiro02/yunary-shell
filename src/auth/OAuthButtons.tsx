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
      {/* Les deux boutons sont des enfants DIRECTS de la carte (maquettes A1-A2) : c'est le
          rythme de la carte (gap-space-5) qui les espace, pas un groupe resserré.
          `surface="card"` : la maquette les pose sur --background (le socle ne déduit pas la
          surface d'un bouton, il la déclare — patterns.css). */}
      <Button variant="secondary" surface="card" fullWidth icon={<GoogleMark />} loading={loading === 'google'} disabled={disabled || (!!loading && loading !== 'google')} onClick={() => onOAuth('google')}>
        {fr.auth.actions.google}
      </Button>
      <Button variant="secondary" surface="card" fullWidth icon={<AppleMark />} loading={loading === 'apple'} disabled={disabled || (!!loading && loading !== 'apple')} onClick={() => onOAuth('apple')}>
        {fr.auth.actions.apple}
      </Button>
    </>
  );
}
