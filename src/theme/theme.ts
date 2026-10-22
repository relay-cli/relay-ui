/** Colors every Relay UI component draws with. Values are any color Ink accepts. */
export interface Theme {
  name: string;
  /** Screen background, for tools that paint one. */
  background: string;
  /** Panels and cards that sit on the background. */
  surface: string;
  /** Selected rows and anything raised above a surface. */
  surfaceRaised: string;
  /** Borders, separators, and table rules. */
  rule: string;
  text: string;
  /** Secondary text: labels, timestamps, hints. */
  muted: string;
  /** Relay orange: the primary highlight, inline code, spinners. */
  accent: string;
  /** Relay blue: focus, selection, and links. */
  focus: string;
  success: string;
  warning: string;
  danger: string;
}

export const relayTheme: Theme = {
  name: 'relay',
  background: '#080B0F',
  surface: '#111820',
  surfaceRaised: '#202A34',
  rule: '#34414D',
  text: '#E8EDF2',
  muted: '#84909C',
  accent: '#FF8A3D',
  focus: '#48A8FF',
  success: '#4FD18B',
  warning: '#F0C84B',
  danger: '#FF4D5A',
};

/** For terminals or people that prefer fewer colors: highlights become shades of grey. */
export const monoTheme: Theme = {
  ...relayTheme,
  name: 'mono',
  accent: '#E8EDF2',
  focus: '#E8EDF2',
  success: '#B8C0C8',
};

/** Build a theme from a base, replacing only the colors given. */
export const defineTheme = (
  name: string,
  overrides: Partial<Omit<Theme, 'name'>>,
  base: Theme = relayTheme,
): Theme => ({...base, ...overrides, name});

export const themes: ReadonlyMap<string, Theme> = new Map([
  [relayTheme.name, relayTheme],
  [monoTheme.name, monoTheme],
]);

/** Look up a theme by name, for `--theme` flags and `/theme` commands. */
export const resolveTheme = (
  name: string,
  available: ReadonlyMap<string, Theme> = themes,
): Theme => {
  const theme = available.get(name);
  if (theme === undefined) {
    throw new Error(`Unknown theme "${name}". Choose one of: ${[...available.keys()].join(', ')}.`);
  }
  return theme;
};
