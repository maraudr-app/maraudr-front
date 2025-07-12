import { useAssoStore } from '../../store/assoStore';
import { CalendarDaysIcon } from '@heroicons/react/24/outline';
import { Button } from '../common/button/button';

interface PlanningNavbarProps {
  onAddDisponibility?: () => void;
  onAddEvent?: () => void;
  isManager?: boolean;
  isAddButtonDisabled?: boolean;
}

export const PlanningNavbar = ({ 
  onAddDisponibility, 
  onAddEvent, 
  isManager = false, 
  isAddButtonDisabled = false 
}: PlanningNavbarProps) => {
  const { sidebarCollapsed } = useAssoStore();
  // Définir la largeur de la sidebar en pixels (comme StockNavbar)
  const sidebarWidth = sidebarCollapsed ? '56px' : '192px';

  return (
    <nav
      className="fixed top-16 right-0 z-40 bg-white dark:bg-gray-800 shadow transition-all duration-300 w-full border-b border-gray-200 dark:border-gray-800"
      style={{ left: sidebarWidth }}
    >
      <div className="flex flex-col sm:flex-row items-center justify-between h-auto sm:h-16 gap-3 sm:gap-2 px-4 py-3 sm:py-0 max-w-6xl mx-auto">
        <div className="flex items-center gap-3">
          <CalendarDaysIcon className="w-6 h-6 text-maraudr-blue dark:text-maraudr-orange flex-shrink-0" />
          <div className="text-gray-900 dark:text-white text-base sm:text-lg font-bold truncate">
            Planification & Disponibilités
          </div>
        </div>
        <div className="flex-shrink-0">
          {isManager ? (
            <Button
              onClick={onAddEvent}
              disabled={isAddButtonDisabled}
              className="text-white bg-maraudr-blue hover:bg-maraudr-orange px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap"
            >
              Ajouter un événement
            </Button>
          ) : (
            <Button
              onClick={onAddDisponibility}
              disabled={isAddButtonDisabled}
              className="text-white bg-maraudr-blue hover:bg-maraudr-orange px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap"
            >
              Ajouter une disponibilité
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}; 