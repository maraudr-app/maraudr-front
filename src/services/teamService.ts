import axios from 'axios';
import { getModuleBaseUrl } from '../config/api';

const API_URL = getModuleBaseUrl('user');

export interface TeamMember {
    id: string;
    firstname: string;
    lastname: string;
    email: string;
    phoneNumber: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    languages: string[];
    managerId?: string | null;
    isManager: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface TeamResponse {
    members: TeamMember[];
    totalCount: number;
}

export interface AddTeamMemberRequest {
    userId: string;
}

export interface RemoveTeamMemberRequest {
    userId: string;
}

// Créer une instance axios pour l'API team
const teamApi = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true
});

// Intercepteur pour ajouter le token d'authentification
teamApi.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Intercepteur pour gérer les erreurs
teamApi.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            console.log('❌ Erreur 401 détectée dans teamService...');
            try {
                const { tokenManager } = await import('./tokenManager');
                const newToken = await tokenManager.refreshToken();
                if (newToken && error.config) {
                    error.config.headers.Authorization = `Bearer ${newToken}`;
                    return teamApi.request(error.config);
                }
            } catch (refreshError) {
                console.error('❌ Impossible de refresh le token:', refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export const teamService = {
  // Récupérer les membres de l'équipe d'un manager
  getTeamMembers: async (managerGuid: string): Promise<TeamResponse> => {
    try {
      const response = await teamApi.get(`/managers/team/${managerGuid}`);
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Erreur lors de la récupération des membres de l\'équipe';
      throw new Error(errorMessage);
    }
  },

  // Ajouter un membre à l'équipe
  addTeamMember: async (managerId: string, request: AddTeamMemberRequest): Promise<void> => {
    try {
      await teamApi.post(`/managers/team/${managerId}`, request);
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Erreur lors de l\'ajout du membre à l\'équipe';
      throw new Error(errorMessage);
    }
  },

  // Supprimer un membre de l'équipe
  removeTeamMember: async (managerId: string, request: RemoveTeamMemberRequest): Promise<void> => {
    try {
      await teamApi.delete(`/managers/team/${managerId}`, { data: request });
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Erreur lors de la suppression du membre de l\'équipe';
      throw new Error(errorMessage);
    }
  }
}; 