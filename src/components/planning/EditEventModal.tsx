import React, { useState, useEffect } from 'react';
import { XMarkIcon, CalendarIcon, UserGroupIcon, MapPinIcon, ClockIcon, ChevronDownIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { Button } from '../common/button/button';
import { Input } from '../common/input/input';
import { useAuthStore } from '../../store/authStore';
import { useAssoStore } from '../../store/assoStore';
import { planningService } from '../../services/planningService';
import { userService } from '../../services/userService';
import { User } from '../../types/user/user';
import { Event, UpdateEventRequest } from '../../types/planning/event';
import { Disponibility } from '../../types/disponibility/disponibility';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

interface EditEventModalProps {
    isOpen: boolean;
    onClose: () => void;
    onEventUpdated: () => void;
    event: Event | null;
    editFormData: {
        title: string;
        description: string;
        location: string;
        beginningDate: string;
        endDate: string;
    };
    selectedParticipants: string[];
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

const EditEventModal: React.FC<EditEventModalProps> = ({
    isOpen,
    onClose,
    onEventUpdated,
    event,
    editFormData,
    selectedParticipants
}) => {
    const { user } = useAuthStore();
    const { selectedAssociation } = useAssoStore();
    const { t } = useTranslation();

    const t_planning = (key: string): string => {
        return t(`planning.${key}` as any);
    };
    
    // États pour l'édition d'événement
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

    // Initialiser le formulaire avec les données de l'événement
    useEffect(() => {
        if (event && editFormData) {
            setEventForm({
                title: editFormData.title,
                description: editFormData.description,
                location: editFormData.location,
                beginningDate: editFormData.beginningDate,
                endDate: editFormData.endDate,
                participantsIds: selectedParticipants
            });
        }
    }, [event, editFormData, selectedParticipants]);

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
        }
    }, [isOpen]);

    useEffect(() => {
        updateAvailabilityConflicts();
    }, [eventForm.beginningDate, eventForm.endDate, eventForm.participantsIds]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (target.classList.contains('modal-backdrop')) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    const updateEvent = async () => {
        if (!event || !selectedAssociation?.id) return;

        // Validation
        if (!eventForm.title.trim()) {
            setError(t_planning('editEvent.titleRequired'));
            return;
        }

        if (!eventForm.beginningDate || !eventForm.endDate) {
            setError(t_planning('editEvent.dateRequired'));
            return;
        }

        const startDate = new Date(eventForm.beginningDate);
        const endDate = new Date(eventForm.endDate);

        if (startDate >= endDate) {
            setError(t_planning('editEvent.endDateAfterStart'));
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const updateData: UpdateEventRequest = {
                id: event.id,
                title: eventForm.title,
                description: eventForm.description,
                location: eventForm.location,
                beginningDate: eventForm.beginningDate,
                endDate: eventForm.endDate,
                participantsIds: eventForm.participantsIds
            };

            await planningService.updateEvent(updateData);
            
            toast.success(t_planning('editEvent.success'));
            onEventUpdated();
            onClose();
        } catch (error) {
            console.error('Erreur lors de la modification de l\'événement:', error);
            setError(t_planning('editEvent.error'));
        } finally {
            setLoading(false);
        }
    };

    const toggleParticipant = (userId: string) => {
        setEventForm(prev => ({
            ...prev,
            participantsIds: prev.participantsIds.includes(userId)
                ? prev.participantsIds.filter(id => id !== userId)
                : [...prev.participantsIds, userId]
        }));
    };

    const getSelectedParticipantsNames = () => {
        return eventForm.participantsIds
            .map(id => teamMembers.find(member => member.id === id))
            .filter(Boolean)
            .map(member => `${member?.firstname} ${member?.lastname}`.trim())
            .join(', ');
    };

    const handleFormChange = (field: keyof EventForm, value: string) => {
        setEventForm(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const filteredMembers = teamMembers.filter(member =>
        `${member.firstname} ${member.lastname}`.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-[400] modal-backdrop">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-2xl rounded-xl bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <div className="mt-3">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                                                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                            {t_planning('editEvent.modalTitle')}
                        </h3>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                            <XMarkIcon className="h-6 w-6" />
                        </button>
                    </div>

                    {/* Formulaire */}
                    <div className="space-y-6">
                        {/* Titre */}
                        <div>
                            <Input
                                type="text"
                                value={eventForm.title}
                                onChange={(e) => handleFormChange('title', e.target.value)}
                                placeholder={t_planning('editEvent.eventTitle') + ' *'}
                                className="w-full text-lg font-medium"
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <textarea
                                value={eventForm.description}
                                onChange={(e) => handleFormChange('description', e.target.value)}
                                placeholder={t_planning('editEvent.description')}
                                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none transition-colors"
                                rows={3}
                            />
                        </div>

                        {/* Localisation */}
                        <div>
                            <Input
                                type="text"
                                value={eventForm.location}
                                onChange={(e) => handleFormChange('location', e.target.value)}
                                placeholder={t_planning('editEvent.location')}
                                className="w-full"
                            />
                        </div>

                        {/* Dates et heures */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Input
                                    type="datetime-local"
                                    value={eventForm.beginningDate}
                                    onChange={(e) => handleFormChange('beginningDate', e.target.value)}
                                    placeholder={t_planning('editEvent.startDate') + ' *'}
                                    className="w-full"
                                />
                            </div>
                            <div>
                                <Input
                                    type="datetime-local"
                                    value={eventForm.endDate}
                                    onChange={(e) => handleFormChange('endDate', e.target.value)}
                                    placeholder={t_planning('editEvent.endDate') + ' *'}
                                    className="w-full"
                                />
                            </div>
                        </div>

                        {/* Participants */}
                        <div>
                            <div className="relative">
                                <div
                                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent dark:bg-gray-700 dark:text-white cursor-pointer flex justify-between items-center transition-colors"
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                >
                                    <span className={eventForm.participantsIds.length > 0 ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}>
                                        {eventForm.participantsIds.length > 0 ? getSelectedParticipantsNames() : t_planning('editEvent.selectParticipants')}
                                    </span>
                                    <ChevronDownIcon className={`h-5 w-5 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                                </div>

                                {isDropdownOpen && (
                                    <div className="absolute z-10 w-full mt-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-xl max-h-60 overflow-auto">
                                        <div className="p-3 border-b border-gray-100 dark:border-gray-600">
                                            <input
                                                type="text"
                                                placeholder={t_planning('editEvent.searchMembers')}
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:text-white"
                                            />
                                        </div>
                                        <div className="max-h-48 overflow-auto">
                                            {filteredMembers.map((member) => (
                                                <div
                                                    key={member.id}
                                                    className="flex items-center px-4 py-3 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer transition-colors"
                                                    onClick={() => toggleParticipant(member.id)}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={eventForm.participantsIds.includes(member.id)}
                                                        onChange={() => {}}
                                                        className="mr-3 text-blue-600 focus:ring-blue-500"
                                                    />
                                                    <span className="text-sm text-gray-900 dark:text-white font-medium">
                                                        {member.firstname} {member.lastname}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Conflits de disponibilité */}
                        {availabilityConflicts.length > 0 && (
                            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-4">
                                <div className="flex items-start">
                                    <ExclamationTriangleIcon className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 mr-3 flex-shrink-0" />
                                    <div>
                                        <h4 className="text-sm font-semibold text-amber-800 dark:text-amber-200 mb-2">
                                            {t_planning('editEvent.availabilityConflicts')}
                                        </h4>
                                        <div className="space-y-1">
                                            {availabilityConflicts.map((conflict, index) => {
                                                const member = teamMembers.find(m => m.id === conflict.userId);
                                                return (
                                                    <div key={index} className="text-sm text-amber-700 dark:text-amber-300">
                                                        <span className="font-medium">{member ? `${member.firstname} ${member.lastname}` : t_planning('editEvent.unknownMember')}</span>: {conflict.missingDates.join(', ')}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Message d'erreur */}
                        {error && (
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4">
                                <div className="flex items-start">
                                    <ExclamationTriangleIcon className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 mr-3 flex-shrink-0" />
                                    <span className="text-sm text-red-800 dark:text-red-200 font-medium">{error}</span>
                                </div>
                            </div>
                        )}

                        {/* Boutons d'action */}
                        <div className="flex justify-between space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                            <Button
                                onClick={onClose}
                         
                                disabled={loading}
                                className="px-8 py-3 w-64 bg-gray-500 hover:bg-gray-600 text-white transition-colors"
                            >
                                {t_planning('editEvent.cancel')}
                            </Button>
                            <Button
                                onClick={updateEvent}
                                disabled={loading}
                                className="px-8 py-3 w-64 bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                            >
                                {loading ? t_planning('editEvent.updating') : t_planning('editEvent.update')}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditEventModal; 