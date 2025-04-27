import { describe, it, expect, vi } from 'vitest';
import { useNavigate } from 'react-router-dom';
import { useLoginNavigation } from './Login';

// Mock de useNavigate
vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn()
}));

describe('Login Page Navigation', () => {
  it('handleCloseLoginPage redirige vers la page d\'accueil', () => {
    // Mock de navigate
    const mockNavigate = vi.fn();
    (useNavigate as any).mockReturnValue(mockNavigate);
    
    // Tester directement la fonction useLoginNavigation
    const { handleCloseLoginPage } = useLoginNavigation();
    
    // Appeler la fonction
    handleCloseLoginPage();
    
    // Vérifier que navigate a été appelé avec le bon paramètre
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });
}); 