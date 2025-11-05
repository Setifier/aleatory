export const formatAndValidatePseudo = (
  input: string
): { isValid: boolean; formatted: string; error?: string } => {
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

  const singleSpaced = input.replace(/\s+/g, " ");
  const trimmed = singleSpaced.trim();
  const formatted = trimmed
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");

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