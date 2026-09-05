import { useEffect, useRef, useState, type ChangeEvent, type JSX } from 'react';
import { LogOut } from 'lucide-react';
import { Banner, Button, Card, FormField, Icon, Input } from '@yunary/ds';
import { fr } from '../i18n/fr';
import { getErrorMessage } from '../lib/errors';
import { initiales } from '../lib/format';
import { UserAvatar } from '../layout/AccountCard';
import { InstagramMark, TikTokMark } from '../auth/BrandMarks';
import { useProfile } from '../account/useProfile';
import { useUpdateProfile } from '../account/useUpdateProfile';
import { useDeleteAvatar, useUpdateAvatar } from '../account/useAvatar';
import { useAccountAudit } from '../audit/useAccountAudit';
import { useLogout } from '../auth/useLogout';
import { usePasswordReset } from '../auth/usePasswordReset';
import { PasswordModal } from './PasswordModal';
import { TabError, TabSkeleton } from './states';
import type { ParametresVariant } from './ParametresLayout';

export type SaveState = 'idle' | 'saving' | 'saved' | 'error';

export interface ReseauView {
  platform: string;
  handle: string;
}

export interface InfosViewProps {
  variant?: ParametresVariant;
  profile: { prenom: string | null; nom: string | null; email: string; avatarUrl: string | null };
  /** Réseau + handle, lecture seule (dernier `account_audits`). `null` = rien renseigné. */
  reseau: ReseauView | null;
  /** RÉSERVÉ : quand `profiles.platform` / `profiles.handle` existeront, ce callback rendra la carte éditable sans changer l'API. */
  onReseauChange?: (reseau: ReseauView) => void;
  onSave: (values: { prenom: string; nom: string }) => void;
  saveState?: SaveState;
  onChoosePhoto?: (file: File) => void;
  onRemovePhoto?: () => void;
  photoBusy?: boolean;
  photoError?: string | null;
  onChangePassword: () => void;
  onLogout: () => void;
  logoutBusy?: boolean;
}

const AUTOSAVE_MS = 600;

/** C2 — la vue. Prénom / nom en autosave (débounce), e-mail verrouillé, réseau en lecture seule, déconnexion. */
export function InfosView({
  variant = 'web', profile, reseau, onSave, saveState = 'idle', onChoosePhoto, onRemovePhoto, photoBusy = false, photoError = null,
  onChangePassword, onLogout, logoutBusy = false,
}: InfosViewProps): JSX.Element {
  const [prenom, setPrenom] = useState(profile.prenom ?? '');
  const [nom, setNom] = useState(profile.nom ?? '');
  const dirty = useRef(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const t = fr.parametres.infos;

  useEffect(() => {
    if (!dirty.current) return;
    const timer = window.setTimeout(() => {
      dirty.current = false;
      onSave({ prenom: prenom.trim(), nom: nom.trim() });
    }, AUTOSAVE_MS);
    return () => window.clearTimeout(timer);
  }, [prenom, nom, onSave]);

  const onFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onChoosePhoto) onChoosePhoto(file);
    e.target.value = '';
  };

  const account = { name: [prenom, nom].filter(Boolean).join(' ') || profile.email, initials: initiales(prenom, nom, profile.email), avatarUrl: profile.avatarUrl };
  const web = variant === 'web';

  return (
    <div className="flex max-w-read flex-col gap-space-5">
      <Card className="flex flex-col gap-space-5 shadow-none">
        {web ? (
          <div className="flex items-center gap-space-5">
            <UserAvatar account={account} size="4rem" className="text-subheading" />
            <div className="flex flex-col items-start gap-space-2">
              <div className="flex gap-space-2">
                <input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={onFile} />
                <Button variant="secondary" size="sm" loading={photoBusy} onClick={() => fileInput.current?.click()}>{t.choosePhoto}</Button>
                <Button variant="ghost" size="sm" disabled={!profile.avatarUrl || photoBusy} onClick={onRemovePhoto}>{t.removePhoto}</Button>
              </div>
              <span className="caption">{t.photoHint}</span>
            </div>
          </div>
        ) : null}
        {photoError ? <Banner tone="danger">{photoError}</Banner> : null}
        <div className="grid grid-cols-1 gap-space-4 sm:grid-cols-2">
          <FormField label={t.prenom} htmlFor="infos-prenom">
            <Input id="infos-prenom" autoComplete="given-name" placeholder={t.prenomPlaceholder} value={prenom} onChange={e => { dirty.current = true; setPrenom(e.target.value); }} />
          </FormField>
          <FormField label={t.nom} htmlFor="infos-nom">
            <Input id="infos-nom" autoComplete="family-name" placeholder={t.nomPlaceholder} value={nom} onChange={e => { dirty.current = true; setNom(e.target.value); }} />
          </FormField>
        </div>
        <FormField label={t.email} htmlFor="infos-email" help={t.emailLocked}>
          <Input id="infos-email" type="email" value={profile.email} readOnly disabled />
        </FormField>
        <FormField label={t.password}>
          <div className="flex"><Button variant="secondary" onClick={onChangePassword}>{t.changePassword}</Button></div>
        </FormField>
        <div className="flex min-h-[1.125rem] justify-end" aria-live="polite">
          {saveState === 'saving' ? <span className="caption">{fr.common.saving}</span> : null}
          {saveState === 'saved' ? <span className="caption">{fr.common.saved}</span> : null}
          {saveState === 'error' ? <span className="text-caption text-destructive-readable">{fr.errors.generic}</span> : null}
        </div>
      </Card>

      {web ? (
        <Card className="flex flex-col gap-space-5 shadow-none" title={t.reseau.title} subtitle={t.reseau.subtitle} titleSize="lg">
          {reseau ? (
            <div className="flex items-center gap-space-4 rounded-md border-[1.5px] border-input bg-background p-space-4">
              <span className="text-[1.375rem] text-foreground">{reseau.platform === 'tiktok' ? <TikTokMark /> : <InstagramMark />}</span>
              <div className="flex min-w-0 flex-1 flex-col gap-space-1">
                <span className="text-control font-bold">{reseau.platform === 'tiktok' ? t.reseau.tiktok : t.reseau.instagram}</span>
                <span className="caption truncate font-regular">@{reseau.handle}</span>
              </div>
            </div>
          ) : (
            <p className="caption font-regular">{t.reseau.none}</p>
          )}
        </Card>
      ) : null}

      <Card className="flex flex-col gap-space-4 shadow-none" title={t.logoutTitle}>
        <div className="flex">
          <Button variant="danger" icon={<Icon glyph={LogOut} size="1rem" />} loading={logoutBusy} onClick={onLogout}>{t.logout}</Button>
        </div>
      </Card>
    </div>
  );
}

/** C2 câblée : profil, dernier audit (réseau + handle), avatar, mot de passe, déconnexion. */
export function InfosTab({ variant = 'web' }: { variant?: ParametresVariant }): JSX.Element {
  const profile = useProfile();
  const audit = useAccountAudit();
  const update = useUpdateProfile();
  const updateAvatar = useUpdateAvatar();
  const deleteAvatar = useDeleteAvatar();
  const logout = useLogout();
  const { updatePassword } = usePasswordReset();
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [logoutBusy, setLogoutBusy] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);

  useEffect(() => {
    if (saveState !== 'saved') return;
    const t = window.setTimeout(() => setSaveState('idle'), 2_500);
    return () => window.clearTimeout(t);
  }, [saveState]);

  if (profile.isPending) return <TabSkeleton />;
  if (profile.isError) return <TabError message={fr.parametres.infos.loadError} onRetry={() => profile.refetch()} />;

  const p = profile.data;
  return (
    <>
      <InfosView
        variant={variant}
        profile={{ prenom: p.prenom, nom: p.nom, email: p.email, avatarUrl: p.avatar_url }}
        reseau={audit.data ? { platform: audit.data.platform, handle: audit.data.handle } : null}
        saveState={saveState}
        onSave={values => {
          setSaveState('saving');
          update.mutate(values, { onSuccess: () => setSaveState('saved'), onError: () => setSaveState('error') });
        }}
        onChoosePhoto={file => {
          setPhotoError(null);
          updateAvatar.mutate({ file, previousUrl: p.avatar_url }, { onError: e => setPhotoError(getErrorMessage(e)) });
        }}
        onRemovePhoto={() => {
          setPhotoError(null);
          deleteAvatar.mutate({ previousUrl: p.avatar_url }, { onError: e => setPhotoError(getErrorMessage(e)) });
        }}
        photoBusy={updateAvatar.isPending || deleteAvatar.isPending}
        photoError={photoError}
        onChangePassword={() => setPasswordOpen(true)}
        onLogout={async () => {
          setLogoutBusy(true);
          try {
            await logout();
          } catch {
            setLogoutBusy(false);
          }
        }}
        logoutBusy={logoutBusy}
      />
      <PasswordModal open={passwordOpen} onClose={() => setPasswordOpen(false)} onSubmit={updatePassword} />
    </>
  );
}
