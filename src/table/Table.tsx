import {Box, Text} from 'ink';
import {useTheme} from '../theme/index.js';
import {fit} from './fit.js';
import {cellText, layoutColumns, type Column} from './layout.js';

export interface TableProps<Row> {
  columns: readonly Column<Row>[];
  rows: readonly Row[];
  /** The widest the table may be, in terminal columns. */
  width?: number;
  /** Highlight this row, for tables the user moves through. */
  selectedIndex?: number;
  /** Show at most this many rows, keeping the selected row in view. */
  maxRows?: number;
  /** Draw a rule under the header. */
  rule?: boolean;
  /** Shown in place of rows when there are none. */
  emptyText?: string;
  /** Spaces between columns. */
  gap?: number;
  /** Stable React keys for rows. Defaults to the row's position. */
  rowKey?: (row: Row, index: number) => string;
}

/** The rows to show: all of them, or a window of `maxRows` that contains the selection. */
export const visibleRange = (
  count: number,
  maxRows: number | undefined,
  selectedIndex: number | undefined,
): {start: number; end: number} => {
  if (maxRows === undefined || count <= maxRows) return {start: 0, end: count};
  const size = Math.max(maxRows, 1);
  const selected = Math.min(Math.max(selectedIndex ?? 0, 0), count - 1);
  const start = Math.max(0, selected - size + 1);
  return {start, end: start + size};
};

export const Table = <Row,>({
  columns,
  rows,
  width = 80,
  selectedIndex,
  maxRows,
  rule = true,
  emptyText = 'Nothing to show.',
  gap = 2,
  rowKey,
}: TableProps<Row>) => {
  const theme = useTheme();
  const widths = layoutColumns(columns, rows, width, gap);
  const spacer = ' '.repeat(gap);
  const tableWidth = widths.reduce((sum, w) => sum + w, 0) + gap * Math.max(columns.length - 1, 0);
  const {start, end} = visibleRange(rows.length, maxRows, selectedIndex);
  const hiddenBefore = start;
  const hiddenAfter = rows.length - end;

  return (
    <Box flexDirection="column">
      <Text bold color={theme.muted}>
        {columns
          .map((column, index) => fit(column.header, widths[index] ?? 0, column.align))
          .join(spacer)}
      </Text>
      {rule && <Text color={theme.rule}>{'─'.repeat(tableWidth)}</Text>}
      {rows.length === 0 && <Text color={theme.muted}>{emptyText}</Text>}
      {hiddenBefore > 0 && <Text color={theme.muted}>↑ {hiddenBefore} more</Text>}
      {rows.slice(start, end).map((row, offset) => {
        const index = start + offset;
        const selected = index === selectedIndex;
        return (
          <Text
            key={rowKey === undefined ? index : rowKey(row, index)}
            {...(selected ? {backgroundColor: theme.surfaceRaised} : {})}
          >
            {columns.map((column, columnIndex) => (
              <Text key={column.key}>
                {columnIndex > 0 && spacer}
                <Text
                  color={selected ? theme.focus : (column.color?.(row) ?? theme.text)}
                  bold={selected}
                >
                  {fit(
                    cellText(column, row),
                    widths[columnIndex] ?? 0,
                    column.align,
                    column.truncate,
                  )}
                </Text>
              </Text>
            ))}
          </Text>
        );
      })}
      {hiddenAfter > 0 && <Text color={theme.muted}>↓ {hiddenAfter} more</Text>}
    </Box>
  );
};
