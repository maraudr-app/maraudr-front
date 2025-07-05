import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ChartBarIcon,
  CubeIcon,
  Cog6ToothIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  UserCircleIcon,
  InformationCircleIcon,
  UsersIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { FiCalendar } from "react-icons/fi";
import {ArrowRightOnRectangleIcon} from "@heroicons/react/20/solid";
import { CiMap } from "react-icons/ci";
import { useAssoStore } from '../../../store/assoStore';
import { useAuthStore } from '../../../store/authStore';
import { assoService } from '../../../services/assoService';

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
      className={`flex items-center py-2 px-3 rounded-lg transition-colors duration-200 text-sm ${isActive 
          ? 'bg-maraudr-blue/20 text-maraudr-blue dark:bg-maraudr-orange/20 dark:text-maraudr-orange' 
          : 'hover:bg-maraudr-blue/10 dark:hover:bg-maraudr-orange/10 text-maraudr-darkText dark:text-maraudr-lightText'
      }`}
    >
      <div className="w-5 h-5">{icon}</div>
      {!isCollapsed && <span className="ml-2 whitespace-nowrap">{label}</span>}
    </Link>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ onToggle }) => {
  const { pathname } = useLocation();
  const { t } = useTranslation();
  const { sidebarCollapsed, setSidebarCollapsed, selectedAssociation } = useAssoStore();
  const [associationDetails, setAssociationDetails] = useState<any>(null);
  const user = useAuthStore((state: any) => state.user);
  const isAuthenticated = useAuthStore((state: any) => state.isAuthenticated);
  
  // Debug logs pour le rôle
      // User information silencieuse

  // Recharger les données utilisateur si elles sont incomplètes
  useEffect(() => {
    const loadUserData = async () => {
      if (isAuthenticated && user) {
        // Si l'utilisateur n'a pas userType, recharger les données
        if (!user.userType || !user.firstName || !user.lastName) {
                      // User data incomplete, reloading silencieusement
          await useAuthStore.getState().fetchUser();
        }
      }
    };
    loadUserData();
  }, [isAuthenticated, user]);

  // Fonction pour vérifier si l'utilisateur est manager
  const isManager = () => {
    if (!user?.userType) return false;
    return user.userType === 'Manager';
  };

  useEffect(() => {
    const fetchAssociationDetails = async () => {
      if (selectedAssociation?.id) {
        try {
          const details = await assoService.getAssociation(selectedAssociation.id);
          setAssociationDetails(details);
        } catch (error) {
          console.error('Error fetching association details:', error);
        }
      }
    };

    fetchAssociationDetails();
  }, [selectedAssociation?.id]);

  const toggleSidebar = () => {
    const newState = !sidebarCollapsed;
    setSidebarCollapsed(newState);
    if (onToggle) {
      onToggle(newState);
    }
  };

  const navigationItems = [
    {
      to: '/maraudApp/dashboard',
      icon: <ChartBarIcon className="w-5 h-5" />,
      label: t('sidebar.dashboard', 'Dashboard'),
      key: 'dashboard',
      showForManager: false
    },
    {
      to: '/maraudApp/stock',
      icon: <CubeIcon className="w-5 h-5" />,
      label: t('sidebar.stock', 'Stock'),
      key: 'stock',
      showForManager: false
    },
    {
      to: '/maraudApp/gallery',
      icon: <InformationCircleIcon className="w-5 h-5" />,
      label: t('sidebar.media', 'Médias'),
      key: 'gallery',
      showForManager: false
    },
    {
      to: '/maraudApp/team',
      icon: <UsersIcon className="w-5 h-5" />,
      label: t('sidebar.team', 'Équipe'),
      key: 'team',
      showForManager: false
    },
    {
      to: '/maraudApp/map',
      icon: <CiMap className="w-5 h-5" />,
      label: t('sidebar.map', 'Carte'),
      key: 'map',
      showForManager: false
    },
    {
      to: '/maraudApp/planing',
      icon: <FiCalendar className="w-5 h-5" />,
      label: t('sidebar.planing', 'Planing'),
      key: 'planing',
      showForManager: false
    },
    {
      to: '/maraudApp/mcp-server',
      icon: <Cog6ToothIcon className="w-5 h-5" />,
      label: t('sidebar.mcp', 'Serveur MCP'),
      key: 'mcp-server',
      showForManager: false
    },
  ];

  // Filtrer les éléments selon le rôle
  const filteredNavigationItems = navigationItems.filter(item => 
    !item.showForManager || isManager()
  );

  const bottomItems = [
    { 
      to: '/maraudApp/profile',
      icon: <UserCircleIcon className="w-5 h-5" />, 
      label: t('sidebar.profile', 'Profile'), 
      key: 'profile' 
    },
    { 
      to: '/maraudApp/setting',
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
      className={`fixed top-0 left-0 h-screen shadow-md transition-all duration-300 z-[60] flex flex-col justify-between font-body ${
        sidebarCollapsed ? 'w-14' : 'w-48'
      }`}
      style={{
      backgroundColor:'#104d77',
      color:'#ffffff'
      }}
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        {!sidebarCollapsed && (
          <h1 className="text-xl font-bold text-white">maraudr</h1>
        )}
          <button
            onClick={toggleSidebar}
          className="p-2 rounded-md hover:bg-gray-700 transition-colors"
          >
          {sidebarCollapsed ? (
            <Bars3Icon className="w-5 h-5 text-white" />
            ) : (
            <XMarkIcon className="w-5 h-5 text-white" />
            )}
          </button>
        </div>

      <nav className="flex-1 py-4">
        <ul className="space-y-2">
          {filteredNavigationItems.map((item) => (
            <li key={item.key}>
              <Link
                to={item.to}
                className={`flex items-center px-4 py-3 text-white hover:bg-gray-700 transition-colors ${
                  checkIsActive(item.to) ? 'bg-gradient-to-r from-orange-100/20 to-blue-100/20 border-l-4 border-orange-500' : ''
                }`}
              >
                {item.icon}
                {!sidebarCollapsed && (
                  <span className="ml-3">{item.label}</span>
                )}
              </Link>
            </li>
          ))}
        </ul>
        </nav>

      <div className="border-t border-gray-700 py-4">
        <ul className="space-y-2">
        {bottomItems.map((item) => (
            <li key={item.key}>
              <Link
              to={item.to}
                className={`flex items-center px-4 py-3 text-white hover:bg-gray-700 transition-colors ${
                  checkIsActive(item.to) ? 'bg-gradient-to-r from-orange-100/20 to-blue-100/20 border-l-4 border-orange-500' : ''
                }`}
              >
                {item.icon}
                {!sidebarCollapsed && (
                  <span className="ml-3">{item.label}</span>
                )}
              </Link>
            </li>
        ))}
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;