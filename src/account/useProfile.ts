import { useQuery } from '@tanstack/react-query';
import { getSupabase } from '../lib/supabase';
import { useAuth } from '../auth/useAuth';

/* `role` (Admin du Hub) n'existe pas encore en base — il arrive avec la première migration du
   Hub. Il sera ajouté ici à ce moment-là, avec les types régénérés. */
export const PROFILE_COLUMNS = 'id, prenom, nom, email, onboarding_completed, avatar_url, notification_prefs, locale' as const;

export interface NotificationPrefs {
  analyse_terminee: boolean;
  nouveaux_templates: boolean;
}

export const DEFAULT_NOTIFICATION_PREFS: NotificationPrefs = { analyse_terminee: true, nouveaux_templates: true };

/** Lecture tolérante du jsonb (`{}` par défaut, partiel ou mal formé) : les défauts `true` sont appliqués ici. */
export function parseNotificationPrefs(raw: unknown): NotificationPrefs {
  if (!raw || typeof raw !== 'object') return { ...DEFAULT_NOTIFICATION_PREFS };
  const v = raw as Partial<NotificationPrefs>;
  return {
    analyse_terminee: v.analyse_terminee ?? true,
    nouveaux_templates: v.nouveaux_templates ?? true,
  };
}

export interface Profile {
  id: string;
  prenom: string | null;
  nom: string | null;
  email: string;
  onboarding_completed: boolean;
  avatar_url: string | null;
  notification_prefs: NotificationPrefs;
  locale: string | null;
}

export const profileKey = (userId: string | undefined) => ['profile', userId] as const;

/**
 * Le profil de l'utilisateur courant (RLS : sa propre ligne).
 */
export function useProfile() {
  const { user } = useAuth();
  return useQuery({
    queryKey: profileKey(user?.id),
    enabled: !!user,
    queryFn: async (): Promise<Profile> => {
      const { data, error } = await getSupabase()
        .from('profiles')
        .select(PROFILE_COLUMNS)
        .eq('id', user!.id)
        .single();
      if (error) throw error;
      return { ...data, notification_prefs: parseNotificationPrefs(data.notification_prefs) };
    },
  });
}
