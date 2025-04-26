// Importer le mock i18n avant tout autre import
import './__mocks__/i18nextMock';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import { ThemeProvider } from '../context/ThemeContext';
import Header from '../components/layout/Header/Header';
import { BrowserRouter as Router } from 'react-router-dom';

// Au lieu de tester toute l'application, nous testons les composants spécifiques 
// qui gèrent le thème
describe('Application Dark Mode', () => {
  beforeEach(() => {
    // Réinitialiser le localStorage avant chaque test
    localStorage.clear();
    
    // Réinitialiser les classes sur l'élément html
    document.documentElement.classList.remove('light', 'dark');
    
    // Simuler une préférence système (light par défaut pour les tests)
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: false, // Simuler le mode clair comme préférence système
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  test('le bouton de thème dans le header bascule correctement le thème', () => {
    render(
      <ThemeProvider>
        <Router>
          <Header />
        </Router>
      </ThemeProvider>
    );

    // Vérifier que le document a la classe light initialement
    expect(document.documentElement.classList.contains('light')).toBe(true);
    expect(document.documentElement.classList.contains('dark')).toBe(false);

    // Trouver tous les boutons de changement de thème dans le header et prendre le premier
    const themeButtons = screen.getAllByRole('button', { 
      name: /passer au mode sombre/i 
    });
    
    // Il devrait y en avoir 2 (un pour mobile, un pour desktop)
    expect(themeButtons.length).toBeGreaterThan(0);
    
    // Cliquer sur le premier bouton pour passer en mode sombre
    fireEvent.click(themeButtons[0]);
    
    // Vérifier que le document a maintenant la classe dark
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(document.documentElement.classList.contains('light')).toBe(false);
    
    // Vérifier que le thème est sauvegardé dans localStorage
    expect(localStorage.getItem('theme')).toBe('dark');
    
    // Cliquer à nouveau pour revenir en mode clair
    const lightButtons = screen.getAllByRole('button', { 
      name: /passer au mode clair/i 
    });
    fireEvent.click(lightButtons[0]);
    
    // Vérifier que le document est revenu à la classe light
    expect(document.documentElement.classList.contains('light')).toBe(true);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    
    // Vérifier que localStorage a été mis à jour
    expect(localStorage.getItem('theme')).toBe('light');
  });

  test('le header respecte la préférence système pour le mode sombre', () => {
    // Configurer matchMedia pour simuler une préférence système pour le mode sombre
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: query === '(prefers-color-scheme: dark)', // Mode sombre comme préférence
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
    
    render(
      <ThemeProvider>
        <Router>
          <Header />
        </Router>
      </ThemeProvider>
    );
    
    // Vérifier que le document a la classe dark initialement
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(document.documentElement.classList.contains('light')).toBe(false);
  });

  test('les éléments du header s\'adaptent correctement au mode sombre', () => {
    render(
      <ThemeProvider>
        <Router>
          <Header />
        </Router>
      </ThemeProvider>
    );
    
    // Vérifier l'état initial (mode clair)
    expect(document.documentElement.classList.contains('light')).toBe(true);
    
    // Cliquer sur le bouton pour passer en mode sombre
    const themeButtons = screen.getAllByRole('button', { 
      name: /passer au mode sombre/i 
    });
    fireEvent.click(themeButtons[0]);
    
    // Vérifier que le document a la classe dark
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    
    // Vérifier les changements visuels en inspectant le DOM
    // Vérifier que le header a la classe dark:bg-gray-800
    const header = document.querySelector('header');
    expect(header?.className).toContain('dark:bg-gray-800');
    
    // Vérifier que les liens dans la navigation ont les bonnes classes pour le mode sombre
    const navLinks = document.querySelectorAll('nav a');
    navLinks.forEach(link => {
      expect(link.className).toContain('dark:text-gray-200');
    });
  });
}); 