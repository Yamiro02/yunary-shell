/**
 * La déconnexion VOLONTAIRE (bouton « Se déconnecter », « Pas toi ? », suppression du compte). Posée par `signOut()`
 * avant l'appel à Supabase, lue par `ProtectedRoute` : une page protégée qui perd sa session à cause d'une déconnexion
 * voulue renvoie vers `/login` SANS `next` (sinon la reconnexion ramènerait sur la page quittée, recette A4 du
 * 27/09/2026). Une session expirée, elle, garde son `next`. Levée dès qu'une session revient.
 */
let explicit = false;

export function markExplicitSignOut(): void {
  explicit = true;
}

export function clearExplicitSignOut(): void {
  explicit = false;
}

export function isExplicitSignOut(): boolean {
  return explicit;
}
