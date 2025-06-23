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
        try {
            const response = await axios.get(`${API_URL}/association`, {
                params: { id },
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