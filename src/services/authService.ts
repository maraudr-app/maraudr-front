import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const API_URL = 'http://localhost:8082';

interface LoginResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

interface DecodedToken {
  sub: string;
  email: string;
  firstName: string;
  lastName: string;
  exp: number;
}

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

interface User {
  role: number;
  team: any[];
  id: string;
  firstname: string;
  lastname: string;
  createdAt: string;
  lastLoggedIn: string;
  isActive: boolean;
  contactInfo: ContactInfo;
  address: Address;
  passwordHash: string;
  biography: string | null;
  languages: number[];
}

export const authService = {
  login: async (email: string, password: string): Promise<{ accessToken: string; user: User }> => {
    try {
      console.log('Sending login request to:', `${API_URL}/auth/login`);
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
      });
      console.log('Login response:', response);
      console.log('Response data:', response.data);
      
      if (!response.data || !response.data.accessToken) {
        throw new Error('Invalid response format: missing accessToken');
      }

      // Vérifier que le token peut être décodé
      let decoded: DecodedToken;
      try {
        decoded = jwtDecode<DecodedToken>(response.data.accessToken);
        console.log('Decoded token:', decoded);
      } catch (decodeError) {
        console.error('Error decoding token:', decodeError);
        throw new Error('Invalid token format');
      }

      // Sauvegarder le token et configurer l'intercepteur
      authService.setToken(response.data.accessToken);

      // Récupérer les informations complètes de l'utilisateur
      const userData = await authService.getUserById(decoded.sub);
      console.log('User data retrieved:', userData);
      
      return {
        accessToken: response.data.accessToken,
        user: userData
      };
    } catch (error) {
      console.error('Login error:', error);
      if (axios.isAxiosError(error)) {
        console.error('Response data:', error.response?.data);
        console.error('Response status:', error.response?.status);
      }
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Supprimer l'intercepteur
    axios.interceptors.request.eject(authService.interceptorId);
  },

  getToken: (): string | null => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode<DecodedToken>(token);
        console.log('Current token decoded:', decoded);
        return token;
      } catch (error) {
        console.error('Error decoding stored token:', error);
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
      const response = await axios.get(`${API_URL}/users/${uuid}`);
      return response.data;
    } catch (error) {
      console.error('Error getting user by ID:', error);
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