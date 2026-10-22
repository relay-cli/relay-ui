import {Box} from 'ink';
import {Spinner} from '../spinner/index.js';
import {Swatches} from '../theme/index.js';
import type {GallerySection} from './Gallery.js';

/** One section per component, in the order the gallery shows them. */
export const gallerySections: readonly GallerySection[] = [
  {title: 'Theme', render: () => <Swatches />},
  {
    title: 'Spinner',
    render: () => (
      <Box flexDirection="column">
        <Spinner label="Thinking…" />
        <Spinner label="Starting server" type="line" />
        <Spinner label="Waiting for events" type="pulse" />
        <Spinner label="Build finished" state="done" />
        <Spinner label="Tests failed" state="failed" />
      </Box>
    ),
  },
];
