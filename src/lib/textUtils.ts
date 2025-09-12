/**
 * Normalise le texte saisi par l'utilisateur pour assurer la cohérence
 * - Supprime les espaces en début/fin
 * - Remplace les espaces multiples par un seul espace
 * - Met en forme Title Case (première lettre de chaque mot en majuscule)
 */
export const normalizeText = (text: string): string => {
  if (!text || typeof text !== 'string') {
    return '';
  }
  
  return (
    text
      // Réduire les espaces multiples à un seul espace
      .replace(/\s+/g, " ")
      // Supprimer les espaces en début et fin
      .trim()
      // Convertir tout en minuscules d'abord
      .toLowerCase()
      // Mettre en majuscule la première lettre de chaque mot (sauf après un tiret)
      .replace(/(?:^|\s)([a-z])/g, (match, letter) =>
        match.replace(letter, letter.toUpperCase())
      )
  );
};