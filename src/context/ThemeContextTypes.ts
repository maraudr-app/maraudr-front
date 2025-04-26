import { createContext } from 'react';

export type Theme = 'light' | 'dark';

export interface ThemeContextInterface {
  theme: Theme;
  toggleTheme: () => void;
}

export const ThemeContextType = createContext<ThemeContextInterface | undefined>(undefined); 