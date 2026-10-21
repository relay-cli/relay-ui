import {render} from 'ink-testing-library';
import {describe, expect, it} from 'vitest';
import {Table, fit, layoutColumns, truncate, visibleRange, type Column} from '../src/index.js';

interface Request {
  method: string;
  path: string;
  status: number;
  ms: number;
}

const health: Request = {method: 'GET', path: '/health', status: 200, ms: 3.2};

const rows: Request[] = [
  health,
  {method: 'POST', path: '/api/orders/2026/10/21/items', status: 201, ms: 48.9},
  {method: 'GET', path: '/missing', status: 404, ms: 1.1},
];

const method: Column<Request> = {key: 'method', header: 'Method'};
const path: Column<Request> = {key: 'path', header: 'Path', truncate: 'middle'};
const status: Column<Request> = {key: 'status', header: 'Status', align: 'right'};

const columns: Column<Request>[] = [
  method,
  path,
  status,
  {key: 'ms', header: 'Time', align: 'right', value: (row) => `${row.ms.toFixed(1)} ms`},
];

const lines = (frame: string | undefined): string[] =>
  (frame ?? '').split('\n').map((line) => line.trimEnd());

describe('fitting text', () => {
  it('cuts text at the end or the middle with an ellipsis', () => {
    expect(truncate('relay-cards', 6)).toBe('relay…');
    expect(truncate('/api/orders/items', 9, 'middle')).toBe('/api…tems');
    expect(truncate('short', 10)).toBe('short');
    expect(truncate('abc', 1)).toBe('…');
  });

  it('counts wide characters as two columns', () => {
    expect(truncate('日本語テキスト', 7)).toBe('日本語…');
    expect(fit('日本', 6)).toBe('日本  ');
  });

  it('pads to the exact width in each alignment', () => {
    expect(fit('ab', 5, 'right')).toBe('   ab');
    expect(fit('ab', 5, 'center')).toBe(' ab  ');
  });
});

describe('column layout', () => {
  it('sizes each column to its widest cell when there is room', () => {
    expect(layoutColumns(columns, rows, 200)).toEqual([6, 28, 6, 7]);
  });

  it('shrinks the widest columns first and keeps fixed widths', () => {
    const fixed: Column<Request>[] = [{...method, width: 6}, path, status];
    expect(layoutColumns(fixed, rows, 30)).toEqual([6, 14, 6]);
  });

  it('stops at each column minimum when the table cannot fit', () => {
    expect(layoutColumns(columns, rows, 10)).toEqual([6, 4, 6, 4]);
  });
});

describe('Table', () => {
  it('lines up headers, a rule, and rows', () => {
    const {lastFrame} = render(<Table columns={columns} rows={rows} width={60} />);
    expect(lines(lastFrame())).toEqual([
      'Method  Path                          Status     Time',
      '─'.repeat(53),
      'GET     /health                          200   3.2 ms',
      'POST    /api/orders/2026/10/21/items     201  48.9 ms',
      'GET     /missing                         404   1.1 ms',
    ]);
  });

  it('fits a narrow terminal by cutting the longest column', () => {
    const {lastFrame} = render(<Table columns={columns} rows={rows} width={40} rule={false} />);
    const output = lines(lastFrame());
    expect(output[2]).toBe('POST    /api/or…1/items     201  48.9 ms');
    expect(Math.max(...output.map((line) => line.length))).toBeLessThanOrEqual(40);
  });

  it('says when there are no rows', () => {
    const {lastFrame} = render(<Table columns={columns} rows={[]} emptyText="No requests yet." />);
    expect(lastFrame()).toContain('No requests yet.');
  });

  it('keeps the selected row in view and counts the rows it hides', () => {
    const many = Array.from({length: 10}, (_, index) => ({...health, path: `/item/${index}`}));
    const {lastFrame} = render(
      <Table columns={columns} rows={many} maxRows={3} selectedIndex={6} rule={false} />,
    );
    const output = lines(lastFrame());
    expect(output[1]).toBe('↑ 4 more');
    expect(output.slice(2, 5).map((line) => line.split(/\s+/)[1])).toEqual([
      '/item/4',
      '/item/5',
      '/item/6',
    ]);
    expect(output[5]).toBe('↓ 3 more');
  });

  it('chooses a window that always holds the selection', () => {
    expect(visibleRange(10, 3, 0)).toEqual({start: 0, end: 3});
    expect(visibleRange(10, 3, 9)).toEqual({start: 7, end: 10});
    expect(visibleRange(2, 3, 1)).toEqual({start: 0, end: 2});
  });
});
