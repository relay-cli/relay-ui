# API

Everything is exported from `@relay-cli/ui`.

| Export           | Purpose                       |
| ---------------- | ----------------------------- |
| `relayUiVersion` | The installed package version |

## Theme

Components read their colors from the nearest `ThemeProvider`. Without one they use `relayTheme`.

```tsx
import {ThemeProvider, resolveTheme} from '@relay-cli/ui';

<ThemeProvider theme={resolveTheme(options.theme)}>
  <App />
</ThemeProvider>;
```

| Export                             | Purpose                                                                 |
| ---------------------------------- | ----------------------------------------------------------------------- |
| `relayTheme`                       | The Relay palette: orange accent, blue focus                            |
| `monoTheme`                        | The same palette with grey highlights                                   |
| `themes`                           | Both themes by name                                                     |
| `resolveTheme(name, available?)`   | Look up a theme by name; throws with the list of names when it is wrong |
| `defineTheme(name, colors, base?)` | A new theme that replaces only the colors given                         |
| `ThemeProvider`, `useTheme`        | Set and read the current theme                                          |
| `Swatches`                         | Every color in the current theme, for galleries and docs                |

| Color           | Used for                                     |
| --------------- | -------------------------------------------- |
| `text`          | Body text                                    |
| `muted`         | Labels, timestamps, hints                    |
| `accent`        | The primary highlight, inline code, spinners |
| `focus`         | Focus, selection, links                      |
| `success`       | Success states                               |
| `warning`       | Warnings                                     |
| `danger`        | Errors and failures                          |
| `rule`          | Borders, separators, table rules             |
| `surfaceRaised` | Selected rows, raised panels                 |
| `surface`       | Panels and cards                             |
| `background`    | The screen, for tools that paint one         |

## Spinner

```tsx
<Spinner label="Thinking…" />
<Spinner label="Build" state={failed ? 'failed' : finished ? 'done' : 'running'} />
```

| Prop    | Default        | Meaning                                                          |
| ------- | -------------- | ---------------------------------------------------------------- |
| `label` |                | Text after the spinner                                           |
| `type`  | `'dots'`       | `'dots'`, `'line'`, `'pulse'`, or `{frames, interval}`           |
| `state` | `'running'`    | `'done'` shows ✓ and `'failed'` shows ✗; both stop the animation |
| `color` | theme `accent` | Color of the spinner                                             |

`useSpinnerFrame(style, active?)` returns the current frame for tools that draw the spinner inside their own text. In `renderToString` and other single-frame renders the spinner shows its first frame.

## Table

```tsx
const columns: Column<Request>[] = [
  {key: 'method', header: 'Method'},
  {key: 'path', header: 'Path', truncate: 'middle'},
  {key: 'status', header: 'Status', align: 'right', color: (row) => statusColor(row.status)},
  {key: 'ms', header: 'Time', align: 'right', value: (row) => `${row.ms.toFixed(1)} ms`},
];

<Table columns={columns} rows={requests} width={columnsAvailable} selectedIndex={cursor} />;
```

Columns start as wide as their widest cell. When the table is wider than `width`, the widest columns shrink first, down to `minWidth` (the header width, at most 8), and cut text with `…`. Widths count East Asian wide characters and emoji as two columns.

| Prop            | Default              | Meaning                                                     |
| --------------- | -------------------- | ----------------------------------------------------------- |
| `columns`       | required             | Column definitions, below                                   |
| `rows`          | required             | Any objects                                                 |
| `width`         | `80`                 | The widest the table may be                                 |
| `selectedIndex` |                      | Highlight one row in the focus color                        |
| `maxRows`       | all                  | Show a window of rows around the selection, with ↑/↓ counts |
| `rule`          | `true`               | Draw a rule under the header                                |
| `emptyText`     | `'Nothing to show.'` | Shown when there are no rows                                |
| `gap`           | `2`                  | Spaces between columns                                      |
| `rowKey`        | row position         | Stable React keys                                           |

| Column field | Meaning                                                          |
| ------------ | ---------------------------------------------------------------- |
| `key`        | Identifies the column; also the row property shown by default    |
| `header`     | Header text                                                      |
| `value`      | `(row) => string` for computed or formatted cells                |
| `width`      | A fixed width that never shrinks                                 |
| `minWidth`   | The narrowest a shrinking column may get                         |
| `align`      | `'left'`, `'right'` or `'center'`                                |
| `truncate`   | `'end'` (default) or `'middle'`, which keeps both ends of a path |
| `color`      | `(row) => color` for one cell, such as a status code             |

The layout helpers are exported too: `layoutColumns(columns, rows, width, gap?)`, `fit(text, width, align?, truncate?)`, `truncate(text, width, mode?)`, and `visibleRange(count, maxRows, selectedIndex)`.

## Markdown

```tsx
<Markdown source={reply} width={columns - 4} />
```

`Markdown` renders headings, paragraphs, ordered and unordered lists, quotes, fenced code, pipe tables (drawn with `Table`), and rules, with bold, italics, strikethrough, inline code, and links inside any of them. An unclosed code fence runs to the end, so a reply that is still streaming shows its code as code. HTML, images, and nested lists are shown as text.

| Prop     | Default   | Meaning                                                                                         |
| -------- | --------- | ----------------------------------------------------------------------------------------------- |
| `source` | required  | Markdown text                                                                                   |
| `width`  | container | Columns to fill; text wraps and code boxes stretch to it. Rules and tables assume 80 without it |

The pieces are exported for tools that render Markdown their own way: `InlineText` (one run of inline Markdown), `CodeBlock`, `parseMarkdownBlocks(source)`, and `parseInline(source)`, with the `MarkdownBlock` and `InlineToken` types.
