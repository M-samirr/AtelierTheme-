const ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
};

/**
 * Merchant HTML as plain text: tags dropped, common entities decoded, spaces
 * collapsed. Salla's review forbids rendering merchant text as HTML, so store
 * and category descriptions go through this.
 */
export function plainText(html: string | null | undefined): string {
  if (!html) return '';
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&(#\d+|#x[\da-f]+|[a-z]+);/gi, (entity, code: string) => {
      if (code[0] !== '#') return ENTITIES[code.toLowerCase()] ?? entity;
      const hex = code[1] === 'x' || code[1] === 'X';
      const point = hex ? parseInt(code.slice(2), 16) : Number(code.slice(1));
      return point >= 0 && point <= 0x10ffff ? String.fromCodePoint(point) : entity;
    })
    .replace(/\s+/g, ' ')
    .trim();
}

/** A textarea value as paragraphs, split on blank or single line breaks. */
export function paragraphs(text: string | null | undefined): string[] {
  if (!text) return [];
  return text
    .split(/\r?\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
}
