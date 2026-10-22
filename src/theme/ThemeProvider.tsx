import {createContext, useContext, type ReactNode} from 'react';
import {relayTheme, type Theme} from './theme.js';

const ThemeContext = createContext<Theme>(relayTheme);

export interface ThemeProviderProps {
  theme: Theme;
  children: ReactNode;
}

/** Set the theme for every Relay UI component below it. Without one, components use `relayTheme`. */
export const ThemeProvider = ({theme, children}: ThemeProviderProps) => (
  <ThemeContext value={theme}>{children}</ThemeContext>
);

export const useTheme = (): Theme => useContext(ThemeContext);
