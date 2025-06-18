import React, { useState, useEffect } from 'react';
import {
    CalendarIcon,
    PlusIcon,
    UserGroupIcon,
    PencilIcon,
    TrashIcon,
    CheckIcon,
    ClockIcon,
    UsersIcon,
} from '@heroicons/react/24/outline';

import {LockOpenIcon, XCircleIcon} from "@heroicons/react/24/solid";
import { useAuthStore } from '../../store/authStore';
import { useAssoStore } from '../../store/assoStore';
import { userService } from '../../services/userService';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';

// Types
interface PlanningUser {
    id: number;
    name: string;
    avatar: string;
    role: string;
    availability: {
        [date: string]: {
            morning: boolean;
            afternoon: boolean;
            evening: boolean;
        }
    };
}

interface Event {
    id: number;
    title: string;
    date: string;
    startTime: string;
    endTime: string;
    location: string;
    description: string;
    category: 'association' | 'communauté' | 'formation' | 'autre';
    volunteers: number[]; // IDs des bénévoles assignés
}

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
            console.log('Chargement des associations pour l\'utilisateur:', user.sub);
            fetchUserAssociations();
        }
    }, [user, selectedAssociation, fetchUserAssociations]);

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
        try {
            setLoading(true);
            // TODO: Appeler l'API pour récupérer les disponibilités existantes
            // const availabilities = await userService.getUserAvailabilities(user?.sub);
            // setUserAvailabilities(availabilities);
        } catch (error) {
            console.error('Erreur lors du chargement des disponibilités:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUserAvailabilities();
    }, []);

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

        // Vérifier que l'utilisateur a une association sélectionnée
        if (!selectedAssociation?.id) {
            toast.error('Aucune association sélectionnée. Veuillez sélectionner une association dans le header.');
            return;
        }

        try {
            setLoading(true);
            
            // Créer des objets Date avec les heures en timezone locale
            const startDateTime = new Date(startDate);
            startDateTime.setHours(parseInt(startTime.split(':')[0]), parseInt(startTime.split(':')[1]), 0, 0);
            
            const endDateTime = new Date(endDate);
            endDateTime.setHours(parseInt(endTime.split(':')[0]), parseInt(endTime.split(':')[1]), 0, 0);
            
            // S'assurer que la date est dans le futur en ajoutant quelques minutes si nécessaire
            const now = new Date();
            if (startDateTime <= now) {
                // Si la date/heure est dans le passé ou maintenant, l'ajuster légèrement dans le futur
                startDateTime.setMinutes(now.getMinutes() + 5);
                endDateTime.setMinutes(endDateTime.getMinutes() + 5);
            }
            
            // Formater sans UTC - utiliser le format local du serveur
            const formatDateForAPI = (date: Date) => {
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                const hours = String(date.getHours()).padStart(2, '0');
                const minutes = String(date.getMinutes()).padStart(2, '0');
                const seconds = String(date.getSeconds()).padStart(2, '0');
                
                // Format ISO sans timezone (assumant que le serveur est en local time)
                return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
            };
            
            const disponibilityData = {
                start: formatDateForAPI(startDateTime),
                end: formatDateForAPI(endDateTime),
                associationId: selectedAssociation.id // Utiliser l'ID de l'association sélectionnée
            };

            console.log('Données envoyées:', disponibilityData);
            console.log('Association sélectionnée:', selectedAssociation);
            console.log('Date/heure actuelle:', new Date());
            console.log('Date de début:', startDateTime);
            await userService.createDisponibility(disponibilityData);
            
            // Recharger les disponibilités
            await loadUserAvailabilities();
            
            // Réinitialiser la sélection
            cancelSelection();
            
            toast.success('Disponibilité ajoutée avec succès ! 🎉');
        } catch (error) {
            console.error('Erreur lors de l\'ajout de la disponibilité:', error);
            toast.error('Erreur lors de l\'ajout de la disponibilité');
        } finally {
            setLoading(false);
        }
    };

    const days = getDaysInMonth(currentDate);
    const startDay = getMonthStartDay(currentDate);
    const daysOfWeek = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

    // Fonction pour vérifier si une date est dans la période sélectionnée
    const isDateInSelectedPeriod = (date: Date) => {
        if (!startDate || !endDate) return false;
        return date >= startDate && date <= endDate;
    };

    // Fonction pour vérifier si une date est sélectionnée comme début ou fin
    const isDateSelected = (date: Date) => {
        return (startDate && date.getTime() === startDate.getTime()) || 
               (endDate && date.getTime() === endDate.getTime());
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* En-tête */}
            <header className="bg-white dark:bg-gray-800 shadow-sm p-4">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center">
                        <CalendarIcon className="w-6 h-6 mr-2" />
                        Mes Disponibilités
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300 mt-1">
                        Sélectionnez une période pour indiquer vos disponibilités
                    </p>
                </div>
            </header>

            {/* Contenu principal */}
            <main className="max-w-7xl mx-auto p-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    {/* Boutons d'action */}
                    <div className="flex gap-4 mb-6">
                        {!isSelectingPeriod ? (
                            <button
                                onClick={startPeriodSelection}
                                className="px-4 py-2 bg-gradient-to-r from-orange-500 to-blue-500 text-white rounded-lg hover:from-orange-600 hover:to-blue-600 transition-all duration-300"
                                disabled={loading}
                            >
                                Ajouter une disponibilité
                            </button>
                        ) : (
                            <div className="flex gap-2">
                                <button
                                    onClick={cancelSelection}
                                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                                >
                                    Annuler
                                </button>
                                {startDate && endDate && (
                                    <span className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-lg">
                                        Du {startDate.toLocaleDateString()} au {endDate.toLocaleDateString()}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Instructions */}
                    {isSelectingPeriod && (
                        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                            <p className="text-blue-800 dark:text-blue-200 text-sm">
                                {!startDate ? 
                                    "1. Cliquez sur la date de début de votre disponibilité" :
                                    !endDate ?
                                    "2. Cliquez sur la date de fin de votre disponibilité" :
                                    "3. Définissez les heures dans la fenêtre qui s'ouvre"
                                }
                            </p>
                        </div>
                    )}

                    {/* Navigation du calendrier */}
                    <div className="flex justify-between items-center mb-6">
                        <button
                            onClick={() => changeMonth(-1)}
                            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                            disabled={loading}
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
                            disabled={loading}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>

                    {/* Jours de la semaine */}
                    <div className="grid grid-cols-7 gap-2 mb-4">
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
                    <div className="grid grid-cols-7 gap-2">
                        {/* Jours vides du début du mois */}
                        {Array.from({ length: startDay }).map((_, index) => (
                            <div
                                key={`empty-start-${index}`}
                                className="aspect-square bg-gray-50 dark:bg-gray-700 rounded-md"
                            />
                        ))}

                        {/* Jours du mois */}
                        {days.map((day, index) => {
                            const dateString = formatDate(day);
                            const isToday = day.toDateString() === new Date().toDateString();
                            const isSelected = isDateSelected(day);
                            const isInPeriod = isDateInSelectedPeriod(day);
                            const isPast = day < new Date(new Date().setHours(0, 0, 0, 0));
                            const hasAvailability = userAvailabilities[dateString];

                            return (
                                <div
                                    key={index}
                                    className={`aspect-square border rounded-md p-2 transition-all cursor-pointer
                                        ${isPast ? 'opacity-50 cursor-not-allowed' : ''}
                                        ${isToday ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-600'}
                                        ${isSelected ? 'border-orange-500 bg-orange-100 dark:bg-orange-900/30' : ''}
                                        ${isInPeriod && !isSelected ? 'bg-orange-50 dark:bg-orange-900/10' : ''}
                                        ${!isPast && !isSelectingPeriod ? 'hover:bg-gray-50 dark:hover:bg-gray-700' : ''}
                                        ${!isPast && isSelectingPeriod ? 'hover:bg-orange-50 dark:hover:bg-orange-900/20' : ''}
                                    `}
                                    onClick={() => !isPast && handleDateClick(day)}
                                >
                                    <div className="h-full flex flex-col">
                                        <div className={`text-right text-sm font-medium mb-2
                                            ${isToday ? 'text-blue-600 dark:text-blue-400' : 
                                              isSelected ? 'text-orange-600 dark:text-orange-400' :
                                              'text-gray-700 dark:text-gray-300'}
                                        `}>
                                            {day.getDate()}
                                        </div>

                                        {/* Indicateur de disponibilité existante */}
                                        {hasAvailability && (
                                            <div className="flex-grow flex items-center justify-center">
                                                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
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
                                className="aspect-square bg-gray-50 dark:bg-gray-700 rounded-md"
                            />
                        ))}
                    </div>

                    {/* Légende */}
                    <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Légende :</h3>
                        <div className="flex flex-wrap gap-4 text-sm">
                            <div className="flex items-center">
                                <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
                                <span className="text-gray-600 dark:text-gray-400">Disponibilité existante</span>
                            </div>
                            <div className="flex items-center">
                                <div className="w-4 h-4 bg-orange-100 dark:bg-orange-900/30 border border-orange-500 rounded mr-2"></div>
                                <span className="text-gray-600 dark:text-gray-400">Période sélectionnée</span>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Modal de sélection d'heures */}
            {showTimeModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Définir les heures de disponibilité
                        </h3>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Période sélectionnée
                                </label>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Du {startDate?.toLocaleDateString()} au {endDate?.toLocaleDateString()}
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Heure de début *
                                </label>
                                <input
                                    type="time"
                                    value={startTime}
                                    onChange={(e) => setStartTime(e.target.value)}
                                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Heure de fin *
                                </label>
                                <input
                                    type="time"
                                    value={endTime}
                                    onChange={(e) => setEndTime(e.target.value)}
                                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    required
                                />
                            </div>

                            <div className="flex justify-end space-x-3 mt-6">
                                <button
                                    onClick={cancelSelection}
                                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg"
                                    disabled={loading}
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={submitAvailability}
                                    className="px-4 py-2 bg-gradient-to-r from-orange-500 to-blue-500 text-white rounded-lg hover:from-orange-600 hover:to-blue-600 transition-all duration-300"
                                    disabled={loading || !startTime || !endTime}
                                >
                                    {loading ? 'Enregistrement...' : 'Valider'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Composant principal
const Planning: React.FC = () => {
    const user = useAuthStore(state => state.user);
    const isAuthenticated = useAuthStore(state => state.isAuthenticated);

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
    // On vérifie le userType pour déterminer si c'est un manager
    const isManager = user.userType === 'Manager';
    if (!isManager) {
        return <UserAvailabilityView />;
    }

    // État pour la vue manager (code existant)
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedUser, setSelectedUser] = useState<number | null>(null);
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
    const [isAddingEvent, setIsAddingEvent] = useState(false);
    const [isEditingEvent, setIsEditingEvent] = useState(false);
    const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
    const [hoveredEvent, setHoveredEvent] = useState<Event | null>(null);

    // Mock data - utilisateurs bénévoles/maraudeurs (pour les managers)
    const users: PlanningUser[] = [
        {
            id: 1,
            name: "Emma Martin",
            avatar: "https://randomuser.me/api/portraits/women/1.jpg",
            role: "Maraudeur",
            availability: {
                "2025-04-02": { morning: true, afternoon: true, evening: false },
                "2025-04-05": { morning: false, afternoon: true, evening: true },
                "2025-04-10": { morning: true, afternoon: false, evening: false },
                "2025-04-15": { morning: false, afternoon: false, evening: true },
                "2025-04-20": { morning: true, afternoon: true, evening: true },
                "2025-04-28": { morning: false, afternoon: true, evening: false },
            }
        },
        {
            id: 2,
            name: "Lucas Dubois",
            avatar: "https://randomuser.me/api/portraits/men/2.jpg",
            role: "Maraudeur",
            availability: {
                "2025-04-01": { morning: false, afternoon: true, evening: true },
                "2025-04-08": { morning: true, afternoon: true, evening: false },
                "2025-04-12": { morning: false, afternoon: true, evening: false },
                "2025-04-18": { morning: true, afternoon: false, evening: true },
                "2025-04-25": { morning: false, afternoon: true, evening: true },
                "2025-04-30": { morning: true, afternoon: false, evening: false },
            }
        },
        {
            id: 3,
            name: "Camille Bernard",
            avatar: "https://randomuser.me/api/portraits/women/3.jpg",
            role: "Bénévole",
            availability: {
                "2025-04-03": { morning: true, afternoon: false, evening: false },
                "2025-04-07": { morning: false, afternoon: true, evening: true },
                "2025-04-14": { morning: true, afternoon: true, evening: false },
                "2025-04-21": { morning: false, afternoon: true, evening: true },
                "2025-04-27": { morning: true, afternoon: false, evening: false },
            }
        },
        {
            id: 4,
            name: "Thomas Laurent",
            avatar: "https://randomuser.me/api/portraits/men/4.jpg",
            role: "Coordinateur",
            availability: {
                "2025-04-01": { morning: true, afternoon: true, evening: true },
                "2025-04-04": { morning: true, afternoon: true, evening: false },
                "2025-04-09": { morning: false, afternoon: true, evening: true },
                "2025-04-16": { morning: true, afternoon: true, evening: false },
                "2025-04-23": { morning: false, afternoon: true, evening: true },
                "2025-04-29": { morning: true, afternoon: false, evening: false },
            }
        },
        {
            id: 5,
            name: "Julie Petit",
            avatar: "https://randomuser.me/api/portraits/women/5.jpg",
            role: "Bénévole",
            availability: {
                "2025-04-02": { morning: false, afternoon: true, evening: false },
                "2025-04-06": { morning: true, afternoon: false, evening: true },
                "2025-04-11": { morning: false, afternoon: true, evening: false },
                "2025-04-17": { morning: true, afternoon: false, evening: true },
                "2025-04-24": { morning: false, afternoon: true, evening: false },
            }
        },
        {
            id: 6,
            name: "Paul Moreau",
            avatar: "https://randomuser.me/api/portraits/men/6.jpg",
            role: "Maraudeur",
            availability: {
                "2025-04-05": { morning: true, afternoon: false, evening: false },
                "2025-04-10": { morning: false, afternoon: true, evening: true },
                "2025-04-15": { morning: true, afternoon: false, evening: false },
                "2025-04-20": { morning: false, afternoon: true, evening: true },
                "2025-04-26": { morning: true, afternoon: false, evening: false },
            }
        }
    ];

    // Mock data - événements
    const [events, setEvents] = useState<Event[]>([
        {
            id: 1,
            title: "Maraude nocturne",
            date: "2025-04-05",
            startTime: "20:00",
            endTime: "23:00",
            location: "Place de la République, Paris",
            description: "Distribution de repas chauds et de kits d'hygiène aux sans-abris.",
            category: "association",
            volunteers: [1, 2, 6]
        },
        {
            id: 2,
            title: "Formation nouveaux bénévoles",
            date: "2025-04-10",
            startTime: "14:00",
            endTime: "17:00",
            location: "Siège de l'association, 45 rue Saint-Denis",
            description: "Session d'accueil et de formation pour les nouveaux bénévoles.",
            category: "formation",
            volunteers: [3, 4, 5]
        },
        {
            id: 3,
            title: "Collecte alimentaire",
            date: "2025-04-15",
            startTime: "09:00",
            endTime: "18:00",
            location: "Supermarché Carrefour, 12 avenue des Ternes",
            description: "Collecte de denrées alimentaires non périssables pour nos actions.",
            category: "association",
            volunteers: [1, 3, 5]
        },
        {
            id: 4,
            title: "Réunion de coordination",
            date: "2025-04-20",
            startTime: "18:30",
            endTime: "20:00",
            location: "En ligne (Zoom)",
            description: "Bilan mensuel et planification des actions à venir.",
            category: "association",
            volunteers: [2, 4, 6]
        },
        {
            id: 5,
            title: "Atelier santé",
            date: "2025-04-25",
            startTime: "15:00",
            endTime: "17:30",
            location: "Centre d'accueil, 8 rue de la Solidarité",
            description: "Sensibilisation aux questions de santé et dépistages gratuits.",
            category: "communauté",
            volunteers: [1, 4, 5]
        }
    ]);

    // Fonctions d'aide
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

    const getEventsForDate = (date: Date) => {
        const dateString = formatDate(date);
        return events.filter(event => event.date === dateString);
    };

    const getEventsForUser = (userId: number) => {
        return events.filter(event => event.volunteers.includes(userId));
    };

    const changeMonth = (increment: number) => {
        const newDate = new Date(currentDate);
        newDate.setMonth(newDate.getMonth() + increment);
        setCurrentDate(newDate);
    };

    // Gérer l'ajout d'un événement
    const handleAddEvent = (newEvent: Event) => {
        setEvents([...events, newEvent]);
        setSelectedEvent(newEvent);
        setIsAddingEvent(false);
    };

    // Gérer la modification d'un événement
    const handleUpdateEvent = (updatedEvent: Event) => {
        setEvents(events.map(event =>
            event.id === updatedEvent.id ? updatedEvent : event
        ));
        setSelectedEvent(updatedEvent);
        setIsEditingEvent(false);
    };

    // Gérer la suppression d'un événement
    const handleDeleteEvent = (eventId: number) => {
        setEvents(events.filter(event => event.id !== eventId));
        setSelectedEvent(null);
    };

    // Gérer l'ajout d'un bénévole à un événement
    const handleAddVolunteer = (eventId: number, userId: number) => {
        setEvents(events.map(event => {
            if (event.id === eventId && !event.volunteers.includes(userId)) {
                return {
                    ...event,
                    volunteers: [...event.volunteers, userId]
                };
            }
            return event;
        }));
    };

    // Gérer la suppression d'un bénévole d'un événement
    const handleRemoveVolunteer = (eventId: number, userId: number) => {
        setEvents(events.map(event => {
            if (event.id === eventId) {
                return {
                    ...event,
                    volunteers: event.volunteers.filter(id => id !== userId)
                };
            }
            return event;
        }));
    };

    // Vérifier si un utilisateur est disponible pour une date et un créneau
    const isUserAvailableForEvent = (userId: number, event: Event) => {
        const user = users.find(u => u.id === userId);
        if (!user || !user.availability[event.date]) {
            return false;
        }

        const startHour = parseInt(event.startTime.split(':')[0]);
        const endHour = parseInt(event.endTime.split(':')[0]);

        if (startHour >= 8 && endHour <= 12) {
            return user.availability[event.date].morning;
        } else if (startHour >= 12 && endHour <= 18) {
            return user.availability[event.date].afternoon;
        } else {
            return user.availability[event.date].evening;
        }
    };

    // Obtenir la couleur de catégorie
    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'association':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'communauté':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'formation':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            default:
                return 'bg-purple-100 text-purple-800 border-purple-200';
        }
    };

    // Rendu
    const days = getDaysInMonth(currentDate);
    const startDay = getMonthStartDay(currentDate);
    const daysOfWeek = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* En-tête */}
            <header className="bg-white dark:bg-gray-800 shadow-sm p-4">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center mb-4 md:mb-0">
                        <CalendarIcon className="w-6 h-6 mr-2" />
                        Planning des Événements
                    </h1>
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => {
                                setSelectedDate(new Date());
                                setIsAddingEvent(true);
                            }}
                            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        >
                            <PlusIcon className="w-5 h-5 mr-1" />
                            Nouvel événement
                        </button>
                    </div>
                </div>
            </header>

            {/* Contenu principal */}
            <main className="max-w-7xl mx-auto p-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar - liste des utilisateurs */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 lg:col-span-1">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                            <UserGroupIcon className="w-5 h-5 mr-2" />
                            Équipe
                        </h2>

                        <div className="mb-6">
                            <button
                                onClick={() => setSelectedUser(null)}
                                className={`w-full py-2 px-3 mb-2 text-left rounded-md flex items-center ${
                                    selectedUser === null
                                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                        : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                                }`}
                            >
                                <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                                    A
                                </div>
                                <div className="ml-3">
                                    <div className="font-medium">Association</div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">Tous les événements</div>
                                </div>
                            </button>
                        </div>

                        <div className="space-y-1">
                            {users.map(user => (
                                <button
                                    key={user.id}
                                    onClick={() => setSelectedUser(user.id)}
                                    className={`w-full py-2 px-3 text-left rounded-md flex items-center ${
                                        selectedUser === user.id
                                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                            : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                                    }`}
                                >
                                    <img
                                        src={user.avatar}
                                        alt={user.name}
                                        className="w-8 h-8 rounded-full"
                                    />
                                    <div className="ml-3">
                                        <div className="font-medium">{user.name}</div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">{user.role}</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Calendrier et détails */}
                    <div className="lg:col-span-3 space-y-6">
                        {/* Navigation du calendrier */}
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
                                    const dateString = formatDate(day);
                                    const dayEvents = events.filter(event => event.date === dateString);
                                    const isToday = new Date().toDateString() === day.toDateString();
                                    const isSelected = selectedDate?.toDateString() === day.toDateString();
                                    const hasUserEvents = selectedUser ?
                                        dayEvents.some(event => event.volunteers.includes(selectedUser)) :
                                        dayEvents.length > 0;

                                    return (
                                        <div
                                            key={index}
                                            className={`aspect-square p-1 rounded-md border transition-all relative
                        ${isToday ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' :
                                                'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700'}
                        ${isSelected ? 'ring-2 ring-blue-500' : ''}
                        ${hasUserEvents ? 'hover:shadow-md' : ''}
                        cursor-pointer
                      `}
                                            onClick={() => setSelectedDate(day)}
                                            onMouseEnter={() => setHoveredDate(day)}
                                            onMouseLeave={() => setHoveredDate(null)}
                                        >
                                            <div className="h-full flex flex-col">
                                                <div className={`text-right text-sm p-1 font-medium
                          ${isToday ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}
                        `}>
                                                    {day.getDate()}
                                                </div>

                                                {/* Indicateurs d'événements */}
                                                <div className="flex-grow flex flex-col justify-end">
                                                    {dayEvents.length > 0 && (
                                                        <div className="flex flex-wrap gap-1 justify-center mt-auto">
                                                            {dayEvents.length <= 3 ? (
                                                                dayEvents.map((event, idx) => (
                                                                    <div
                                                                        key={idx}
                                                                        className={`h-2 rounded-full w-2/3 ${
                                                                            event.category === 'association' ? 'bg-blue-500' :
                                                                                event.category === 'communauté' ? 'bg-green-500' :
                                                                                    event.category === 'formation' ? 'bg-yellow-500' :
                                                                                        'bg-purple-500'
                                                                        }`}
                                                                    />
                                                                ))
                                                            ) : (
                                                                <div className="text-xs font-medium text-center w-full text-gray-500 dark:text-gray-400">
                                                                    {dayEvents.length} événements
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Info-bulle au survol */}
                                            {hoveredDate?.toDateString() === day.toDateString() && dayEvents.length > 0 && (
                                                <div className="absolute z-10 bottom-full left-0 mb-2 w-64 bg-white dark:bg-gray-800 shadow-lg rounded-md p-3 border border-gray-200 dark:border-gray-700">
                                                    <h3 className="font-medium text-gray-900 dark:text-white text-sm mb-2">
                                                        {day.getDate()} {months[day.getMonth()]} {day.getFullYear()}
                                                    </h3>
                                                    <div className="max-h-48 overflow-y-auto space-y-2">
                                                        {dayEvents.map((event, idx) => (
                                                            <div
                                                                key={idx}
                                                                className="text-xs p-2 rounded border"
                                                            >
                                                                <div className="font-medium">{event.title}</div>
                                                                <div className="flex items-center mt-1 text-gray-500 dark:text-gray-400">
                                                                    <ClockIcon className="w-3 h-3 mr-1" />
                                                                    {event.startTime} - {event.endTime}
                                                                </div>
                                                                {event.volunteers.length > 0 && (
                                                                    <div className="flex items-center mt-1">
                                                                        <UsersIcon className="w-3 h-3 mr-1 text-gray-500 dark:text-gray-400" />
                                                                        <div className="flex -space-x-1 overflow-hidden">
                                                                            {event.volunteers.slice(0, 3).map((userId) => {
                                                                                const user = users.find(u => u.id === userId);
                                                                                return (
                                                                                    <img
                                                                                        key={userId}
                                                                                        src={user?.avatar || ''}
                                                                                        className="w-4 h-4 rounded-full ring-1 ring-white dark:ring-gray-800"
                                                                                        alt={user?.name || ''}
                                                                                    />
                                                                                );
                                                                            })}
                                                                            {event.volunteers.length > 3 && (
                                                                                <div className="w-4 h-4 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-[8px] ring-1 ring-white dark:ring-gray-800">
                                                                                    +{event.volunteers.length - 3}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
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

                        {/* Liste des événements */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                {selectedUser === null ?
                                    `Événements de l'association` :
                                    `Événements de ${users.find(u => u.id === selectedUser)?.name}`
                                }
                                {selectedDate && ` - ${selectedDate.getDate()} ${months[selectedDate.getMonth()]}`}
                            </h2>

                            <div className="space-y-3">
                                {(selectedDate ?
                                        getEventsForDate(selectedDate) :
                                        selectedUser === null ?
                                            events :
                                            getEventsForUser(selectedUser)
                                ).map((event) => (
                                    <div
                                        key={event.id}
                                        className={`border ${getCategoryColor(event.category)} rounded-md p-3 hover:shadow-md transition-shadow relative`}
                                        onClick={() => setSelectedEvent(event)}
                                        onMouseEnter={() => setHoveredEvent(event)}
                                        onMouseLeave={() => setHoveredEvent(null)}
                                    >
                                        <div className="flex justify-between">
                                            <h3 className="font-medium">{event.title}</h3>
                                            <span className="text-xs px-2 py-1 rounded-full bg-white dark:bg-gray-700 border">
                        {event.category}
                      </span>
                                        </div>

                                        <div className="mt-2 text-sm space-y-1">
                                            <div className="flex items-center">
                                                <CalendarIcon className="w-4 h-4 mr-1 text-gray-500 dark:text-gray-400" />
                                                {new Date(event.date).getDate()} {months[new Date(event.date).getMonth()]} {new Date(event.date).getFullYear()}
                                            </div>
                                            <div className="flex items-center">
                                                <ClockIcon className="w-4 h-4 mr-1 text-gray-500 dark:text-gray-400" />
                                                {event.startTime} - {event.endTime}
                                            </div>
                                            <div className="flex items-center">
                                                <LockOpenIcon className="w-4 h-4 mr-1 text-gray-500 dark:text-gray-400" />
                                                {event.location}
                                            </div>
                                        </div>

                                        {event.volunteers.length > 0 && (
                                            <div className="mt-3 flex items-center">
                                                <UserGroupIcon className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" />
                                                <div className="flex -space-x-2 overflow-hidden">
                                                    {event.volunteers.slice(0, 5).map((userId) => {
                                                        const user = users.find(u => u.id === userId);
                                                        return (
                                                            <img
                                                                key={userId}
                                                                src={user?.avatar || ''}
                                                                className="w-6 h-6 rounded-full ring-1 ring-white dark:ring-gray-800"
                                                                alt={user?.name || ''}
                                                            />
                                                        );
                                                    })}
                                                    {event.volunteers.length > 5 && (
                                                        <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-xs ring-1 ring-white dark:ring-gray-800">
                                                            +{event.volunteers.length - 5}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Actions rapides */}
                                        <div className="absolute top-2 right-2 flex space-x-1">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedEvent(event);
                                                    setIsEditingEvent(true);
                                                }}
                                                className="p-1 rounded-full hover:bg-white dark:hover:bg-gray-700 text-gray-500 hover:text-blue-500"
                                            >
                                                <PencilIcon className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (confirm("Êtes-vous sûr de vouloir supprimer cet événement ?")) {
                                                        handleDeleteEvent(event.id);
                                                    }
                                                }}
                                                className="p-1 rounded-full hover:bg-white dark:hover:bg-gray-700 text-gray-500 hover:text-red-500"
                                            >
                                                <TrashIcon className="w-4 h-4" />
                                            </button>
                                        </div>

                                        {/* Info-bulle au survol */}
                                        {hoveredEvent?.id === event.id && (
                                            <div className="absolute z-10 right-0 top-full mt-2 w-64 bg-white dark:bg-gray-800 shadow-lg rounded-md p-3 border border-gray-200 dark:border-gray-700">
                                                <h3 className="font-medium text-gray-900 dark:text-white text-sm mb-2">
                                                    {event.title}
                                                </h3>
                                                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                                                    {event.description || "Aucune description disponible."}
                                                </p>
                                                {event.volunteers.length > 0 && (
                                                    <div>
                                                        <h4 className="text-xs font-medium text-gray-500 mb-1">Bénévoles assignés:</h4>
                                                        <ul className="text-xs space-y-1">
                                                            {event.volunteers.map((userId) => {
                                                                const user = users.find(u => u.id === userId);
                                                                return (
                                                                    <li key={userId} className="flex items-center">
                                                                        <img
                                                                            src={user?.avatar || ''}
                                                                            className="w-4 h-4 rounded-full mr-2"
                                                                            alt={user?.name || ''}
                                                                        />
                                                                        {user?.name}
                                                                    </li>
                                                                );
                                                            })}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}

                                {(selectedDate ?
                                        getEventsForDate(selectedDate) :
                                        selectedUser === null ?
                                            events :
                                            getEventsForUser(selectedUser)
                                ).length === 0 && (
                                    <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                                        {selectedDate ?
                                            "Aucun événement prévu pour cette date." :
                                            selectedUser === null ?
                                                "Aucun événement n'est prévu dans la période sélectionnée." :
                                                `${users.find(u => u.id === selectedUser)?.name} n'est assigné à aucun événement.`
                                        }
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Modal d'ajout/modification d'événement */}
            {(isAddingEvent || isEditingEvent) && selectedEvent && (
                <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                {isAddingEvent ? "Nouvel événement" : "Modifier l'événement"}
                            </h2>
                            <button
                                onClick={() => {
                                    setIsAddingEvent(false);
                                    setIsEditingEvent(false);
                                }}
                                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                                <XCircleIcon className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={(e) => {
                            e.preventDefault();
                            const form = e.target as HTMLFormElement;
                            const formData = new FormData(form);

                            const updatedEvent: Event = {
                                ...selectedEvent,
                                title: formData.get('title') as string,
                                date: formData.get('date') as string,
                                startTime: formData.get('startTime') as string,
                                endTime: formData.get('endTime') as string,
                                location: formData.get('location') as string,
                                description: formData.get('description') as string,
                                category: formData.get('category') as 'association' | 'communauté' | 'formation' | 'autre',
                            };

                            handleUpdateEvent(updatedEvent);
                        }}>
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Titre
                                    </label>
                                    <input
                                        type="text"
                                        id="title"
                                        name="title"
                                        defaultValue={selectedEvent.title}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Date
                                    </label>
                                    <input
                                        type="date"
                                        id="date"
                                        name="date"
                                        defaultValue={selectedEvent.date}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Heure de début
                                        </label>
                                        <input
                                            type="time"
                                            id="startTime"
                                            name="startTime"
                                            defaultValue={selectedEvent.startTime}
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Heure de fin
                                        </label>
                                        <input
                                            type="time"
                                            id="endTime"
                                            name="endTime"
                                            defaultValue={selectedEvent.endTime}
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Lieu
                                    </label>
                                    <input
                                        type="text"
                                        id="location"
                                        name="location"
                                        defaultValue={selectedEvent.location}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Catégorie
                                    </label>
                                    <select
                                        id="category"
                                        name="category"
                                        defaultValue={selectedEvent.category}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                    >
                                        <option value="association">Association</option>
                                        <option value="communauté">Communauté</option>
                                        <option value="formation">Formation</option>
                                        <option value="autre">Autre</option>
                                    </select>
                                </div>

                                <div>
                                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Description
                                    </label>
                                    <textarea
                                        id="description"
                                        name="description"
                                        rows={3}
                                        defaultValue={selectedEvent.description}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Bénévoles assignés
                                    </label>
                                    <div className="space-y-2 max-h-40 overflow-y-auto p-2 border border-gray-300 dark:border-gray-600 rounded-md">
                                        {users.map(user => {
                                            const isAssigned = selectedEvent.volunteers.includes(user.id);
                                            const isAvailable = isUserAvailableForEvent(user.id, selectedEvent);

                                            return (
                                                <div key={user.id} className="flex items-center justify-between">
                                                    <div className="flex items-center">
                                                        <img
                                                            src={user.avatar}
                                                            alt={user.name}
                                                            className="w-6 h-6 rounded-full mr-2"
                                                        />
                                                        <span className={`text-sm ${isAvailable ? '' : 'text-gray-400 dark:text-gray-500'}`}>
                              {user.name}
                                                            {!isAvailable && <span className="ml-1">(indisponible)</span>}
                            </span>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            if (isAssigned) {
                                                                handleRemoveVolunteer(selectedEvent.id, user.id);
                                                            } else {
                                                                handleAddVolunteer(selectedEvent.id, user.id);
                                                            }
                                                        }}
                                                        className={`p-1 rounded-full ${
                                                            isAssigned
                                                                ? 'text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20'
                                                                : 'text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                                                        }`}
                                                    >
                                                        {isAssigned ? <CheckIcon className="w-5 h-5" /> : <PlusIcon className="w-5 h-5" />}
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsAddingEvent(false);
                                            setIsEditingEvent(false);
                                        }}
                                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                                    >
                                        {isAddingEvent ? "Créer" : "Mettre à jour"}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal détails de l'événement */}
            {selectedEvent && !isAddingEvent && !isEditingEvent && (
                <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                Détails de l'événement
                            </h2>
                            <button
                                onClick={() => setSelectedEvent(null)}
                                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                                <XCircleIcon className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className={`inline-block px-3 py-1 rounded-full text-sm ${getCategoryColor(selectedEvent.category)}`}>
                                {selectedEvent.category}
                            </div>

                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                {selectedEvent.title}
                            </h3>

                            <div className="space-y-2 text-sm">
                                <div className="flex items-center">
                                    <CalendarIcon className="w-5 h-5 mr-2 text-gray-500 dark:text-gray-400" />
                                    <span className="text-gray-700 dark:text-gray-300">
                    {new Date(selectedEvent.date).getDate()} {months[new Date(selectedEvent.date).getMonth()]} {new Date(selectedEvent.date).getFullYear()}
                  </span>
                                </div>

                                <div className="flex items-center">
                                    <ClockIcon className="w-5 h-5 mr-2 text-gray-500 dark:text-gray-400" />
                                    <span className="text-gray-700 dark:text-gray-300">
                    {selectedEvent.startTime} - {selectedEvent.endTime}
                  </span>
                                </div>

                                <div className="flex items-center">
                                    <XCircleIcon className="w-5 h-5 mr-2 text-gray-500 dark:text-gray-400" />
                                    <span className="text-gray-700 dark:text-gray-300">
                    {selectedEvent.location}
                  </span>
                                </div>
                            </div>

                            <div className="mt-4">
                                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Description
                                </h4>
                                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md text-gray-700 dark:text-gray-300 text-sm">
                                    {selectedEvent.description || "Aucune description disponible."}
                                </div>
                            </div>

                            <div className="mt-4">
                                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                                    <UserGroupIcon className="w-5 h-5 mr-1" />
                                    Bénévoles assignés ({selectedEvent.volunteers.length})
                                </h4>
                                {selectedEvent.volunteers.length > 0 ? (
                                    <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                                        <ul className="divide-y divide-gray-200 dark:divide-gray-600">
                                            {selectedEvent.volunteers.map((userId) => {
                                                const user = users.find(u => u.id === userId);
                                                return (
                                                    <li key={userId} className="py-2 flex items-center">
                                                        <img
                                                            src={user?.avatar || ''}
                                                            alt={user?.name || ''}
                                                            className="w-8 h-8 rounded-full mr-3"
                                                        />
                                                        <div>
                                                            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                                {user?.name || 'Inconnu'}
                                                            </div>
                                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                                {user?.role || ''}
                                                            </div>
                                                        </div>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    </div>
                                ) : (
                                    <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md text-gray-500 dark:text-gray-400 text-sm">
                                        Aucun bénévole assigné à cet événement.
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <button
                                    onClick={() => setSelectedEvent(null)}
                                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                                >
                                    Fermer
                                </button>
                                <button
                                    onClick={() => setIsEditingEvent(true)}
                                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                                >
                                    Modifier
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Pied de page */}
            <footer className="bg-white dark:bg-gray-800 shadow-sm p-4 mt-8">
                <div className="max-w-7xl mx-auto text-center text-sm text-gray-500 dark:text-gray-400">
                    © 2025 Marraudr. Tous droits réservés.
                </div>
            </footer>
        </div>
    );
};

export default Planning;
