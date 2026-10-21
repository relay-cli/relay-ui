import type {Align} from '../table/index.js';

export type MarkdownBlock =
  | {type: 'paragraph'; text: string}
  | {type: 'heading'; level: number; text: string}
  | {type: 'quote'; lines: readonly string[]}
  | {type: 'list'; ordered: boolean; start: number; items: readonly string[]}
  | {type: 'code'; language?: string; code: string}
  | {
      type: 'table';
      headers: readonly string[];
      align: readonly Align[];
      rows: readonly (readonly string[])[];
    }
  | {type: 'rule'};

export type InlineToken =
  | {type: 'text'; value: string}
  | {type: 'strong'; value: string}
  | {type: 'emphasis'; value: string}
  | {type: 'strike'; value: string}
  | {type: 'code'; value: string}
  | {type: 'link'; value: string; href: string};
