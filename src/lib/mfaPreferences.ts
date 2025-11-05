export const isMfaEnabledInPreferences = (): boolean => {
  const savedMfaEnabled = localStorage.getItem('mfa-enabled');
  return savedMfaEnabled === 'true';
};

export const setMfaEnabledPreference = (enabled: boolean): void => {
  localStorage.setItem('mfa-enabled', enabled.toString());
};