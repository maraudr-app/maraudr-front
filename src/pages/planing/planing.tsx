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
import { Event } from '../../types/planning/event';

// Interface simplifiée pour les disponibilités par utilisateur
interface UserAvailability {
    [date: string]: {
        morning: boolean;
        afternoon: boolean;
        evening: boolean;
    }
}

// Composant pour la vue utilisateur simple (disponibilités)
const UserAvailabilityView: React.FC = () => {
    const user = useAuthStore(state => state.user);
    const selectedAssociation = useAssoStore(state => state.selectedAssociation);
    const fetchUserAssociations = useAssoStore(state => state.fetchUserAssociations);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [userAvailabilities, setUserAvailabilities] = useState<UserAvailability>({});
    const [loading, setLoading] = useState(false);
    
    // États pour la sélection de période
    const [isSelectingPeriod, setIsSelectingPeriod] = useState(false);
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [showTimeModal, setShowTimeModal] = useState(false);

    // Charger les associations si nécessaire
    useEffect(() => {
        if (user && !selectedAssociation) {
            fetchUserAssociations();
        }
    }, [user, fetchUserAssociations]); // SUPPRIMÉ selectedAssociation des dépendances

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
            
            // Récupérer toutes les disponibilités de l'association
            const allAvailabilities = await userService.getDisponibilities(selectedAssociation.id);
            
            // Filtrer les disponibilités de l'utilisateur connecté
            const userDisponibilities = allAvailabilities.filter((dispo: Disponibility) => dispo.userId === user.sub);
            
            // Convertir en format pour le calendrier
            const availabilitiesMap: UserAvailability = {};
            userDisponibilities.forEach((dispo: Disponibility) => {
                const startDate = new Date(dispo.start);
                const endDate = new Date(dispo.end);
                
                // Pour chaque jour de la période, marquer comme disponible
                const currentDate = new Date(startDate);
                while (currentDate <= endDate) {
                    const dateKey = formatDate(currentDate);
                    availabilitiesMap[dateKey] = {
                        morning: true, // Pour l'instant, on considère toute la journée
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
        if (!isSelectingPeriod) {
            return;
        }

        if (!startDate) {
            setStartDate(date);
        } else if (!endDate && date >= startDate) {
            setEndDate(date);
            setShowTimeModal(true);
        } else {
            // Réinitialiser la sélection
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

    // Valider la disponibilité
    const submitAvailability = async () => {
        if (!startDate || !endDate || !startTime || !endTime) {
            toast.error('Veuillez sélectionner une période et des heures');
            return;
        }

        if (!selectedAssociation?.id || !user?.sub) {
            toast.error('Informations utilisateur ou association manquantes');
            return;
        }

        try {
            setLoading(true);

            // Fonction pour formater la date pour l'API
            const formatDateForAPI = (date: Date) => {
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
            };

            const disponibilityData = {
                userId: user.sub,
                start: `${formatDateForAPI(startDate)}T${startTime}:00`,
                end: `${formatDateForAPI(endDate)}T${endTime}:00`,
                associationId: selectedAssociation.id
            };

            await userService.createDisponibility(disponibilityData);
            
            toast.success('Disponibilité ajoutée avec succès');
            
            // Recharger les disponibilités
            await loadUserAvailabilities();
            
            // Réinitialiser la sélection
            cancelSelection();
            
        } catch (error: any) {
            toast.error(error.message || 'Erreur lors de l\'ajout de la disponibilité');
        } finally {
            setLoading(false);
        }
    };

    // Vérifier si une date est dans la période sélectionnée
    const isDateInSelectedPeriod = (date: Date) => {
        if (!startDate || !endDate) return false;
        return date >= startDate && date <= endDate;
    };

    // Vérifier si une date est sélectionnée (début ou fin)
    const isDateSelected = (date: Date) => {
        return (startDate && date.toDateString() === startDate.toDateString()) ||
               (endDate && date.toDateString() === endDate.toDateString());
    };

    const days = getDaysInMonth(currentDate);
    const startDay = getMonthStartDay(currentDate);
    const daysOfWeek = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
            <div className="max-w-6xl mx-auto">
                {/* En-tête */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Mes Disponibilités
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Gérez vos créneaux de disponibilité pour les missions de l'association
                    </p>
                </div>

                {/* Actions */}
                <div className="mb-6 flex flex-wrap gap-4">
                    {!isSelectingPeriod ? (
                        <button
                            onClick={startPeriodSelection}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
                        >
                            <PlusIcon className="w-4 h-4 mr-2" />
                            Ajouter une disponibilité
                        </button>
                    ) : (
                        <div className="flex gap-2">
                            <button
                                onClick={cancelSelection}
                                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                            >
                                Annuler
                            </button>
                            {startDate && endDate && (
                                <button
                                    onClick={() => setShowTimeModal(true)}
                                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                                >
                                    Définir les heures
                                </button>
                            )}
                        </div>
                    )}
                    
                    <button
                        onClick={loadUserAvailabilities}
                        disabled={loading}
                        className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center"
                    >
                        <ArrowPathIcon className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Actualiser
                    </button>
                </div>

                {/* Instructions */}
                {isSelectingPeriod && (
                    <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
                        <p className="text-blue-800 dark:text-blue-200">
                            {!startDate ? 
                                "Cliquez sur une date pour commencer la sélection de votre période de disponibilité." :
                                !endDate ?
                                "Cliquez sur une date de fin (après le " + startDate.toLocaleDateString() + ")." :
                                "Période sélectionnée du " + startDate.toLocaleDateString() + " au " + endDate.toLocaleDateString() + ". Définissez maintenant les heures."
                            }
                        </p>
                    </div>
                )}

                {/* Calendrier */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    {/* Navigation du calendrier */}
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

                    {/* Jours de la semaine */}
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

                    {/* Grille du calendrier */}
                    <div className="grid grid-cols-7 gap-1">
                        {/* Jours vides du début du mois */}
                        {Array.from({ length: startDay }).map((_, index) => (
                            <div
                                key={`empty-start-${index}`}
                                className="aspect-square p-1 bg-gray-50 dark:bg-gray-700 rounded-md"
                            />
                        ))}

                        {/* Jours du mois */}
                        {days.map((day, index) => {
                            const dateString = formatDate(day);
                            const isToday = new Date().toDateString() === day.toDateString();
                            const hasAvailability = userAvailabilities[dateString];
                            const inSelectedPeriod = isDateInSelectedPeriod(day);
                            const isSelected = isDateSelected(day);

                            return (
                                <div
                                    key={index}
                                    className={`aspect-square p-1 rounded-md border transition-all cursor-pointer
                                        ${isToday ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' :
                                          'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700'}
                                        ${isSelected ? 'ring-2 ring-blue-500' : ''}
                                        ${inSelectedPeriod ? 'bg-blue-100 dark:bg-blue-900/30' : ''}
                                        ${hasAvailability ? 'border-green-300 dark:border-green-600' : ''}
                                        hover:shadow-md
                                    `}
                                    onClick={() => handleDateClick(day)}
                                >
                                    <div className="h-full flex flex-col">
                                        <div className={`text-right text-sm p-1 font-medium
                                            ${isToday ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}
                                        `}>
                                            {day.getDate()}
                                        </div>

                                        {/* Indicateur de disponibilité */}
                                        {hasAvailability && (
                                            <div className="flex-grow flex items-center justify-center">
                                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}

                        {/* Jours vides de la fin du mois */}
                        {Array.from({ length: (7 - (days.length + startDay) % 7) % 7 }).map((_, index) => (
                            <div
                                key={`empty-end-${index}`}
                                className="aspect-square p-1 bg-gray-50 dark:bg-gray-700 rounded-md"
                            />
                        ))}
                    </div>
                </div>

                {/* Légende */}
                <div className="mt-4 flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center">
                        <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                        <span>Disponible</span>
                    </div>
                    <div className="flex items-center">
                        <div className="w-3 h-3 bg-blue-100 dark:bg-blue-900/30 border border-blue-300 rounded mr-2"></div>
                        <span>Période sélectionnée</span>
                    </div>
                </div>
            </div>

            {/* Modal pour définir les heures */}
            {showTimeModal && startDate && endDate && (
                <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Définir les heures de disponibilité
                        </h3>
                        
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            Période : du {startDate.toLocaleDateString()} au {endDate.toLocaleDateString()}
                        </p>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Heure de début
                                </label>
                                <input
                                    type="time"
                                    value={startTime}
                                    onChange={(e) => setStartTime(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Heure de fin
                                </label>
                                <input
                                    type="time"
                                    value={endTime}
                                    onChange={(e) => setEndTime(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end space-x-3 mt-6">
                            <button
                                onClick={cancelSelection}
                                className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={submitAvailability}
                                disabled={loading || !startTime || !endTime}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {loading ? 'Ajout...' : 'Confirmer'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
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
    const [currentDate, setCurrentDate] = useState(new Date());
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
    
    // États pour le modal de création d'événement
    const [showCreateEventModal, setShowCreateEventModal] = useState(false);

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
    
    // Charger les disponibilités et utilisateurs quand l'association change
    useEffect(() => {
        console.log('Planning useEffect - selectedAssociation:', selectedAssociation);
        console.log('Planning useEffect - user:', user);
        if (selectedAssociation?.id && user?.sub) {
            loadAllDisponibilities();
            loadTeamUsers();
        }
    }, [selectedAssociation, user]);

    // Effet initial pour s'assurer que les données sont chargées
    useEffect(() => {
        console.log('Planning initial load - isManager:', user?.userType === 'Manager');
        if (user?.userType === 'Manager' && selectedAssociation?.id) {
            console.log('Loading initial data for manager...');
            loadAllDisponibilities();
            loadTeamUsers();
        }
    }, []);
    
    // Fonction pour filtrer les disponibilités par utilisateur
    const getDisponibilitiesByUser = (userId: string) => {
        return allDisponibilities.filter(dispo => dispo.userId === userId);
    };

    // Fonction appelée après création d'un événement
    const handleEventCreated = () => {
        // Optionnel: recharger les données si nécessaire
        loadAllDisponibilities();
        loadTeamUsers();
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

    // Si l'utilisateur n'est pas un manager, afficher la vue des disponibilités
    const isManager = user.userType === 'Manager';
    if (!isManager) {
        return <UserAvailabilityView />;
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
        const newDate = new Date(currentDate);
        newDate.setMonth(newDate.getMonth() + increment);
        setCurrentDate(newDate);
    };

    // Rendu pour les managers
    const days = getDaysInMonth(currentDate);
    const startDay = getMonthStartDay(currentDate);
    const daysOfWeek = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Navbar fixe style Stock */}
            <nav className="fixed top-16 right-0 z-40 bg-white dark:bg-gray-800 shadow transition-all duration-300" style={{ left: sidebarWidth }}>
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center gap-3 pl-7">
                        <CalendarIcon className="w-5 h-5" />
                        <div className="text-gray-900 dark:text-white">
                            Planning des Disponibilités
                        </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 px-4">
                        <button
                            onClick={() => setShowCreateEventModal(true)}
                            className="flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
                        >
                            <PlusIcon className="w-4 h-4 mr-2" />
                            Créer un événement
                        </button>
                        
                        <button
                            onClick={() => {
                                loadAllDisponibilities();
                                loadTeamUsers();
                            }}
                            className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                            <ArrowPathIcon className="w-4 h-4 mr-2" />
                            Actualiser
                        </button>
                    </div>
                </div>
            </nav>

            {/* Contenu principal */}
            <main className="pt-16 w-full px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Sidebar - liste des utilisateurs */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 lg:col-span-1">
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
                                    <div className="font-medium">Association</div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">Toutes les disponibilités</div>
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

                    {/* Calendrier */}
                    <div className="lg:col-span-2">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                            <div className="flex justify-between items-center mb-4">
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
                            
                            {/* Jours de la semaine */}
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

                            {/* Grille du calendrier */}
                            <div className="grid grid-cols-7 gap-1">
                                {/* Jours vides du début du mois */}
                                {Array.from({ length: startDay }).map((_, index) => (
                                    <div
                                        key={`empty-start-${index}`}
                                        className="aspect-square p-1 bg-gray-50 dark:bg-gray-700 rounded-md"
                                    />
                                ))}

                                {/* Jours du mois */}
                                {days.map((day, index) => {
                                    const dateKey = formatDate(day);
                                    const isToday = new Date().toDateString() === day.toDateString();
                                    
                                    // Mode utilisateur : afficher les disponibilités de l'utilisateur sélectionné
                                    if (selectedUser) {
                                        const userDisponibilities = allDisponibilities.filter(dispo => dispo.userId === selectedUser);
                                        const hasContent = userDisponibilities.some(dispo => {
                                            const dispoStart = new Date(dispo.start);
                                            const dispoEnd = new Date(dispo.end);
                                            return day >= dispoStart && day <= dispoEnd;
                                        });

                                        return (
                                            <div
                                                key={index}
                                                className={`aspect-square p-1 rounded-md border transition-all
                                                    ${isToday ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' :
                                                      'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700'}
                                                    ${hasContent ? 'border-green-300 dark:border-green-600 hover:shadow-md' : ''}
                                                    cursor-pointer
                                                `}
                                            >
                                                <div className="h-full flex flex-col">
                                                    <div className={`text-right text-sm p-1 font-medium
                                                        ${isToday ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}
                                                    `}>
                                                        {day.getDate()}
                                                    </div>

                                                    {/* Indicateur de disponibilités */}
                                                    {hasContent && (
                                                        <div className="flex-grow flex items-center justify-center">
                                                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    } else {
                                        // Mode association : afficher toutes les disponibilités
                                        const hasContent = allDisponibilities.some(dispo => {
                                            const dispoStart = new Date(dispo.start);
                                            const dispoEnd = new Date(dispo.end);
                                            return day >= dispoStart && day <= dispoEnd;
                                        });

                                    return (
                                        <div
                                            key={index}
                                            className={`aspect-square p-1 rounded-md border transition-all
                                                ${isToday ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' :
                                                  'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700'}
                                                ${hasContent ? 'border-green-300 dark:border-green-600 hover:shadow-md' : ''}
                                                cursor-pointer
                                            `}
                                        >
                                            <div className="h-full flex flex-col">
                                                <div className={`text-right text-sm p-1 font-medium
                                                    ${isToday ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}
                                                `}>
                                                    {day.getDate()}
                                                </div>

                                                {/* Indicateur de disponibilités */}
                                                {hasContent && (
                                                    <div className="flex-grow flex items-center justify-center">
                                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                    }
                                })}

                                {/* Jours vides de la fin du mois */}
                                {Array.from({ length: (7 - (days.length + startDay) % 7) % 7 }).map((_, index) => (
                                    <div
                                        key={`empty-end-${index}`}
                                        className="aspect-square p-1 bg-gray-50 dark:bg-gray-700 rounded-md"
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Liste des disponibilités - Colonne droite */}
                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 h-fit">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                {selectedUser === null ?
                                    `Disponibilités de l'association` :
                                    `Disponibilités de ${teamUsers.find(u => u.id === selectedUser)?.firstname} ${teamUsers.find(u => u.id === selectedUser)?.lastname}`
                                }
                            </h2>

                            <div className="space-y-3 max-h-96 overflow-y-auto">
                                {(selectedUser ? getDisponibilitiesByUser(selectedUser) : allDisponibilities).map((dispo) => {
                                    const user = teamUsers.find(u => u.id === dispo.userId);
                                    return (
                                        <div
                                            key={dispo.id}
                                            className="border border-green-200 dark:border-green-600 rounded-md p-3 bg-green-50 dark:bg-green-900/20"
                                        >
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <div className="flex items-center mb-2">
                                                        <ClockIcon className="h-4 w-4 text-green-600 mr-2" />
                                                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                            {user ? `${user.firstname} ${user.lastname}` : 'Utilisateur inconnu'}
                                                        </span>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-sm text-gray-700 dark:text-gray-300">
                                                            <span className="font-medium">Début:</span> {new Date(dispo.start).toLocaleString('fr-FR')}
                                                        </p>
                                                        <p className="text-sm text-gray-700 dark:text-gray-300">
                                                            <span className="font-medium">Fin:</span> {new Date(dispo.end).toLocaleString('fr-FR')}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}

                                {(selectedUser ? getDisponibilitiesByUser(selectedUser) : allDisponibilities).length === 0 && (
                                    <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                                        {selectedUser ?
                                            `${teamUsers.find(u => u.id === selectedUser)?.firstname} n'a pas encore enregistré de disponibilités.` :
                                            "Aucune disponibilité n'est enregistrée pour cette association."
                                        }
                                    </div>
                                )}
                            </div>

                            {loadingDisponibilities && (
                                <div className="text-center py-4">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            {/* Modal de création d'événement */}
            <CreateEventModal
                isOpen={showCreateEventModal}
                onClose={() => setShowCreateEventModal(false)}
                onEventCreated={handleEventCreated}
            />
        </div>
    );
};

export default Planning;
