import React, { useState, useEffect } from 'react';
import { XMarkIcon, PlusIcon, CalendarIcon, UserGroupIcon, MapPinIcon, ClockIcon } from '@heroicons/react/24/outline';
import { Button } from '../common/button/button';
import { Input } from '../common/input/input';
import { useAuthStore } from '../../store/authStore';
import { useAssoStore } from '../../store/assoStore';
import { planningService } from '../../services/planningService';
import { assoService } from '../../services/assoService';
import { userService } from '../../services/userService';
import { CreateEventRequest, CreateEventDto } from '../../types/planning/event';
import { User } from '../../types/user/user';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Language } from '../../types/enums/Language';

interface CreatePlanningModalProps {
    isOpen: boolean;
    onClose: () => void;
    onPlanningCreated: () => void;
}

interface EventForm {
    title: string;
    description: string;
    location: string;
    beginningDate: string;
    endDate: string;
    participantsIds: string[];
}

const CreatePlanningModal: React.FC<CreatePlanningModalProps> = ({
    isOpen,
    onClose,
    onPlanningCreated
}) => {
    const { user } = useAuthStore();
    const { selectedAssociation } = useAssoStore();
    const { t } = useTranslation();

    const t_planning = (key: string): string => {
        return t(`planning.${key}` as any);
    };
    
    // États pour la création de planning
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [currentPlanningId, setCurrentPlanningId] = useState<string | null>(null);
    
    // États pour la liste des membres
    const [teamMembers, setTeamMembers] = useState<User[]>([]);
    const [loadingMembers, setLoadingMembers] = useState(false);
    
    // États pour les événements
    const [events, setEvents] = useState<EventForm[]>([]);
    const [showAddEvent, setShowAddEvent] = useState(false);
    
    // Formulaire pour un nouvel événement
    const [newEvent, setNewEvent] = useState<EventForm>({
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
            const associationMembers = await assoService.getAssociationMembers(selectedAssociation.id);
            
            // Convertir AssociationMember en User pour la compatibilité
            const convertedMembers = associationMembers.map(member => ({
                id: member.id,
                firstname: member.firstname,
                lastname: member.lastname,
                email: member.email,
                phoneNumber: member.phoneNumber || '',
                street: member.street || '',
                city: member.city || '',
                state: member.state || '',
                postalCode: member.postalCode || '',
                country: member.country || '',
                languages: member.languages || [],
                managerId: null,
                isManager: member.isManager,
                createdAt: member.createdAt,
                updatedAt: member.updatedAt
            }));
            
            setTeamMembers(convertedMembers);
        } catch (error) {

        } finally {
            setLoadingMembers(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            loadTeamMembers();
            // Reset du formulaire
            setEvents([]);
            setCurrentPlanningId(null);
            setError(null);
            setSuccess(null);
            setShowAddEvent(false);
            setNewEvent({
                title: '',
                description: '',
                location: '',
                beginningDate: '',
                endDate: '',
                participantsIds: []
            });
        }
    }, [isOpen, selectedAssociation]);

    // Créer le planning initial
    const createPlanning = async () => {
        if (!selectedAssociation?.id) {
            setError(t_planning('createPlanning_associationNotSelected'));
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const planningData = {
                associationId: selectedAssociation.id
            };

            const planning = await planningService.createPlanning(planningData);
            setCurrentPlanningId(planning.id);
            setSuccess(t_planning('createPlanning_success'));
            setShowAddEvent(true);
            
        } catch (err: any) {

            setError(err.message || t_planning('createPlanning_error'));
        } finally {
            setLoading(false);
        }
    };

    // Ajouter un événement au planning
    const addEventToPlanning = async () => {
        if (!currentPlanningId || !user?.sub) {
            setError(t_planning('createPlanning_planningNotCreated'));
            return;
        }

        // Validation
        if (!newEvent.title.trim() || !newEvent.beginningDate || !newEvent.endDate) {
            setError(t_planning('createPlanning_eventFormError'));
            return;
        }

        if (new Date(newEvent.beginningDate) >= new Date(newEvent.endDate)) {
            setError(t_planning('createPlanning_eventDateError'));
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const eventData: CreateEventDto = {
                associationId: selectedAssociation?.id || '',
                participantsIds: newEvent.participantsIds,
                title: newEvent.title.trim(),
                description: newEvent.description.trim(),
                location: newEvent.location.trim(),
                beginningDate: newEvent.beginningDate,
                endDate: newEvent.endDate
            };

            await planningService.createEvent(eventData);
            
            // Ajouter l'événement à la liste locale
            setEvents(prev => [...prev, newEvent]);
            
            // Reset du formulaire d'événement
            setNewEvent({
                title: '',
                description: '',
                location: '',
                beginningDate: '',
                endDate: '',
                participantsIds: []
            });

            toast.success(t_planning('createPlanning_eventAdded'));
            
        } catch (err: any) {

            setError(err.message || t_planning('createPlanning_eventError'));
        } finally {
            setLoading(false);
        }
    };

    // Finaliser et fermer
    const finalizePlanning = () => {
        toast.success(t_planning('createPlanning_finalSuccess'));
        onPlanningCreated();
        onClose();
    };

    // Gérer la sélection des participants
    const toggleParticipant = (userId: string) => {
        setNewEvent(prev => ({
            ...prev,
            participantsIds: prev.participantsIds.includes(userId)
                ? prev.participantsIds.filter(id => id !== userId)
                : [...prev.participantsIds, userId]
        }));
    };

    const handleEventFormChange = (field: keyof EventForm, value: string) => {
        setNewEvent(prev => ({
            ...prev,
            [field]: value
        }));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {t_planning('createPlanning_modalTitle')}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-6">
                    {/* Messages d'erreur/succès */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-md">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 rounded-md">
                            {success}
                        </div>
                    )}

                    {/* Étape 1: Créer le planning */}
                    {!currentPlanningId && (
                        <div className="text-center py-8">
                            <CalendarIcon className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                {t_planning('createPlanning_modalSubtitle')}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-6" 
                               dangerouslySetInnerHTML={{ 
                                   __html: t_planning('createPlanning_modalDescription').replace('{name}', selectedAssociation?.name || '') 
                               }} 
                            />
                            <Button
                                onClick={createPlanning}
                                isLoading={loading}
                                disabled={loading}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
                            >
                                {t_planning('createPlanning_createButton')}
                            </Button>
                        </div>
                    )}

                    {/* Étape 2: Ajouter des événements */}
                    {currentPlanningId && (
                        <div className="space-y-6">
                            {/* Liste des événements ajoutés */}
                            {events.length > 0 && (
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                        {t_planning('createPlanning_eventsAdded').replace('{count}', events.length.toString())}
                                    </h3>
                                    <div className="space-y-3">
                                        {events.map((event, index) => (
                                            <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <h4 className="font-medium text-gray-900 dark:text-white">{event.title}</h4>
                                                        {event.description && (
                                                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{event.description}</p>
                                                        )}
                                                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                                                            <span className="flex items-center">
                                                                <ClockIcon className="w-4 h-4 mr-1" />
                                                                {new Date(event.beginningDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}
                                                            </span>
                                                            {event.location && (
                                                                <span className="flex items-center">
                                                                    <MapPinIcon className="w-4 h-4 mr-1" />
                                                                    {event.location}
                                                                </span>
                                                            )}
                                                                                                                    <span className="flex items-center">
                                                            <UserGroupIcon className="w-4 h-4 mr-1" />
                                                            {t_planning('createPlanning_participantsCount').replace('{count}', event.participantsIds.length.toString())}
                                                        </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Bouton pour ajouter un événement */}
                            {!showAddEvent && (
                                <div className="text-center">
                                    <Button
                                        onClick={() => setShowAddEvent(true)}
                                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2"
                                    >
                                        <PlusIcon className="w-4 h-4 mr-2" />
                                        {t_planning('createPlanning_addEvent')}
                                    </Button>
                                </div>
                            )}

                            {/* Formulaire d'ajout d'événement */}
                            {showAddEvent && (
                                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                        {t_planning('createPlanning_newEvent')}
                                    </h3>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        <Input
                                            type="text"
                                            placeholder={`${t_planning('createPlanning_eventTitle')} *`}
                                            value={newEvent.title}
                                            onChange={(e) => handleEventFormChange('title', e.target.value)}
                                            className="w-full"
                                        />
                                        <Input
                                            type="text"
                                            placeholder={t_planning('createPlanning_location')}
                                            value={newEvent.location}
                                            onChange={(e) => handleEventFormChange('location', e.target.value)}
                                            className="w-full"
                                        />
                                    </div>

                                    <div className="mb-4">
                                        <Input
                                            type="text"
                                            placeholder={t_planning('createPlanning_description')}
                                            value={newEvent.description}
                                            onChange={(e) => handleEventFormChange('description', e.target.value)}
                                            className="w-full"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                {t_planning('createPlanning_startDate')} *
                                            </label>
                                            <Input
                                                type="datetime-local"
                                                value={newEvent.beginningDate}
                                                onChange={(e) => handleEventFormChange('beginningDate', e.target.value)}
                                                className="w-full"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                {t_planning('createPlanning_endDate')} *
                                            </label>
                                            <Input
                                                type="datetime-local"
                                                value={newEvent.endDate}
                                                onChange={(e) => handleEventFormChange('endDate', e.target.value)}
                                                className="w-full"
                                            />
                                        </div>
                                    </div>

                                    {/* Sélection des participants */}
                                    <div className="mb-6">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            {t_planning('createPlanning_participants')}
                                        </label>
                                        {loadingMembers ? (
                                            <div className="text-center py-4">
                                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                                            </div>
                                        ) : (
                                            <div className="max-h-32 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg p-2">
                                                {teamMembers.length === 0 ? (
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-2">
                                                        {t_planning('createPlanning_noMembersAvailable')}
                                                    </p>
                                                ) : (
                                                    <div className="space-y-2">
                                                        {teamMembers.map((member) => (
                                                            <label key={member.id} className="flex items-center">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={newEvent.participantsIds.includes(member.id)}
                                                                    onChange={() => toggleParticipant(member.id)}
                                                                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                                />
                                                                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                                                                    {member.firstname} {member.lastname}
                                                                </span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex justify-end space-x-3">
                                        <Button
                                            onClick={() => setShowAddEvent(false)}
                                            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2"
                                        >
                                            {t_planning('availability_cancel')}
                                        </Button>
                                        <Button
                                            onClick={addEventToPlanning}
                                            isLoading={loading}
                                            disabled={loading}
                                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2"
                                        >
                                            {t_planning('createPlanning_eventAdded')}
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* Boutons de finalisation */}
                            <div className="flex justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
                                <Button
                                    onClick={() => setShowAddEvent(true)}
                                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2"
                                    disabled={showAddEvent}
                                >
                                    <PlusIcon className="w-4 h-4 mr-2" />
                                    {t_planning('createPlanning_addAnotherEvent')}
                                </Button>
                                
                                <Button
                                    onClick={finalizePlanning}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
                                    disabled={events.length === 0}
                                >
                                    {t_planning('createPlanning_finalizePlanning')}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CreatePlanningModal; 