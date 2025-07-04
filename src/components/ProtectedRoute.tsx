import { ReactNode, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useAssoStore } from '../store/assoStore';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAuth?: boolean;
}

const ProtectedRoute = ({ children, requireAuth = true }: ProtectedRouteProps) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const associations = useAssoStore((state) => state.associations);
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);

  // Charger les associations si l'utilisateur est connecté et qu'on va rediriger vers le dashboard
  useEffect(() => {
    if (!requireAuth && isAuthenticated) {
      setIsLoading(true);
      const loadAssociations = async () => {
        try {
          await useAssoStore.getState().fetchUserAssociations();
        } catch (error) {
          console.error('Erreur lors du chargement des associations:', error);
        } finally {
          setIsLoading(false);
        }
      };
      loadAssociations();
    }
  }, [requireAuth, isAuthenticated]);

  // Si l'authentification est requise et que l'utilisateur n'est pas connecté
  if (requireAuth && !isAuthenticated) {
    // Rediriger vers la page 401
    return <Navigate to="/401" state={{ from: location }} replace />;
  }

  // Si l'authentification n'est pas requise et que l'utilisateur est connecté
  // Attendre que les associations soient chargées avant de rediriger
  if (!requireAuth && isAuthenticated) {
    if (isLoading) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-maraudr-lightBg via-blue-50/30 to-orange-50/30 dark:from-maraudr-darkBg dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-maraudr-orange mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">Connexion en cours...</p>
          </div>
        </div>
      );
    }
    
    // Si l'utilisateur a des associations, rediriger vers le dashboard
    // Sinon, le laisser sur la page actuelle (il verra le message pour créer une association)
    if (associations.length > 0) {
      return <Navigate to="/maraudApp/dashboard" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute; 