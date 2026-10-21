export interface CliOptions {
  help: boolean;
  version: boolean;
  snapshot: boolean;
  theme: string;
}

export const helpText = `Relay UI

Usage:
  relay-ui
  relay-ui --snapshot
  relay-ui --theme mono

Options:
  --snapshot         Print the component gallery once and exit
  --theme <name>     Show the components in a theme: relay (default) or mono
  -h, --help         Show this help
  -v, --version      Show the version

Relay UI is a component library. Import it from @relay-cli/ui to use the components in your own tool.
`;

export const parseCliOptions = (arguments_: readonly string[]): CliOptions => {
  const options: CliOptions = {help: false, version: false, snapshot: false, theme: 'relay'};
  for (let index = 0; index < arguments_.length; index += 1) {
    const argument = arguments_[index] ?? '';
    if (argument === '--theme' || argument.startsWith('--theme=')) {
      const value = argument === '--theme' ? arguments_[(index += 1)] : argument.slice(8);
      if (value === undefined || value === '') throw new Error('--theme needs a theme name');
      options.theme = value;
    } else if (argument === '-h' || argument === '--help') options.help = true;
    else if (argument === '-v' || argument === '--version') options.version = true;
    else if (argument === '--snapshot') options.snapshot = true;
    else throw new Error(`Unknown option: ${argument}`);
  }
  return options;
};
