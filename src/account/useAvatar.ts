import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getSupabase } from '../lib/supabase';
import { useAuth } from '../auth/useAuth';
import { fr } from '../i18n/fr';
import { profileKey } from './useProfile';

const BUCKET = 'avatars';
const OUTPUT_SIZE = 512;
const MAX_INPUT_BYTES = 2 * 1024 * 1024;
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

/* Recadrage carré CENTRÉ + 512 px → webp via canvas. Pas de lib de crop : le sujet d'un
   avatar est au centre dans la quasi-totalité des cas. */
async function cropSquareToWebp(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  try {
    const side = Math.min(bitmap.width, bitmap.height);
    const canvas = document.createElement('canvas');
    canvas.width = OUTPUT_SIZE;
    canvas.height = OUTPUT_SIZE;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error(fr.errors.image.canvas);
    ctx.drawImage(bitmap, (bitmap.width - side) / 2, (bitmap.height - side) / 2, side, side, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE);
    const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/webp', 0.9));
    if (!blob) throw new Error(fr.errors.image.prepare);
    return blob;
  } finally {
    bitmap.close();
  }
}

/* URL publique = …/object/public/avatars/{path} — pour retirer l'ancien fichier. */
function storagePathFromPublicUrl(url: string): string | null {
  const marker = `/object/public/${BUCKET}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  const path = url.slice(idx + marker.length);
  return path ? decodeURIComponent(path) : null;
}

/** Nouvelle photo : validation → recadrage → upload `{user}/avatar-{ts}.webp` → `profiles.avatar_url` → ancien fichier retiré (best-effort). */
export function useUpdateAvatar() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ file, previousUrl }: { file: File; previousUrl: string | null }): Promise<string> => {
      if (!user) throw new Error(fr.errors.auth.sessionExpired);
      if (!ACCEPTED_TYPES.includes(file.type)) throw new Error(fr.errors.image.format);
      if (file.size > MAX_INPUT_BYTES) throw new Error(fr.errors.image.tooLarge);
      const supabase = getSupabase();
      const blob = await cropSquareToWebp(file);
      const path = `${user.id}/avatar-${Date.now()}.webp`;
      const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, blob, { contentType: 'image/webp' });
      if (uploadError) throw uploadError;
      const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);
      const { error: updateError } = await supabase.from('profiles').update({ avatar_url: pub.publicUrl }).eq('id', user.id);
      if (updateError) {
        await supabase.storage.from(BUCKET).remove([path]);
        throw updateError;
      }
      const oldPath = previousUrl ? storagePathFromPublicUrl(previousUrl) : null;
      if (oldPath && oldPath !== path) await supabase.storage.from(BUCKET).remove([oldPath]);
      return pub.publicUrl;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKey(user?.id) });
    },
  });
}

/** Retire la photo : `avatar_url = null`, puis le fichier (best-effort). */
export function useDeleteAvatar() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ previousUrl }: { previousUrl: string | null }): Promise<void> => {
      if (!user) throw new Error(fr.errors.auth.sessionExpired);
      const supabase = getSupabase();
      const { error } = await supabase.from('profiles').update({ avatar_url: null }).eq('id', user.id);
      if (error) throw error;
      const path = previousUrl ? storagePathFromPublicUrl(previousUrl) : null;
      if (path) await supabase.storage.from(BUCKET).remove([path]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKey(user?.id) });
    },
  });
}
