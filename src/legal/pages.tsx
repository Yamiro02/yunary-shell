import { useEffect, useState, type JSX } from 'react';
import { useLocation } from 'react-router-dom';
import { fr } from '../i18n/fr';
import { getShellConfig } from '../config';
import { formatDateLongue } from '../lib/format';
import { LEGAL_DOCS } from './legalContent';
import { LegalDocView, LegalPageLayout } from './LegalPageLayout';

export interface LegalPageProps {
  homeHref?: string;
}

export function CguPage({ homeHref }: LegalPageProps = {}): JSX.Element {
  return <LegalDocView doc={LEGAL_DOCS.cgu} homeHref={homeHref} />;
}
export function MentionsLegalesPage({ homeHref }: LegalPageProps = {}): JSX.Element {
  return <LegalDocView doc={LEGAL_DOCS.mentions} homeHref={homeHref} />;
}
export function ConfidentialitePage({ homeHref }: LegalPageProps = {}): JSX.Element {
  return <LegalDocView doc={LEGAL_DOCS.confidentialite} homeHref={homeHref} />;
}

export type DeletionState =
  | { kind: 'loading' }
  | { kind: 'missing' }
  | { kind: 'not_found' }
  | { kind: 'error' }
  | { kind: 'found'; status: string; requestedAt: string | null };

/** La vue de `/suppression-donnees` — pilotée par l'état, pour la démo et les tests. */
export function SuppressionDonneesView({ state, homeHref }: { state: DeletionState; homeHref?: string }): JSX.Element {
  const d = fr.legal.deletion;
  return (
    <LegalPageLayout title={d.title} homeHref={homeHref}>
      {state.kind === 'loading' ? <p className="text-body leading-prose text-text-muted">{d.checking}</p> : null}
      {state.kind === 'missing' ? <p className="text-body leading-prose">{d.missing}</p> : null}
      {state.kind === 'not_found' ? <p className="text-body leading-prose">{d.notFound}</p> : null}
      {state.kind === 'error' ? <p className="text-body leading-prose">{d.error}</p> : null}
      {state.kind === 'found' ? (
        <div className="flex flex-col gap-space-3">
          <p className="text-body leading-prose">{state.status === 'completed' ? d.completed : d.failed}</p>
          {state.requestedAt ? <p className="text-caption text-text-muted">{d.receivedOn(formatDateLongue(state.requestedAt))}</p> : null}
        </div>
      ) : null}
    </LegalPageLayout>
  );
}

/**
 * `/suppression-donnees?code=…` — PUBLIQUE, exigée par Meta : l'état d'une demande de
 * suppression est lu en GET sur l'Edge `meta-data-deletion` (frigo, reste déployée). Le code
 * UUID non devinable est le seul sésame ; la table n'est jamais exposée.
 */
export function SuppressionDonneesPage({ homeHref }: LegalPageProps = {}): JSX.Element {
  const location = useLocation();
  const [state, setState] = useState<DeletionState>({ kind: 'loading' });
  useEffect(() => {
    const code = new URLSearchParams(location.search).get('code')?.trim();
    if (!code) {
      setState({ kind: 'missing' });
      return;
    }
    const controller = new AbortController();
    const { supabaseUrl } = getShellConfig();
    fetch(`${supabaseUrl}/functions/v1/meta-data-deletion?code=${encodeURIComponent(code)}`, { signal: controller.signal })
      .then(res => res.json())
      .then((body: { success?: boolean; data?: { status?: string; requested_at?: string | null } }) => {
        if (body?.success && body.data?.status) setState({ kind: 'found', status: body.data.status, requestedAt: body.data.requested_at ?? null });
        else setState({ kind: 'not_found' });
      })
      .catch((err: unknown) => {
        if ((err as { name?: string })?.name !== 'AbortError') setState({ kind: 'error' });
      });
    return () => controller.abort();
  }, [location.search]);
  return <SuppressionDonneesView state={state} homeHref={homeHref} />;
}
