import React from 'react';
import { useTranslation } from 'react-i18next';
import { CalendarDaysIcon } from '@heroicons/react/24/outline';
import { useAssoStore } from '../../store/assoStore';
import Button from '../common/button/button';

interface PlanningNavbarProps {
  onAddEvent?: () => void;
  onAddAvailability?: () => void;
  userRole?: 'manager' | 'member';
}

const PlanningNavbar: React.FC<PlanningNavbarProps> = ({ 
  onAddEvent, 
  onAddAvailability, 
  userRole = 'member' 
}) => {
  const { t } = useTranslation();
  const { sidebarCollapsed } = useAssoStore();

  const t_planning = (key: string): string => {
    return t(`planning.${key}` as any);
  };

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
            {t_planning('team_associationPlanning')}
          </div>
        </div>
        
        <div className="flex-shrink-0">
          {userRole === 'manager' && onAddEvent && (
            <Button
              onClick={onAddEvent}
              className="text-white bg-maraudr-blue hover:bg-maraudr-orange px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap"
            >
              {t_planning('team_addEvent')}
            </Button>
          )}
          
          {userRole === 'member' && onAddAvailability && (
            <Button
              onClick={onAddAvailability}
              className="text-white bg-maraudr-blue hover:bg-maraudr-orange px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap"
            >
              {t_planning('team_addAvailability')}
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
};

export { PlanningNavbar }; 