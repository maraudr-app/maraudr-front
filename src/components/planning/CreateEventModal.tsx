import React, { useState, useEffect } from 'react';
import { XMarkIcon, CalendarIcon, UserGroupIcon, MapPinIcon, ClockIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { Button } from '../common/button/button';
import { Input } from '../common/input/input';
import { useAuthStore } from '../../store/authStore';
import { useAssoStore } from '../../store/assoStore';
import { planningService } from '../../services/planningService';
import { userService } from '../../services/userService';
import { User } from '../../types/user/user';
import { CreateEventDto } from '../../types/planning/event';
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

    useEffect(() => {
        if (isOpen) {
            loadTeamMembers();
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
        }
    }, [isOpen, selectedAssociation]);

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
                                className="w-full"
                            />
                            <Input
                                type="datetime-local"
                                placeholder="Date de fin *"
                                value={eventForm.endDate}
                                onChange={(e) => handleFormChange('endDate', e.target.value)}
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