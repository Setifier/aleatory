interface EmailValidationResult {
  isValid: boolean;
  formatted: string;
  error?: string;
}

export const formatAndValidateEmail = (
  input: string
): EmailValidationResult => {
  // 1. Trim les espaces en début/fin
  const trimmed = input.trim();

  // 2. Convertir en minuscules (standard pour les emails)
  const formatted = trimmed.toLowerCase();

  // 3. Validation de base de l'email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(formatted)) {
    return {
      isValid: false,
      formatted,
      error: "Format d'email invalide",
    };
  }

  // 4. Validations supplémentaires
  if (formatted.length < 5) {
    return {
      isValid: false,
      formatted,
      error: "L'email est trop court",
    };
  }

  if (formatted.length > 254) {
    return {
      isValid: false,
      formatted,
      error: "L'email est trop long",
    };
  }

  return { isValid: true, formatted };
};