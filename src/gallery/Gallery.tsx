import type {ReactNode} from 'react';
import {Box, Text, useApp, useInput} from 'ink';
import {useTheme} from '../theme/index.js';
import {relayUiVersion} from '../version.js';

export interface GallerySection {
  title: string;
  render: (context: {width: number; interactive: boolean}) => ReactNode;
}

export interface GalleryProps {
  sections: readonly GallerySection[];
  width?: number;
  /** Listen for `q` to quit and let components animate. Off for snapshots. */
  interactive?: boolean;
}

const QuitKey = () => {
  const {exit} = useApp();
  useInput((input, key) => {
    if (input === 'q' || (key.ctrl && input === 'c')) exit();
  });
  return null;
};

export const Gallery = ({sections, width = 80, interactive = false}: GalleryProps) => {
  const theme = useTheme();
  return (
    <Box flexDirection="column" width={width} gap={1}>
      {interactive && <QuitKey />}
      <Box justifyContent="space-between">
        <Text bold color={theme.text}>
          Relay UI <Text color={theme.muted}>· {theme.name} theme</Text>
        </Text>
        <Text color={theme.muted}>{relayUiVersion}</Text>
      </Box>
      {sections.length === 0 ? (
        <Text color={theme.muted}>No components yet.</Text>
      ) : (
        sections.map((section) => (
          <Box key={section.title} flexDirection="column">
            <Text bold color={theme.accent}>
              {section.title}
            </Text>
            {section.render({width, interactive})}
          </Box>
        ))
      )}
      {interactive && <Text color={theme.muted}>q quit</Text>}
    </Box>
  );
};
