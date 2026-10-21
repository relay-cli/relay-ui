import {Box, Text} from 'ink';
import {useTheme} from '../theme/index.js';

export interface CodeBlockProps {
  code: string;
  language?: string;
}

/** Fenced code in a bordered box, with its language above the code. */
export const CodeBlock = ({code, language}: CodeBlockProps) => {
  const theme = useTheme();
  return (
    <Box flexDirection="column" borderStyle="single" borderColor={theme.rule} paddingX={1}>
      {language !== undefined && <Text color={theme.muted}>{language}</Text>}
      <Text color={theme.text}>{code}</Text>
    </Box>
  );
};
