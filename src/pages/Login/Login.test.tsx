import { describe, it, expect, vi } from 'vitest';
import { useNavigate } from 'react-router-dom';
import { useLoginNavigation } from '../../hooks/useLoginNavigation';

// Mock de useNavigate
vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn(() => vi.fn())
}));

describe('Login Page Navigation', () => {
  it('handleCloseLoginPage redirige vers la page d\'accueil', () => {
    // Réinitialiser les mocks
    vi.clearAllMocks();
    
    // Obtenir la référence au mock
    const mockNavigate = vi.fn();
    vi.mocked(useNavigate).mockReturnValue(mockNavigate);
    
    // Tester directement la fonction useLoginNavigation
    const { handleCloseLoginPage } = useLoginNavigation();
    
    // Appeler la fonction
    handleCloseLoginPage();
    
    // Vérifier que navigate a été appelé avec le bon paramètre
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });
}); 