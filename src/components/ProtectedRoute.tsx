import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAuth?: boolean;
}

const ProtectedRoute = ({ children, requireAuth = true }: ProtectedRouteProps) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const location = useLocation();

  // Si l'authentification est requise et que l'utilisateur n'est pas connecté
  if (requireAuth && !isAuthenticated) {
    // Rediriger vers la page 401
    return <Navigate to="/401" state={{ from: location }} replace />;
  }

  // Si l'authentification n'est pas requise et que l'utilisateur est connecté
  // (pour éviter qu'un utilisateur connecté accède aux pages de login/register)
  if (!requireAuth && isAuthenticated) {
    return <Navigate to="/maraudApp/dashboard" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute; 