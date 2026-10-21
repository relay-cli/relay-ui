import {execFile} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {promisify} from 'node:util';
import {describe, expect, it} from 'vitest';
import {parseCliOptions} from '../src/cli/options.js';

const run = promisify(execFile);
const cli = fileURLToPath(new URL('../src/cli.tsx', import.meta.url));
const tsx = fileURLToPath(new URL('../node_modules/tsx/dist/cli.mjs', import.meta.url));

describe('CLI options', () => {
  it('reads the snapshot flag', () => {
    expect(parseCliOptions(['--snapshot'])).toEqual({help: false, version: false, snapshot: true});
  });

  it('rejects unknown options', () => {
    expect(() => parseCliOptions(['--wat'])).toThrow('Unknown option');
  });
});

describe('relay-ui command', () => {
  it('prints the gallery once without a terminal', async () => {
    const {stdout} = await run(process.execPath, [tsx, cli, '--snapshot']);
    expect(stdout).toContain('Relay UI');
  }, 30_000);

  it('exits with usage on an unknown option', async () => {
    await expect(run(process.execPath, [tsx, cli, '--wat'])).rejects.toMatchObject({code: 2});
  }, 30_000);
});
