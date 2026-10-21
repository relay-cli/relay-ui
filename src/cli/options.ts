export interface CliOptions {
  help: boolean;
  version: boolean;
  snapshot: boolean;
}

export const helpText = `Relay UI

Usage:
  relay-ui
  relay-ui --snapshot

Options:
  --snapshot         Print the component gallery once and exit
  -h, --help         Show this help
  -v, --version      Show the version

Relay UI is a component library. Import it from @relay-cli/ui to use the components in your own tool.
`;

export const parseCliOptions = (arguments_: readonly string[]): CliOptions => {
  const options: CliOptions = {help: false, version: false, snapshot: false};
  for (const argument of arguments_) {
    if (argument === '-h' || argument === '--help') options.help = true;
    else if (argument === '-v' || argument === '--version') options.version = true;
    else if (argument === '--snapshot') options.snapshot = true;
    else throw new Error(`Unknown option: ${argument}`);
  }
  return options;
};
