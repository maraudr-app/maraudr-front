import { UserToCreate, UserToCreateDTO } from '../types/user/userToCreate';
import axios from 'axios';
import { CreateUserDto } from '../types/user';
import { api } from './api';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5141';

class UserService {
  async createUser(userData: CreateUserDto) {
    try {
      const response = await api.post('/users', userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getUser(userId: string) {
    try {
      const response = await axios.get(`${API_URL}/users/${userId}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Erreur lors de la récupération de l\'utilisateur');
      }
      throw error;
    }
  }

  async updateUser(userId: string, userData: Partial<UserToCreate>) {
    try {
      const response = await axios.put(`${API_URL}/users/${userId}`, userData);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Erreur lors de la mise à jour de l\'utilisateur');
      }
      throw error;
    }
  }

  async deleteUser(userId: string) {
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
}

export const userService = new UserService(); 