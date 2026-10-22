import {flattenCell, textWidth, type Align, type Truncate} from './fit.js';

export interface Column<Row> {
  /** Identifies the column. Also the property read from each row when `value` is not given. */
  key: string;
  header: string;
  /** The text of this column's cell for a row. Defaults to `String(row[key])`. */
  value?: (row: Row) => string;
  /** A fixed width in columns. Without one, the column fits its content and may shrink. */
  width?: number;
  /** The narrowest a shrinking column may get. Defaults to the header width, at most 8. */
  minWidth?: number;
  align?: Align;
  /** Where to cut text that does not fit. `middle` keeps both ends, which suits paths and URLs. */
  truncate?: Truncate;
  /** A color for this column's cell in a row, such as red for failed statuses. */
  color?: (row: Row) => string | undefined;
}

export const cellText = <Row>(column: Column<Row>, row: Row): string => {
  if (column.value !== undefined) return flattenCell(column.value(row));
  const raw = (row as Record<string, unknown>)[column.key];
  if (raw === undefined || raw === null) return '';
  if (typeof raw === 'string') return flattenCell(raw);
  if (typeof raw === 'number' || typeof raw === 'boolean' || typeof raw === 'bigint') {
    return String(raw);
  }
  return typeof raw === 'object' ? flattenCell(JSON.stringify(raw)) : '';
};

/**
 * Column widths that fit in `maxWidth`, counting `gap` columns between cells.
 * Columns without a fixed width start at their widest cell. When the table is
 * too wide, the widest of them give up one column at a time until it fits or
 * each has reached its minimum.
 */
export const layoutColumns = <Row>(
  columns: readonly Column<Row>[],
  rows: readonly Row[],
  maxWidth: number,
  gap = 2,
): number[] => {
  const widths = columns.map(
    (column) =>
      column.width ??
      Math.max(textWidth(column.header), ...rows.map((row) => textWidth(cellText(column, row)))),
  );
  const minimums = columns.map(
    (column, index) =>
      column.width ??
      Math.min(widths[index] ?? 0, column.minWidth ?? Math.min(textWidth(column.header), 8)),
  );
  const total = (): number =>
    widths.reduce((sum, width) => sum + width, 0) + gap * Math.max(columns.length - 1, 0);

  let excess = total() - maxWidth;
  while (excess > 0) {
    let widest = -1;
    for (let index = 0; index < columns.length; index += 1) {
      const width = widths[index] ?? 0;
      if (width <= (minimums[index] ?? 0)) continue;
      if (widest === -1 || width > (widths[widest] ?? 0)) widest = index;
    }
    if (widest === -1) break;
    widths[widest] = (widths[widest] ?? 0) - 1;
    excess -= 1;
  }
  return widths;
};
