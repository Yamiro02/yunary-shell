import { useEffect, useState, type JSX } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, FormField, Icon, Input, Modal, type ModalResult } from '@yunary/ds';
import { fr } from '../i18n/fr';
import { getErrorMessage } from '../lib/errors';
import { newPasswordSchema, type NewPasswordValues } from '../auth/schemas';

export interface PasswordModalProps {
  open: boolean;
  onClose: () => void;
  /** Lève en cas d'échec — la modale affiche l'erreur dans sa phase résultat. */
  onSubmit: (password: string) => Promise<void>;
  /** Démo : phase forcée. */
  phase?: 'confirm' | 'loading' | 'result';
  result?: ModalResult;
  inline?: boolean;
}

/** « Modifier le mot de passe » — Modal du DS en 3 phases : saisie → envoi → résultat. */
export function PasswordModal({ open, onClose, onSubmit, phase: forcedPhase, result: forcedResult, inline }: PasswordModalProps): JSX.Element {
  const [phase, setPhase] = useState<'confirm' | 'loading' | 'result'>('confirm');
  const [result, setResult] = useState<ModalResult | undefined>(undefined);
  const form = useForm<NewPasswordValues>({ resolver: zodResolver(newPasswordSchema), defaultValues: { password: '', confirm: '' } });
  const p = fr.parametres.password;

  /* Reset à l'ouverture, après l'animation de fermeture. */
  useEffect(() => {
    if (open) return;
    const t = window.setTimeout(() => {
      setPhase('confirm');
      setResult(undefined);
      form.reset();
    }, 300);
    return () => window.clearTimeout(t);
  }, [open, form]);

  const submit = async (values: NewPasswordValues) => {
    setPhase('loading');
    try {
      await onSubmit(values.password);
      setResult({ status: 'success', title: p.updated });
    } catch (e) {
      setResult({ status: 'error', message: getErrorMessage(e), onRetry: () => setPhase('confirm') });
    }
    setPhase('result');
  };

  const currentPhase = forcedPhase ?? phase;
  const e = form.formState.errors;
  return (
    <Modal
      open={open}
      inline={inline}
      onClose={currentPhase === 'loading' ? undefined : onClose}
      dismissable={false}
      icon={<Icon name="user" />}
      iconVariant="brand"
      title={p.title}
      description={p.description}
      phase={currentPhase}
      result={forcedResult ?? result}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={currentPhase === 'loading'}>{fr.common.cancel}</Button>
          <Button variant="primary" form="password-form" type="submit" loading={currentPhase === 'loading'}>{p.submit}</Button>
        </>
      }
    >
      <form id="password-form" className="flex flex-col gap-space-4" noValidate onSubmit={form.handleSubmit(submit)}>
        <FormField label={p.new} htmlFor="pw-new" help={fr.auth.fields.passwordHint} error={e.password?.message}>
          <Input id="pw-new" type="password" autoComplete="new-password" placeholder={p.newPlaceholder} invalid={!!e.password} {...form.register('password')} />
        </FormField>
        <FormField label={p.confirm} htmlFor="pw-confirm" error={e.confirm?.message}>
          <Input id="pw-confirm" type="password" autoComplete="new-password" placeholder={p.confirmPlaceholder} invalid={!!e.confirm} {...form.register('confirm')} />
        </FormField>
      </form>
    </Modal>
  );
}
