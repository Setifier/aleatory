interface EmailValidationResult {
  isValid: boolean;
  formatted: string;
  error?: string;
}

export const formatAndValidateEmail = (
  input: string
): EmailValidationResult => {
  const trimmed = input.trim();
  const formatted = trimmed.toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(formatted)) {
    return {
      isValid: false,
      formatted,
      error: "Format d'email invalide",
    };
  }

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