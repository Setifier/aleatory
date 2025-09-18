// Fonction de validation et formatage du pseudo
export const formatAndValidatePseudo = (
  input: string
): { isValid: boolean; formatted: string; error?: string } => {
  // 1. Validation des caractères interdits AVANT nettoyage
  if (/[0-9]/.test(input)) {
    return {
      isValid: false,
      formatted: input,
      error: "Le pseudo ne peut pas contenir de chiffres",
    };
  }

  if (/[^a-zA-ZÀ-ÿ\s]/.test(input)) {
    return {
      isValid: false,
      formatted: input,
      error: "Le pseudo ne peut contenir que des lettres",
    };
  }

  // 2. Remplace les espaces multiples par un seul
  const singleSpaced = input.replace(/\s+/g, " ");

  // 3. Trim les espaces en début/fin
  const trimmed = singleSpaced.trim();

  // 4. Capitalise chaque mot
  const formatted = trimmed
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");

  // 5. Validations
  if (formatted.length < 2) {
    return {
      isValid: false,
      formatted,
      error: "Le pseudo doit contenir au moins 2 lettres",
    };
  }

  const spaceCount = (formatted.match(/\s/g) || []).length;
  if (spaceCount > 2) {
    return {
      isValid: false,
      formatted,
      error: "Maximum 2 espaces autorisés",
    };
  }

  return { isValid: true, formatted };
};