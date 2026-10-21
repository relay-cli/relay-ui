#!/usr/bin/env node

import {render, renderToString} from 'ink';
import {helpText, parseCliOptions} from './cli/options.js';
import {Gallery} from './gallery/Gallery.js';
import {gallerySections} from './gallery/sections.js';
import {relayUiVersion} from './version.js';

const main = async (): Promise<void> => {
  let options;
  try {
    options = parseCliOptions(process.argv.slice(2));
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
    const frame = renderToString(<Gallery sections={gallerySections} width={width} />, {
      columns: width,
    });
    process.stdout.write(`${frame}\n`);
    return;
  }

  const app = render(<Gallery sections={gallerySections} width={width} interactive />);
  await app.waitUntilExit();
};

await main();
