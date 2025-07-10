import { useAssoStore } from '../../store/assoStore';
import { CalendarDaysIcon } from '@heroicons/react/24/outline';
import { Button } from '../common/button/button';

interface PlanningNavbarProps {
  onAddDisponibility: () => void;
  isAddButtonDisabled?: boolean;
}

export const PlanningNavbar = ({ onAddDisponibility, isAddButtonDisabled = false }: PlanningNavbarProps) => {
  const { sidebarCollapsed } = useAssoStore();
  // Définir la largeur de la sidebar en pixels (comme StockNavbar)
  const sidebarWidth = sidebarCollapsed ? '56px' : '192px';

  return (
    <nav
      className="fixed top-16 right-0 z-40 bg-white dark:bg-gray-800 shadow transition-all duration-300 w-full border-b border-gray-200 dark:border-gray-800"
      style={{ left: sidebarWidth }}
    >
      <div className="flex items-center justify-between h-16 max-w-6xl mx-auto px-4">
        <div className="flex items-center gap-3 pl-2">
          <CalendarDaysIcon className="w-6 h-6 text-maraudr-blue dark:text-maraudr-orange" />
          <div className="text-gray-900 dark:text-white text-lg font-bold">
            Mes planings
          </div>
        </div>
        <div className="flex items-center space-x-4 px-2">
          <Button
            onClick={onAddDisponibility}
            disabled={isAddButtonDisabled}
            className="text-white bg-maraudr-blue hover:bg-maraudr-orange px-4 py-2 rounded-md text-sm font-medium transition-colors"
          >
            Ajouter une disponibilité
          </Button>
        </div>
      </div>
    </nav>
  );
}; 