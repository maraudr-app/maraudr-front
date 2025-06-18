import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const API_URL = 'http://localhost:8080';

interface AssoResponse {
    id?: string;
    siret: string;
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

    getAssociation: async (id: string) => {
        const token = useAuthStore.getState().token;
        if (!token) {
            throw new Error('No authentication token available');
        }

        console.log('Calling getAssociation API with ID:', id);
        try {
            const response = await axios.get(`${API_URL}/association`, {
                params: { id },
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                withCredentials: true
            });
            console.log('getAssociation response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error getting association:', error);
            throw error;
        }
    },

    getAssociationById: async (id: string) => {
        const token = useAuthStore.getState().token;
        if (!token) {
            throw new Error('No authentication token available');
        }

        try {
            const response = await axios.get(`${API_URL}/association/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                withCredentials: true
            });
            return response.data;
        } catch (error) {
            console.error('Error getting association by ID:', error);
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
        const token = useAuthStore.getState().token;
        if (!token) {
            throw new Error('No authentication token available');
        }

        try {
            const response = await axios.get(`${API_URL}/association/membership`, {
                params: { id: userId },
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                withCredentials: true
            });
            return response.data;
        } catch (error) {
            console.error('Error checking membership:', error);
            return [];
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
            console.error('Error adding member to association:', error);
            throw error;
        }
    },

    // Vérifier si un utilisateur est membre d'une association spécifique avec la nouvelle API
    isUserMemberOfAssociation: async (userId: string, associationId: string): Promise<boolean> => {
        const token = useAuthStore.getState().token;
        if (!token) {
            throw new Error('No authentication token available');
        }

        try {
            const response = await axios.get(`${API_URL}/association/is-member/${associationId}/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                withCredentials: true
            });
            
            console.log(`API is-member response for user ${userId} in association ${associationId}:`, response.data);
            
            // L'API retourne true/false directement
            return response.data === true || response.data === 'true';
        } catch (error) {
            console.error('Error checking user membership with API:', error);
            // En cas d'erreur, on considère que l'utilisateur n'est pas membre
            return false;
        }
    }
};