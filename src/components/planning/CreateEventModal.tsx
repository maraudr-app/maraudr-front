import React, { useState, useEffect } from 'react';
import { XMarkIcon, CalendarIcon, UserGroupIcon, MapPinIcon, ClockIcon, ChevronDownIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { Button } from '../common/button/button';
import { Input } from '../common/input/input';
import { useAuthStore } from '../../store/authStore';
import { useAssoStore } from '../../store/assoStore';
import { planningService } from '../../services/planningService';
import { userService } from '../../services/userService';
import { User } from '../../types/user/user';
import { CreateEventDto } from '../../types/planning/event';
import { Disponibility } from '../../types/disponibility/disponibility';
import { toast } from 'react-hot-toast';

interface CreateEventModalProps {
    isOpen: boolean;
    onClose: () => void;
    onEventCreated: () => void;
}

interface EventForm {
    title: string;
    description: string;
    location: string;
    beginningDate: string;
    endDate: string;
    participantsIds: string[];
}

// Interface pour les conflits de disponibilité
interface AvailabilityConflict {
    userId: string;
    missingDates: string[];
    hasPartialAvailability: boolean;
}

const CreateEventModal: React.FC<CreateEventModalProps> = ({
    isOpen,
    onClose,
    onEventCreated
}) => {
    const { user } = useAuthStore();
    const { selectedAssociation } = useAssoStore();
    
    // États pour la création d'événement
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    // États pour la liste des membres
    const [teamMembers, setTeamMembers] = useState<User[]>([]);
    const [loadingMembers, setLoadingMembers] = useState(false);
    
    // États pour les disponibilités
    const [allAvailabilities, setAllAvailabilities] = useState<Disponibility[]>([]);
    const [loadingAvailabilities, setLoadingAvailabilities] = useState(false);
    const [availabilityConflicts, setAvailabilityConflicts] = useState<AvailabilityConflict[]>([]);
    
    // États pour la liste déroulante des participants
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Formulaire pour l'événement
    const [eventForm, setEventForm] = useState<EventForm>({
        title: '',
        description: '',
        location: '',
        beginningDate: '',
        endDate: '',
        participantsIds: []
    });

    // Charger les membres de l'équipe
    const loadTeamMembers = async () => {
        if (!selectedAssociation?.id) return;
        
        try {
            setLoadingMembers(true);
            const members = await userService.getTeamUsers(user?.sub || '');
            setTeamMembers(members);
        } catch (error) {
            console.error('Erreur lors du chargement des membres:', error);
        } finally {
            setLoadingMembers(false);
        }
    };

    // Charger toutes les disponibilités de l'association
    const loadAvailabilities = async () => {
        if (!selectedAssociation?.id) return;
        
        try {
            setLoadingAvailabilities(true);
            const availabilities = await userService.getAllDisponibilities(selectedAssociation.id);
            setAllAvailabilities(availabilities || []);
        } catch (error) {
            console.error('Erreur lors du chargement des disponibilités:', error);
            setAllAvailabilities([]);
        } finally {
            setLoadingAvailabilities(false);
        }
    };

    // Vérifier les conflits de disponibilité pour un participant
    const checkAvailabilityConflicts = (userId: string, eventStart: string, eventEnd: string): AvailabilityConflict | null => {
        if (!eventStart || !eventEnd) return null;

        const eventStartDate = new Date(eventStart);
        const eventEndDate = new Date(eventEnd);
        
        // Récupérer les disponibilités de l'utilisateur
        const userAvailabilities = allAvailabilities.filter(avail => avail.userId === userId);
        
        if (userAvailabilities.length === 0) {
            // Aucune disponibilité enregistrée
            return {
                userId,
                missingDates: [`Du ${eventStartDate.toLocaleDateString('fr-FR')} au ${eventEndDate.toLocaleDateString('fr-FR')}`],
                hasPartialAvailability: false
            };
        }

        // Vérifier si l'événement est entièrement couvert par les disponibilités
        const missingDates: string[] = [];
        let hasPartialAvailability = false;

        // Générer tous les jours de l'événement
        const eventDays: Date[] = [];
        const currentDate = new Date(eventStartDate);
        while (currentDate <= eventEndDate) {
            eventDays.push(new Date(currentDate));
            currentDate.setDate(currentDate.getDate() + 1);
        }

        // Vérifier chaque jour de l'événement
        for (const day of eventDays) {
            const dayStart = new Date(day);
            dayStart.setHours(0, 0, 0, 0);
            const dayEnd = new Date(day);
            dayEnd.setHours(23, 59, 59, 999);

            // Chercher une disponibilité qui couvre ce jour
            const isAvailable = userAvailabilities.some(avail => {
                const availStart = new Date(avail.start);
                const availEnd = new Date(avail.end);
                
                // Vérifier si la disponibilité couvre au moins une partie de ce jour
                return availStart <= dayEnd && availEnd >= dayStart;
            });

            if (!isAvailable) {
                missingDates.push(day.toLocaleDateString('fr-FR'));
            } else {
                hasPartialAvailability = true;
            }
        }

        if (missingDates.length > 0) {
            return {
                userId,
                missingDates,
                hasPartialAvailability
            };
        }

        return null; // Aucun conflit
    };

    // Mettre à jour les conflits de disponibilité
    const updateAvailabilityConflicts = () => {
        if (!eventForm.beginningDate || !eventForm.endDate || eventForm.participantsIds.length === 0) {
            setAvailabilityConflicts([]);
            return;
        }

        const conflicts: AvailabilityConflict[] = [];
        
        for (const participantId of eventForm.participantsIds) {
            const conflict = checkAvailabilityConflicts(participantId, eventForm.beginningDate, eventForm.endDate);
            if (conflict) {
                conflicts.push(conflict);
            }
        }

        setAvailabilityConflicts(conflicts);
    };

    useEffect(() => {
        if (isOpen) {
            loadTeamMembers();
            loadAvailabilities();
            // Reset du formulaire
            setEventForm({
                title: '',
                description: '',
                location: '',
                beginningDate: '',
                endDate: '',
                participantsIds: []
            });
            setError(null);
            setSearchTerm('');
            setIsDropdownOpen(false);
            setAvailabilityConflicts([]);
        }
    }, [isOpen, selectedAssociation]);

    // Mettre à jour les conflits quand les participants ou les dates changent
    useEffect(() => {
        updateAvailabilityConflicts();
    }, [eventForm.participantsIds, eventForm.beginningDate, eventForm.endDate, allAvailabilities]);

    // Fermer le dropdown quand on clique en dehors
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Element;
            if (isDropdownOpen && !target.closest('.participants-dropdown')) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isDropdownOpen]);

    // Créer l'événement
    const createEvent = async () => {
        if (!selectedAssociation?.id || !user?.sub) {
            setError('Association non sélectionnée ou utilisateur non connecté');
            return;
        }

        // Validation
        if (!eventForm.title.trim() || !eventForm.beginningDate || !eventForm.endDate) {
            setError('Veuillez remplir au moins le titre, la date de début et la date de fin');
            return;
        }

        // Vérification des dates passées
        const now = new Date();
        const beginningDate = new Date(eventForm.beginningDate);
        
        if (beginningDate < now) {
            setError('La date de début ne peut pas être dans le passé');
            return;
        }

        if (new Date(eventForm.beginningDate) >= new Date(eventForm.endDate)) {
            setError('La date de fin doit être postérieure à la date de début');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const eventData: CreateEventDto = {
                associationId: selectedAssociation.id,
                participantsIds: eventForm.participantsIds,
                title: eventForm.title.trim(),
                description: eventForm.description.trim(),
                location: eventForm.location.trim(),
                beginningDate: eventForm.beginningDate,
                endDate: eventForm.endDate
            };

            await planningService.createEvent(eventData);
            
            toast.success('Événement créé avec succès !');
            onEventCreated();
            onClose();
            
        } catch (err: any) {
            console.error('Erreur lors de la création de l\'événement:', err);
            setError(err.message || 'Erreur lors de la création de l\'événement');
        } finally {
            setLoading(false);
        }
    };

    // Gérer la sélection des participants
    const toggleParticipant = (userId: string) => {
        setEventForm(prev => ({
            ...prev,
            participantsIds: prev.participantsIds.includes(userId)
                ? prev.participantsIds.filter(id => id !== userId)
                : [...prev.participantsIds, userId]
        }));
    };

    // Filtrer les membres selon la recherche
    const filteredMembers = teamMembers.filter(member => 
        `${member.firstname} ${member.lastname}`.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Obtenir les noms des participants sélectionnés
    const getSelectedParticipantsNames = () => {
        return teamMembers
            .filter(member => eventForm.participantsIds.includes(member.id))
            .map(member => `${member.firstname} ${member.lastname}`)
            .join(', ');
    };

    const handleFormChange = (field: keyof EventForm, value: string) => {
        setEventForm(prev => ({
            ...prev,
            [field]: value
        }));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Créer un événement
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-6">
                    {/* Messages d'erreur */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-md">
                            {error}
                        </div>
                    )}

                    <div className="space-y-6">
                        {/* Informations de base */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                type="text"
                                placeholder="Titre de l'événement *"
                                value={eventForm.title}
                                onChange={(e) => handleFormChange('title', e.target.value)}
                                className="w-full"
                            />
                            <Input
                                type="text"
                                placeholder="Lieu"
                                value={eventForm.location}
                                onChange={(e) => handleFormChange('location', e.target.value)}
                                className="w-full"
                            />
                        </div>

                        <Input
                            type="text"
                            placeholder="Description"
                            value={eventForm.description}
                            onChange={(e) => handleFormChange('description', e.target.value)}
                            className="w-full"
                        />

                        {/* Dates */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                type="datetime-local"
                                placeholder="Date de début *"
                                value={eventForm.beginningDate}
                                onChange={(e) => handleFormChange('beginningDate', e.target.value)}
                                min={new Date().toISOString().slice(0, 16)}
                                className="w-full"
                            />
                            <Input
                                type="datetime-local"
                                placeholder="Date de fin *"
                                value={eventForm.endDate}
                                onChange={(e) => handleFormChange('endDate', e.target.value)}
                                min={eventForm.beginningDate || new Date().toISOString().slice(0, 16)}
                                className="w-full"
                            />
                        </div>

                        {/* Sélection des participants */}
                        <div className="relative participants-dropdown">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Participants
                            </label>
                            
                            {/* Champ de sélection principal */}
                            <div
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white cursor-pointer flex justify-between items-center min-h-[42px]"
                            >
                                <span className={eventForm.participantsIds.length === 0 ? "text-gray-400" : ""}>
                                    {eventForm.participantsIds.length === 0 
                                        ? "Sélectionner des participants..." 
                                        : `${eventForm.participantsIds.length} participant(s) sélectionné(s)`
                                    }
                                </span>
                                <ChevronDownIcon 
                                    className={`w-5 h-5 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} 
                                />
                            </div>

                            {/* Liste déroulante */}
                            {isDropdownOpen && (
                                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-64 overflow-hidden">
                                    {/* Champ de recherche */}
                                    <div className="p-3 border-b border-gray-200 dark:border-gray-600">
                                        <Input
                                            type="text"
                                            placeholder="Rechercher un membre..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full"
                                        />
                                    </div>

                                    {/* Liste des membres */}
                                    <div className="max-h-48 overflow-y-auto">
                                        {loadingMembers ? (
                                            <div className="text-center py-4">
                                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                                            </div>
                                        ) : filteredMembers.length === 0 ? (
                                            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                                                {searchTerm ? 'Aucun membre trouvé' : 'Aucun membre disponible'}
                                            </p>
                                        ) : (
                                            <div className="py-2">
                                                {filteredMembers.map((member) => (
                                                    <label 
                                                        key={member.id} 
                                                        className="flex items-center px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer"
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={eventForm.participantsIds.includes(member.id)}
                                                            onChange={() => toggleParticipant(member.id)}
                                                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                        />
                                                        <div className="ml-3 flex items-center">
                                                            <img
                                                                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(member.firstname + ' ' + member.lastname)}&background=random`}
                                                                alt={`${member.firstname} ${member.lastname}`}
                                                                className="w-6 h-6 rounded-full mr-2"
                                                            />
                                                            <span className="text-sm text-gray-700 dark:text-gray-300">
                                                                {member.firstname} {member.lastname}
                                                            </span>
                                                            {member.isManager && (
                                                                <span className="ml-2 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                                                                    Manager
                                                                </span>
                                                            )}
                                                        </div>
                                                    </label>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Affichage des participants sélectionnés */}
                            {eventForm.participantsIds.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {teamMembers
                                        .filter(member => eventForm.participantsIds.includes(member.id))
                                        .map(member => (
                                            <span
                                                key={member.id}
                                                className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
                                            >
                                                {member.firstname} {member.lastname}
                                                <button
                                                    type="button"
                                                    onClick={() => toggleParticipant(member.id)}
                                                    className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800"
                                                >
                                                    <XMarkIcon className="w-3 h-3" />
                                                </button>
                                            </span>
                                        ))
                                    }
                                </div>
                            )}
                        </div>

                        {/* Avertissements de disponibilité */}
                        {availabilityConflicts.length > 0 && (
                            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
                                <div className="flex items-start">
                                    <ExclamationTriangleIcon className="w-5 h-5 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
                                    <div className="flex-1">
                                        <h4 className="text-sm font-medium text-orange-800 dark:text-orange-200 mb-2">
                                            ⚠️ Conflits de disponibilité détectés
                                        </h4>
                                        <div className="space-y-3">
                                            {availabilityConflicts.map((conflict) => {
                                                const member = teamMembers.find(m => m.id === conflict.userId);
                                                if (!member) return null;
                                                
                                                return (
                                                    <div key={conflict.userId} className="bg-white dark:bg-gray-800 rounded-md p-3 border border-orange-200 dark:border-orange-700">
                                                        <div className="flex items-center mb-2">
                                                            <img
                                                                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(member.firstname + ' ' + member.lastname)}&background=random`}
                                                                alt={`${member.firstname} ${member.lastname}`}
                                                                className="w-6 h-6 rounded-full mr-2"
                                                            />
                                                            <span className="font-medium text-gray-900 dark:text-white">
                                                                {member.firstname} {member.lastname}
                                                            </span>
                                                            {conflict.hasPartialAvailability && (
                                                                <span className="ml-2 text-xs bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 px-2 py-1 rounded">
                                                                    Disponibilité partielle
                                                                </span>
                                                            )}
                                                        </div>
                                                        
                                                        {conflict.missingDates.length === 1 && conflict.missingDates[0].startsWith('Du ') ? (
                                                            <p className="text-sm text-orange-700 dark:text-orange-300">
                                                                <span className="font-medium">Aucune disponibilité enregistrée</span> pour la période {conflict.missingDates[0].toLowerCase()}
                                                            </p>
                                                        ) : (
                                                            <div className="text-sm text-orange-700 dark:text-orange-300">
                                                                <span className="font-medium">Jours non disponibles :</span>
                                                                <div className="mt-1 flex flex-wrap gap-1">
                                                                    {conflict.missingDates.slice(0, 5).map((date, index) => (
                                                                        <span 
                                                                            key={index}
                                                                            className="inline-block bg-orange-100 dark:bg-orange-900/50 text-orange-800 dark:text-orange-200 px-2 py-1 text-xs rounded"
                                                                        >
                                                                            {date}
                                                                        </span>
                                                                    ))}
                                                                    {conflict.missingDates.length > 5 && (
                                                                        <span className="text-xs text-orange-600 dark:text-orange-400 px-2 py-1">
                                                                            +{conflict.missingDates.length - 5} autres jours
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        <p className="text-xs text-orange-600 dark:text-orange-400 mt-3">
                                            💡 Ces participants pourront toujours être ajoutés à l'événement, mais assurez-vous qu'ils soient informés des dates concernées.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Indicateur de chargement des disponibilités */}
                        {loadingAvailabilities && eventForm.participantsIds.length > 0 && (
                            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                                <div className="flex items-center">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                                    <span className="text-sm text-blue-700 dark:text-blue-300">
                                        Vérification des disponibilités en cours...
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Informations sur l'association */}
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                            <div className="flex items-center">
                                <CalendarIcon className="w-5 h-5 text-blue-500 mr-2" />
                                <span className="text-sm text-blue-700 dark:text-blue-300">
                                    Événement pour l'association : <strong>{selectedAssociation?.name}</strong>
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Boutons d'action */}
                    <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <Button
                            onClick={onClose}
                            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2"
                        >
                            Annuler
                        </Button>
                        <Button
                            onClick={createEvent}
                            isLoading={loading}
                            disabled={loading}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
                        >
                            Créer l'événement
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateEventModal; 