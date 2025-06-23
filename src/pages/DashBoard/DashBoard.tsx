import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/authStore';
import { useAssoStore } from '../../store/assoStore';
import { 
  CalendarDaysIcon, 
  MapPinIcon, 
  UserGroupIcon,
  ClipboardDocumentListIcon 
} from '@heroicons/react/24/outline';
import { assoService } from '../../services/assoService';
import { teamService } from '../../services/teamService';
import { stockService } from '../../services/stockService';
import { userService } from '../../services/userService';
import { MembershipStatusAlert } from '../../components/common/alert/MembershipStatusAlert';
import { 
  UsersIcon, 
  CubeIcon,
  ChartBarIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/20/solid';

// Interfaces pour TypeScript
interface DashboardData {
  stockItems: number;
  lowStockItems: number;
  teamMembers: number;
  upcomingEvents: number;
  activeDisponibilities: number;
  isUserInAssociation: boolean;
  stockItemsData: any[];
}

const DashBoard = () => {
  const { t } = useTranslation();
  const user = useAuthStore(state => state.user);
  const { selectedAssociation } = useAssoStore();
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    stockItems: 0,
    lowStockItems: 0,
    teamMembers: 0,
    upcomingEvents: 0,
    activeDisponibilities: 0,
    isUserInAssociation: true,
    stockItemsData: []
  });

  const isManager = user?.userType === 'Manager';

  // Fonctions pour la navigation des mois
  const getMonthName = (date: Date) => {
    return date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setSelectedMonth(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  // Générer des données d'activité mockées pour le mois sélectionné
  const generateMonthActivities = (date: Date) => {
    const daysInMonth = getDaysInMonth(date);
    const activities = [];
    
    for (let i = 0; i < daysInMonth; i++) {
      // Générer des activités pseudo-aléatoires basées sur le mois et le jour
      const seed = date.getMonth() * 31 + i;
      const random = Math.sin(seed) * 10000;
      const normalizedRandom = Math.abs(random % 1);
      
      // Moins d'activité les weekends
      const dayOfWeek = new Date(date.getFullYear(), date.getMonth(), i + 1).getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      
      let activityLevel;
      if (isWeekend) {
        activityLevel = normalizedRandom < 0.7 ? 0 : Math.floor(normalizedRandom * 3);
      } else {
        activityLevel = Math.floor(normalizedRandom * 9);
      }
      
      activities.push(activityLevel);
    }
    
    return activities;
  };

  // Charger les données du dashboard
  useEffect(() => {
    if (!selectedAssociation?.id) {
      return;
    }

    const loadDashboardData = async () => {
      setLoading(true);
      try {
        // Charger les données de stock
        const stockItems = await stockService.getStockItems(selectedAssociation.id);
        // Pour l'instant, considérer qu'un item est en stock faible si quantity < 5
        const lowStockItems = stockItems.filter(item => item.quantity < 5);
        setDashboardData({
          stockItems: stockItems.length,
          lowStockItems: lowStockItems.length,
          teamMembers: 0,
          upcomingEvents: 0,
          activeDisponibilities: 0,
          isUserInAssociation: true,
          stockItemsData: stockItems
        });

        // Charger les données d'équipe si l'utilisateur est manager
        if (user?.userType === 'Manager') {
          const teamResponse = await teamService.getTeamMembers(user.sub);
          const teamCount = teamResponse?.members?.length || 0;
          setDashboardData(prev => ({ ...prev, teamMembers: teamCount }));
        }

        // Charger les données de planning
        const availability = await userService.getDisponibilities(selectedAssociation.id);
        setDashboardData(prev => ({ ...prev, activeDisponibilities: availability?.length || 0 }));

      } catch (error) {
        // Erreur silencieuse
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [selectedAssociation, user]);

  // Ajouter un useEffect pour écouter les changements d'association
  useEffect(() => {
    const handleAssociationChange = (event: CustomEvent) => {
      console.log('🎯 Dashboard: Événement de changement d\'association reçu:', event.detail.association);
    };

    window.addEventListener('associationChanged', handleAssociationChange as EventListener);
    
    return () => {
      window.removeEventListener('associationChanged', handleAssociationChange as EventListener);
    };
  }, []);

  // Données des cartes selon le rôle
  const getStatsCards = () => {
    if (isManager) {
      return [
        {
          title: 'Membres de l\'équipe',
          value: dashboardData.teamMembers.toString(),
          change: '+2',
          isPositive: true,
          icon: <UsersIcon className="w-6 h-6 text-orange-500" />,
          iconBg: 'bg-orange-100 dark:bg-orange-900/30',
          description: 'Ce mois'
        },
        {
          title: 'Articles en stock',
          value: dashboardData.stockItems.toString(),
          change: '+12',
          isPositive: true,
          icon: <CubeIcon className="w-6 h-6 text-blue-500" />,
          iconBg: 'bg-blue-100 dark:bg-blue-900/30',
          description: 'Total'
        },
        {
          title: 'Stock faible',
          value: dashboardData.lowStockItems.toString(),
          change: '-3',
          isPositive: false,
          icon: <ExclamationTriangleIcon className="w-6 h-6 text-red-500" />,
          iconBg: 'bg-red-100 dark:bg-red-900/30',
          description: 'À réapprovisionner'
        },
        {
          title: 'Événements prévus',
          value: dashboardData.upcomingEvents.toString(),
          change: '+1',
          isPositive: true,
          icon: <CalendarDaysIcon className="w-6 h-6 text-green-500" />,
          iconBg: 'bg-green-100 dark:bg-green-900/30',
          description: 'Cette semaine'
        }
      ];
    } else {
      return [
        {
          title: 'Mes disponibilités',
          value: dashboardData.activeDisponibilities.toString(),
          change: '+2',
          isPositive: true,
          icon: <ClockIcon className="w-6 h-6 text-orange-500" />,
          iconBg: 'bg-orange-100 dark:bg-orange-900/30',
          description: 'Ce mois',
          action: (
            <Link
              to="/maraudApp/planing"
              className="mt-2 inline-flex items-center text-xs text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300"
            >
              Modifier
            </Link>
          )
        },
        {
          title: 'Prochaines missions',
          value: '2',
          change: '+1',
          isPositive: true,
          icon: <MapPinIcon className="w-6 h-6 text-blue-500" />,
          iconBg: 'bg-blue-100 dark:bg-blue-900/30',
          description: 'Cette semaine'
        },
        {
          title: 'Missions complétées',
          value: '8',
          change: '+3',
          isPositive: true,
          icon: <CheckCircleIcon className="w-6 h-6 text-green-500" />,
          iconBg: 'bg-green-100 dark:bg-green-900/30',
          description: 'Ce mois'
        },
        {
          title: 'Heures bénévolat',
          value: '24h',
          change: '+6h',
          isPositive: true,
          icon: <ChartBarIcon className="w-6 h-6 text-purple-500" />,
          iconBg: 'bg-purple-100 dark:bg-purple-900/30',
          description: 'Ce mois'
        }
      ];
    }
  };

  const statsCards = getStatsCards();

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Chargement de votre dashboard...
          </p>
          <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">
            Récupération des données en cours
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* En-tête de bienvenue */}
      <div className="bg-gradient-to-r from-orange-500 to-blue-500 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          Bonjour {user?.firstName || user?.email?.split('@')[0] || 'Utilisateur'} ! 👋
        </h1>
        <p className="text-orange-100">
          {isManager 
            ? "Voici un aperçu de votre association et de votre équipe."
            : "Voici un aperçu de vos activités et missions."
          }
        </p>
        {selectedAssociation && (
          <p className="text-sm text-orange-200 mt-2">
            Association : {selectedAssociation.name}
          </p>
        )}
      </div>

      {/* Alerte de statut d'adhésion pour les utilisateurs simples */}
      {!isManager && (
        <MembershipStatusAlert 
          isInAssociation={dashboardData.isUserInAssociation}
          associationName={selectedAssociation?.name}
        />
      )}

      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((card, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">
                  {card.title}
                </p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {card.value}
                </h3>
                <div className="flex items-center">
                  <span className={`flex items-center text-sm ${card.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                    {card.isPositive ? 
                      <ArrowUpIcon className="w-3 h-3 mr-1" /> : 
                      <ArrowDownIcon className="w-3 h-3 mr-1" />
                    }
                    {card.change}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                    {card.description}
                  </span>
                </div>
                {(card as any).action && (card as any).action}
              </div>
              <div className={`p-3 rounded-lg ${card.iconBg}`}>
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calendrier d'activité */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {isManager ? 'Activité de l\'association' : 'Mon activité'}
            </h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => navigateMonth('prev')}
                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <ChevronLeftIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              </button>
              <div className="text-sm text-gray-500 dark:text-gray-400 min-w-[120px] text-center">
                {getMonthName(selectedMonth)}
              </div>
              <button
                onClick={() => navigateMonth('next')}
                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <ChevronRightIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
          </div>
          
          <div className="space-y-4">
            {/* Légende */}
            <div className="flex items-center space-x-4 text-xs">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-1"></div>
                <span className="text-gray-600 dark:text-gray-400">Faible (1-2)</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-orange-500 rounded-full mr-1"></div>
                <span className="text-gray-600 dark:text-gray-400">Modérée (3-5)</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-1"></div>
                <span className="text-gray-600 dark:text-gray-400">Élevée (6+)</span>
              </div>
            </div>

            {/* Calendrier mini */}
            <div className="grid grid-cols-7 gap-1">
              {/* En-têtes des jours */}
              {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, index) => (
                <div key={index} className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 p-1">
                  {day}
                </div>
              ))}
              
                             {/* Jours du mois avec activité */}
               {(() => {
                 const daysInMonth = getDaysInMonth(selectedMonth);
                 const monthActivities = generateMonthActivities(selectedMonth);
                 const today = new Date();
                 const isCurrentMonth = selectedMonth.getMonth() === today.getMonth() && 
                                       selectedMonth.getFullYear() === today.getFullYear();
                 
                 return Array.from({ length: daysInMonth }, (_, i) => {
                   const dayNumber = i + 1;
                   const activities = monthActivities[i];
                   const intensity = activities === 0 ? 'bg-gray-100 dark:bg-gray-700' :
                                   activities <= 2 ? 'bg-green-200 dark:bg-green-800' :
                                   activities <= 5 ? 'bg-orange-200 dark:bg-orange-800' :
                                   'bg-red-200 dark:bg-red-800';
                   
                   const isToday = isCurrentMonth && dayNumber === today.getDate();
                   
                   return (
                     <div
                       key={dayNumber}
                       className={`aspect-square flex items-center justify-center text-xs rounded cursor-pointer transition-all hover:scale-110 ${intensity} ${
                         isToday ? 'ring-2 ring-blue-500 font-bold' : ''
                       }`}
                       title={`${dayNumber} ${getMonthName(selectedMonth).split(' ')[0]} - ${activities} activités`}
                     >
                       {dayNumber}
                     </div>
                   );
                 });
               })()}
            </div>

            {/* Statistiques rapides */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="text-center">
                <div className="text-lg font-bold text-green-600 dark:text-green-400">47</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Actions stock</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-orange-600 dark:text-orange-400">23</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Missions</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600 dark:text-blue-400">156</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Bénéficiaires</div>
              </div>
            </div>
          </div>
        </div>

        {/* Résumé de stock (Manager) ou Prochaines missions (Membre) */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {isManager ? 'Résumé du stock' : 'Prochaines missions'}
          </h3>
          
          <div className="space-y-4">
            {isManager ? (
              // Vue Manager : Résumé de stock
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {dashboardData.stockItems}
                    </div>
                    <div className="text-sm text-blue-600 dark:text-blue-400">Articles total</div>
                  </div>
                  <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                      {dashboardData.lowStockItems}
                    </div>
                    <div className="text-sm text-red-600 dark:text-red-400">Stock critique</div>
                  </div>
                </div>
                <div className="text-center py-4">
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                    Consultez la page Stock pour plus de détails
                  </p>
                  <Link
                    to="/maraudApp/stock"
                    className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-orange-500 to-blue-500 text-white text-sm font-medium rounded-lg hover:from-orange-600 hover:to-blue-600 transition-colors"
                  >
                    Voir le stock complet
                  </Link>
                </div>
              </div>
            ) : (
              // Vue Membre : Prochaines missions
              <>
                <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center">
                    <MapPinIcon className="w-5 h-5 text-blue-500 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                        Maraude Centre-ville
                      </p>
                      <p className="text-xs text-blue-600 dark:text-blue-300">
                        Demain 19h - 22h
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center">
                    <CalendarDaysIcon className="w-5 h-5 text-green-500 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-green-800 dark:text-green-200">
                        Distribution alimentaire
                      </p>
                      <p className="text-xs text-green-600 dark:text-green-300">
                        Samedi 14h - 17h
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashBoard;