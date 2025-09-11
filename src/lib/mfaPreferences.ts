/**
 * Vérifier si MFA est activé dans les préférences utilisateur
 */
export const isMfaEnabledInPreferences = (): boolean => {
  const savedMfaEnabled = localStorage.getItem('mfa-enabled');
  // Par défaut, MFA est DÉSACTIVÉ pour les nouveaux utilisateurs
  return savedMfaEnabled === 'true';
};

/**
 * Activer/désactiver MFA dans les préférences
 */
export const setMfaEnabledPreference = (enabled: boolean): void => {
  localStorage.setItem('mfa-enabled', enabled.toString());
};