import { useContext } from 'react';
import { ThemeContextType } from './context/ThemeContextTypes';

// Hook personnalisé pour utiliser le contexte de thème
export function useTheme() {
  const context = useContext(ThemeContextType);
  
  if (context === undefined) {
    throw new Error('useTheme doit être utilisé à l\'intérieur d\'un ThemeProvider');
  }
  
  return context;
} 