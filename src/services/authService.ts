import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { LoginResponse, DecodedToken, User } from '../types/auth/auth';


const API_URL = 'http://localhost:8082/api';


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
      const response = await axios.post<LoginResponse>(`${API_URL}/auth`, {
        email,
        password
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  logout: async () => {
    try {
      // Appeler le endpoint de logout
      await axios.post(`${API_URL}/auth/logout`, {}, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${authService.getToken()}`
        }
      });
    } catch (error) {
      // On continue avec le nettoyage local même si l'appel API échoue
    } finally {
      // Supprimer tous les tokens et données utilisateur
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      localStorage.removeItem('asso-storage');
      localStorage.removeItem('auth-storage');
      
      // Supprimer l'intercepteur
      if (authService.interceptorId) {
        axios.interceptors.request.eject(authService.interceptorId);
      }
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

  setToken: (token: string, refreshToken?: string) => {
    try {
      localStorage.setItem('token', token);
      
      // Sauvegarder le refresh token s'il est fourni
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }
      
      // Décoder le token pour extraire les informations utilisateur
      const decoded = jwtDecode<DecodedToken>(token);
      
      // Stocker les informations utilisateur décodées
      const userData = {
        sub: decoded.sub,
        email: decoded.email,
        firstName: decoded.firstName,
        lastName: decoded.lastName,
        userType: decoded.userType
      };
      
      localStorage.setItem('user', JSON.stringify(userData));

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
      // Error silencieuse
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
    try {
      const token = authService.getToken();
      if (!token) return false;
      
      const decoded = jwtDecode<DecodedToken>(token);
      const currentTime = Date.now() / 1000;
      
      const isValid = decoded.exp > currentTime;
      return isValid;
    } catch (error) {
      // Error silencieuse
      return false;
    }
  },

  getDecodedToken: (): DecodedToken | null => {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
      const decoded = jwtDecode<DecodedToken>(token);
      return decoded;
    } catch (error) {
      // Error silencieuse
      return null;
    }
  },

  getUserById: async (uuid: string): Promise<User> => {
      const token = authService.getToken();
    
    if (!token) {
      throw new Error('No authentication token found');
    }

    try {
      const response = await axios.get(`${API_URL}/users/${uuid}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data;
    } catch (error: any) {
      // Error silencieuse
      throw new Error(error.response?.data?.message || 'Failed to fetch user data');
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
  },

  // Fonction pour envoyer une invitation par email
  sendInvitation: async (invitedEmail: string, associationId: string, message?: string): Promise<void> => {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const requestData = {
        invitedEmail,
        associationId,
        message: message || ""
      };

      await axios.post(`${API_URL}/auth/invitation-link/send`, requestData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      console.error('Error sending invitation:', error);
      throw error;
    }
  },

  // Fonction pour décoder le token d'invitation (via appel API au backend)
  decodeInvitationToken: async (token: string): Promise<{ managerFirstName: string; managerLastName: string; associationName: string; associationId: string; invitedEmail: string }> => {
    try {
      console.log('Token reçu:', token);
      console.log('Longueur du token:', token.length);
      
      // Utiliser l'endpoint correct selon le Swagger
      const response = await axios.post(`${API_URL}/auth/invitation-token/validate/${token}`, {}, {
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      console.log('Données décodées par le backend:', response.data);
      
      // Adapter le mapping selon la réponse du backend
      return {
        managerFirstName: response.data.invitedByFirstName || '',
        managerLastName: response.data.invitedByLastname || '',
        associationName: '', // Le backend ne retourne pas le nom de l'association
        associationId: response.data.associationId || '',
        invitedEmail: '' // Le backend ne retourne pas l'email invité
      };
    } catch (error) {
      console.error('Error decoding invitation token via backend:', error);
      console.error('Token problématique:', token);
      throw new Error('Invalid invitation token');
    }
  },

  // Fonction pour réinitialiser le mot de passe
  resetPassword: async (email: string): Promise<{ message: string }> => {
    try {
      const response = await axios.post(`${API_URL}/auth/password-reset/initiate`, {
        email
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de l\'envoi de l\'email de réinitialisation');
    }
  },

  // Fonction pour confirmer la réinitialisation avec le token
  confirmResetPassword: async (token: string, newPassword: string): Promise<{ message: string }> => {
    try {
      const response = await axios.post(`${API_URL}/auth/password-reset/confirm`, {
        token,
        newPassword
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la réinitialisation du mot de passe');
    }
  }
}; 