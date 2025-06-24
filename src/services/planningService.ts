import axios from 'axios';

// Instance API spécifique pour le planning (port 8085)
const planningApi = axios.create({
    baseURL: 'http://localhost:8085/api',
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true
});

// Intercepteur pour ajouter le token d'authentification
planningApi.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Intercepteur pour gérer les erreurs
planningApi.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);
import { 
    Planning, 
    CreatePlanningRequest, 
    UpdatePlanningRequest 
} from '../types/planning/planning';
import { 
    Event, 
    CreateEventRequest, 
    CreateEventDto,
    UpdateEventRequest 
} from '../types/planning/event';

export const planningService = {
    // Créer un planning
    createPlanning: async (planningData: CreatePlanningRequest): Promise<Planning> => {
        try {
            const response = await planningApi.post('/planning/create-planning', planningData, {
                headers: {
                    'X-Api-Key': 'your-api-key' // À remplacer par la vraie clé API
                }
            });
            return response.data;
        } catch (error: any) {
            console.error('Erreur lors de la création du planning:', error);
            const errorMessage = error.response?.data?.detail || error.response?.data || 'Erreur lors de la création du planning';
            throw new Error(errorMessage);
        }
    },

    // Créer un événement (API directe avec associationId)
    createEvent: async (eventData: CreateEventDto): Promise<Event> => {
        try {
            const response = await planningApi.post('/planning', eventData);
            return response.data;
        } catch (error: any) {
            console.error('Erreur lors de la création de l\'événement:', error);
            const errorMessage = error.response?.data?.detail || error.response?.data || 'Erreur lors de la création de l\'événement';
            throw new Error(errorMessage);
        }
    },

    // Supprimer un événement
    deleteEvent: async (eventId: string): Promise<void> => {
        try {
            await planningApi.delete(`/planning/${eventId}`);
        } catch (error: any) {
            console.error('Erreur lors de la suppression de l\'événement:', error);
            const errorMessage = error.response?.data?.detail || error.response?.data || 'Erreur lors de la suppression de l\'événement';
            throw new Error(errorMessage);
        }
    },

    // Récupérer tous les événements d'une association
    getAllEvents: async (associationId: string): Promise<Event[]> => {
        try {
            const response = await planningApi.get(`/planning/all-events/${associationId}`);
            return response.data;
        } catch (error: any) {
            console.error('Erreur lors de la récupération des événements:', error);
            const errorMessage = error.response?.data?.detail || error.response?.data || 'Erreur lors de la récupération des événements';
            throw new Error(errorMessage);
        }
    },

    // Récupérer tous mes événements
    getMyEvents: async (): Promise<Event[]> => {
        try {
            const response = await planningApi.get('/planning/my-events');
            return response.data;
        } catch (error: any) {
            console.error('Erreur lors de la récupération de mes événements:', error);
            const errorMessage = error.response?.data?.detail || error.response?.data || 'Erreur lors de la récupération de mes événements';
            throw new Error(errorMessage);
        }
    },

    // Récupérer mes événements pour une association spécifique
    getMyEventsByAssociation: async (associationId: string): Promise<Event[]> => {
        try {
            const response = await planningApi.get(`/planning/my-events/${associationId}`);
            return response.data;
        } catch (error: any) {
            console.error('Erreur lors de la récupération de mes événements pour l\'association:', error);
            const errorMessage = error.response?.data?.detail || error.response?.data || 'Erreur lors de la récupération de mes événements pour l\'association';
            throw new Error(errorMessage);
        }
    },

    // Récupérer un événement par son ID
    getEventById: async (eventId: string): Promise<Event> => {
        try {
            const response = await planningApi.get(`/planning/events/${eventId}`);
            return response.data;
        } catch (error: any) {
            console.error('Erreur lors de la récupération de l\'événement:', error);
            const errorMessage = error.response?.data?.detail || error.response?.data || 'Erreur lors de la récupération de l\'événement';
            throw new Error(errorMessage);
        }
    },

    // Mettre à jour un événement (si l'endpoint existe)
    updateEvent: async (eventId: string, eventData: UpdateEventRequest): Promise<Event> => {
        try {
            const response = await planningApi.put(`/planning/${eventId}`, eventData);
            return response.data;
        } catch (error: any) {
            console.error('Erreur lors de la mise à jour de l\'événement:', error);
            const errorMessage = error.response?.data?.detail || error.response?.data || 'Erreur lors de la mise à jour de l\'événement';
            throw new Error(errorMessage);
        }
    },

    // Ajouter un participant à un événement
    addParticipant: async (eventId: string, participantId: string): Promise<void> => {
        try {
            await planningApi.post(`/planning/${eventId}/participants`, { participantId });
        } catch (error: any) {
            console.error('Erreur lors de l\'ajout du participant:', error);
            const errorMessage = error.response?.data?.detail || error.response?.data || 'Erreur lors de l\'ajout du participant';
            throw new Error(errorMessage);
        }
    },

    // Retirer un participant d'un événement
    removeParticipant: async (eventId: string, participantId: string): Promise<void> => {
        try {
            await planningApi.delete(`/planning/${eventId}/participants/${participantId}`);
        } catch (error: any) {
            console.error('Erreur lors de la suppression du participant:', error);
            const errorMessage = error.response?.data?.detail || error.response?.data || 'Erreur lors de la suppression du participant';
            throw new Error(errorMessage);
        }
    }
}; 