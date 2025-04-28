import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ChartBarIcon,
  CubeIcon,
  Cog6ToothIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import {ArrowRightOnRectangleIcon} from "@heroicons/react/20/solid";

interface SidebarItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  isCollapsed: boolean;
}

interface SidebarProps {
  onToggle?: (isCollapsed: boolean) => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ to, icon, label, isActive, isCollapsed }) => {
  return (
    <Link
      to={to}
      className={`flex items-center py-2 px-3 rounded-lg transition-colors duration-200 text-sm ${
        isActive 
          ? 'bg-blue-100 text-blue-600 dark:bg-gray-700 dark:text-blue-400' 
          : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
      }`}
    >
      <div className="w-5 h-5">{icon}</div>
      {!isCollapsed && <span className="ml-2 whitespace-nowrap">{label}</span>}
    </Link>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ onToggle }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { pathname } = useLocation();
  const { t } = useTranslation();


  const toggleSidebar = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    if (onToggle) {
      onToggle(newState);
    }
  };

  const navigationItems = [
    { 
      to: '/maraudApp/dashboard', 
      icon: <ChartBarIcon className="w-5 h-5" />, 
      label: t('sidebar.dashboard', 'Dashboard'), 
      key: 'dashboard' 
    },
    { 
      to: '/maraudApp/stock', 
      icon: <CubeIcon className="w-5 h-5" />, 
      label: t('sidebar.stock', 'Stock'), 
      key: 'stock' 
    }
  ];

  const bottomItems = [
    { 
      to: '/settings', 
      icon: <Cog6ToothIcon className="w-5 h-5" />, 
      label: t('sidebar.settings', 'Settings'), 
      key: 'settings' 
    },
    {
      to: '/logOut',
      icon: <ArrowRightOnRectangleIcon className="w-5 h-5" />,
      label: t('sidebar.logout', 'Log Out'),
      key: 'logOut'
    }
  ];

  // Fonction pour vérifier si un élément est actif
  const checkIsActive = (path: string) => {
    return pathname === path || pathname.startsWith(`${path}/`);
  };

  return (
    <div
      className={`fixed top-16 left-0 h-[calc(100vh-4rem)] bg-white dark:bg-gray-800 shadow-md transition-all duration-300 z-10 flex flex-col justify-between ${
        isCollapsed ? 'w-14' : 'w-48'
      }`}
    >
      <div>
        <div className="flex justify-end p-2">
          <button
            onClick={toggleSidebar}
            className="p-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
            aria-label={isCollapsed ? t('sidebar.expand', 'Expand') : t('sidebar.collapse', 'Collapse')}
          >
            {isCollapsed ? (
              <ChevronRightIcon className="w-4 h-4" />
            ) : (
              <ChevronLeftIcon className="w-4 h-4" />
            )}
          </button>
        </div>

        <nav className="px-2 mt-2">
          {navigationItems.map((item) => (
            <div key={item.key} className="mb-2">
              <SidebarItem
                to={item.to}
                icon={item.icon}
                label={item.label}
                isActive={checkIsActive(item.to)}
                isCollapsed={isCollapsed}
              />
            </div>
          ))}
        </nav>
      </div>

      <div className="mb-8 px-2">
        {bottomItems.map((item) => (
          <div key={item.key} className="mb-2">
            <SidebarItem
              to={item.to}
              icon={item.icon}
              label={item.label}
              isActive={checkIsActive(item.to)}
              isCollapsed={isCollapsed}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;