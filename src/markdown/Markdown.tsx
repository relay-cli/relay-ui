import {Box, Text} from 'ink';
import {Table, type Column} from '../table/index.js';
import {useTheme} from '../theme/index.js';
import {CodeBlock} from './CodeBlock.js';
import {InlineText} from './InlineText.js';
import {parseMarkdownBlocks} from './parse-blocks.js';
import type {MarkdownBlock} from './types.js';

export interface MarkdownProps {
  source: string;
  /**
   * Columns to fill. Text wraps and code boxes stretch to this width. Without
   * it, the Markdown fills its container and rules and tables assume 80.
   */
  width?: number;
}

type TableBlock = Extract<MarkdownBlock, {type: 'table'}>;

// Table cells show their Markdown source with the markers removed, since a
// cell is padded text rather than nested Ink elements.
const plainInline = (source: string): string =>
  source
    .replace(/\[([^\]]+)\]\([^)\s]+\)/g, '$1')
    .replace(/(\*\*|__|~~|`)(.+?)\1/g, '$2')
    .replace(/\*(?![\s*])([^*]+?)(?<!\s)\*/g, '$1');

const MarkdownTable = ({block, width}: {block: TableBlock; width: number}) => {
  const columns: Column<readonly string[]>[] = block.headers.map((header, index) => ({
    key: String(index),
    header: plainInline(header),
    align: block.align[index] ?? 'left',
    value: (row) => plainInline(row[index] ?? ''),
  }));
  return <Table columns={columns} rows={block.rows} width={width} />;
};

export const Markdown = ({source, width}: MarkdownProps) => {
  const theme = useTheme();
  const lineWidth = width ?? 80;
  return (
    <Box flexDirection="column" gap={1} {...(width === undefined ? {} : {width})}>
      {parseMarkdownBlocks(source).map((block, index) => {
        switch (block.type) {
          case 'code':
            return (
              <CodeBlock
                key={index}
                code={block.code}
                {...(block.language === undefined ? {} : {language: block.language})}
              />
            );
          case 'heading':
            return (
              <InlineText
                key={index}
                source={block.text}
                bold
                color={
                  block.level === 1 ? theme.accent : block.level === 2 ? theme.text : theme.muted
                }
              />
            );
          case 'quote':
            return (
              <Box key={index} flexDirection="column">
                {block.lines.map((line, lineIndex) => (
                  <Box key={lineIndex} gap={1}>
                    <Text color={theme.rule}>│</Text>
                    <InlineText source={line} color={theme.muted} />
                  </Box>
                ))}
              </Box>
            );
          case 'rule':
            return (
              <Text key={index} color={theme.rule}>
                {'─'.repeat(Math.max(lineWidth, 1))}
              </Text>
            );
          case 'list': {
            const markerWidth = block.ordered
              ? `${block.start + block.items.length - 1}.`.length
              : 1;
            return (
              <Box key={index} flexDirection="column">
                {block.items.map((item, itemIndex) => (
                  <Box key={itemIndex} gap={1}>
                    <Box width={markerWidth} flexShrink={0} justifyContent="flex-end">
                      <Text color={theme.muted}>
                        {block.ordered ? `${block.start + itemIndex}.` : '•'}
                      </Text>
                    </Box>
                    <InlineText source={item} />
                  </Box>
                ))}
              </Box>
            );
          }
          case 'table':
            return <MarkdownTable key={index} block={block} width={lineWidth} />;
          default:
            return <InlineText key={index} source={block.text} />;
        }
      })}
    </Box>
  );
};
