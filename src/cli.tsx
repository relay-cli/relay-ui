#!/usr/bin/env node

import {render, renderToString} from 'ink';
import {helpText, parseCliOptions} from './cli/options.js';
import {Gallery} from './gallery/Gallery.js';
import {gallerySections} from './gallery/sections.js';
import {ThemeProvider, resolveTheme, type Theme} from './theme/index.js';
import {relayUiVersion} from './version.js';

const main = async (): Promise<void> => {
  let options;
  let theme: Theme;
  try {
    options = parseCliOptions(process.argv.slice(2));
    theme = resolveTheme(options.theme);
  } catch (error) {
    process.stderr.write(
      `${error instanceof Error ? error.message : String(error)}\n\n${helpText}`,
    );
    process.exitCode = 2;
    return;
  }
  if (options.help) return void process.stdout.write(helpText);
  if (options.version) return void process.stdout.write(`${relayUiVersion}\n`);

  const width = Math.min(process.stdout.columns || 80, 100);
  if (options.snapshot || !process.stdout.isTTY || !process.stdin.isTTY) {
    const frame = renderToString(
      <ThemeProvider theme={theme}>
        <Gallery sections={gallerySections} width={width} />
      </ThemeProvider>,
      {columns: width},
    );
    process.stdout.write(`${frame}\n`);
    return;
  }

  const app = render(
    <ThemeProvider theme={theme}>
      <Gallery sections={gallerySections} width={width} interactive />
    </ThemeProvider>,
  );
  await app.waitUntilExit();
};

await main();
