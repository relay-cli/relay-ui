import type {Align} from '../table/index.js';
import type {MarkdownBlock} from './types.js';

const headingPattern = /^(#{1,6})\s+(.+?)\s*#*\s*$/;
const unorderedPattern = /^\s*[-*+]\s+(.+)$/;
const orderedPattern = /^\s*(\d+)[.)]\s+(.+)$/;
const rulePattern = /^\s*([-*_])(?:\s*\1){2,}\s*$/;
const quotePattern = /^\s*>\s?(.*)$/;
const fencePattern = /^\s*(```|~~~)\s*([\w+-]*)/;
const tableSeparatorPattern = /^\s*\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)*\|?\s*$/;

/** The cells of a `| a | b |` row, with escaped pipes kept as text. */
const splitRow = (line: string): string[] => {
  const trimmed = line
    .trim()
    .replace(/^\|/, '')
    .replace(/(?<!\\)\|$/, '');
  return trimmed.split(/(?<!\\)\|/).map((cell) => cell.trim().replace(/\\\|/g, '|'));
};

const alignOf = (cell: string): Align => {
  const left = cell.startsWith(':');
  const right = cell.endsWith(':');
  if (left && right) return 'center';
  if (right) return 'right';
  return 'left';
};

const startsTable = (line: string, next: string | undefined): boolean =>
  line.includes('|') && next !== undefined && tableSeparatorPattern.test(next);

const startsBlock = (line: string, next: string | undefined): boolean =>
  line.trim() === '' ||
  fencePattern.test(line) ||
  headingPattern.test(line) ||
  rulePattern.test(line) ||
  quotePattern.test(line) ||
  unorderedPattern.test(line) ||
  orderedPattern.test(line) ||
  startsTable(line, next);

/**
 * Split Markdown into blocks. This covers what chat replies and READMEs use:
 * headings, paragraphs, lists, quotes, fenced code, pipe tables, and rules.
 * Unclosed code fences run to the end, so a reply that is still streaming
 * renders its code as code.
 */
export const parseMarkdownBlocks = (source: string): readonly MarkdownBlock[] => {
  const lines = source.replace(/\r\n?/g, '\n').split('\n');
  const blocks: MarkdownBlock[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index] ?? '';
    const next = lines[index + 1];
    if (line.trim() === '') {
      index += 1;
      continue;
    }

    const fence = fencePattern.exec(line);
    if (fence !== null) {
      const marker = fence[1] ?? '```';
      const language = fence[2] === '' ? undefined : fence[2];
      const code: string[] = [];
      index += 1;
      while (index < lines.length && !(lines[index] ?? '').trimStart().startsWith(marker)) {
        code.push(lines[index] ?? '');
        index += 1;
      }
      if (index < lines.length) index += 1;
      blocks.push({
        type: 'code',
        code: code.join('\n'),
        ...(language === undefined ? {} : {language}),
      });
      continue;
    }

    const heading = headingPattern.exec(line);
    if (heading !== null) {
      blocks.push({type: 'heading', level: heading[1]?.length ?? 1, text: heading[2] ?? ''});
      index += 1;
      continue;
    }

    if (rulePattern.test(line)) {
      blocks.push({type: 'rule'});
      index += 1;
      continue;
    }

    if (quotePattern.test(line)) {
      const quote: string[] = [];
      let match;
      while (index < lines.length && (match = quotePattern.exec(lines[index] ?? '')) !== null) {
        quote.push(match[1] ?? '');
        index += 1;
      }
      blocks.push({type: 'quote', lines: quote});
      continue;
    }

    if (startsTable(line, next)) {
      const headers = splitRow(line);
      const align = splitRow(next ?? '').map(alignOf);
      const rows: string[][] = [];
      index += 2;
      while (index < lines.length && (lines[index] ?? '').includes('|')) {
        const cells = splitRow(lines[index] ?? '');
        rows.push(headers.map((_, column) => cells[column] ?? ''));
        index += 1;
      }
      blocks.push({type: 'table', headers, align, rows});
      continue;
    }

    const ordered = orderedPattern.exec(line);
    if (ordered !== null || unorderedPattern.test(line)) {
      const isOrdered = ordered !== null;
      const items: string[] = [];
      while (index < lines.length) {
        const current = lines[index] ?? '';
        const item = isOrdered
          ? orderedPattern.exec(current)?.[2]
          : unorderedPattern.exec(current)?.[1];
        if (item !== undefined) items.push(item);
        else if (current.trim() !== '' && /^\s+/.test(current) && items.length > 0) {
          // An indented line continues the item above it.
          items[items.length - 1] = `${items.at(-1) ?? ''} ${current.trim()}`;
        } else break;
        index += 1;
      }
      blocks.push({
        type: 'list',
        ordered: isOrdered,
        start: isOrdered ? Number(ordered[1]) : 1,
        items,
      });
      continue;
    }

    const paragraph = [line.trim()];
    index += 1;
    while (index < lines.length && !startsBlock(lines[index] ?? '', lines[index + 1])) {
      paragraph.push((lines[index] ?? '').trim());
      index += 1;
    }
    blocks.push({type: 'paragraph', text: paragraph.join(' ')});
  }

  return blocks;
};
