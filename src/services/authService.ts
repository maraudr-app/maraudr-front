import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { LoginResponse, DecodedToken, User } from '../types/auth/auth';

const API_URL = 'http://localhost:8082';

interface ContactInfo {
  email: string;
  phoneNumber: string;
}

interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export const authService = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    try {
      const response = await axios.post<LoginResponse>(`${API_URL}/auth/login`, {
        email,
        password
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Supprimer l'intercepteur
    if (authService.interceptorId) {
      axios.interceptors.request.eject(authService.interceptorId);
    }
  },

  getToken: (): string | null => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode<DecodedToken>(token);
        return token;
      } catch (error) {
        localStorage.removeItem('token');
        return null;
      }
    }
    return null;
  },

  interceptorId: 0,

  setToken: (token: string) => {
    try {
      const decoded = jwtDecode<DecodedToken>(token);
      console.log('Setting token, decoded:', decoded);
      localStorage.setItem('token', token);

      // Supprimer l'ancien intercepteur s'il existe
      if (authService.interceptorId) {
        axios.interceptors.request.eject(authService.interceptorId);
      }

      // Configurer le nouvel intercepteur
      authService.interceptorId = axios.interceptors.request.use(
        (config) => {
          config.headers.Authorization = `Bearer ${token}`;
          return config;
        },
        (error) => {
          return Promise.reject(error);
        }
      );
    } catch (error) {
      console.error('Error setting token:', error);
      throw new Error('Invalid token format');
    }
  },

  setUser: (user: User) => {
    localStorage.setItem('user', JSON.stringify(user));
  },

  getUser: (): User | null => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr) as User;
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('user');
        return null;
      }
    }
    return null;
  },

  isAuthenticated: (): boolean => {
    const token = localStorage.getItem('token');
    if (!token) return false;

    try {
      const decoded = jwtDecode<DecodedToken>(token);
      console.log('Checking authentication, token decoded:', decoded);
      const isValid = decoded.exp * 1000 > Date.now();
      console.log('Token is valid:', isValid);
      return isValid;
    } catch (error) {
      console.error('Error checking authentication:', error);
      return false;
    }
  },

  getDecodedToken: (): DecodedToken | null => {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
      const decoded = jwtDecode<DecodedToken>(token);
      console.log('Getting decoded token:', decoded);
      return decoded;
    } catch (error) {
      console.error('Error getting decoded token:', error);
      return null;
    }
  },

  getUserById: async (uuid: string): Promise<User> => {
    try {
      console.log('Fetching user with UUID:', uuid);
      const token = authService.getToken();
      console.log('Token being used:', token ? 'Present' : 'Missing');
      
      const response = await axios.get(`${API_URL}/users/${uuid}`, {
        withCredentials: true,
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined
        }
      });
      console.log('Response headers:', response.headers);
      console.log('Response status:', response.status);
      return response.data;
    } catch (error) {
      console.error('Error getting user by ID:', error);
      if (axios.isAxiosError(error)) {
        console.error('Error response:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          headers: error.response?.headers
        });
      }
      throw error;
    }
  },

  // Nouvelle fonction pour mettre à jour le profil
  updateProfile: async (userData: Partial<User>): Promise<User> => {
    try {
      const user = authService.getUser();
      if (!user) {
        throw new Error('No user found');
      }

      const response = await axios.put(`${API_URL}/users/${user.id}`, userData);
      const updatedUser = response.data;
      
      // Mettre à jour le user dans le localStorage
      authService.setUser(updatedUser);
      
      return updatedUser;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }
}; 