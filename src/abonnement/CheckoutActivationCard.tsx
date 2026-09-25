import type { JSX } from 'react';
import { Button, Icon, Spinner, StateCard } from '@yunary/ds';
import { fr } from '../i18n/fr';
import type { CheckoutActivationState } from './useCheckoutActivation';

export interface CheckoutActivationCardProps {
  /** `pending` · `active` · `late` — `idle` ne rend rien. */
  state: CheckoutActivationState;
  /** « Continuer » une fois actif : retire `?checkout=` et rend la page à son état normal. */
  onContinue: () => void;
  className?: string;
}

/**
 * L'écran de retour de Stripe, rendu par la page de l'app tant que `?checkout=`
 * est dans l'URL. « On active ton abonnement… » pendant la sonde ; succès quand `subscriptions`
 * est écrite ; passé 20 s, le message calme — JAMAIS une erreur rouge, le paiement a réussi.
 * `StateCard` brand du DS dans les trois cas (tone `danger` interdit ici, par construction).
 */
export function CheckoutActivationCard({ state, onContinue, className }: CheckoutActivationCardProps): JSX.Element | null {
  const t = fr.parametres.abonnement.activation;
  if (state === 'idle') return null;
  if (state === 'active') {
    return (
      <StateCard
        className={className}
        icon={<Icon name="circle-check" size="1.5rem" />}
        title={t.doneTitle}
        description={t.doneBody}
        action={<Button variant="primary" onClick={onContinue}>{t.continue}</Button>}
      />
    );
  }
  if (state === 'late') {
    return <StateCard className={className} icon={<Icon name="clock" size="1.5rem" />} title={t.lateTitle} description={t.lateBody} />;
  }
  return (
    <StateCard className={className} icon={<Icon name="zap" size="1.5rem" />} title={t.title} description={t.body} aria-busy="true">
      <Spinner size="md" />
    </StateCard>
  );
}
