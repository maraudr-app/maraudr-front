import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService } from '../services/authService';
import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
  sub: string;
  email: string;
  firstName: string;
  lastName: string;
  userType: string;
  exp: number;
  iat: number;
  nbf: number;
  jti: string;
  iss: string;
  aud: string;
}

// Type pour les données utilisateur
type User = {
  email: string;
  sub: string;  // sub est l'UUID de l'utilisateur
  firstName?: string;
  lastName?: string;
  userType?: string;
  avatar?: string;
};

// Interface du store d'authentification
interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  
  // Actions
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  fetchUser: () => Promise<void>;
  setToken: (token: string | null) => void;
}

const getAvatarUrl = (firstName?: string, lastName?: string) => {
  if (firstName && lastName) {
    const firstInitial = firstName.trim().charAt(0).toUpperCase();
    const lastInitial = lastName.trim().charAt(0).toUpperCase();
    return `https://ui-avatars.com/api/?name=${firstInitial}${lastInitial}&background=random`;
  }
  return '';
};

// Création du store avec persistance
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      token: null,
      
      login: async (email: string, password: string) => {
        try {
          const response = await authService.login(email, password);
          
          if (response && response.accessToken) {
            // Décoder le token immédiatement
            const decodedToken = jwtDecode<DecodedToken>(response.accessToken);
            
            if (decodedToken) {
             
              const userData: User = {
                email: decodedToken.email,
                sub: decodedToken.sub,  // sub est l'UUID de l'utilisateur
                firstName: decodedToken.firstName,
                lastName: decodedToken.lastName,
                userType: decodedToken.userType,
                avatar: getAvatarUrl(decodedToken.firstName, decodedToken.lastName)
              };
            
              // Sauvegarder le token et le refresh token s'il est fourni
              authService.setToken(response.accessToken, response.refreshToken);
              
              // Mettre à jour le state
              set({ 
                isAuthenticated: true,
                user: userData,
                token: response.accessToken
              });
              
              return true;
            }
          }
          return false;
        } catch (error: any) {
          // Propager l'erreur au lieu de retourner false
          throw error;
        }
      },
      
      logout: async () => {
        // Appeler le service de logout
        await authService.logout();
        
        // Supprimer spécifiquement les stores Zustand
        localStorage.removeItem('asso-storage');
        localStorage.removeItem('auth-storage');
        localStorage.clear();
        
        // Réinitialiser le state
        set({ 
          isAuthenticated: false,
          user: null,
          token: null
        });
      },

      // Nouvelle fonction pour récupérer les données utilisateur
      fetchUser: async () => {
        try {
          const currentUser = useAuthStore.getState().user;
          if (!currentUser || !currentUser.sub) {
            return;
          }

          const userData = await authService.getUserById(currentUser.sub);
          
          // Mettre à jour le state avec les nouvelles données
          set({
            user: {
              ...currentUser,
              firstName: userData.firstname,
              lastName: userData.lastname,
              userType: (userData as any).userType || currentUser.userType,
              // On garde l'avatar existant ou on en crée un nouveau
              avatar: currentUser.avatar || getAvatarUrl(userData.firstname, userData.lastname)
            }
          });
        } catch (error) {
          // En cas d'erreur, on ne modifie pas le state
        }
      },

      setToken: (token: string | null) => {
        set({ token });
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        token: state.token
      })
    }
  )
); 