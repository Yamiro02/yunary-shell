import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getSupabase } from '../lib/supabase';
import { useAuth } from '../auth/useAuth';
import { fr } from '../i18n/fr';
import { profileKey, type NotificationPrefs } from './useProfile';
import type { Json, TablesUpdate } from '../integrations/supabase/types';

export interface ProfileUpdate {
  prenom?: string | null;
  nom?: string | null;
  notification_prefs?: NotificationPrefs;
}

/** Mise à jour partielle des colonnes éditables (prénom, nom, préférences). L'e-mail est en lecture seule. */
export function useUpdateProfile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (values: ProfileUpdate): Promise<void> => {
      if (!user) throw new Error(fr.errors.auth.sessionExpired);
      const payload: TablesUpdate<'profiles'> = {
        ...(values.prenom !== undefined ? { prenom: values.prenom } : {}),
        ...(values.nom !== undefined ? { nom: values.nom } : {}),
        ...(values.notification_prefs ? { notification_prefs: values.notification_prefs as unknown as Json } : {}),
      };
      const { error } = await getSupabase().from('profiles').update(payload).eq('id', user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKey(user?.id) });
    },
  });
}
