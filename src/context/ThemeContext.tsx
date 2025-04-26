import { useState, useEffect, ReactNode } from 'react';
import { ThemeContextType, Theme } from './ThemeContextTypes';

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    // Récupérer le thème du localStorage s'il existe
    const savedTheme = localStorage.getItem('theme');
    
    // Vérifier également la préférence système
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Priorité au thème sauvegardé, sinon utiliser la préférence système
    return (savedTheme as Theme) || (prefersDark ? 'dark' : 'light');
  });

  // Mettre à jour la classe sur l'élément html quand le thème change
  useEffect(() => {
    const root = window.document.documentElement;
    
    // Supprimer les classes précédentes
    root.classList.remove('light', 'dark');
    
    // Ajouter la nouvelle classe
    root.classList.add(theme);
    
    // Sauvegarder dans localStorage
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme: Theme) => prevTheme === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContextType.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContextType.Provider>
  );
} 