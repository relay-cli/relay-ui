import {Text} from 'ink';
import {render} from 'ink-testing-library';
import {describe, expect, it} from 'vitest';
import {
  Swatches,
  ThemeProvider,
  defineTheme,
  monoTheme,
  relayTheme,
  resolveTheme,
  useTheme,
} from '../src/index.js';

const ThemeName = () => <Text>{useTheme().name}</Text>;

describe('themes', () => {
  it('uses the Relay theme when no provider is present', () => {
    expect(render(<ThemeName />).lastFrame()).toBe('relay');
  });

  it('gives components the theme from the nearest provider', () => {
    const {lastFrame} = render(
      <ThemeProvider theme={relayTheme}>
        <ThemeProvider theme={monoTheme}>
          <ThemeName />
        </ThemeProvider>
      </ThemeProvider>,
    );
    expect(lastFrame()).toBe('mono');
  });

  it('resolves themes by name and lists the choices when the name is wrong', () => {
    expect(resolveTheme('mono')).toBe(monoTheme);
    expect(() => resolveTheme('neon')).toThrow('Choose one of: relay, mono.');
  });

  it('builds a theme from a base and keeps the colors it does not replace', () => {
    const solar = defineTheme('solar', {accent: '#FFB000'});
    expect(solar).toEqual({...relayTheme, name: 'solar', accent: '#FFB000'});
    expect(defineTheme('soft', {danger: '#FF8888'}, monoTheme).accent).toBe(monoTheme.accent);
  });

  it('lists every color in the swatches', () => {
    const frame = render(<Swatches />).lastFrame() ?? '';
    expect(frame).toContain('accent');
    expect(frame).toContain(relayTheme.focus);
    expect(frame.split('\n')).toHaveLength(11);
  });
});
