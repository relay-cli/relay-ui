import {Swatches} from '../theme/index.js';
import type {GallerySection} from './Gallery.js';

/** One section per component, in the order the gallery shows them. */
export const gallerySections: readonly GallerySection[] = [
  {title: 'Theme', render: () => <Swatches />},
];
