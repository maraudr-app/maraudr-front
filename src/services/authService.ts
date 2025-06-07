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

export const authService = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
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
      try {
        const decoded = jwtDecode<DecodedToken>(response.data.accessToken);
        console.log('Decoded token:', decoded);
      } catch (decodeError) {
        console.error('Error decoding token:', decodeError);
        throw new Error('Invalid token format');
      }
      
      return response.data;
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

  setToken: (token: string) => {
    try {
      const decoded = jwtDecode<DecodedToken>(token);
      console.log('Setting token, decoded:', decoded);
      localStorage.setItem('token', token);
    } catch (error) {
      console.error('Error setting token:', error);
      throw new Error('Invalid token format');
    }
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
  }
}; 