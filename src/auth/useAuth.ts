import { useSyncExternalStore } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { getSupabase } from '../lib/supabase';

export interface AuthState {
  session: Session | null;
  user: User | null;
  /** `true` pendant la résolution initiale — ProtectedRoute affiche un loader, jamais une redirection. */
  loading: boolean;
}

/* Store module-singleton : UN abonnement onAuthStateChange pour toute l'app, partagé par
   useSyncExternalStore. Pas de Provider, pas de listeners en double. Le client n'est
   touché qu'au premier abonnement — donc après configureShell. */
let state: AuthState = { session: null, user: null, loading: true };
const listeners = new Set<() => void>();
let initialized = false;

function emit(next: AuthState): void {
  state = next;
  listeners.forEach(l => l());
}

function init(): void {
  if (initialized) return;
  initialized = true;
  const supabase = getSupabase();
  supabase.auth
    .getSession()
    .then(({ data }) => emit({ session: data.session, user: data.session?.user ?? null, loading: false }))
    .catch(() => emit({ session: null, user: null, loading: false }));
  supabase.auth.onAuthStateChange((_event, session) => {
    emit({ session, user: session?.user ?? null, loading: false });
  });
}

function subscribe(callback: () => void): () => void {
  init();
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

function getSnapshot(): AuthState {
  return state;
}

/**
 * Source unique de la session côté front. Ne jamais appeler `supabase.auth.getSession()`
 * ni `getUser()` dans un composant : `useAuth()`.
 */
export function useAuth(): AuthState {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
