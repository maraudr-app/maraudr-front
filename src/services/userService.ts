import { UserToCreate } from '../types/user/userToCreate';
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
  }
}; 