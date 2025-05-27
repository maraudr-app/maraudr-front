import { UserToCreate } from '../types/user/userToCreate';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5141';

export const userService = {
  createUser: async (userData: UserToCreate) => {
    try {
      const response = await axios.post(`${API_URL}/users`, userData);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Erreur lors de la création de l\'utilisateur');
      }
      throw error;
    }
  },


  getUser: async (userId: string) => {
    try {
      const response = await axios.get(`${API_URL}/users/${userId}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Erreur lors de la récupération de l\'utilisateur');
      }
      throw error;
    }
  },

  updateUser: async (userId: string, userData: Partial<UserToCreate>) => {
    try {
      const response = await axios.put(`${API_URL}/users/${userId}`, userData);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Erreur lors de la mise à jour de l\'utilisateur');
      }
      throw error;
    }
  },

  deleteUser: async (userId: string) => {
    try {
      const response = await axios.delete(`${API_URL}/users/${userId}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Erreur lors de la suppression de l\'utilisateur');
      }
      throw error;
    }
  }
}; 