import type { JSX } from 'react';
import { Card, Separator, Switch } from '@yunary/ds';
import { fr } from '../i18n/fr';
import { useProfile, type NotificationPrefs } from '../account/useProfile';
import { useUpdateProfile } from '../account/useUpdateProfile';
import { TabError, TabSkeleton } from './states';

export interface NotificationsViewProps {
  prefs: NotificationPrefs;
  onToggle: (key: keyof NotificationPrefs, value: boolean) => void;
  /** La préférence en cours d'enregistrement — son interrupteur est désactivé le temps de l'aller-retour. */
  pending?: keyof NotificationPrefs | null;
}

const ROWS: { key: keyof NotificationPrefs; label: string; description: string }[] = [
  { key: 'analyse_terminee', ...fr.parametres.notifications.analyseTerminee },
  { key: 'nouveaux_templates', ...fr.parametres.notifications.nouveauxTemplates },
];

/** C3 — la vue : une carte, une ligne par préférence, interrupteur du DS à droite. */
export function NotificationsView({ prefs, onToggle, pending = null }: NotificationsViewProps): JSX.Element {
  return (
    <Card className="flex max-w-read flex-col py-0 shadow-none">
      {ROWS.map((row, i) => (
        <div key={row.key} className="contents">
          {i > 0 ? <Separator /> : null}
          <label className="flex cursor-pointer items-center justify-between gap-space-6 py-space-5">
            <span className="flex flex-col gap-space-1">
              <span className="font-display text-body-lg font-(--heading-weight) tracking-heading-sm">{row.label}</span>
              <span className="caption font-regular">{row.description}</span>
            </span>
            <Switch aria-label={row.label} checked={prefs[row.key]} disabled={pending === row.key} onChange={e => onToggle(row.key, e.target.checked)} />
          </label>
        </div>
      ))}
    </Card>
  );
}

/** C3 câblée : `profiles.notification_prefs`, mise à jour optimiste par bascule. */
export function NotificationsTab(): JSX.Element {
  const profile = useProfile();
  const update = useUpdateProfile();
  if (profile.isPending) return <TabSkeleton lines={2} />;
  if (profile.isError) return <TabError message={fr.parametres.notifications.loadError} onRetry={() => profile.refetch()} />;
  const prefs = profile.data.notification_prefs;
  const pendingKey = update.isPending ? (Object.keys(update.variables?.notification_prefs ?? {}).find(k => update.variables?.notification_prefs?.[k as keyof NotificationPrefs] !== prefs[k as keyof NotificationPrefs]) as keyof NotificationPrefs | undefined) ?? null : null;
  return (
    <NotificationsView
      prefs={prefs}
      pending={pendingKey}
      onToggle={(key, value) => update.mutate({ notification_prefs: { ...prefs, [key]: value } })}
    />
  );
}
