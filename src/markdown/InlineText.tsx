import {Text} from 'ink';
import {useTheme} from '../theme/index.js';
import {parseInline} from './parse-inline.js';

export interface InlineTextProps {
  source: string;
  /** Color for plain text. Defaults to the theme's text color. */
  color?: string;
  bold?: boolean;
}

/** One run of Markdown text with bold, italics, strikethrough, inline code, and links. */
export const InlineText = ({source, color, bold = false}: InlineTextProps) => {
  const theme = useTheme();
  return (
    <Text color={color ?? theme.text} bold={bold}>
      {parseInline(source).map((token, index) => {
        switch (token.type) {
          case 'strong':
            return (
              <Text key={index} bold>
                {token.value}
              </Text>
            );
          case 'emphasis':
            return (
              <Text key={index} italic>
                {token.value}
              </Text>
            );
          case 'strike':
            return (
              <Text key={index} strikethrough>
                {token.value}
              </Text>
            );
          case 'code':
            return (
              <Text key={index} color={theme.accent}>
                {token.value}
              </Text>
            );
          case 'link':
            return (
              <Text key={index}>
                <Text color={theme.focus} underline>
                  {token.value}
                </Text>
                {token.href !== token.value && <Text color={theme.muted}> ({token.href})</Text>}
              </Text>
            );
          default:
            return <Text key={index}>{token.value}</Text>;
        }
      })}
    </Text>
  );
};
