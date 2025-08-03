import { createContext } from 'react';

export type Theme = 'light' | 'dark' | 'medical';

export interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isTransitioning: boolean;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
