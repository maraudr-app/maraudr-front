import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const API_URL = 'http://localhost:8080';

interface AssoResponse {
    id?: string;
    siret: string;
}

export const assoService = {
    createAssociation: async (name: string, logo?: string): Promise<string> => {
        const token = useAuthStore.getState().token;
        if (!token) {
            throw new Error('No authentication token available');
        }

        const url = `${API_URL}/association`;
        try {
            const response = await axios.post(url, {
                name,
                logo
            }, {
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
                withCredentials: true
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    updateAssociation: async (id: string, data: any) => {
        try {
            const response = await axios.put(`${API_URL}/association/${id}`, data);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    deleteAssociation: async (id: string) => {
        try {
            const response = await axios.delete(`${API_URL}/association/${id}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    getCurrentUserAssociation: async () => {
        try {
            const user = useAuthStore.getState().user;
            if (!user || !user.sub) {
                throw new Error('No user ID found in store');
            }

            console.log('Fetching association for user:', user.sub);
            const response = await axios.get(`${API_URL}/association/membership`, {
                params: { id: user.sub },
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error getting user association:', error);
            throw error;
        }
    },
    getUserAssociations: async (userId: string) => {
        try {
            const response = await axios.get(`${API_URL}/association/membership`, {
                params: { id: userId },
                withCredentials: true
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },
};