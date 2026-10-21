import {Box, Text} from 'ink';
import type {Theme} from './theme.js';
import {useTheme} from './ThemeProvider.js';

const tokens = [
  'text',
  'muted',
  'accent',
  'focus',
  'success',
  'warning',
  'danger',
  'rule',
  'surfaceRaised',
  'surface',
  'background',
] as const satisfies readonly (keyof Theme)[];

/** Every color in the current theme, one per line. */
export const Swatches = () => {
  const theme = useTheme();
  return (
    <Box flexDirection="column">
      {tokens.map((token) => (
        <Box key={token} gap={1}>
          <Text color={theme[token]}>■■</Text>
          <Box width={14}>
            <Text color={theme.text}>{token}</Text>
          </Box>
          <Text color={theme.muted}>{theme[token]}</Text>
        </Box>
      ))}
    </Box>
  );
};
