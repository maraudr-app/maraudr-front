import { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from '../Sidebar/Sidebar';
import { useAuthStore } from '../../../store/authStore';

const DashboardLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const navigate = useNavigate();

  // Rediriger vers la page de login si l'utilisateur n'est pas authentifié
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Gérer le changement d'état de la sidebar
  const handleSidebarToggle = (collapsed: boolean) => {
    setSidebarCollapsed(collapsed);
  };

  // Si l'utilisateur n'est pas authentifié, ne rien afficher pendant la redirection
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-screen pt-16 bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Sidebar avec handling du collapse */}
      <aside className="fixed z-10">
        <Sidebar onToggle={handleSidebarToggle} />
      </aside>

      {/* Contenu principal qui s'adapte à la taille de la sidebar */}
      <main 
        className={`flex-1 p-8 transition-all duration-300 overflow-auto ${
          sidebarCollapsed ? 'ml-14' : 'ml-48'
        } mt-0`}
      >
        <div className="container mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout; 