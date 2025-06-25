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
import { Input } from '../../components/common/input/input';

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

        // Empêcher la sélection de dates passées
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Normaliser à minuit pour la comparaison
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

            // Construire les dates/heures de début et de fin correctement
            const startDateTime = `${formatDateForAPI(startDate)}T${startTime}:00`;
            const endDateTime = `${formatDateForAPI(endDate)}T${endTime}:00`;

            // Validation : vérifier que la fin est postérieure au début
            const startDateTimeObj = new Date(startDateTime);
            const endDateTimeObj = new Date(endDateTime);

            if (endDateTimeObj <= startDateTimeObj) {
                // Si c'est le même jour et que l'heure de fin est antérieure/égale à l'heure de début
                if (startDate.toDateString() === endDate.toDateString()) {
                    toast.error('Sur un même jour, l\'heure de fin doit être postérieure à l\'heure de début');
                } else {
                    toast.error('La date et heure de fin doivent être postérieures au début');
                }
                return;
            }

            const disponibilityData = {
                userId: user.sub,
                start: startDateTime,
                end: endDateTime,
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
                        <p className="text-blue-800 dark:text-blue-200 mb-2">
                            {!startDate ? 
                                "Cliquez sur une date pour commencer la sélection de votre période de disponibilité." :
                                !endDate ?
                                "Cliquez sur une date de fin (après le " + startDate.toLocaleDateString() + "). Vous pouvez sélectionner plusieurs jours." :
                                "Période sélectionnée du " + startDate.toLocaleDateString() + " au " + endDate.toLocaleDateString() + ". Définissez maintenant les heures."
                            }
                        </p>
                        {!startDate && (
                            <p className="text-sm text-blue-600 dark:text-blue-400">
                                💡 <strong>Astuce :</strong> Vous pouvez créer des disponibilités sur une seule journée ou sur plusieurs jours consécutifs.
                            </p>
                        )}
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
                            const dateKey = formatDate(day);
                            const isToday = new Date().toDateString() === day.toDateString();
                            const hasAvailability = userAvailabilities[dateKey];
                            const inSelectedPeriod = isDateInSelectedPeriod(day);
                            const isSelected = isDateSelected(day);
                            
                            // Vérifier si la date est passée
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            const dayDate = new Date(day);
                            dayDate.setHours(0, 0, 0, 0);
                            const isPastDate = dayDate < today;

                            return (
                                <div
                                    key={index}
                                    className={`aspect-square p-1 rounded-md border transition-all 
                                        ${isPastDate ? 
                                            'bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600 cursor-not-allowed opacity-50' :
                                            `cursor-pointer hover:shadow-md ${
                                                hasAvailability ? 'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-600' :
                                                isToday ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' :
                                                'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700'
                                            }`
                                        }
                                        ${isSelected ? 'ring-2 ring-blue-500' : ''}
                                        ${inSelectedPeriod ? 'bg-blue-100 dark:bg-blue-900/30' : ''}
                                    `}
                                    onClick={() => !isPastDate && handleDateClick(day)}
                                >
                                    <div className="h-full flex flex-col">
                                        <div className={`text-right text-sm p-1 font-medium
                                            ${isPastDate ? 
                                                'text-gray-400 dark:text-gray-500' :
                                                isToday ? 'text-blue-600 dark:text-blue-400' : 
                                                hasAvailability ? 'text-green-700 dark:text-green-300' :
                                                'text-gray-700 dark:text-gray-300'
                                            }
                                        `}>
                                            {day.getDate()}
                                        </div>

                                        {/* Indicateur de disponibilité avec texte */}
                                        {hasAvailability && !isPastDate && (
                                            <div className="flex-grow flex items-center justify-center px-1">
                                                <span className="text-xs font-medium text-green-700 dark:text-green-300 text-center leading-tight">
                                                    Disponible
                                                </span>
                                            </div>
                                        )}
                                        
                                        {/* Indicateur de date passée */}
                                        {isPastDate && (
                                            <div className="flex-grow flex items-center justify-center">
                                                <div className="text-xs text-gray-400 dark:text-gray-500">×</div>
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
                        <div className="w-3 h-3 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-600 rounded mr-2"></div>
                        <span>Disponible</span>
                    </div>
                    <div className="flex items-center">
                        <div className="w-3 h-3 bg-blue-100 dark:bg-blue-900/30 border border-blue-300 rounded mr-2"></div>
                        <span>Période sélectionnée</span>
                    </div>
                    <div className="flex items-center">
                        <div className="w-3 h-3 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded mr-2 opacity-50"></div>
                        <span className="text-gray-500">Dates passées (non sélectionnables)</span>
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

                        {/* Note explicative */}
                        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
                            <p className="text-xs text-blue-700 dark:text-blue-300 mb-2">
                                💡 <strong>Comment ça marche :</strong>
                            </p>
                            {startDate?.toDateString() === endDate?.toDateString() ? (
                                <p className="text-xs text-blue-700 dark:text-blue-300">
                                    • <strong>Même journée :</strong> Vous êtes disponible de {startTime || '[heure début]'} à {endTime || '[heure fin]'} le {startDate?.toLocaleDateString()}.
                                </p>
                            ) : (
                                <div className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                                    <p>• <strong>Période multi-jours :</strong> Vous serez disponible :</p>
                                    <p className="ml-4">- Le {startDate?.toLocaleDateString()} à partir de {startTime || '[heure début]'}</p>
                                    <p className="ml-4">- Tous les jours intermédiaires (journée complète)</p>
                                    <p className="ml-4">- Le {endDate?.toLocaleDateString()} jusqu'à {endTime || '[heure fin]'}</p>
                                </div>
                            )}
                        </div>

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
            (event.description && event.description.toLowerCase().includes(query))
        );
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
                                loadAllEvents();
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

                    {/* Calendrier moderne dans la colonne du milieu */}
                    <div className="lg:col-span-2">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                            {/* Header avec titre et navigation */}
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                    Activité de l'association
                                </h2>
                                <div className="flex items-center space-x-3">
                                    <button
                                        onClick={() => changeMonth(-1)}
                                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                        </svg>
                                    </button>
                                    
                                    <h3 className="text-lg font-medium min-w-[130px] text-center text-gray-900 dark:text-white">
                                        {months[currentDate.getMonth()]} {currentDate.getFullYear()}
                                    </h3>
                                    
                                    <button
                                        onClick={() => changeMonth(1)}
                                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            {/* Légende compacte */}
                            <div className="flex items-center justify-center space-x-4 mb-4">
                                <div className="flex items-center space-x-1">
                                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                    <span className="text-xs text-gray-600 dark:text-gray-400">1-2</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                                    <span className="text-xs text-gray-600 dark:text-gray-400">3-5</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                    <span className="text-xs text-gray-600 dark:text-gray-400">6+</span>
                                </div>
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

                            {/* Grille du calendrier moderne */}
                            <div className="grid grid-cols-7 gap-1">
                                {/* Jours vides du début du mois */}
                                {Array.from({ length: startDay }).map((_, index) => (
                                    <div
                                        key={`empty-start-${index}`}
                                        className="aspect-square rounded-md bg-gray-50 dark:bg-gray-700"
                                    />
                                ))}

                                {/* Jours du mois avec le nouveau style moderne */}
                                {days.map((day, index) => {
                                    const isToday = new Date().toDateString() === day.toDateString();
                                    const eventCount = getEventCountForDate(day);
                                    
                                    // Déterminer la couleur de fond selon l'activité
                                    let bgColor = 'bg-white dark:bg-gray-800'; // Pas d'événements
                                    let textColor = 'text-gray-700 dark:text-gray-300';
                                    let borderColor = 'border-gray-100 dark:border-gray-700';
                                    
                                    if (eventCount >= 1 && eventCount <= 2) {
                                        bgColor = 'bg-green-500';
                                        textColor = 'text-white';
                                        borderColor = 'border-green-500';
                                    } else if (eventCount >= 3 && eventCount <= 5) {
                                        bgColor = 'bg-orange-500';
                                        textColor = 'text-white';
                                        borderColor = 'border-orange-500';
                                    } else if (eventCount >= 6) {
                                        bgColor = 'bg-red-500';
                                        textColor = 'text-white';
                                        borderColor = 'border-red-500';
                                    }

                                    return (
                                        <div
                                            key={index}
                                            onClick={() => eventCount > 0 && handleDateClick(day)}
                                            className={`aspect-square rounded-md border transition-all duration-200 cursor-pointer hover:scale-105 hover:shadow-md
                                                ${bgColor} ${textColor} ${borderColor}
                                                ${isToday ? 'ring-2 ring-blue-400 ring-offset-1' : ''}
                                                ${eventCount > 0 ? 'hover:brightness-110 shadow-sm' : ''}
                                            `}
                                        >
                                            <div className="h-full flex flex-col items-center justify-center p-1">
                                                <div className="text-sm font-semibold">{day.getDate()}</div>
                                                {eventCount > 0 && (
                                                    <div className="text-xs opacity-90 mt-0.5">
                                                        {eventCount}
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
                                        className="aspect-square rounded-md bg-gray-50 dark:bg-gray-700"
                                    />
                                ))}
                            </div>

                            {/* Mini statistiques */}
                            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <div className="flex justify-center space-x-6 text-sm">
                                    <div className="text-center">
                                        <div className="text-lg font-bold text-green-500">{allEvents.length}</div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">Événements</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-lg font-bold text-blue-500">{teamUsers.length}</div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">Membres</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Liste des disponibilités ou événements - Colonne droite */}
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

            {/* Modal de modification d'événement - Vraie version */}
            {showEditEventModal && editingEvent && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-[300]">
                    <div className="relative top-10 mx-auto p-6 border w-11/12 md:w-3/4 lg:w-1/2 shadow-2xl rounded-xl bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                        <div className="mb-6">
                            <div className="flex justify-between items-center">
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                    Modifier l'événement
                                </h3>
                                <button
                                    onClick={() => {
                                        setShowEditEventModal(false);
                                        setEditingEvent(null);
                                    }}
                                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                        
                        {/* Formulaire de modification */}
                        <form onSubmit={async (e) => {
                            e.preventDefault();
                            if (!editingEvent) return;
                            
                            const updatedEvent = {
                                id: editingEvent.id,
                                title: editFormData.title,
                                description: editFormData.description,
                                location: editFormData.location,
                                beginningDate: editFormData.beginningDate,
                                endDate: editFormData.endDate,
                                participantsIds: editSelectedParticipants
                            };
                            
                            try {
                                setUpdateLoading(true);
                                await planningService.updateEvent(editingEvent.id, updatedEvent);
                                console.log('Événement mis à jour avec succès');
                                
                                // Recharger les événements
                                loadAllEvents();
                                
                                // Fermer le modal
                                setShowEditEventModal(false);
                                setEditingEvent(null);
                                
                                toast.success('Événement mis à jour avec succès !');
                            } catch (error) {
                                console.error('Erreur lors de la mise à jour:', error);
                                toast.error('Erreur lors de la mise à jour de l\'événement');
                            } finally {
                                setUpdateLoading(false);
                            }
                        }}>
                            <div className="space-y-4">
                                {/* Titre et Lieu sur la même ligne */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Input
                                        name="title"
                                        type="text"
                                        placeholder="Titre de l'événement"
                                        value={editFormData.title}
                                        onChange={(e) => setEditFormData(prev => ({ ...prev, title: e.target.value }))}
                                        required
                                    />
                                    <Input
                                        name="location"
                                        type="text"
                                        placeholder="Lieu"
                                        value={editFormData.location}
                                        onChange={(e) => setEditFormData(prev => ({ ...prev, location: e.target.value }))}
                                    />
                                </div>

                                {/* Description */}
                                <div>
                                    <textarea
                                        name="description"
                                        rows={3}
                                        placeholder="Description"
                                        value={editFormData.description}
                                        onChange={(e) => setEditFormData(prev => ({ ...prev, description: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                    />
                                </div>

                                {/* Dates */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Input
                                        name="beginningDate"
                                        type="datetime-local"
                                        placeholder="Date de début"
                                        value={editFormData.beginningDate}
                                        onChange={(e) => setEditFormData(prev => ({ ...prev, beginningDate: e.target.value }))}
                                        required
                                    />
                                    <Input
                                        name="endDate"
                                        type="datetime-local"
                                        placeholder="Date de fin"
                                        value={editFormData.endDate}
                                        onChange={(e) => setEditFormData(prev => ({ ...prev, endDate: e.target.value }))}
                                        required
                                    />
                                </div>

                                {/* Sélection des participants */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Participants ({editSelectedParticipants.length} sélectionné{editSelectedParticipants.length > 1 ? 's' : ''})
                                    </label>
                                    <div className="max-h-48 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-md p-3 bg-gray-50 dark:bg-gray-700">
                                        {teamUsers.map(user => (
                                            <div key={user.id} className="flex items-center mb-2">
                                                <input
                                                    type="checkbox"
                                                    id={`edit-participant-${user.id}`}
                                                    checked={editSelectedParticipants.includes(user.id)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setEditSelectedParticipants(prev => [...prev, user.id]);
                                                        } else {
                                                            setEditSelectedParticipants(prev => prev.filter(id => id !== user.id));
                                                        }
                                                    }}
                                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                />
                                                <label 
                                                    htmlFor={`edit-participant-${user.id}`}
                                                    className="ml-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer flex items-center"
                                                >
                                                    <div className="flex-shrink-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold mr-2">
                                                        {user.firstname ? user.firstname.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                                                    </div>
                                                    {user.firstname ? `${user.firstname} ${user.lastname || ''}` : user.email}
                                                </label>
                                            </div>
                                        ))}
                                        {teamUsers.length === 0 && (
                                            <p className="text-gray-500 dark:text-gray-400 text-sm">Aucun membre d'équipe disponible</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Boutons d'action */}
                            <div className="flex justify-end space-x-4 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowEditEventModal(false);
                                        setEditingEvent(null);
                                    }}
                                    disabled={updateLoading}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    disabled={updateLoading}
                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center"
                                >
                                    {updateLoading ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Sauvegarde...
                                        </>
                                    ) : (
                                        'Sauvegarder les modifications'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

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
                            
                            {/* Content */}
                            <div className="space-y-4 max-h-96 overflow-y-auto">
                                {selectedDateEvents.map((event, index) => (
                                    <div
                                        key={event.id}
                                        className="border border-blue-200 dark:border-blue-600 rounded-lg p-4 bg-blue-50 dark:bg-blue-900/20"
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <h4 className="font-semibold text-gray-900 dark:text-white">
                                                {event.title}
                                            </h4>
                                            <div className="flex items-center space-x-2">
                                                <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200 rounded-full">
                                                    Événement {index + 1}
                                                </span>
                                                
                                                {/* Boutons d'action pour manager/organisateur */}
                                                {canEditEvent(event) && (
                                                    <div className="flex space-x-1">
                                                        <button
                                                            onClick={() => handleEditEvent(event)}
                                                            className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 rounded transition-colors"
                                                            title="Modifier l'événement"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                            </svg>
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteEvent(event)}
                                                            className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 rounded transition-colors"
                                                            title="Supprimer l'événement"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
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
                                                    <span className="font-medium">Participants:</span> {event.participantsIds.length}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Planning;