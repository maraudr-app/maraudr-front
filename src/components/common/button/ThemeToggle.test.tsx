import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ThemeToggle } from './ThemeToggle';
import { ThemeProvider, useTheme } from '../../../context/ThemeContext';
import { vi } from 'vitest';

// Composant de test qui affiche le thème actuel
const TestComponent = () => {
  const { theme } = useTheme();
  return (
    <div>
      <div data-testid="current-theme">{theme}</div>
      <ThemeToggle />
    </div>
  );
};

describe('ThemeToggle', () => {
  beforeEach(() => {
    // Réinitialiser le localStorage avant chaque test
    localStorage.clear();
    
    // Réinitialiser les classes sur l'élément html
    document.documentElement.classList.remove('light', 'dark');
    
    // Simuler une préférence système (light par défaut pour les tests)
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: false, // simulate light mode as system preference
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  test('bascule du thème quand on clique sur le bouton', () => {
    // Rendu du composant avec le ThemeProvider
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    // Vérifier que le thème initial est "light" (par défaut dans notre test)
    expect(screen.getByTestId('current-theme').textContent).toBe('light');
    
    // Cliquer sur le bouton pour basculer en mode sombre
    const toggleButton = screen.getByRole('button');
    fireEvent.click(toggleButton);
    
    // Vérifier que le thème a changé à "dark"
    expect(screen.getByTestId('current-theme').textContent).toBe('dark');
    
    // Cliquer à nouveau pour revenir en mode clair
    fireEvent.click(toggleButton);
    
    // Vérifier que le thème est revenu à "light"
    expect(screen.getByTestId('current-theme').textContent).toBe('light');
  });

  test('persiste le thème dans localStorage', () => {
    // Rendu du composant
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    
    // Cliquer sur le bouton pour basculer en mode sombre
    const toggleButton = screen.getByRole('button');
    fireEvent.click(toggleButton);
    
    // Vérifier que le thème est sauvegardé dans localStorage
    expect(localStorage.getItem('theme')).toBe('dark');
    
    // Cliquer à nouveau pour revenir en mode clair
    fireEvent.click(toggleButton);
    
    // Vérifier que localStorage a été mis à jour
    expect(localStorage.getItem('theme')).toBe('light');
  });
  
  test('affiche l\'icône correcte selon le thème actuel', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    
    // En mode clair, l'icône de lune (MoonIcon) devrait être visible
    const toggleButton = screen.getByRole('button');
    
    // L'attribut aria-label devrait indiquer le passage au mode sombre
    expect(toggleButton).toHaveAttribute('aria-label', 'Passer au mode sombre');
    
    // Basculer vers le mode sombre
    fireEvent.click(toggleButton);
    
    // En mode sombre, le bouton devrait avoir un aria-label pour passer au mode clair
    expect(toggleButton).toHaveAttribute('aria-label', 'Passer au mode clair');
  });
}); 