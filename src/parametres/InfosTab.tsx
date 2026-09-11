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
  /** Réseau + handle, lecture seule (`profiles.platform` / `profiles.handle`). `null` = rien renseigné. */
  reseau: ReseauView | null;
  /** RÉSERVÉ : rendra la carte éditable sans changer l'API (relance d'audit = lot ultérieur). */
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
      {/* Artboard C2 : blocs à 20 px dans la carte → `space-4` (Julien : trop d'air à 24) ; la ligne d'état
          « Enregistré » n'occupe aucune place tant qu'elle est vide. */}
      <Card gap={4} className="shadow-none">
        {/* Sous 64 rem, la rangée photo et ses deux boutons passent à la ligne (64 + 264 px ne tiennent pas dans une carte à 375 px). */}
        {web ? (
          <div className="flex flex-wrap items-center gap-space-5">
            <UserAvatar account={account} size="4rem" className="text-subheading" />
            <div className="flex min-w-0 flex-col items-start gap-space-2">
              <div className="flex flex-wrap gap-space-2">
                <input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={onFile} />
                {/* Artboard C2 : boutons secondaires SUR la carte (le socle ne déduit pas la surface d'un bouton). */}
                <Button variant="secondary" surface="card" size="sm" loading={photoBusy} onClick={() => fileInput.current?.click()}>{t.choosePhoto}</Button>
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
          <div className="flex"><Button variant="secondary" surface="card" onClick={onChangePassword}>{t.changePassword}</Button></div>
        </FormField>
        <div className="flex justify-end empty:hidden" aria-live="polite">
          {saveState === 'saving' ? <span className="caption">{fr.common.saving}</span> : null}
          {saveState === 'saved' ? <span className="caption">{fr.common.saved}</span> : null}
          {saveState === 'error' ? <span className="text-caption text-destructive-readable">{fr.errors.generic}</span> : null}
        </div>
      </Card>

      {/* Artboard C2 « Comptes connectés » (Julien, 08/09/2026, renverse l'écart « une seule rangée ») :
          titre à la taille de l'artboard (`subheading`, Julien 11/09/2026), chapô, DEUX rangées
          Instagram / TikTok à filet 1,5 px --input sur --background, note. La rangée connectée porte le pseudo (lecture seule, depuis
          `profiles`) ; la rangée non connectée porte le bouton « Connecter » de l'artboard, désactivé
          tant qu'OAuth est au frigo (état en attente d'arbitrage). */}
      {web ? (
        <Card className="shadow-none" title={t.comptes.title} titleSize="lg" subtitle={t.comptes.subtitle}>
          {/* Le slot de titre porte déjà sa gouttière (16) : pas de gap de carte en plus. */}
          <div className="flex flex-col gap-space-4">
            {(['instagram', 'tiktok'] as const).map(platform => {
              const connected = reseau?.platform === platform ? reseau : null;
              return (
                <div key={platform} className="flex items-center gap-space-3 rounded-md border-[1.5px] border-input bg-background p-space-4">
                  <span className="text-[1.375rem] text-foreground">{platform === 'tiktok' ? <TikTokMark /> : <InstagramMark />}</span>
                  <div className="flex min-w-0 flex-1 flex-col gap-space-1">
                    <span className="text-control font-bold">{platform === 'tiktok' ? t.reseau.tiktok : t.reseau.instagram}</span>
                    <span className="caption truncate font-regular">{connected ? `@${connected.handle}` : t.comptes.none}</span>
                  </div>
                  {/* « Connecter » comme sur l'artboard — inerte tant qu'OAuth est au frigo. */}
                  {connected ? null : <Button variant="primary" size="sm" disabled title={fr.common.soon} className="flex-none">{t.comptes.connect}</Button>}
                </div>
              );
            })}
            <p className="caption font-regular">{t.comptes.note}</p>
          </div>
        </Card>
      ) : null}

      <Card className="shadow-none" title={t.logoutTitle}>
        <div className="flex">
          <Button variant="danger" icon={<Icon glyph={LogOut} size="1rem" />} loading={logoutBusy} onClick={onLogout}>{t.logout}</Button>
        </div>
      </Card>
    </div>
  );
}

/** C2 câblée : profil (dont réseau + handle), avatar, mot de passe, déconnexion. */
export function InfosTab({ variant = 'web' }: { variant?: ParametresVariant }): JSX.Element {
  const profile = useProfile();
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
        reseau={p.platform && p.handle ? { platform: p.platform, handle: p.handle } : null}
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
