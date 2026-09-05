import { useEffect, useState, type JSX } from 'react';
import { Link } from 'react-router-dom';
import { Button, Card, FormField, Icon, Input, Modal, type ModalResult } from '@yunary/ds';
import { fr } from '../i18n/fr';
import { getErrorMessage } from '../lib/errors';
import { useDeleteAccount } from '../account/useDeleteAccount';
import type { ParametresVariant } from './ParametresLayout';

export interface LegalHrefs {
  cgu: string;
  mentions: string;
  confidentialite: string;
}

export const DEFAULT_LEGAL_HREFS: LegalHrefs = { cgu: '/cgu', mentions: '/mentions-legales', confidentialite: '/confidentialite' };

export interface LegalViewProps {
  variant?: ParametresVariant;
  hrefs?: LegalHrefs;
  onDelete: () => void;
}

/** C5 — la vue : trois cartes-liens, puis la zone danger. */
export function LegalView({ hrefs = DEFAULT_LEGAL_HREFS, onDelete }: LegalViewProps): JSX.Element {
  const l = fr.parametres.legal;
  const links: { href: string; label: string }[] = [
    { href: hrefs.cgu, label: l.cgu },
    { href: hrefs.mentions, label: l.mentions },
    { href: hrefs.confidentialite, label: l.confidentialite },
  ];
  return (
    <div className="flex max-w-read flex-col gap-space-4">
      {links.map(link => (
        <Link key={link.href} to={link.href} className="text-foreground no-underline">
          <Card variant="interactive" className="flex items-center justify-between gap-space-4 shadow-none">
            <span className="font-display text-body-lg font-(--heading-weight) tracking-heading-sm">{link.label}</span>
            <Icon name="chevron-right" className="text-text-muted" />
          </Card>
        </Link>
      ))}
      <Card className="flex flex-col gap-space-4 border-destructive/30 shadow-none">
        <div className="flex flex-col gap-space-1">
          <h3 className="text-heading-sm text-destructive-readable">{l.danger.title}</h3>
          <p className="text-body font-medium text-text-secondary">{l.danger.description}</p>
        </div>
        <div className="flex">
          <Button variant="danger" icon={<Icon name="trash-2" size="1rem" />} onClick={onDelete}>{l.danger.cta}</Button>
        </div>
      </Card>
    </div>
  );
}

export interface DeleteAccountModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  phase?: 'confirm' | 'loading' | 'result';
  result?: ModalResult;
  inline?: boolean;
}

/** « Supprimer mon compte » — Modal danger en 3 phases, avec le mot à taper. */
export function DeleteAccountModal({ open, onClose, onConfirm, phase: forcedPhase, result: forcedResult, inline }: DeleteAccountModalProps): JSX.Element {
  const d = fr.parametres.legal.deleteDialog;
  const [phase, setPhase] = useState<'confirm' | 'loading' | 'result'>('confirm');
  const [result, setResult] = useState<ModalResult | undefined>(undefined);
  const [typed, setTyped] = useState('');

  useEffect(() => {
    if (open) return;
    const t = window.setTimeout(() => {
      setPhase('confirm');
      setResult(undefined);
      setTyped('');
    }, 300);
    return () => window.clearTimeout(t);
  }, [open]);

  const confirm = async () => {
    setPhase('loading');
    try {
      await onConfirm();
      setResult({ status: 'success', title: d.deleted });
    } catch (e) {
      setResult({ status: 'error', message: getErrorMessage(e), onRetry: () => setPhase('confirm') });
    }
    setPhase('result');
  };

  const currentPhase = forcedPhase ?? phase;
  const ok = typed.trim().toUpperCase() === d.confirmWord;
  return (
    <Modal
      open={open}
      inline={inline}
      onClose={currentPhase === 'loading' ? undefined : onClose}
      dismissable={false}
      icon={<Icon name="trash-2" />}
      iconVariant="danger"
      title={d.title}
      description={d.description}
      phase={currentPhase}
      result={forcedResult ?? result}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={currentPhase === 'loading'}>{fr.common.cancel}</Button>
          <Button variant="danger" disabled={!ok} loading={currentPhase === 'loading'} onClick={confirm}>{d.confirm}</Button>
        </>
      }
    >
      <ul className="flex list-disc flex-col gap-space-2 pl-space-5 text-body-sm text-text-secondary">
        <li>{d.bulletData}</li>
        <li>{d.bulletBilling}</li>
      </ul>
      <FormField label={d.typeToConfirm(d.confirmWord)} htmlFor="delete-confirm">
        <Input id="delete-confirm" autoComplete="off" value={typed} onChange={e => setTyped(e.target.value)} />
      </FormField>
    </Modal>
  );
}

/** C5 câblée : liens légaux + suppression via `delete-account`. */
export function LegalTab({ variant = 'web', hrefs, onDeleted }: { variant?: ParametresVariant; hrefs?: LegalHrefs; onDeleted?: () => void }): JSX.Element {
  const del = useDeleteAccount();
  const [open, setOpen] = useState(false);
  return (
    <>
      <LegalView variant={variant} hrefs={hrefs} onDelete={() => setOpen(true)} />
      <DeleteAccountModal
        open={open}
        onClose={() => {
          setOpen(false);
          if (del.isSuccess) onDeleted?.();
        }}
        onConfirm={() => del.mutateAsync()}
      />
    </>
  );
}
