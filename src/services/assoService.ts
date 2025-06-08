import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const API_URL = 'http://localhost:8080';

interface AssoResponse {
    id?: string;
    siret: string;
}

export const assoService = {
    createAssociation: async (siret: string, userId: string): Promise<AssoResponse> => {
        try {
            const url = `${API_URL}/association?siret=${siret}&userId=${userId}`;
            console.log('Full URL:', url);
            console.log('Request method:', 'POST');
            console.log('Request headers:', {
                'Content-Type': 'application/json'
            });
            
            const response = await axios({
                method: 'post',
                url: url,
                headers: {
                    'Content-Type': 'application/json'
                },
                data: {}
            });
            
            console.log('Response status:', response.status);
            console.log('Response data:', response.data);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error('Error details:', {
                    status: error.response?.status,
                    statusText: error.response?.statusText,
                    data: error.response?.data,
                    headers: error.response?.headers,
                    config: {
                        url: error.config?.url,
                        method: error.config?.method,
                        headers: error.config?.headers,
                        data: error.config?.data
                    }
                });
            }
            throw error;
        }
    },

    getAssociation: async (id: string) => {
        try {
            const response = await axios.get(`${API_URL}/association`, {
                params: { id }
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
            // Récupérer le sub (userId) depuis le store
            const user = useAuthStore.getState().user;
            if (!user || !user.sub) {
                throw new Error('No user ID found in store');
            }

            console.log('Fetching association for user:', user.sub);
            const response = await axios.get(`${API_URL}/association/membership?id=${user.sub}`);
            return response.data;
        } catch (error) {
            console.error('Error getting user association:', error);
            throw error;
        }
    }
};