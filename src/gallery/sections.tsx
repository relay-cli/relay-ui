import {Box} from 'ink';
import {Markdown} from '../markdown/index.js';
import {Spinner} from '../spinner/index.js';
import {Table, type Column} from '../table/index.js';
import {Swatches, useTheme} from '../theme/index.js';
import type {GallerySection} from './Gallery.js';

interface SampleRequest {
  method: string;
  path: string;
  status: number;
  ms: number;
}

const sampleRequests: SampleRequest[] = [
  {method: 'GET', path: '/health', status: 200, ms: 3.2},
  {method: 'POST', path: '/api/orders/2026/10/21/items', status: 201, ms: 48.9},
  {method: 'GET', path: '/api/orders/unknown', status: 404, ms: 1.1},
  {method: 'PUT', path: '/api/settings', status: 500, ms: 212.4},
];

const sampleMarkdown = [
  '## Deploy checklist',
  '',
  'Run **all** checks before tagging. See [the guide](https://github.com/relay-cli/relay-ui#readme).',
  '',
  '1. Run `npm run check`',
  '2. Update the *changelog*',
  '3. ~~Email the team~~ Post in the channel',
  '',
  '> Releases go out from `main` only.',
  '',
  '| Package | Size | Status |',
  '| ------- | ---: | :----: |',
  '| cards   | 48 KB | ready |',
  '| chat    | 112 KB | review |',
  '',
  '```sh',
  'npm run release',
  '```',
].join('\n');

const RequestTable = ({width}: {width: number}) => {
  const theme = useTheme();
  const columns: Column<SampleRequest>[] = [
    {key: 'method', header: 'Method'},
    {key: 'path', header: 'Path', truncate: 'middle'},
    {
      key: 'status',
      header: 'Status',
      align: 'right',
      color: (row) =>
        row.status >= 500 ? theme.danger : row.status >= 400 ? theme.warning : theme.success,
    },
    {key: 'ms', header: 'Time', align: 'right', value: (row) => `${row.ms.toFixed(1)} ms`},
  ];
  return <Table columns={columns} rows={sampleRequests} width={width} selectedIndex={1} />;
};

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
  {title: 'Table', render: ({width}) => <RequestTable width={Math.min(width, 64)} />},
  {
    title: 'Markdown',
    render: ({width}) => <Markdown source={sampleMarkdown} width={Math.min(width, 64)} />,
  },
];
