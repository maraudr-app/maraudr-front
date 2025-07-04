import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { userService } from './userService';

const API_URL = 'http://localhost:8080';


interface AssoResponse {
    id?: string;
    siret: string;
}

// Interface pour les membres d'association
export interface AssociationMember {
    id: string;
    firstname: string;
    lastname: string;
    email: string;
    phoneNumber?: string;
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
    languages?: string[];
    isManager: boolean;
    createdAt: string;
    updatedAt: string;
}

// Interface pour les données d'association retournées par l'API
interface AssociationData {
    id: string;
    name: string;
    managerId: string;
    members: string[]; // Tableau des IDs des membres
    address: {
        street: string;
        city: string;
        postalCode: string;
        country: string;
    };
    siret: {
        value: string;
    };
}

export const assoService = {
    createAssociation: async (siret: string): Promise<string> => {
        const token = useAuthStore.getState().token;
        if (!token) {
            throw new Error('No authentication token available');
        }

        const url = `${API_URL}/association`;
        try {
            const response = await axios.post(url, null, {
                params: { siret },
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                withCredentials: true
            });
            
            return response.data.id;
        } catch (error) {
            throw error;
        }
    },

    getAssociation: async (id: string | any) => {
        // 🔍 DEBUG: Capturer le problème id[id] et id[name]
        console.log('🔍 getAssociation appelé avec:', {
            id: id,
            typeofId: typeof id,
            stringified: JSON.stringify(id)
        });

        // Si c'est un objet, montrer la stack trace
        if (typeof id === 'object' && id !== null) {
            console.error('❌ ERREUR: Objet passé au lieu d\'un ID string!', id);
            console.trace('📍 Stack trace pour trouver la source:');
            
            // Essayer de récupérer l'ID de l'objet si possible
            if (id.id) {
                console.warn('🔧 Tentative de récupération de l\'ID depuis l\'objet:', id.id);
                // Utiliser l'ID de l'objet pour continuer
                id = id.id;
            } else {
                throw new Error('Objet invalide passé à getAssociation - pas d\'ID trouvé');
            }
        }

        try {
            console.log('📡 Envoi de la requête finale avec ID:', id);
            const response = await axios.get(`${API_URL}/association`, {
                params: { id },
                headers: {
                    'Authorization': `Bearer ${useAuthStore.getState().token}`
                },
                withCredentials: true
            });
            
            return response.data;
        } catch (error: any) {
            console.error('❌ Erreur dans getAssociation:', error);
            console.error('URL générée:', error.config?.url);
            throw error;
        }
    },

    getAssociationById: async (id: string) => {
        try {
            const response = await axios.get(`${API_URL}/association/${id}`, {
                headers: {
                    'Authorization': `Bearer ${useAuthStore.getState().token}`
                },
                withCredentials: true
            });
            return response.data;
        } catch (error: any) {
            // Error silencieuse
            throw error;
        }
    },
  
    // Nouvelle fonction spécifiquement pour les invitations qui utilise le bon format d'URL
    getAssociationByIdForInvitation: async (id: string) => {
        try {
            console.log('🔍 Récupération association pour invitation avec ID:', id);
            const response = await axios.get(`${API_URL}/association`, {
                params: { id },
                headers: {
                    'Authorization': `Bearer ${useAuthStore.getState().token}`
                },
                withCredentials: true
            });
            console.log('✅ Association récupérée:', response.data);
            return response.data;
        } catch (error: any) {
            console.error('❌ Erreur récupération association pour invitation:', error);
            throw error;
        }
    },

    updateAssociation: async (id: string, data: any) => {
        const token = useAuthStore.getState().token;
        if (!token) {
            throw new Error('No authentication token available');
        }

        try {
            const response = await axios.put(`${API_URL}/association/${id}`, data, {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                withCredentials: true
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    deleteAssociation: async (id: string) => {
        const token = useAuthStore.getState().token;
        if (!token) {
            throw new Error('No authentication token available');
        }

        try {
            const response = await axios.delete(`${API_URL}/association/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                withCredentials: true
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    checkMembership: async (userId: string): Promise<string[]> => {
        try {
            const response = await axios.get(`${API_URL}/association/membership`, {
                params: { id: userId },
                headers: {
                    'Authorization': `Bearer ${useAuthStore.getState().token}`
                },
                withCredentials: true
            });
            return response.data || [];
        } catch (error: any) {
            // Error silencieuse
            throw error;
        }
    },

    // Méthode mise à jour pour récupérer les membres avec leurs détails complets
    getAssociationMembers: async (associationId: string): Promise<AssociationMember[]> => {
        try {
            console.log('Récupération des membres pour l\'association:', associationId);
            
            // 1. Récupérer les données de l'association (qui contient les IDs des membres)
            const associationResponse = await axios.get(`${API_URL}/association`, {
                params: { id: associationId },
                headers: {
                    'Authorization': `Bearer ${useAuthStore.getState().token}`
                },
                withCredentials: true
            });

            const associationData: AssociationData = associationResponse.data;
            console.log('Données association récupérées:', associationData);

            if (!associationData.members || associationData.members.length === 0) {
                console.log('Aucun membre trouvé dans l\'association');
                return [];
            }

            // 2. Récupérer les détails de chaque membre via leur ID
            const memberDetailsPromises = associationData.members.map(async (memberId: string) => {
                try {
                    const userDetails = await userService.getUser(memberId);
                    console.log('Détails utilisateur récupérés pour', memberId, ':', userDetails);
                    
                    // Déterminer si l'utilisateur est le manager
                    const isManager = memberId === associationData.managerId;
                    
                    // Convertir en format AssociationMember
                    const associationMember: AssociationMember = {
                        id: userDetails.id,
                        firstname: userDetails.firstname,
                        lastname: userDetails.lastname,
                        email: userDetails.email,
                        phoneNumber: userDetails.phoneNumber || userDetails.contactInfo?.phoneNumber,
                        street: userDetails.street || userDetails.address?.street,
                        city: userDetails.city || userDetails.address?.city,
                        state: userDetails.state || userDetails.address?.state,
                        postalCode: userDetails.postalCode || userDetails.address?.postalCode,
                        country: userDetails.country || userDetails.address?.country,
                        languages: userDetails.languages || [],
                        isManager: isManager,
                        createdAt: userDetails.createdAt,
                        updatedAt: userDetails.updatedAt || userDetails.lastLoggedIn
                    };
                    
                    return associationMember;
        } catch (error) {
                    console.error(`Erreur lors de la récupération des détails pour le membre ${memberId}:`, error);
                    return null;
                }
            });

            // 3. Attendre que tous les détails soient récupérés et filtrer les résultats null
            const memberDetails = await Promise.all(memberDetailsPromises);
            const validMembers = memberDetails.filter((member): member is AssociationMember => member !== null);
            
            console.log('Membres finaux récupérés:', validMembers);
            return validMembers;

        } catch (error: any) {
            console.error('Erreur lors de la récupération des membres de l\'association:', error);
            throw new Error(error.response?.data?.detail || 'Erreur lors de la récupération des membres');
        }
    },

    addMemberToAssociation: async (membershipData: { userId: string; associationId: string }) => {
        const token = useAuthStore.getState().token;
        if (!token) {
            throw new Error('No authentication token available');
        }

        try {
            const response = await axios.post(`${API_URL}/association/member`, membershipData, {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                withCredentials: true
            });
            return response.data;
        } catch (error) {
            // Error silencieuse
            throw error;
        }
    },

    // Vérifier si un utilisateur est membre d'une association spécifique avec la nouvelle API
    isUserMemberOfAssociation: async (userId: string, associationId: string): Promise<boolean> => {
        try {
            const response = await axios.get(`${API_URL}/association/is-member/${associationId}/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${useAuthStore.getState().token}`
                },
                withCredentials: true
            });
            
            return response.data === true || response.data === 'true';
        } catch (error: any) {
            // Error silencieuse
            return false;
        }
    }
};