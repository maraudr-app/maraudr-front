import React from 'react';
import { useTranslation } from 'react-i18next';
import { MapPinIcon, PlusIcon, FireIcon, WifiIcon } from '@heroicons/react/24/outline';
import { useAssoStore } from '../../store/assoStore';
import Button from '../common/button/button';

interface MapNavbarProps {
  isConnected: boolean;
  showHeatmap: boolean;
  onToggleHeatmap: () => void;
  onAddPoint: () => void;
  daysFilter: number;
  onDaysFilterChange: (days: number) => void;
  onCreateRoute?: () => void;
  eventsCount?: number;
}

const MapNavbar: React.FC<MapNavbarProps> = ({ 
  isConnected, 
  showHeatmap, 
  onToggleHeatmap, 
  onAddPoint,
  daysFilter,
  onDaysFilterChange,
  onCreateRoute,
  eventsCount = 0
}) => {
  const { t } = useTranslation();
  const { sidebarCollapsed } = useAssoStore();

  const t_map = (key: string): string => {
    return t(`map.${key}` as any);
  };

  // Définir la largeur de la sidebar en pixels
  const sidebarWidth = sidebarCollapsed ? '56px' : '192px';

  return (
    <nav
      className="fixed top-16 right-0 z-40 bg-white dark:bg-gray-800 shadow transition-all duration-300 border-b border-orange-200/50 dark:border-gray-700"
      style={{ left: sidebarWidth, width: `calc(100vw - ${sidebarWidth})` }}
    >
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4 px-3 sm:px-7 py-2 sm:py-3 mx-auto w-full">
        {/* Titre et icône */}
        <div className="flex items-center gap-2 sm:gap-3 flex-1 justify-center sm:justify-start order-1 sm:order-1 min-w-0">
          <MapPinIcon className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500 flex-shrink-0" />
          <div className="text-gray-900 dark:text-white text-sm sm:text-base lg:text-lg font-bold truncate text-center sm:text-left">
            {t_map('title')}
          </div>
          <div className={`flex items-center space-x-2 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm ${
            isConnected 
              ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
              : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
          }`}>
            <WifiIcon className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">
              {isConnected ? t_map('realtime_active') : t_map('offline')}
            </span>
            <span className="sm:hidden">
              {isConnected ? 'En ligne' : 'Hors ligne'}
            </span>
          </div>
        </div>
        
        {/* Boutons d'action */}
        <div className="flex-shrink-0 flex flex-col sm:flex-row justify-center sm:justify-end gap-2 order-2 sm:order-2">
          {/* Filtre par jours */}
          <select
            value={daysFilter}
            onChange={(e) => onDaysFilterChange(parseInt(e.target.value))}
            className="px-2 sm:px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs sm:text-sm"
          >
            <option value={1}>{t_map('filter_today')}</option>
            <option value={7}>{t_map('filter_7days')}</option>
            <option value={30}>{t_map('filter_30days')}</option>
            <option value={90}>{t_map('filter_3months')}</option>
          </select>

          {/* Bouton heatmap */}
          <Button
            onClick={onToggleHeatmap}
            className={`flex items-center space-x-2 px-2 sm:px-4 py-2 rounded-lg font-medium transition-all text-xs sm:text-sm ${
              showHeatmap 
                ? 'bg-purple-500 hover:bg-purple-600 text-white' 
                : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
            }`}
          >
            <FireIcon className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">
              {showHeatmap ? t_map('hide_heatmap') : t_map('show_heatmap')}
            </span>
            <span className="sm:hidden">
              {showHeatmap ? 'Masquer' : 'Heatmap'}
            </span>
          </Button>

          {/* Bouton créer route */}
          {onCreateRoute && (
            <Button
              onClick={onCreateRoute}
              disabled={eventsCount === 0}
              className="flex items-center space-x-2 px-2 sm:px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg font-medium transition-all text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <PlusIcon className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">{t_map('create_route')}</span>
              <span className="sm:hidden">Route</span>
            </Button>
          )}

          {/* Bouton ajouter point */}
          <Button
            onClick={onAddPoint}
            className="flex items-center space-x-2 px-2 sm:px-4 py-2 bg-gradient-to-r from-orange-500 to-blue-500 hover:from-orange-600 hover:to-blue-600 text-white rounded-lg font-medium transition-all text-xs sm:text-sm"
          >
            <PlusIcon className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">{t_map('add_point')}</span>
            <span className="sm:hidden">Point</span>
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default MapNavbar; 