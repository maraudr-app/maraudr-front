import { useNavigate } from 'react-router-dom';

/**
 * Hook personnalisé pour gérer la navigation depuis la page de connexion
 * @returns Fonctions de navigation
 */
export const useLoginNavigation = () => {
  const navigate = useNavigate();
  
  const handleCloseLoginPage = () => {
    navigate('/');
  };
  
  return { handleCloseLoginPage };
}; 