# API

Everything is exported from `@relay-cli/ui`.

| Export           | Purpose                       |
| ---------------- | ----------------------------- |
| `relayUiVersion` | The installed package version |

## Theme

Components read their colors from the nearest `ThemeProvider`. Without one they use `relayTheme`.

```tsx
import {ThemeProvider, resolveTheme} from '@relay-cli/ui';

<ThemeProvider theme={resolveTheme(options.theme)}>
  <App />
</ThemeProvider>;
```

| Export                             | Purpose                                                                 |
| ---------------------------------- | ----------------------------------------------------------------------- |
| `relayTheme`                       | The Relay palette: orange accent, blue focus                            |
| `monoTheme`                        | The same palette with grey highlights                                   |
| `themes`                           | Both themes by name                                                     |
| `resolveTheme(name, available?)`   | Look up a theme by name; throws with the list of names when it is wrong |
| `defineTheme(name, colors, base?)` | A new theme that replaces only the colors given                         |
| `ThemeProvider`, `useTheme`        | Set and read the current theme                                          |
| `Swatches`                         | Every color in the current theme, for galleries and docs                |

| Color           | Used for                                     |
| --------------- | -------------------------------------------- |
| `text`          | Body text                                    |
| `muted`         | Labels, timestamps, hints                    |
| `accent`        | The primary highlight, inline code, spinners |
| `focus`         | Focus, selection, links                      |
| `success`       | Success states                               |
| `warning`       | Warnings                                     |
| `danger`        | Errors and failures                          |
| `rule`          | Borders, separators, table rules             |
| `surfaceRaised` | Selected rows, raised panels                 |
| `surface`       | Panels and cards                             |
| `background`    | The screen, for tools that paint one         |

## Spinner

```tsx
<Spinner label="Thinking…" />
<Spinner label="Build" state={failed ? 'failed' : finished ? 'done' : 'running'} />
```

| Prop    | Default        | Meaning                                                          |
| ------- | -------------- | ---------------------------------------------------------------- |
| `label` |                | Text after the spinner                                           |
| `type`  | `'dots'`       | `'dots'`, `'line'`, `'pulse'`, or `{frames, interval}`           |
| `state` | `'running'`    | `'done'` shows ✓ and `'failed'` shows ✗; both stop the animation |
| `color` | theme `accent` | Color of the spinner                                             |

`useSpinnerFrame(style, active?)` returns the current frame for tools that draw the spinner inside their own text. In `renderToString` and other single-frame renders the spinner shows its first frame.
