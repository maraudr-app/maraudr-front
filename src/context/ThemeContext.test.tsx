import React from 'react';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ThemeProvider, useTheme } from './ThemeContext';
import { vi } from 'vitest';

// Composant de test qui affiche le thème actuel et permet de le basculer
const TestComponent = () => {
  const { theme, toggleTheme } = useTheme();
  return (
    <div>
      <div data-testid="current-theme">{theme}</div>
      <button data-testid="toggle-button" onClick={toggleTheme}>
        Toggle Theme
      </button>
    </div>
  );
};

describe('ThemeContext', () => {
  beforeEach(() => {
    // Réinitialiser le localStorage avant chaque test
    localStorage.clear();
    
    // Réinitialiser les classes sur l'élément html
    document.documentElement.classList.remove('light', 'dark');
  });

  test('utilise par défaut le thème clair si aucune préférence n\'est définie', () => {
    // Simuler l'absence de préférence système
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: false, // mode clair comme préférence système
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    // Vérifier que le thème initial est "light"
    expect(screen.getByTestId('current-theme').textContent).toBe('light');
  });

  test('utilise le thème sombre si la préférence système est définie sur sombre', () => {
    // Simuler la préférence système pour le mode sombre
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: query === '(prefers-color-scheme: dark)', // mode sombre comme préférence système
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    // Vérifier que le thème initial est "dark"
    expect(screen.getByTestId('current-theme').textContent).toBe('dark');
  });

  test('utilise le thème sauvegardé dans localStorage en priorité', () => {
    // Simuler la préférence système pour le mode sombre
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: query === '(prefers-color-scheme: dark)', // mode sombre comme préférence système
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    // Mais définir le thème clair dans localStorage
    localStorage.setItem('theme', 'light');

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    // Vérifier que le thème initial est "light" (priorité au localStorage)
    expect(screen.getByTestId('current-theme').textContent).toBe('light');
  });

  test('met à jour la classe sur l\'élément HTML quand le thème change', () => {
    // Simuler l'absence de préférence système
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: false, // mode clair comme préférence système
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
    
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    // Vérifier que la classe du document est initialement "light"
    expect(document.documentElement.classList.contains('light')).toBe(true);
    expect(document.documentElement.classList.contains('dark')).toBe(false);

    // Basculer vers le mode sombre
    act(() => {
      screen.getByTestId('toggle-button').click();
    });

    // Vérifier que la classe du document est maintenant "dark"
    expect(document.documentElement.classList.contains('light')).toBe(false);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });
}); 