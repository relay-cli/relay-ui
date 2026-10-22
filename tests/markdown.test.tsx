import {render} from 'ink-testing-library';
import {describe, expect, it} from 'vitest';
import {Markdown, parseInline, parseMarkdownBlocks} from '../src/index.js';

const lines = (frame: string | undefined): string[] =>
  (frame ?? '').split('\n').map((line) => line.trimEnd());

describe('Markdown blocks', () => {
  it('recognizes headings, lists, quotes, fenced code, tables, and rules', () => {
    const blocks = parseMarkdownBlocks(
      [
        '# Title',
        '',
        '- one',
        '- two',
        '',
        '> note',
        '',
        '```ts',
        'const x = 1;',
        '```',
        '',
        '| a | b |',
        '| - | -: |',
        '| 1 | 2 |',
        '',
        '---',
      ].join('\n'),
    );
    expect(blocks.map(({type}) => type)).toEqual([
      'heading',
      'list',
      'quote',
      'code',
      'table',
      'rule',
    ]);
    expect(blocks[3]).toEqual({type: 'code', language: 'ts', code: 'const x = 1;'});
    expect(blocks[4]).toEqual({
      type: 'table',
      headers: ['a', 'b'],
      align: ['left', 'right'],
      rows: [['1', '2']],
    });
  });

  it('keeps the number an ordered list starts at', () => {
    expect(parseMarkdownBlocks('3. three\n4. four')[0]).toEqual({
      type: 'list',
      ordered: true,
      start: 3,
      items: ['three', 'four'],
    });
  });

  it('joins indented lines onto the list item above', () => {
    expect(parseMarkdownBlocks('- first line\n  continues here\n- second')[0]).toMatchObject({
      items: ['first line continues here', 'second'],
    });
  });

  it('treats an unclosed fence as code to the end, as a streaming reply is', () => {
    expect(parseMarkdownBlocks('Here:\n```py\nprint(1)')).toEqual([
      {type: 'paragraph', text: 'Here:'},
      {type: 'code', language: 'py', code: 'print(1)'},
    ]);
  });

  it('ends a paragraph where a table starts', () => {
    const blocks = parseMarkdownBlocks('Results:\n| a | b |\n|---|---|\n| 1 | 2 |');
    expect(blocks.map(({type}) => type)).toEqual(['paragraph', 'table']);
  });

  it('pads short table rows and keeps escaped pipes as text', () => {
    const [table] = parseMarkdownBlocks('| cmd | note |\n|---|---|\n| a \\| b |');
    expect(table).toMatchObject({rows: [['a | b', '']]});
  });

  it('accepts CRLF line endings', () => {
    expect(parseMarkdownBlocks('# A\r\n\r\ntext')).toEqual([
      {type: 'heading', level: 1, text: 'A'},
      {type: 'paragraph', text: 'text'},
    ]);
  });
});

describe('Markdown inline', () => {
  it('recognizes bold, italics, strikethrough, code, and links', () => {
    expect(
      parseInline('Use **bold**, *it*, ~~old~~, `code`, and [docs](https://example.com).').map(
        ({type}) => type,
      ),
    ).toEqual([
      'text',
      'strong',
      'text',
      'emphasis',
      'text',
      'strike',
      'text',
      'code',
      'text',
      'link',
      'text',
    ]);
  });

  it('leaves arithmetic alone', () => {
    expect(parseInline('2 * 3 * 4')).toEqual([{type: 'text', value: '2 * 3 * 4'}]);
  });
});

describe('Markdown', () => {
  it('formats text inside headings, list items, and quotes', () => {
    const {lastFrame} = render(
      <Markdown
        source={
          '## Use `relay-ui`\n\n1. Install **it**\n2. See [docs](https://relay.dev)\n\n> Keep `q` free'
        }
      />,
    );
    expect(lines(lastFrame())).toEqual([
      'Use relay-ui',
      '',
      '1. Install it',
      '2. See docs (https://relay.dev)',
      '',
      '│ Keep q free',
    ]);
  });

  it('right-aligns list numbers once they reach two digits', () => {
    const source = Array.from({length: 10}, (_, index) => `${index + 1}. item`).join('\n');
    const output = lines(render(<Markdown source={source} />).lastFrame());
    expect(output[0]).toBe(' 1. item');
    expect(output[9]).toBe('10. item');
  });

  it('draws tables with the Table component', () => {
    const {lastFrame} = render(
      <Markdown source={'| Name | Size |\n|---|--:|\n| **cards** | 12 |\n| chat | 340 |'} />,
    );
    expect(lines(lastFrame())).toEqual([
      'Name   Size',
      '───────────',
      'cards    12',
      'chat    340',
    ]);
  });

  it('shows a link once when its text is the address', () => {
    const {lastFrame} = render(<Markdown source="[https://relay.dev](https://relay.dev)" />);
    expect(lastFrame()).toBe('https://relay.dev');
  });

  it('draws code in a box with its language', () => {
    const output = lines(render(<Markdown source={'```sh\nnpm test\n```'} />).lastFrame());
    expect(output[1]).toContain('sh');
    expect(output[2]).toContain('npm test');
  });

  it('draws a rule as wide as it is given', () => {
    expect(render(<Markdown source="***" width={12} />).lastFrame()).toBe('─'.repeat(12));
  });
});
