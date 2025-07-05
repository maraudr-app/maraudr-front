import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/authStore';
import { useAssoStore } from '../../store/assoStore';
import { 
  CalendarDaysIcon, 
  MapPinIcon, 
  UserGroupIcon,
  ClipboardDocumentListIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  UsersIcon,
  CubeIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  CheckCircleIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { assoService } from '../../services/assoService';
import { teamService } from '../../services/teamService';
import { stockService } from '../../services/stockService';
import { userService } from '../../services/userService';
import { planningService } from '../../services/planningService';
import { Event } from '../../types/planning/event';
import { MembershipStatusAlert } from '../../components/common/alert/MembershipStatusAlert';
import { 
  ChevronDownIcon,
  ChevronUpIcon
} from '@heroicons/react/24/outline';

// Interfaces pour TypeScript
interface DashboardData {
  stockItems: number;
  lowStockItems: number;
  teamMembers: number;
  teamMembersList: any[];
  upcomingEvents: number;
  activeDisponibilities: number;
  isUserInAssociation: boolean;
  stockItemsData: any[];
  userEvents: Event[];
}

const DashBoard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = useAuthStore(state => state.user);
  const { selectedAssociation, associations } = useAssoStore();
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    stockItems: 0,
    lowStockItems: 0,
    teamMembers: 0,
    teamMembersList: [],
    upcomingEvents: 0,
    activeDisponibilities: 0,
    isUserInAssociation: true,
    stockItemsData: [],
    userEvents: []
  });

  const isManager = user?.userType === 'Manager';

  // Vérifier si l'utilisateur a une association
  useEffect(() => {
    // Si l'utilisateur n'a pas d'association, on ne fait rien ici
    // Le composant ProtectedAssociationRoute s'en chargera
  }, [associations]);

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

  // Générer les vraies données d'activité basées sur les événements de l'utilisateur
  const generateRealMonthActivities = (date: Date) => {
    const daysInMonth = getDaysInMonth(date);
    const activities = new Array(daysInMonth).fill(0);
    
    // Pour chaque événement de l'utilisateur
    dashboardData.userEvents.forEach(event => {
      const eventStart = new Date(event.beginningDate);
      const eventEnd = new Date(event.endDate);
      
      // Vérifier si l'événement se déroule dans le mois sélectionné
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      
      // Si l'événement chevauche avec le mois
      if (eventStart <= monthEnd && eventEnd >= monthStart) {
        // Calculer les jours où l'événement a lieu dans ce mois
        const startDay = Math.max(1, eventStart.getDate());
        const endDay = Math.min(daysInMonth, eventEnd.getDate());
        
        // Incrémenter le compteur pour chaque jour de l'événement
        for (let day = startDay; day <= endDay; day++) {
          const dayDate = new Date(date.getFullYear(), date.getMonth(), day);
          if (dayDate >= eventStart && dayDate <= eventEnd) {
            activities[day - 1]++;
          }
        }
      }
    });
    
    return activities;
  };

  // Obtenir les événements pour un jour spécifique
  const getEventsForDay = (date: Date, dayNumber: number) => {
    const dayDate = new Date(date.getFullYear(), date.getMonth(), dayNumber);
    
    return dashboardData.userEvents.filter(event => {
      const eventStart = new Date(event.beginningDate);
      const eventEnd = new Date(event.endDate);
      
      // Normaliser les dates pour la comparaison (ignorer les heures)
      const eventStartDate = new Date(eventStart.getFullYear(), eventStart.getMonth(), eventStart.getDate());
      const eventEndDate = new Date(eventEnd.getFullYear(), eventEnd.getMonth(), eventEnd.getDate());
      const targetDate = new Date(dayDate.getFullYear(), dayDate.getMonth(), dayDate.getDate());
      
      return targetDate >= eventStartDate && targetDate <= eventEndDate;
    });
  };

  // Gérer le clic sur un jour du calendrier
  const handleDayClick = (date: Date, dayNumber: number) => {
    const eventsForDay = getEventsForDay(date, dayNumber);
    if (eventsForDay.length > 0) {
      setSelectedEvent(eventsForDay[0]); // Pour l'instant, on prend le premier événement
      setShowEventModal(true);
    }
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
          teamMembersList: [],
          upcomingEvents: 0,
          activeDisponibilities: 0,
          isUserInAssociation: true,
          stockItemsData: stockItems,
          userEvents: []
        });

        // Charger les données d'équipe si l'utilisateur est manager
        if (user?.userType === 'Manager') {
          const teamResponse = await teamService.getTeamMembers(user.sub);
          const teamCount = teamResponse?.members?.length || 0;
          setDashboardData(prev => ({ ...prev, teamMembers: teamCount, teamMembersList: teamResponse?.members || [] }));
        }

        // Charger les données de planning
        const availability = await userService.getDisponibilities(selectedAssociation.id);
        setDashboardData(prev => ({ ...prev, activeDisponibilities: availability?.length || 0 }));

        // Charger les événements de l'utilisateur (pour tous les utilisateurs)
        const userEvents = await planningService.getMyEventsByAssociation(selectedAssociation.id);
        
        // Calculer les prochaines missions (événements futurs)
        const now = new Date();
        const upcomingEvents = userEvents.filter(event => new Date(event.beginningDate) > now);
        
        setDashboardData(prev => ({ 
          ...prev, 
          upcomingEvents: upcomingEvents.length,
          userEvents: userEvents 
        }));

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

  // Calcul de la période (mois en cours)
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // Variation stock : nombre d'articles créés ce mois-ci
  const stockAddedThisMonth = dashboardData.stockItemsData.filter(item => {
    if (!item.createdAt) return false;
    const created = new Date(item.createdAt);
    return created >= startOfMonth && created <= now;
  }).length;

  // Variation événements : nombre d'événements qui commencent ce mois-ci
  const eventsThisMonth = dashboardData.userEvents.filter(event => {
    const begin = new Date(event.beginningDate);
    return begin >= startOfMonth && begin <= now;
  }).length;

  // Variation membres : nombre de membres créés ce mois-ci
  const teamAddedThisMonth = dashboardData.teamMembersList.filter(member => {
    if (!member.createdAt) return false;
    const created = new Date(member.createdAt);
    return created >= startOfMonth && created <= now;
  }).length;

  // Données des cartes selon le rôle
  const getStatsCards = () => {
    if (isManager) {
      return [
        {
          title: "Membres de l'équipe",
          value: dashboardData.teamMembers.toString(),
          variation: teamAddedThisMonth,
          icon: <UsersIcon className="w-6 h-6 text-orange-500" />,
          iconBg: 'bg-orange-100 dark:bg-orange-900/30',
          description: 'Total'
        },
        {
          title: 'Articles en stock',
          value: dashboardData.stockItems.toString(),
          variation: stockAddedThisMonth,
          icon: <CubeIcon className="w-6 h-6 text-blue-500" />,
          iconBg: 'bg-blue-100 dark:bg-blue-900/30',
          description: 'Total'
        },
        {
          title: 'Stock faible',
          value: dashboardData.lowStockItems.toString(),
          variation: 0,
          icon: <ExclamationTriangleIcon className="w-6 h-6 text-red-500" />,
          iconBg: 'bg-red-100 dark:bg-red-900/30',
          description: 'À réapprovisionner'
        },
        {
          title: 'Événements prévus',
          value: dashboardData.upcomingEvents.toString(),
          variation: eventsThisMonth,
          icon: <CalendarDaysIcon className="w-6 h-6 text-green-500" />,
          iconBg: 'bg-green-100 dark:bg-green-900/30',
          description: 'À venir'
        }
      ];
    } else {
      return [
        {
          title: 'Mes disponibilités',
          value: dashboardData.activeDisponibilities.toString(),
          variation: 0,
          icon: <ClockIcon className="w-6 h-6 text-orange-500" />,
          iconBg: 'bg-orange-100 dark:bg-orange-900/30',
          description: 'Total',
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
          value: dashboardData.upcomingEvents.toString(),
          variation: eventsThisMonth,
          icon: <MapPinIcon className="w-6 h-6 text-blue-500" />,
          iconBg: 'bg-blue-100 dark:bg-blue-900/30',
          description: 'À venir'
        },
        {
          title: 'Missions complétées',
          value: dashboardData.userEvents.filter(event => new Date(event.endDate) < new Date()).length.toString(),
          variation: 0,
          icon: <CheckCircleIcon className="w-6 h-6 text-green-500" />,
          iconBg: 'bg-green-100 dark:bg-green-900/30',
          description: 'Total'
        },
        {
          title: 'Heures bénévolat',
          value: '—',
          variation: 0,
          icon: <ChartBarIcon className="w-6 h-6 text-purple-500" />,
          iconBg: 'bg-purple-100 dark:bg-purple-900/30',
          description: 'Total'
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
          Bonjour {user?.firstName || user?.lastName || user?.email?.split('@')[0] || 'Membre'} ! 👋
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
                {card.title === "Membres de l'équipe" ? null : (
                  card.variation > 0 ? (
                    <span className="ml-2 text-sm text-green-600">
                      +{card.variation} ce mois
                    </span>
                  ) : card.variation === 0 && card.title === 'Articles en stock' ? (
                    <span className="ml-2 text-xs text-gray-400">
                      Aucun nouvel article ce mois
                    </span>
                  ) : card.variation === 0 && card.title === 'Événements prévus' ? (
                    <span className="ml-2 text-xs text-gray-400">
                      Aucun nouvel événement ce mois
                    </span>
                  ) : card.variation === 0 && card.title === 'Prochaines missions' ? (
                    <span className="ml-2 text-xs text-gray-400">
                      Aucune nouvelle mission ce mois
                    </span>
                  ) : null
                )}
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
                 const monthActivities = generateRealMonthActivities(selectedMonth);
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
                       onClick={() => handleDayClick(selectedMonth, dayNumber)}
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
                <div className="text-lg font-bold text-green-600 dark:text-green-400">
                  {dashboardData.userEvents.length}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Mes missions</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-orange-600 dark:text-orange-400">
                  {dashboardData.userEvents.filter(event => new Date(event.beginningDate) > new Date()).length}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">À venir</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  {dashboardData.userEvents.filter(event => new Date(event.endDate) < new Date()).length}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Terminées</div>
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
              <div className="space-y-3">
                {dashboardData.userEvents
                  .filter(event => new Date(event.beginningDate) > new Date())
                  .slice(0, 3) // Afficher seulement les 3 prochaines
                  .map((event, index) => {
                    const eventDate = new Date(event.beginningDate);
                    const endDate = new Date(event.endDate);
                    const isToday = eventDate.toDateString() === new Date().toDateString();
                    const isTomorrow = eventDate.toDateString() === new Date(Date.now() + 86400000).toDateString();
                    
                    let dateText = '';
                    if (isToday) {
                      dateText = `Aujourd'hui ${eventDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
                    } else if (isTomorrow) {
                      dateText = `Demain ${eventDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
                    } else {
                      dateText = eventDate.toLocaleDateString('fr-FR', { 
                        weekday: 'long', 
                        day: 'numeric', 
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      });
                    }
                    
                    return (
                      <div 
                        key={event.id} 
                        className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                        onClick={() => {
                          setSelectedEvent(event);
                          setShowEventModal(true);
                        }}
                      >
                        <div className="flex items-center">
                          <MapPinIcon className="w-5 h-5 text-blue-500 mr-3" />
                          <div>
                            <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                              {event.title}
                            </p>
                            <p className="text-xs text-blue-600 dark:text-blue-300">
                              {dateText}
                            </p>
                            {event.location && (
                              <p className="text-xs text-blue-500 dark:text-blue-400">
                                📍 {event.location}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                
                {dashboardData.userEvents.filter(event => new Date(event.beginningDate) > new Date()).length === 0 && (
                  <div className="text-center py-8">
                    <CalendarDaysIcon className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                      Aucune mission prévue
                    </p>
                    <Link
                      to="/maraudApp/planing"
                      className="inline-flex items-center mt-2 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                    >
                      Voir le planning
                    </Link>
                  </div>
                )}
                
                {dashboardData.userEvents.filter(event => new Date(event.beginningDate) > new Date()).length > 3 && (
                  <div className="text-center pt-2">
                    <Link
                      to="/maraudApp/planing"
                      className="inline-flex items-center text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                    >
                      Voir toutes les missions ({dashboardData.userEvents.filter(event => new Date(event.beginningDate) > new Date()).length})
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de détails d'événement */}
      {showEventModal && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Détails de la mission
              </h3>
              <button
                onClick={() => setShowEventModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                  {selectedEvent.title}
                </h4>
                {selectedEvent.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedEvent.description}
                  </p>
                )}
              </div>
              
              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-center text-sm">
                  <CalendarDaysIcon className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-gray-600 dark:text-gray-400">
                    {new Date(selectedEvent.beginningDate).toLocaleDateString('fr-FR', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                
                <div className="flex items-center text-sm">
                  <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-gray-600 dark:text-gray-400">
                    {new Date(selectedEvent.beginningDate).toLocaleTimeString('fr-FR', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })} - {new Date(selectedEvent.endDate).toLocaleTimeString('fr-FR', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                </div>
                
                {selectedEvent.location && (
                  <div className="flex items-center text-sm">
                    <MapPinIcon className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-gray-600 dark:text-gray-400">
                      {selectedEvent.location}
                    </span>
                  </div>
                )}
                
                <div className="flex items-center text-sm">
                  <UserGroupIcon className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-gray-600 dark:text-gray-400">
                    {selectedEvent.participantsIds?.length || 0} participant(s)
                  </span>
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <Link
                  to="/maraudApp/planing"
                  className="w-full inline-flex justify-center items-center px-4 py-2 bg-gradient-to-r from-orange-500 to-blue-500 text-white text-sm font-medium rounded-lg hover:from-orange-600 hover:to-blue-600 transition-colors"
                  onClick={() => setShowEventModal(false)}
                >
                  Voir dans le planning
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashBoard;