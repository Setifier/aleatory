export const normalizeText = (text: string): string => {
  if (!text || typeof text !== 'string') {
    return '';
  }

  return (
    text
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase()
      .replace(/(?:^|\s)([a-z])/g, (match, letter) =>
        match.replace(letter, letter.toUpperCase())
      )
  );
};