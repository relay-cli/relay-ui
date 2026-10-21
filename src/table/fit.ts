import stringWidth from 'string-width';

export type Align = 'left' | 'right' | 'center';
export type Truncate = 'end' | 'middle';

const ellipsis = '…';
const segmenter = new Intl.Segmenter();

/** User-perceived characters, so emoji sequences and accents are never split. */
const graphemes = (text: string): string[] =>
  Array.from(segmenter.segment(text), (part) => part.segment);

/** Cells are one line: newlines and tabs become spaces. */
export const flattenCell = (text: string): string => text.replace(/[\t\r\n]+/g, ' ');

export const textWidth = (text: string): number => stringWidth(text);

/** The longest prefix of `text` that fits in `width` terminal columns. */
const takeStart = (text: string, width: number): string => {
  let result = '';
  let used = 0;
  for (const character of graphemes(text)) {
    const size = stringWidth(character);
    if (used + size > width) break;
    result += character;
    used += size;
  }
  return result;
};

const takeEnd = (text: string, width: number): string => {
  const characters = graphemes(text);
  let result = '';
  let used = 0;
  for (let index = characters.length - 1; index >= 0; index -= 1) {
    const character = characters[index] ?? '';
    const size = stringWidth(character);
    if (used + size > width) break;
    result = character + result;
    used += size;
  }
  return result;
};

/** Shorten `text` to at most `width` columns, marking the cut with an ellipsis. */
export const truncate = (text: string, width: number, mode: Truncate = 'end'): string => {
  if (width <= 0) return '';
  if (stringWidth(text) <= width) return text;
  if (width === 1) return ellipsis;
  if (mode === 'middle') {
    const kept = width - 1;
    const head = takeStart(text, Math.ceil(kept / 2));
    return head + ellipsis + takeEnd(text, kept - stringWidth(head));
  }
  return takeStart(text, width - 1) + ellipsis;
};

/** Truncate and pad `text` to exactly `width` columns. */
export const fit = (
  text: string,
  width: number,
  align: Align = 'left',
  mode: Truncate = 'end',
): string => {
  const cut = truncate(text, width, mode);
  const space = width - stringWidth(cut);
  if (space <= 0) return cut;
  if (align === 'right') return ' '.repeat(space) + cut;
  if (align === 'center') {
    const left = Math.floor(space / 2);
    return ' '.repeat(left) + cut + ' '.repeat(space - left);
  }
  return cut + ' '.repeat(space);
};
