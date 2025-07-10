import React, { useState, useEffect } from 'react';
import {
    CalendarIcon,
    PlusIcon,
    UserGroupIcon,
    ClockIcon,
    ArrowPathIcon,
} from '@heroicons/react/24/outline';

import { useAuthStore } from '../../store/authStore';
import { useAssoStore } from '../../store/assoStore';
import { userService } from '../../services/userService';
import { Disponibility } from '../../types/disponibility/disponibility';
import { User } from '../../types/user/user';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import CreateEventModal from '../../components/planning/CreateEventModal';
import { planningService } from '../../services/planningService';
import type { Event } from '../../types/planning/event';
import { Input } from '../../components/common/input/input';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { PlanningNavbar } from '../../components/planning/PlanningNavbar';
import { Button } from '../../components/common/button/button';

// Interface simplifiée pour les disponibilités par utilisateur
interface UserAvailability {
    [date: string]: {
        morning: boolean;
        afternoon: boolean;
        evening: boolean;
    }
}

interface UserAvailabilityViewProps {
  hideAddButton?: boolean;
  externalAddButtonId?: string;
  flat?: boolean;
}
// Composant pour la vue utilisateur simple (disponibilités)
const UserAvailabilityView: React.FC<UserAvailabilityViewProps> = ({ hideAddButton, externalAddButtonId, flat }) => {
    const user = useAuthStore(state => state.user);
    const selectedAssociation = useAssoStore(state => state.selectedAssociation);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [userAvailabilities, setUserAvailabilities] = useState<UserAvailability>({});
    const [loading, setLoading] = useState(false);
    const [isSelectingPeriod, setIsSelectingPeriod] = useState(false);
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [showTimeModal, setShowTimeModal] = useState(false);

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const days = [];
        for (let day = 1; day <= lastDay.getDate(); day++) {
            days.push(new Date(year, month, day));
        }
        return days;
    };
    const getMonthStartDay = (date: Date) => {
        const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
        return firstDay.getDay();
    };
    const formatDate = (date: Date) => {
        return date.toISOString().split('T')[0];
    };
    const changeMonth = (increment: number) => {
        setCurrentDate(prevDate => new Date(prevDate.getFullYear(), prevDate.getMonth() + increment, 1));
    };
    // Charger les disponibilités existantes
    const loadUserAvailabilities = async () => {
        if (!selectedAssociation?.id || !user?.sub) return;
        try {
            setLoading(true);
            const allAvailabilities = await userService.getDisponibilities(selectedAssociation.id);
            const userDisponibilities = allAvailabilities.filter((dispo: Disponibility) => dispo.userId === user.sub);
            const availabilitiesMap: UserAvailability = {};
            userDisponibilities.forEach((dispo: Disponibility) => {
                const startDate = new Date(dispo.start);
                const endDate = new Date(dispo.end);
                const currentDate = new Date(startDate);
                while (currentDate <= endDate) {
                    const dateKey = formatDate(currentDate);
                    availabilitiesMap[dateKey] = {
                        morning: true,
                        afternoon: true,
                        evening: true
                    };
                    currentDate.setDate(currentDate.getDate() + 1);
                }
            });
            setUserAvailabilities(availabilitiesMap);
        } catch (error) {
            toast.error('Erreur lors du chargement des disponibilités');
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        loadUserAvailabilities();
    }, [selectedAssociation, user]);
    // Gérer la sélection de dates
    const handleDateClick = (date: Date) => {
        if (!isSelectingPeriod) return;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const clickedDate = new Date(date);
        clickedDate.setHours(0, 0, 0, 0);
        if (clickedDate < today) {
            toast.error('Vous ne pouvez pas sélectionner une date passée');
            return;
        }
        if (!startDate) {
            setStartDate(date);
        } else if (!endDate && date >= startDate) {
            setEndDate(date);
            setShowTimeModal(true);
        } else {
            setStartDate(date);
            setEndDate(null);
        }
    };
    // Démarrer la sélection de période
    const startPeriodSelection = () => {
        setIsSelectingPeriod(true);
        setStartDate(null);
        setEndDate(null);
        setStartTime('');
        setEndTime('');
    };
    // Annuler la sélection
    const cancelSelection = () => {
        setIsSelectingPeriod(false);
        setStartDate(null);
        setEndDate(null);
        setStartTime('');
        setEndTime('');
        setShowTimeModal(false);
    };
    // Valider la disponibilité (logique existante ou à compléter)
    // ...
    const days = getDaysInMonth(currentDate);
    const startDay = getMonthStartDay(currentDate);
    const daysOfWeek = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
    return (
        <div>
            {!hideAddButton && !isSelectingPeriod && (
                <div className="mb-4 flex w-full justify-end">
                    <button
                        onClick={startPeriodSelection}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
                        id={externalAddButtonId || 'add-dispo-btn'}
                    >
                        Ajouter une disponibilité
                    </button>
                </div>
            )}
            <div className={flat ? '' : "bg-white dark:bg-gray-800 rounded-lg shadow p-6"}>
                <div className="flex justify-between items-center mb-6">
                    <button
                        onClick={() => changeMonth(-1)}
                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <h2 className="text-xl font-semibold">
                        {months[currentDate.getMonth()]} {currentDate.getFullYear()}
                    </h2>
                    <button
                        onClick={() => changeMonth(1)}
                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
                <div className="grid grid-cols-7 gap-1 mb-2">
                    {daysOfWeek.map((day, index) => (
                        <div
                            key={index}
                            className="text-center py-2 text-sm font-medium text-gray-500 dark:text-gray-400"
                        >
                            {day}
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                    {Array.from({ length: startDay }).map((_, index) => (
                        <div key={`empty-start-${index}`} className="aspect-square rounded-md bg-gray-50 dark:bg-gray-700" />
                    ))}
                    {days.map((day, index) => {
                        const isToday = new Date().toDateString() === day.toDateString();
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        const dayDate = new Date(day);
                        dayDate.setHours(0, 0, 0, 0);
                        const isPastDate = dayDate < today;
                        const dateKey = formatDate(day);
                        const isAvailable = !!userAvailabilities[dateKey];
                        let bgColor = 'bg-white dark:bg-gray-800';
                        let textColor = 'text-gray-700 dark:text-gray-300';
                        let borderColor = 'border-gray-100 dark:border-gray-700';
                        if (!isPastDate) {
                            if (isAvailable) {
                                bgColor = 'bg-green-500';
                                textColor = 'text-white';
                                borderColor = 'border-green-500';
                            }
                        }
                        return (
                            <div
                                key={index}
                                onClick={() => handleDateClick(day)}
                                className={`aspect-square rounded-md border transition-all duration-200 cursor-pointer hover:scale-105 hover:shadow-md
                                    ${bgColor} ${textColor} ${borderColor}
                                    ${isToday ? 'ring-2 ring-blue-400 ring-offset-1' : ''}
                                    ${isPastDate ? 'opacity-50 cursor-not-allowed' : ''}
                                `}
                            >
                                <div className="h-full flex flex-col items-center justify-center p-1">
                                    <div className="text-sm font-semibold">{day.getDate()}</div>
                                </div>
                            </div>
                        );
                    })}
                    {Array.from({ length: (7 - (days.length + startDay) % 7) % 7 }).map((_, index) => (
                        <div key={`empty-end-${index}`} className="aspect-square rounded-md bg-gray-50 dark:bg-gray-700" />
                    ))}
                </div>
            </div>
        </div>
    );
};

// Composant principal Planning pour les managers
const Planning: React.FC = () => {
    const user = useAuthStore(state => state.user);
    const isAuthenticated = useAuthStore(state => state.isAuthenticated);
    const { sidebarCollapsed } = useAssoStore();
    const selectedAssociation = useAssoStore(state => state.selectedAssociation);
    
    // Définir la largeur de la sidebar en pixels comme dans Stock
    const sidebarWidth = sidebarCollapsed ? '56px' : '192px';

    // États pour la vue manager
    const [currentDateAsso, setCurrentDateAsso] = useState(new Date());
    const [currentDateUser, setCurrentDateUser] = useState(new Date());
    const [selectedUser, setSelectedUser] = useState<string | null>(null);
    
    // Debug pour voir les changements de selectedUser
    useEffect(() => {
        console.log('selectedUser changed to:', selectedUser);
    }, [selectedUser]);
    
    // États pour les vraies données
    const [allDisponibilities, setAllDisponibilities] = useState<Disponibility[]>([]);
    const [loadingDisponibilities, setLoadingDisponibilities] = useState(false);
    const [teamUsers, setTeamUsers] = useState<User[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(false);
    
    // États pour les événements
    const [allEvents, setAllEvents] = useState<Event[]>([]);
    const [loadingEvents, setLoadingEvents] = useState(false);
    const [selectedDateEvents, setSelectedDateEvents] = useState<Event[]>([]);
    const [showEventsModal, setShowEventsModal] = useState(false);
    const [editingEvent, setEditingEvent] = useState<Event | null>(null);
    const [showEditEventModal, setShowEditEventModal] = useState(false);
    const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
    const [eventToDelete, setEventToDelete] = useState<Event | null>(null);
    const [updateLoading, setUpdateLoading] = useState(false);
    
    // États pour le formulaire d'édition
    const [editFormData, setEditFormData] = useState({
        title: '',
        description: '',
        location: '',
        beginningDate: '',
        endDate: ''
    });
    
    // États pour le modal de création d'événement
    const [showCreateEventModal, setShowCreateEventModal] = useState(false);

    // États pour la recherche et la gestion des participants
    const [eventSearchQuery, setEventSearchQuery] = useState('');
    const [editSelectedParticipants, setEditSelectedParticipants] = useState<string[]>([]);

    // Charger toutes les disponibilités de l'association
    const loadAllDisponibilities = async () => {
        if (!selectedAssociation?.id) {
            console.log('loadAllDisponibilities: Pas d\'association sélectionnée');
            return;
        }
        
        try {
            setLoadingDisponibilities(true);
            console.log('loadAllDisponibilities: Chargement pour association ID:', selectedAssociation.id);
            const disponibilities = await userService.getAllDisponibilities(selectedAssociation.id);
            console.log('Toutes les disponibilités chargées:', disponibilities);
            console.log('Nombre de disponibilités:', disponibilities?.length || 0);
            setAllDisponibilities(disponibilities || []);
        } catch (error) {
            console.error('Erreur lors du chargement des disponibilités:', error);
            setAllDisponibilities([]);
        } finally {
            setLoadingDisponibilities(false);
        }
    };

    // Charger les vrais utilisateurs de l'équipe
    const loadTeamUsers = async () => {
        if (!user?.sub) return;
        
        try {
            setLoadingUsers(true);
            const users = await userService.getTeamUsers(user.sub);
            console.log('Utilisateurs de l\'équipe chargés:', users);
            setTeamUsers(users);
        } catch (error) {
            console.error('Erreur lors du chargement des utilisateurs:', error);
        } finally {
            setLoadingUsers(false);
        }
    };

    // Charger tous les événements de l'association
    const loadAllEvents = async () => {
        if (!selectedAssociation?.id) {
            console.log('loadAllEvents: Pas d\'association sélectionnée');
            return;
        }
        
        try {
            setLoadingEvents(true);
            console.log('loadAllEvents: Chargement pour association ID:', selectedAssociation.id);
            const events = await planningService.getAllEvents(selectedAssociation.id);
            console.log('Tous les événements chargés:', events);
            console.log('Nombre d\'événements:', events?.length || 0);
            setAllEvents(events || []);
        } catch (error) {
            console.error('Erreur lors du chargement des événements:', error);
            setAllEvents([]);
        } finally {
            setLoadingEvents(false);
        }
    };
    
    // Charger les disponibilités et utilisateurs quand l'association change
    useEffect(() => {
        console.log('Planning useEffect - selectedAssociation:', selectedAssociation);
        console.log('Planning useEffect - user:', user);
        if (selectedAssociation?.id && user?.sub) {
            loadAllDisponibilities();
            loadTeamUsers();
            loadAllEvents();
        }
    }, [selectedAssociation, user]);

    // Effet initial pour s'assurer que les données sont chargées
    useEffect(() => {
        console.log('Planning initial load - isManager:', user?.userType === 'Manager');
        if (user?.userType === 'Manager' && selectedAssociation?.id) {
            console.log('Loading initial data for manager...');
            loadAllDisponibilities();
            loadTeamUsers();
            loadAllEvents();
        }
    }, []);
    
    // Fonction pour filtrer les disponibilités par utilisateur
    const getDisponibilitiesByUser = (userId: string) => {
        return allDisponibilities.filter(dispo => dispo.userId === userId);
    };

    // Fonction appelée après création d'un événement
    const handleEventCreated = () => {
        // Recharger les données 
        loadAllDisponibilities();
        loadTeamUsers();
        loadAllEvents();
    };

    // Fonctions de gestion des événements
    const canEditEvent = (event: Event): boolean => {        
        if (!user) return false;
        
        // Manager peut modifier tous les événements (avec M majuscule)
        if (user.userType === 'Manager') return true;
        
        // Organisateur peut modifier ses propres événements
        if (event.organizerId === user.sub) return true;
        
        return false;
    };

    const handleEditEvent = (event: Event) => {
        setEditingEvent(event);
        setEditFormData({
            title: event.title,
            description: event.description || '',
            location: event.location || '',
            beginningDate: new Date(event.beginningDate).toISOString().slice(0, 16),
            endDate: new Date(event.endDate).toISOString().slice(0, 16)
        });
        // Initialiser les participants sélectionnés
        setEditSelectedParticipants(event.participantsIds || []);
        setShowEditEventModal(true);
    };

    const handleDeleteEvent = (event: Event) => {
        setEventToDelete(event);
        setShowDeleteConfirmModal(true);
        setShowEventsModal(false);
    };

    const confirmDeleteEvent = async () => {
        if (!eventToDelete) return;
        
        try {
            await planningService.deleteEvent(eventToDelete.id);
            console.log('Événement supprimé avec succès');
            
            // Recharger les événements
            loadAllEvents();
            
            // Fermer les modals
            setShowDeleteConfirmModal(false);
            setEventToDelete(null);
            
            toast.success('Événement supprimé avec succès');
        } catch (error) {
            console.error('Erreur lors de la suppression de l\'événement:', error);
            toast.error('Erreur lors de la suppression de l\'événement');
        }
    };

    const handleEventUpdated = () => {
        // Recharger les données après modification
        loadAllEvents();
        setShowEditEventModal(false);
        setEditingEvent(null);
    };

    // Fonctions d'aide pour les événements
    const getEventsForDate = (date: Date): Event[] => {
        const dateStr = formatDate(date);
        return allEvents.filter(event => {
            const eventStartDate = new Date(event.beginningDate);
            const eventEndDate = new Date(event.endDate);
            const currentDate = new Date(dateStr);
            
            // Normaliser les dates pour ne comparer que les jours (pas les heures)
            const startDay = new Date(eventStartDate.getFullYear(), eventStartDate.getMonth(), eventStartDate.getDate());
            const endDay = new Date(eventEndDate.getFullYear(), eventEndDate.getMonth(), eventEndDate.getDate());
            const checkDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
            
            // Vérifier si la date courante est dans la plage de l'événement
            return checkDay >= startDay && checkDay <= endDay;
        });
    };

    const getEventCountForDate = (date: Date): number => {
        return getEventsForDate(date).length;
    };

    const getEventColorForDate = (date: Date): string => {
        const count = getEventCountForDate(date);
        if (count === 0) return 'bg-white dark:bg-gray-800';
        if (count === 1) return 'bg-green-100 dark:bg-green-900/30 border-green-200 dark:border-green-700';
        if (count === 2) return 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-700';
        return 'bg-red-100 dark:bg-red-900/30 border-red-200 dark:border-red-700'; // 3+
    };

    const handleDateClick = (date: Date) => {
        const eventsForDate = getEventsForDate(date);
        if (eventsForDate.length > 0) {
            setSelectedDateEvents(eventsForDate);
            setEventSearchQuery(''); // Réinitialiser la recherche
            setShowEventsModal(true);
        }
    };

    // Fonction pour filtrer les événements par recherche
    const getFilteredEvents = () => {
        if (!eventSearchQuery.trim()) {
            return selectedDateEvents;
        }
        
        const query = eventSearchQuery.toLowerCase();
        return selectedDateEvents.filter(event => 
            event.title.toLowerCase().includes(query) ||
            (event.description && event.description.toLowerCase().includes(query)) ||
            (event.location && event.location.toLowerCase().includes(query))
        );
    };

    // Ajout d'une fonction utilitaire pour savoir si un événement est passé
    const isEventPast = (event: Event) => {
        const now = new Date();
        const end = new Date(event.endDate);
        // Si la date de fin est avant aujourd'hui
        if (end < now && (end.toDateString() !== now.toDateString())) return true;
        // Si la date de fin est aujourd'hui, compare l'heure
        if (end.toDateString() === now.toDateString()) {
            return end.getTime() < now.getTime();
        }
        return end < now;
    };

    // Ajoute une fonction utilitaire pour savoir si tous les événements d'un jour sont passés
    const areAllEventsPastForDate = (date: Date) => {
        const events = getEventsForDate(date);
        if (events.length === 0) return false;
        return events.every(event => isEventPast(event));
    };

    // Ajoute une fonction utilitaire pour savoir si un événement a commencé
    const isEventStarted = (event: Event) => {
        const now = new Date();
        const start = new Date(event.beginningDate);
        return start < now;
    };

    // Ajoute une fonction utilitaire pour savoir si un événement est en cours
    const isEventOngoing = (event: Event) => {
        const now = new Date();
        const start = new Date(event.beginningDate);
        const end = new Date(event.endDate);
        return start < now && now < end;
    };

    // Ajoute des helpers pour désactiver individuellement les champs date/heure
    const isStartDatePast = (event: Event) => {
        const now = new Date();
        const start = new Date(event.beginningDate);
        return start < now;
    };
    const isEndDatePast = (event: Event) => {
        const now = new Date();
        const end = new Date(event.endDate);
        return end < now;
    };

    // Vérifier l'authentification
    if (!isAuthenticated || !user) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <p className="text-gray-600 dark:text-gray-400">Vous devez être connecté pour accéder à cette page.</p>
                </div>
            </div>
        );
    }

    // Si l'utilisateur n'est pas un manager, afficher la double vue membre
    const isManager = user.userType === 'Manager';
    // États globaux pour la sélection de période (dispo)
    const [isSelectingPeriod, setIsSelectingPeriod] = useState(false);
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [showTimeModal, setShowTimeModal] = useState(false);
    const startPeriodSelection = () => {
        setIsSelectingPeriod(true);
        setStartDate(null);
        setEndDate(null);
        setStartTime('');
        setEndTime('');
    };
    if (!isManager) {
        // 1. Filtrer les événements où l'utilisateur est participant
        const myEvents = allEvents.filter(event => event.participantsIds && event.participantsIds.includes(user.sub));
        // 2. Filtrer les dispos de l'utilisateur
        const myDisponibilities = allDisponibilities.filter(dispo => dispo.userId === user.sub);
        // 3. Etats pour les mois affichés
        const [currentDateDispo, setCurrentDateDispo] = useState(new Date());
        const [currentDateEvents, setCurrentDateEvents] = useState(new Date());
        // 4. Helpers pour les jours/mois
        const getDaysInMonth = (date: Date) => {
            const year = date.getFullYear();
            const month = date.getMonth();
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            return Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1));
        };
        const getMonthStartDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();
        const formatDate = (date: Date) => date.toISOString().split('T')[0];
        const daysOfWeek = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
        const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

        // 5. Rendu double calendrier
        const sidebarWidth = sidebarCollapsed ? 'pl-14' : 'pl-[192px]';
        return (
            <>
                <PlanningNavbar onAddDisponibility={startPeriodSelection} />
                <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 p-4 pt-16 ${sidebarWidth}`}>
                    {/* Container pour les deux calendriers côte à côte */}
                    <div className="flex flex-row gap-6 justify-start items-start ">
                        {/* Calendrier des disponibilités (flat, sans encadrement) */}
                        <div className="flex-1 min-w-[400px] max-w-[600px] h-full flex flex-col items-center justify-start">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 text-center">Mes disponibilités</h2>
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 w-full h-full flex-1 flex flex-col">
                              <UserAvailabilityView hideAddButton externalAddButtonId="add-dispo-navbar-btn" flat />
                            </div>
                        </div>
                        {/* Calendrier des événements où je participe */}
                        <div className="flex-1 min-w-[400px] max-w-[600px] h-full flex flex-col items-center justify-start">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 text-center">Mes missions</h2>
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 w-full h-full flex-1 flex flex-col">
                                {/* Navigation mois */}
                                <div className="flex justify-between items-center mb-4">
                                    <button onClick={() => setCurrentDateEvents(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                        </svg>
                                    </button>
                                    <h3 className="text-lg font-medium min-w-[130px] text-center text-gray-900 dark:text-white">
                                        {months[currentDateEvents.getMonth()]} {currentDateEvents.getFullYear()}
                                    </h3>
                                    <button onClick={() => setCurrentDateEvents(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                </div>
                                {/* Grille calendrier missions */}
                                <div className="grid grid-cols-7 gap-1 mb-2">
                                    {daysOfWeek.map((day, idx) => (
                                        <div key={idx} className="text-center py-2 text-sm font-medium text-gray-500 dark:text-gray-400">{day}</div>
                                    ))}
                                </div>
                                <div className="grid grid-cols-7 gap-1">
                                    {Array.from({ length: getMonthStartDay(currentDateEvents) }).map((_, idx) => (
                                        <div key={`empty-start-myevents-${idx}`} className="aspect-square rounded-md bg-gray-50 dark:bg-gray-700" />
                                    ))}
                                    {getDaysInMonth(currentDateEvents).map((day, idx) => {
                                        const isToday = new Date().toDateString() === day.toDateString();
                                        const today = new Date(); today.setHours(0,0,0,0);
                                        const dayDate = new Date(day); dayDate.setHours(0,0,0,0);
                                        const isPastDate = dayDate < today;
                                        // Trouver les events où user participe ce jour
                                        const eventsForDay = myEvents.filter(ev => {
                                            const start = new Date(ev.beginningDate); start.setHours(0,0,0,0);
                                            const end = new Date(ev.endDate); end.setHours(0,0,0,0);
                                            return dayDate >= start && dayDate <= end;
                                        });
                                        let bgColor = 'bg-white dark:bg-gray-800';
                                        let textColor = 'text-gray-700 dark:text-gray-300';
                                        let borderColor = 'border-gray-100 dark:border-gray-700';
                                        if (!isPastDate) {
                                            if (eventsForDay.length === 1) {
                                                bgColor = 'bg-green-100 dark:bg-green-900/30';
                                                borderColor = 'border-green-200 dark:border-green-700';
                                            } else if (eventsForDay.length === 2) {
                                                bgColor = 'bg-orange-100 dark:bg-orange-900/30';
                                                borderColor = 'border-orange-200 dark:border-orange-700';
                                            } else if (eventsForDay.length >= 3) {
                                                bgColor = 'bg-red-100 dark:bg-red-900/30';
                                                borderColor = 'border-red-200 dark:border-red-700';
                                            }
                                        }
                                        if (isPastDate && eventsForDay.length > 0) {
                                            bgColor = 'bg-violet-200 dark:bg-violet-900/30';
                                            borderColor = 'border-violet-400 dark:border-violet-700';
                                        }
                                        return (
                                            <div
                                                key={idx}
                                                className={`aspect-square rounded-md border transition-all duration-200 ${bgColor} ${textColor} ${borderColor} ${isToday ? 'ring-2 ring-blue-400 ring-offset-1' : ''} ${eventsForDay.length > 0 ? 'cursor-pointer hover:scale-105 hover:shadow-md hover:brightness-110 shadow-sm' : ''}`}
                                                title={eventsForDay.map(ev => ev.title).join(', ')}
                                            >
                                                <div className="h-full flex flex-col items-center justify-center p-0.5">
                                                    <div className="text-xs font-semibold">{day.getDate()}</div>
                                                    {eventsForDay.length > 0 && (
                                                        <div className="text-xs opacity-90 mt-0.5">{eventsForDay.length}</div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {Array.from({ length: (7 - (getDaysInMonth(currentDateEvents).length + getMonthStartDay(currentDateEvents)) % 7) % 7 }).map((_, idx) => (
                                        <div key={`empty-end-myevents-${idx}`} className="aspect-square rounded-md bg-gray-50 dark:bg-gray-700" />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Légende code couleur sous les deux calendriers */}
                    <div className="mt-6 flex flex-wrap gap-x-3 gap-y-2 text-xs justify-center items-center w-full">
                        <div className="flex items-center"><div className="w-2.5 h-2.5 bg-green-500 border border-green-600 rounded mr-1.5"></div><span>1 événement</span></div>
                        <div className="flex items-center"><div className="w-2.5 h-2.5 bg-orange-500 border border-orange-600 rounded mr-1.5"></div><span>2 événements</span></div>
                        <div className="flex items-center"><div className="w-2.5 h-2.5 bg-red-500 border border-red-600 rounded mr-1.5"></div><span>3+ événements</span></div>
                        <div className="flex items-center"><div className="w-2.5 h-2.5 bg-violet-500 border border-violet-600 rounded mr-1.5"></div><span>Événement(s) passé(s)</span></div>
                    </div>
                </div>
            </>
        );
    }

    // Fonctions d'aide pour le calendrier
    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const days = [];
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(new Date(year, month, i));
        }

        return days;
    };

    const getMonthStartDay = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        return new Date(year, month, 1).getDay();
    };

    const formatDate = (date: Date) => {
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    };

    const changeMonth = (increment: number) => {
        const newDate = new Date(currentDateAsso);
        newDate.setMonth(newDate.getMonth() + increment);
        setCurrentDateAsso(newDate);
    };

    // Pour le calendrier asso
    const getMonthEventsCount = (date: Date) => {
      const month = date.getMonth();
      const year = date.getFullYear();
      // Un événement est compté s'il commence ou finit dans le mois
      const uniqueEventIds = new Set(
        allEvents.filter(event => {
          const start = new Date(event.beginningDate);
          const end = new Date(event.endDate);
          return (
            (start.getMonth() === month && start.getFullYear() === year) ||
            (end.getMonth() === month && end.getFullYear() === year) ||
            (start < new Date(year, month + 1, 1) && end >= new Date(year, month, 1))
          );
        }).map(event => event.id)
      );
      return uniqueEventIds.size;
    };
    // Pour le calendrier user
    const getMonthDisponibilitiesCount = (userId: string, date: Date) => {
      const month = date.getMonth();
      const year = date.getFullYear();
      // Une dispo est comptée si elle commence ou finit dans le mois
      const userDispos = getDisponibilitiesByUser(userId);
      const uniqueDispoIds = new Set(
        userDispos.filter(dispo => {
          const start = new Date(dispo.start);
          const end = new Date(dispo.end);
          return (
            (start.getMonth() === month && start.getFullYear() === year) ||
            (end.getMonth() === month && end.getFullYear() === year) ||
            (start < new Date(year, month + 1, 1) && end >= new Date(year, month, 1))
          );
        }).map(dispo => dispo.id)
      );
      return uniqueDispoIds.size;
    };

    // Fonction utilitaire pour regrouper les événements par mois
    const getEventsPerMonth = (events: Event[]) => {
        const months: { [key: string]: number } = {};
        events.forEach(event => {
            const date = new Date(event.beginningDate);
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            months[key] = (months[key] || 0) + 1;
        });
        // Retourne un tableau trié par date
        return Object.entries(months)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([month, count]) => ({ month, count }));
    };

    // Composant EventStatsGraph
    const EventStatsGraph = ({ events }: { events: Event[] }) => {
        const data = getEventsPerMonth(events);
        return (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 w-full mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 text-center">Évolution des événements par mois</h2>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={3} dot={{ r: 4 }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        );
    };

    // Rendu pour les managers
    const daysAsso = getDaysInMonth(currentDateAsso);
    const startDayAsso = getMonthStartDay(currentDateAsso);
    const daysUser = getDaysInMonth(currentDateUser);
    const startDayUser = getMonthStartDay(currentDateUser);
    const daysOfWeek = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Affiche la navbar planning uniquement pour les membres */}
            <PlanningNavbar onAddDisponibility={startPeriodSelection} isAddButtonDisabled={isManager} />
            {/* Place the navbar at the top, sticky/fixed, flush with header and sidebar */}
            <nav
                className="fixed top-16 right-0 z-40 bg-white dark:bg-gray-800 shadow transition-all duration-300 border-b border-gray-200 dark:border-gray-800"
                style={{ left: sidebarWidth }}
            >
                <div className="flex items-center justify-between h-16 px-7">
                    <div className="flex items-center gap-3">
                        <CalendarIcon className="w-6 h-6 text-maraudr-blue dark:text-maraudr-orange" />
                        <span className="text-gray-900 dark:text-white text-lg font-bold">Planification & Disponibilités</span>
                    </div>
                    <div className="flex items-center space-x-4">
                        {/* Example: Add main action buttons here, conditionally rendered by role */}
                        {!isManager && (
                            <Button
                                onClick={startPeriodSelection}
                                className="text-white bg-maraudr-blue hover:bg-maraudr-orange px-4 py-2 rounded-md text-sm font-medium transition-colors"
                            >
                                Ajouter une disponibilité
                            </Button>
                        )}
                        {/* Add more buttons/filters as needed */}
                    </div>
                </div>
            </nav>
            {/* Main content scrolls under the navbar, with correct padding */}
            <div className="pt-16" />
            <main className="w-full px-4 py-8" style={{ paddingLeft: sidebarWidth }}>
                <div className="w-full flex flex-col md:flex-row gap-4">
                    {/* Sidebar équipe */}
                    <div className="w-full md:w-1/4">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 w-full">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                                <UserGroupIcon className="w-5 h-5 mr-2" />
                                Équipe ({teamUsers.length})
                            </h2>
                            

                            <div className="mb-6">
                                <button
                                    onClick={() => setSelectedUser(null)}
                                    className={`w-full py-2 px-3 mb-2 text-left rounded-md flex items-center transition-colors ${
                                        selectedUser === null
                                            ? 'bg-gradient-to-r from-orange-100 to-blue-100 text-orange-800 dark:from-orange-900/30 dark:to-blue-900/30 dark:text-orange-200 border border-orange-200 dark:border-orange-700'
                                            : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                                    }`}
                                >
                                    <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                                        A
                                    </div>
                                    <div className="ml-3">
                                        <div className="font-medium">Planning de l'association</div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">Tous les plannings</div>
                                    </div>
                                </button>
                            </div>

                            <div className="space-y-1">
                                {teamUsers.map(user => (
                                    <button
                                        key={user.id}
                                        onClick={() => setSelectedUser(user.id)}
                                        className={`w-full py-2 px-3 text-left rounded-md flex items-center transition-colors ${
                                            selectedUser === user.id
                                                ? 'bg-gradient-to-r from-orange-100 to-blue-100 text-orange-800 dark:from-orange-900/30 dark:to-blue-900/30 dark:text-orange-200 border border-orange-200 dark:border-orange-700'
                                                : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                                        }`}
                                    >
                                        <img
                                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.firstname + ' ' + user.lastname)}&background=random`}
                                            alt={`${user.firstname} ${user.lastname}`}
                                            className="w-8 h-8 rounded-full"
                                        />
                                        <div className="ml-3">
                                            <div className="font-medium">{user.firstname} {user.lastname}</div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">{user.isManager ? "Manager" : "Membre"}</div>
                                        </div>
                                    </button>
                                ))}
                            </div>

                            {loadingUsers && (
                                <div className="text-center py-4">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                                </div>
                            )}
                        </div>
                    </div>
                    {/* Calendrier asso */}
                    <div className={`w-full ${selectedUser ? 'md:w-5/12' : 'md:w-1/2'}`}>
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 w-full">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 text-center">
                                Planning de l'association
                            </h2>
                            <div className="text-sm text-gray-500 dark:text-gray-400 mb-3 text-center">
                                {getMonthEventsCount(currentDateAsso)} événement{getMonthEventsCount(currentDateAsso) > 1 ? 's' : ''} ce mois
                            </div>
                            <div className="flex justify-between items-center mb-4">
                                <button onClick={() => setCurrentDateAsso(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>
                                <h3 className="text-lg font-medium min-w-[130px] text-center text-gray-900 dark:text-white">
                                    {months[currentDateAsso.getMonth()]} {currentDateAsso.getFullYear()}
                                </h3>
                                <button onClick={() => setCurrentDateAsso(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </div>
                            <div className="grid grid-cols-7 gap-1 mb-2">
                                {daysOfWeek.map((day, index) => (
                                    <div key={index} className="text-center py-2 text-sm font-medium text-gray-500 dark:text-gray-400">{day}</div>
                                ))}
                            </div>
                            <div className="grid grid-cols-7 gap-1">
                                {Array.from({ length: startDayAsso }).map((_, index) => (
                                    <div key={`empty-start-asso-${index}`} className="aspect-square rounded-md bg-gray-50 dark:bg-gray-700" />
                                ))}
                                {daysAsso.map((day, index) => {
                                    const isToday = new Date().toDateString() === day.toDateString();
                                    const eventCount = getEventCountForDate(day);
                                    const today = new Date();
                                    today.setHours(0, 0, 0, 0);
                                    const dayDate = new Date(day);
                                    dayDate.setHours(0, 0, 0, 0);
                                    const isPastDate = dayDate < today;
                                    let bgColor = 'bg-white dark:bg-gray-800';
                                    let textColor = 'text-gray-700 dark:text-gray-300';
                                    let borderColor = 'border-gray-100 dark:border-gray-700';
                                    if (isPastDate && eventCount > 0) {
                                        bgColor = 'bg-violet-500';
                                        textColor = 'text-white';
                                        borderColor = 'border-violet-600';
                                    } else if (eventCount === 1) {
                                        bgColor = 'bg-green-500';
                                        textColor = 'text-white';
                                        borderColor = 'border-green-500';
                                    } else if (eventCount === 2) {
                                        bgColor = 'bg-orange-500';
                                        textColor = 'text-white';
                                        borderColor = 'border-orange-500';
                                    } else if (eventCount >= 3) {
                                        bgColor = 'bg-red-500';
                                        textColor = 'text-white';
                                        borderColor = 'border-red-500';
                                    }
                                    return (
                                        <div
                                            key={index}
                                            onClick={() => eventCount > 0 && handleDateClick(day)}
                                            className={`aspect-square rounded-md border transition-all duration-200
                                                ${bgColor} ${textColor} ${borderColor}
                                                ${isToday ? 'ring-2 ring-blue-400 ring-offset-1' : ''}
                                                ${eventCount > 0 ? 'cursor-pointer hover:scale-105 hover:shadow-md hover:brightness-110 shadow-sm' : ''}
                                            `}
                                        >
                                            <div className="h-full flex flex-col items-center justify-center p-0.5">
                                                <div className="text-xs font-semibold">{day.getDate()}</div>
                                                {eventCount > 0 && (
                                                    <div className="text-xs opacity-90 mt-0.5">{eventCount}</div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                                {Array.from({ length: (7 - (daysAsso.length + startDayAsso) % 7) % 7 }).map((_, index) => (
                                    <div key={`empty-end-asso-${index}`} className="aspect-square rounded-md bg-gray-50 dark:bg-gray-700" />
                                ))}
                            </div>
                            {/* Légende asso */}
                            <div className="mt-4 flex flex-wrap gap-x-3 gap-y-2 text-xs justify-center items-center">
                                <div className="flex items-center"><div className="w-2.5 h-2.5 bg-green-500 border border-green-600 rounded mr-1.5"></div><span>1 événement</span></div>
                                <div className="flex items-center"><div className="w-2.5 h-2.5 bg-orange-500 border border-orange-600 rounded mr-1.5"></div><span>2 événements</span></div>
                                <div className="flex items-center"><div className="w-2.5 h-2.5 bg-red-500 border border-red-600 rounded mr-1.5"></div><span>3+ événements</span></div>
                                <div className="flex items-center"><div className="w-2.5 h-2.5 bg-violet-500 border border-violet-600 rounded mr-1.5"></div><span>Événement(s) passé(s)</span></div>
                            </div>
                        </div>
                    </div>
                    {/* Calendrier user (si sélectionné) */}
                    {selectedUser && (
                        <div className="w-full md:w-5/12">
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 w-full">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 text-center">
                                    Disponibilités de {teamUsers.find(u => u.id === selectedUser)?.firstname} {teamUsers.find(u => u.id === selectedUser)?.lastname}
                                </h2>
                                <div className="text-sm text-gray-500 dark:text-gray-400 mb-3 text-center">
                                    {getMonthDisponibilitiesCount(selectedUser, currentDateUser)} disponibilité{getMonthDisponibilitiesCount(selectedUser, currentDateUser) > 1 ? 's' : ''} ce mois
                                </div>
                                <div className="flex justify-between items-center mb-4">
                                    <button onClick={() => setCurrentDateUser(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                        </svg>
                                    </button>
                                    <h3 className="text-lg font-medium min-w-[130px] text-center text-gray-900 dark:text-white">
                                        {months[currentDateUser.getMonth()]} {currentDateUser.getFullYear()}
                                    </h3>
                                    <button onClick={() => setCurrentDateUser(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                </div>
                                <div className="grid grid-cols-7 gap-1 mb-2">
                                    {daysOfWeek.map((day, index) => (
                                        <div key={index} className="text-center py-2 text-sm font-medium text-gray-500 dark:text-gray-400">{day}</div>
                                    ))}
                                </div>
                                <div className="grid grid-cols-7 gap-1">
                                    {Array.from({ length: startDayUser }).map((_, index) => (
                                        <div key={`empty-start-user-${index}`} className="aspect-square rounded-md bg-gray-50 dark:bg-gray-700" />
                                    ))}
                                    {daysUser.map((day, index) => {
                                        const isToday = new Date().toDateString() === day.toDateString();
                                        const today = new Date();
                                        today.setHours(0, 0, 0, 0);
                                        const dayDate = new Date(day);
                                        dayDate.setHours(0, 0, 0, 0);
                                        const isPastDate = dayDate < today;
                                        const userDispos = selectedUser ? getDisponibilitiesByUser(selectedUser) : [];
                                        const isAvailable = userDispos.some((dispo: Disponibility) => {
                                            const start = new Date(dispo.start);
                                            const end = new Date(dispo.end);
                                            start.setHours(0,0,0,0);
                                            end.setHours(0,0,0,0);
                                            return dayDate >= start && dayDate <= end;
                                        });
                                        let bgColor = 'bg-white dark:bg-gray-800';
                                        let textColor = 'text-gray-700 dark:text-gray-300';
                                        let borderColor = 'border-gray-100 dark:border-gray-700';
                                        if (!isPastDate) {
                                            if (isAvailable) {
                                                bgColor = 'bg-green-500';
                                                textColor = 'text-white';
                                                borderColor = 'border-green-500';
                                            } else {
                                                bgColor = 'bg-red-500';
                                                textColor = 'text-white';
                                                borderColor = 'border-red-500';
                                            }
                                        } else {
                                            if (isAvailable) {
                                                bgColor = 'bg-green-500';
                                                textColor = 'text-white';
                                                borderColor = 'border-green-500';
                                            } else {
                                                bgColor = 'bg-red-500';
                                                textColor = 'text-white';
                                                borderColor = 'border-red-500';
                                            }
                                        }
                                        return (
                                            <div
                                                key={index}
                                                className={`aspect-square rounded-md border transition-all duration-200
                                                    ${bgColor} ${textColor} ${borderColor}
                                                    ${isToday ? 'ring-2 ring-blue-400 ring-offset-1' : ''}
                                                    ${!isPastDate ? '' : 'opacity-50 cursor-not-allowed'}
                                                `}
                                            >
                                                <div className="h-full flex flex-col items-center justify-center p-1">
                                                    <div className="text-sm font-semibold">{day.getDate()}</div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {Array.from({ length: (7 - (daysUser.length + startDayUser) % 7) % 7 }).map((_, index) => (
                                        <div key={`empty-end-user-${index}`} className="aspect-square rounded-md bg-gray-50 dark:bg-gray-700" />
                                    ))}
                                </div>
                                {/* Légende user */}
                                <div className="mt-4 flex flex-wrap gap-4 text-sm justify-center">
                                    <div className="flex items-center"><div className="w-3 h-3 bg-green-500 border border-green-600 rounded mr-2"></div><span>Disponible</span></div>
                                    <div className="flex items-center"><div className="w-3 h-3 bg-red-500 border border-red-600 rounded mr-2"></div><span>Non disponible</span></div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Modal de création d'événement */}
                <CreateEventModal
                    isOpen={showCreateEventModal}
                    onClose={() => setShowCreateEventModal(false)}
                    onEventCreated={handleEventCreated}
                />

                {/* Modal de confirmation de suppression */}
                {showDeleteConfirmModal && eventToDelete && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-[300]">
                        <div className="relative top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-6 border w-11/12 md:w-96 shadow-2xl rounded-xl bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                            <div className="text-center">
                                {/* Icône d'avertissement */}
                                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/20 mb-4">
                                    <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                    </svg>
                                </div>
                                
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                    Supprimer l'événement
                                </h3>
                                
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                                    Êtes-vous sûr de vouloir supprimer l'événement "{eventToDelete.title}" ? 
                                    Cette action est irréversible.
                                </p>
                                
                                <div className="flex justify-center space-x-4">
                                    <button
                                        onClick={() => {
                                            setShowDeleteConfirmModal(false);
                                            setEventToDelete(null);
                                        }}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        onClick={confirmDeleteEvent}
                                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
                                    >
                                        Supprimer
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal de détail des événements */}
                {showEventsModal && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-[200]">
                        <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-2xl rounded-xl bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                            <div className="mt-3">
                                {/* Header */}
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                        Événements du jour ({selectedDateEvents.length})
                                    </h3>
                                    <button
                                        onClick={() => setShowEventsModal(false)}
                                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                                    >
                                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                                {/* Champ de recherche */}
                                <div className="mb-4">
                                    <input
                                        type="text"
                                        value={eventSearchQuery}
                                        onChange={e => setEventSearchQuery(e.target.value)}
                                        placeholder="Rechercher par titre, description ou lieu..."
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                    />
                                </div>
                                {/* Content */}
                                <div className="space-y-4 max-h-96 overflow-y-auto">
                                    {getFilteredEvents().map((event, index) => {
                                        const past = isEventPast(event);
                                        return (
                                            <div
                                                key={event.id}
                                                className={`border rounded-lg p-4 transition cursor-pointer ${past ? 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600' : 'border-blue-200 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/20'} hover:shadow-md`}
                                                onClick={() => handleEditEvent(event)}
                                            >
                                                {past ? (
                                                    <>
                                                        <div className="mb-1 text-base font-bold text-center text-violet-700 dark:text-violet-300 uppercase">Événement passé</div>
                                                        <div className="mb-2 text-xs text-center text-gray-700 dark:text-gray-300 italic">{event.title}</div>
                                                    </>
                                                ) : (
                                                    <h4 className="font-semibold text-gray-900 dark:text-white">
                                                        {event.title}
                                                    </h4>
                                                )}
                                                <div className="flex justify-between items-start mb-3">
                                                    {!past && (
                                                        <div className="flex items-center space-x-2">
                                                            <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200 rounded-full">
                                                                Événement {index + 1}
                                                            </span>
                                                            {/* Boutons d'action pour manager/organisateur */}
                                                            {canEditEvent(event) && (
                                                                <div className="flex space-x-1">
                                                                    <button
                                                                        onClick={e => { e.stopPropagation(); handleEditEvent(event); }}
                                                                        className={`p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 rounded transition-colors`}
                                                                        title="Modifier l'événement"
                                                                    >
                                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                        </svg>
                                                                    </button>
                                                                    <button
                                                                        onClick={e => { e.stopPropagation(); handleDeleteEvent(event); }}
                                                                        className={`p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 rounded transition-colors`}
                                                                        title="Supprimer l'événement"
                                                                    >
                                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                        </svg>
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="space-y-2">
                                                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                                        <CalendarIcon className="h-4 w-4 mr-2" />
                                                        <span>
                                                            {new Date(event.beginningDate).toLocaleDateString('fr-FR')} 
                                                            {' de '}
                                                            {new Date(event.beginningDate).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                                            {' à '}
                                                            {new Date(event.endDate).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                    {event.description && (
                                                        <div className="text-sm text-gray-700 dark:text-gray-300">
                                                            <span className="font-medium">Description:</span> {event.description}
                                                        </div>
                                                    )}
                                                    {event.location && (
                                                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                                            <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            </svg>
                                                            <span>{event.location}</span>
                                                        </div>
                                                    )}
                                                    {event.participantsIds && event.participantsIds.length > 0 && (
                                                        <div className="text-sm text-gray-600 dark:text-gray-400">
                                                            <span className="font-medium">Participants :</span> {
                                                                event.participantsIds
                                                                    .map(pid => {
                                                                        const user = teamUsers.find(u => u.id === pid);
                                                                        return user ? `${user.firstname} ${user.lastname}`.trim() : '';
                                                                    })
                                                                    .filter(Boolean)
                                                                    .join(', ')
                                                            }
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                        {/* Légende en bas du modal */}
                        <div className="mt-4 flex flex-wrap gap-4 text-sm justify-center">
                            <div className="flex items-center"><div className="w-3 h-3 bg-blue-200 border border-blue-400 rounded mr-2"></div><span>Événement à venir</span></div>
                            <div className="flex items-center"><div className="w-3 h-3 bg-gray-300 border border-gray-400 rounded mr-2"></div><span>Événement passé</span></div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Planning;