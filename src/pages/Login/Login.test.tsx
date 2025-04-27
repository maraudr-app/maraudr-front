import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter, useNavigate } from 'react-router-dom';
import Login from './Login';

// Mock de useNavigate
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn()
  };
});

// Mock de i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { changeLanguage: vi.fn() }
  })
}));

describe('Login Page', () => {
  const mockNavigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // Configuration du mock pour useNavigate
    (useNavigate as any).mockReturnValue(mockNavigate);
  });

  it('appelle navigate("/") quand le bouton de fermeture est cliqué', () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    // Trouver le bouton de fermeture par son aria-label
    const closeButton = screen.getByLabelText('Close');
    expect(closeButton).toBeInTheDocument();

    // Simuler un clic sur le bouton
    fireEvent.click(closeButton);

    // Vérifier que navigate a été appelé avec '/'
    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });
}); 