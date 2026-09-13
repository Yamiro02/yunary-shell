import { useEffect, useState, type JSX } from 'react';
import { Button, Modal, type ModalResult } from '@yunary/ds';
import { fr } from '../i18n/fr';
import { getErrorMessage } from '../lib/errors';
import { formatDateLongue } from '../lib/format';

export interface CancelSubscriptionModalProps {
  open: boolean;
  onClose: () => void;
  /** Lève en cas d'échec — la modale affiche l'erreur dans sa phase résultat. */
  onConfirm: () => Promise<void>;
  /** `subscriptions.current_period_end` : la date jusqu'à laquelle l'accès et les crédits courent. */
  periodEnd: string | null;
  /** Démo : phase forcée. */
  phase?: 'confirm' | 'loading' | 'result';
  result?: ModalResult;
  inline?: boolean;
}

/**
 * « Se désabonner ? » — confirmation en UNE étape, au texte exact (décision Julien, 13/09/2026) :
 * « Tu gardes l'accès et tes crédits jusqu'au {date}. Ensuite tu repasses à la formule Gratuite. »
 * Modal du DS en 3 phases (confirm → loading → result), comme les autres modales de la coque.
 */
export function CancelSubscriptionModal({ open, onClose, onConfirm, periodEnd, phase: forcedPhase, result: forcedResult, inline }: CancelSubscriptionModalProps): JSX.Element {
  const a = fr.parametres.abonnement;
  const [phase, setPhase] = useState<'confirm' | 'loading' | 'result'>('confirm');
  const [result, setResult] = useState<ModalResult | undefined>(undefined);
  const date = periodEnd ? formatDateLongue(periodEnd) : '—';

  useEffect(() => {
    if (open) return;
    const t = window.setTimeout(() => {
      setPhase('confirm');
      setResult(undefined);
    }, 300);
    return () => window.clearTimeout(t);
  }, [open]);

  const confirm = async () => {
    setPhase('loading');
    try {
      await onConfirm();
      setResult({ status: 'success', title: a.cancelDialog.done, message: a.cancelDialog.doneBody(date) });
    } catch (e) {
      setResult({ status: 'error', message: getErrorMessage(e), onRetry: () => setPhase('confirm') });
    }
    setPhase('result');
  };

  const currentPhase = forcedPhase ?? phase;
  return (
    <Modal
      open={open}
      inline={inline}
      onClose={currentPhase === 'loading' ? undefined : onClose}
      title={a.cancelDialog.title}
      description={a.endsOnBody(date)}
      phase={currentPhase}
      result={forcedResult ?? result}
      footer={
        currentPhase === 'result' ? undefined : (
          <>
            <Button variant="secondary" onClick={onClose} disabled={currentPhase === 'loading'}>{fr.common.cancel}</Button>
            <Button variant="danger" loading={currentPhase === 'loading'} onClick={confirm}>{a.cancelDialog.confirm}</Button>
          </>
        )
      }
    />
  );
}
