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
      className="fixed top-16 right-0 z-40 bg-white dark:bg-gray-800 shadow transition-all duration-300 border-b border-gray-200 dark:border-gray-800"
      style={{ left: sidebarWidth, width: `calc(100vw - ${sidebarWidth})` }}
    >
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4 px-3 sm:px-4 py-2 sm:py-3 mx-auto w-full">
        {/* Titre et icône */}
        <div className="flex items-center gap-2 sm:gap-3 flex-1 justify-center sm:justify-start order-1 sm:order-1 min-w-0">
          <CalendarDaysIcon className="w-5 h-5 sm:w-6 sm:h-6 text-maraudr-blue dark:text-maraudr-orange flex-shrink-0" />
          <div className="text-gray-900 dark:text-white text-sm sm:text-base lg:text-lg font-bold truncate text-center sm:text-left">
            {t_planning('team_associationPlanning')}
          </div>
        </div>
        
        {/* Boutons d'action */}
        <div className="flex-shrink-0 flex flex-col sm:flex-row justify-center sm:justify-end gap-2 order-2 sm:order-2">
          {/* Bouton pour basculer entre planning et historique */}
          <Button
            onClick={() => isOnHistoryPage ? navigate('/maraudApp/planing') : navigate('/maraudApp/planing/history')}
            className={`px-2 sm:px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap w-full sm:w-auto flex items-center justify-center gap-1 sm:gap-2 ${
              isOnHistoryPage 
                ? 'text-white bg-maraudr-orange hover:bg-maraudr-blue' 
                : 'text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <ClockIcon className="w-4 h-4" />
            <span className="hidden sm:inline">
              {isOnHistoryPage ? t_planning('history_backToPlanning') : t_planning('history_title')}
            </span>
            <span className="sm:hidden">
              {isOnHistoryPage ? 'Retour' : 'Historique'}
            </span>
          </Button>
          
          {/* Ne pas afficher les boutons d'ajout sur la page d'historique */}
          {!isOnHistoryPage && userRole === 'manager' && onAddEvent && (
            <Button
              onClick={onAddEvent}
              className="text-white bg-maraudr-blue hover:bg-maraudr-orange px-2 sm:px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap w-full sm:w-auto"
            >
              <span className="hidden sm:inline">{t_planning('team_addEvent')}</span>
              <span className="sm:hidden">Ajouter événement</span>
            </Button>
          )}
          
          {!isOnHistoryPage && userRole === 'member' && onAddAvailability && (
            <Button
              onClick={onAddAvailability}
              className="text-white bg-maraudr-blue hover:bg-maraudr-orange px-2 sm:px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap w-full sm:w-auto"
            >
              <span className="hidden sm:inline">{t_planning('team_addAvailability')}</span>
              <span className="sm:hidden">Ajouter dispo</span>
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
};

export { PlanningNavbar }; 