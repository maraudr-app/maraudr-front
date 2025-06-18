import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { 
  UsersIcon, 
  CubeIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  ClockIcon,
  MapPinIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/20/solid';
import { useAuthStore } from '../../store/authStore';
import { useAssoStore } from '../../store/assoStore';
import { stockService } from '../../services/stockService';
import { teamService } from '../../services/teamService';
import { assoService } from '../../services/assoService';
import MembershipStatusAlert from '../../components/common/alert/MembershipStatusAlert';
import { Link } from 'react-router-dom';

// Interfaces pour TypeScript
interface RecentActivity {
  id: number;
  type: 'stock' | 'team' | 'planning';
  message: string;
  time: string;
  user: string;
}

interface DashboardData {
  stockItems: number;
  lowStockItems: number;
  teamMembers: number;
  upcomingEvents: number;
  activeDisponibilities: number;
  recentActivities: RecentActivity[];
  isUserInAssociation: boolean;
}

const DashBoard = () => {
  const { t } = useTranslation();
  const user = useAuthStore(state => state.user);
  const { selectedAssociation } = useAssoStore();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    stockItems: 0,
    lowStockItems: 0,
    teamMembers: 0,
    upcomingEvents: 0,
    activeDisponibilities: 0,
    recentActivities: [],
    isUserInAssociation: true
  });

  const isManager = user?.userType === 'Manager';

  // Charger les données du dashboard
  useEffect(() => {
    const loadDashboardData = async () => {
      if (!selectedAssociation?.id) return;
      
      try {
        setLoading(true);
        
        // Charger les données de stock
        const stockItems = await stockService.getStockItems(selectedAssociation.id);
        const lowStockItems = stockItems.filter(item => item.quantity < 10);
        
        // Charger les données d'équipe si manager
        let teamCount = 0;
        if (isManager) {
          try {
            const teamData = await teamService.getTeamMembers(selectedAssociation.id);
            teamCount = teamData.totalCount;
          } catch (error) {
            console.log('Team data not available');
          }
        }

        // Vérifier si l'utilisateur est dans l'association (seulement pour les utilisateurs simples)
        let isInAssociation = true;
        if (!isManager && user?.sub && selectedAssociation?.id) {
          try {
            isInAssociation = await assoService.isUserMemberOfAssociation(user.sub, selectedAssociation.id);
            console.log(`Utilisateur ${user.sub} membre de l'association ${selectedAssociation.id}:`, isInAssociation);
          } catch (error) {
            console.log('Could not check association membership:', error);
            // En cas d'erreur, on considère que l'utilisateur n'est pas encore membre
            isInAssociation = false;
          }
        }

        setDashboardData({
          stockItems: stockItems.length,
          lowStockItems: lowStockItems.length,
          teamMembers: teamCount,
          upcomingEvents: 3, // Mock data
          activeDisponibilities: 5, // Mock data
          isUserInAssociation: isInAssociation,
          recentActivities: [
            {
              id: 1,
              type: 'stock',
              message: 'Ajout de 50 pâtes au stock',
              time: '2 heures',
              user: 'Marie Dupont'
            },
            {
              id: 2,
              type: 'team',
              message: 'Nouveau membre ajouté à l\'équipe',
              time: '4 heures',
              user: 'Jean Martin'
            },
            {
              id: 3,
              type: 'planning',
              message: 'Disponibilité ajoutée pour demain',
              time: '6 heures',
              user: 'Sophie Moreau'
            }
          ]
        });
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [selectedAssociation?.id, isManager]);

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
        {/* Graphique des activités */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {isManager ? 'Activité de l\'association' : 'Mon activité'}
          </h3>
          
          <div className="h-64 w-full">
            {/* Graphique simple avec barres */}
            <div className="h-full w-full flex items-end justify-between space-x-2">
              {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day, index) => {
                const heights = [60, 80, 45, 90, 70, 35, 55];
                return (
                  <div key={day} className="flex flex-col items-center flex-1">
                    <div 
                      className="w-full bg-gradient-to-t from-orange-500 to-blue-500 rounded-t-md transition-all duration-300 hover:opacity-80" 
                      style={{height: `${heights[index]}%`}}
                    />
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">{day}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Stock critique (Manager) ou Prochaines missions (Membre) */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {isManager ? 'Stock critique' : 'Prochaines missions'}
          </h3>
          
          <div className="space-y-4">
            {isManager ? (
              // Vue Manager : Articles en stock faible
              dashboardData.lowStockItems > 0 ? (
                <>
                  <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                    <div className="flex items-center">
                      <ExclamationTriangleIcon className="w-5 h-5 text-red-500 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-red-800 dark:text-red-200">
                          {dashboardData.lowStockItems} articles en stock faible
                        </p>
                        <p className="text-xs text-red-600 dark:text-red-300">
                          Réapprovisionnement nécessaire
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                    <div className="flex items-center">
                      <CubeIcon className="w-5 h-5 text-orange-500 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-orange-800 dark:text-orange-200">
                          Pâtes - 8 unités restantes
                        </p>
                        <p className="text-xs text-orange-600 dark:text-orange-300">
                          Seuil critique atteint
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <CheckCircleIcon className="w-12 h-12 text-green-500 mx-auto mb-2" />
                  <p className="text-gray-600 dark:text-gray-400">Tous les stocks sont OK</p>
                </div>
              )
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

      {/* Activités récentes */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Activités récentes
          </h3>
        </div>
        
        <div className="p-6">
          <div className="space-y-4">
            {dashboardData.recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className={`p-2 rounded-full ${
                  activity.type === 'stock' ? 'bg-blue-100 dark:bg-blue-900/30' :
                  activity.type === 'team' ? 'bg-green-100 dark:bg-green-900/30' :
                  'bg-orange-100 dark:bg-orange-900/30'
                }`}>
                  {activity.type === 'stock' ? (
                    <CubeIcon className="w-4 h-4 text-blue-500" />
                  ) : activity.type === 'team' ? (
                    <UsersIcon className="w-4 h-4 text-green-500" />
                  ) : (
                    <CalendarDaysIcon className="w-4 h-4 text-orange-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 dark:text-white">
                    {activity.message}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Par {activity.user} • Il y a {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashBoard;