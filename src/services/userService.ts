import { UserToCreate } from '../types/user/userToCreate';
import { User, Disponibility, CreateDisponibilityRequest, UpdateDisponibilityRequest } from '../types/user/user';
import { api } from './api';
import axios from 'axios';

// URL pour les disponibilités
const DISPONIBILITY_API_URL = 'http://localhost:8082/api';

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

  updateUser: async (userId: string, userData: Partial<UserToCreate>) => {
    try {
      const response = await api.put(`/users/${userId}`, userData);
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Une erreur est survenue';
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

  // Services pour les disponibilités - Utilise localhost:8082/api
  createDisponibility: async (disponibilityData: CreateDisponibilityRequest): Promise<Disponibility> => {
    try {
      const response = await axios.post(`${DISPONIBILITY_API_URL}/users/disponibilities`, disponibilityData);
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Une erreur est survenue';
      throw new Error(errorMessage);
    }
  },

  updateDisponibility: async (disponibilityId: string, disponibilityData: UpdateDisponibilityRequest): Promise<Disponibility> => {
    try {
      const response = await axios.put(`${DISPONIBILITY_API_URL}/users/disponibilities/${disponibilityId}`, disponibilityData);
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Une erreur est survenue';
      throw new Error(errorMessage);
    }
  },

  getDisponibilities: async (associationId: string): Promise<Disponibility[]> => {
    try {
      const response = await axios.get(`${DISPONIBILITY_API_URL}/users/disponibilities/${associationId}`);
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Une erreur est survenue';
      throw new Error(errorMessage);
    }
  },

  getAllDisponibilities: async (associationId: string): Promise<Disponibility[]> => {
    try {
      const response = await axios.get(`${DISPONIBILITY_API_URL}/users/disponibilities/all/${associationId}`);
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Une erreur est survenue';
      throw new Error(errorMessage);
    }
  },

  getFutureDisponibilities: async (associationId: string): Promise<Disponibility[]> => {
    try {
      const response = await axios.get(`${DISPONIBILITY_API_URL}/users/disponibilities/futur/${associationId}`);
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Une erreur est survenue';
      throw new Error(errorMessage);
    }
  },

  deleteDisponibility: async (disponibilityId: string): Promise<void> => {
    try {
      await axios.delete(`${DISPONIBILITY_API_URL}/users/disponibilities/${disponibilityId}`);
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Une erreur est survenue';
      throw new Error(errorMessage);
    }
  }
}; 