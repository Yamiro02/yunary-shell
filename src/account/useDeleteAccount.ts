import { useMutation } from '@tanstack/react-query';
import { getSupabase } from '../lib/supabase';
import { fr } from '../i18n/fr';

interface DeleteAccountResponse {
  success: boolean;
  message?: string;
}

/**
 * Suppression définitive via l'Edge `delete-account` (résiliation Stripe immédiate, purge
 * des données et du Storage, `auth.admin.deleteUser`). Au succès, le compte auth n'existe
 * plus : on coupe la session LOCALE sans se soucier d'une erreur serveur.
 */
export function useDeleteAccount() {
  return useMutation({
    mutationFn: async (): Promise<void> => {
      const { data, error } = await getSupabase().functions.invoke<DeleteAccountResponse>('delete-account', { body: {} });
      if (error) throw new Error(fr.errors.accountDeleteFailed);
      if (!data?.success) throw new Error(data?.message ?? fr.errors.accountDeleteFailed);
    },
    onSuccess: async () => {
      await getSupabase().auth.signOut({ scope: 'local' }).catch(() => undefined);
    },
  });
}
