import React from 'react';
import { useTranslation } from 'react-i18next';
import { CalendarDaysIcon, ClockIcon } from '@heroicons/react/24/outline';
import { useAssoStore } from '../../store/assoStore';
import Button from '../common/button/button';
import { useNavigate, useLocation } from 'react-router-dom';

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
  const navigate = useNavigate();
  const location = useLocation();

  const t_planning = (key: string): string => {
    return t(`planning.${key}` as any);
  };

  // Définir la largeur de la sidebar en pixels (comme StockNavbar)
  const sidebarWidth = sidebarCollapsed ? '56px' : '192px';

  // Vérifier si on est sur la page d'historique
  const isOnHistoryPage = location.pathname === '/maraudApp/planing/history';

  return (
    <nav
      className="fixed top-16 right-0 z-40 bg-white dark:bg-gray-800 shadow transition-all duration-300 w-full border-b border-gray-200 dark:border-gray-800"
      style={{ left: sidebarWidth }}
    >
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 px-4 py-3 max-w-6xl mx-auto">
        <div className="flex items-center gap-3 w-full justify-center md:justify-start">
          <CalendarDaysIcon className="w-6 h-6 text-maraudr-blue dark:text-maraudr-orange flex-shrink-0" />
          <div className="text-gray-900 dark:text-white text-base sm:text-lg font-bold truncate text-center md:text-left">
            {t_planning('team_associationPlanning')}
          </div>
        </div>
        
        <div className="flex-shrink-0 w-full md:w-auto flex justify-center md:justify-end gap-2">
          {(
            <Button
              onClick={() => isOnHistoryPage ? navigate('/maraudApp/planing') : navigate('/maraudApp/planing/history')}
              className={`px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap w-full md:w-auto flex items-center gap-2 ${
                isOnHistoryPage 
                  ? 'text-white bg-maraudr-orange hover:bg-maraudr-blue' 
                  : 'text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <ClockIcon className="w-4 h-4" />
              {isOnHistoryPage ? t_planning('team_associationPlanning') : t_planning('history_title')}
            </Button>
          )}
          
          {userRole === 'manager' && onAddEvent && (
            <Button
              onClick={onAddEvent}
              className="text-white bg-maraudr-blue hover:bg-maraudr-orange px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap w-full md:w-auto"
            >
              {t_planning('team_addEvent')}
            </Button>
          )}
          
          {userRole === 'member' && onAddAvailability && (
            <Button
              onClick={onAddAvailability}
              className="text-white bg-maraudr-blue hover:bg-maraudr-orange px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap w-full md:w-auto"
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