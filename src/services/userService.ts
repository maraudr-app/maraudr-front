import { UserToCreate } from '../types/user/userToCreate';
import { User } from '../types/user/user';
import { Disponibility, DisponibilityToCreate } from '../types/disponibility/disponibility';
import { api } from './api';

export const userService = {
  createUser: async (userData: UserToCreate) => {
    try {
      const response = await api.post('/users', userData);
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Une erreur est survenue';
      throw new Error(errorMessage);
    }
  },

  createAccount: async (userData: UserToCreate) => {
    try {

      const response = await api.post('/users', userData);


      return response.data;
    } catch (error: any) {
    

      const errorMessage = error.response?.data?.detail || 'Une erreur est survenue';
      throw new Error(errorMessage);
    }
  },

  getUser: async (userId: string) => {
    try {
      const response = await api.get(`/users/${userId}`);
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Une erreur est survenue';
      throw new Error(errorMessage);
    }
  },

  getAllUsers: async (): Promise<User[]> => {
    try {
      const response = await api.get('/users');
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Une erreur est survenue';
      throw new Error(errorMessage);
    }
  },

  // Récupérer tous les utilisateurs sauf le manager connecté
  getTeamUsers: async (managerId: string): Promise<User[]> => {
    try {
      const response = await api.get('/users');
      const allUsers = response.data;
      // Filtrer pour exclure le manager connecté
      return allUsers.filter((user: User) => user.id !== managerId);
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Une erreur est survenue';
      throw new Error(errorMessage);
    }
  },

  updateUser: async (userSub: string, userData: any) => {
    try {

      
      const response = await api.put(`/users/${userSub}`, userData);
      

      
      return response.data;
    } catch (error: any) {

      
      const errorMessage = error.response?.data?.detail || error.response?.data?.message || 'Une erreur est survenue';
      throw new Error(errorMessage);
    }
  },

  deleteUser: async (userId: string) => {
    try {
      const response = await api.delete(`/users/${userId}`);
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Une erreur est survenue';
      throw new Error(errorMessage);
    }
  },

  // Services pour les disponibilités - Utilise localhost:8080/api
  createDisponibility: async (disponibilityData: DisponibilityToCreate): Promise<Disponibility> => {
    try {
      // Utiliser l'instance api qui a déjà les en-têtes d'authentification
      const response = await api.post('/users/disponibilities', disponibilityData);
      return response.data;
    } catch (error: any) {

      
      // Extraire le message d'erreur de la validation
      let errorMessage = 'availability_unknownError';
      
      if (error.response?.data) {
        const responseData = error.response.data;
        let backendMessage = '';
        
        // Si c'est un tableau d'erreurs de validation
        if (Array.isArray(responseData) && responseData.length > 0 && responseData[0].errorMessage) {
          backendMessage = responseData[0].errorMessage;
        }
        // Si c'est un objet avec errorMessage
        else if (responseData.errorMessage) {
          backendMessage = responseData.errorMessage;
        }
        // Sinon, utiliser detail
        else if (responseData.detail) {
          backendMessage = responseData.detail;
        }
        
        // Mapper les messages du backend vers les clés de traduction
        if (backendMessage.includes('durée de disponibilité doit être raisonnable') || backendMessage.includes('moins de 120h')) {
          errorMessage = 'availability_durationError';
        } else if (backendMessage) {
          // Si on a un message mais pas de mapping spécifique, retourner le message original
          errorMessage = backendMessage;
        }
      }
      
      throw new Error(errorMessage);
    }
  },

  updateDisponibility: async (disponibilityId: string, disponibilityData: any) => {
    try {
      const response = await api.put(`/users/disponibilities/${disponibilityId}`, disponibilityData);
      return response.data;
    } catch (error: any) {

      const errorMessage = error.response?.data?.detail || error.response?.data || 'Une erreur est survenue';
      throw new Error(errorMessage);
    }
  },

  getDisponibilities: async (associationId: string): Promise<Disponibility[]> => {
    try {
      const response = await api.get(`/users/disponibilities/${associationId}`);
      return response.data;
    } catch (error: any) {

      const errorMessage = error.response?.data?.detail || error.response?.data || 'Une erreur est survenue';
      throw new Error(errorMessage);
    }
  },

  getAllDisponibilities: async (associationId: string) => {
    try {
      const response = await api.get(`/users/disponibilities/all/${associationId}`);
      return response.data;
    } catch (error: any) {

      const errorMessage = error.response?.data?.detail || error.response?.data || 'Une erreur est survenue';
      throw new Error(errorMessage);
    }
  },

  getFutureDisponibilities: async (associationId: string) => {
    try {
      const response = await api.get(`/users/disponibilities/futur/${associationId}`);
      return response.data;
    } catch (error: any) {

      const errorMessage = error.response?.data?.detail || error.response?.data || 'Une erreur est survenue';
      throw new Error(errorMessage);
    }
  },

  deleteDisponibility: async (disponibilityId: string): Promise<void> => {
    try {
      await api.delete(`/users/disponibilities/${disponibilityId}`);
    } catch (error: any) {

      const errorMessage = error.response?.data?.detail || error.response?.data || 'Une erreur est survenue';
      throw new Error(errorMessage);
    }
  }
}; 