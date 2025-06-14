import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService } from '../services/authService';
import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
  sub: string;
  email: string;
  firstName: string;
  lastName: string;
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
  avatar?: string;
};

// Interface du store d'authentification
interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  
  // Actions
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  fetchUser: () => Promise<void>;  // Nouvelle fonction
}

// Création du store avec persistance
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      
      login: async (email: string, password: string) => {
        try {
          const response = await authService.login(email, password);
          console.log('Login response in store:', response);
          
          if (response && response.accessToken) {
            // Décoder le token immédiatement
            const decodedToken = jwtDecode<DecodedToken>(response.accessToken);
            console.log('Decoded token in store:', decodedToken);
            
            if (decodedToken) {
              const userData: User = {
                email: decodedToken.email,
                sub: decodedToken.sub,  // sub est l'UUID de l'utilisateur
                firstName: decodedToken.firstName,
                lastName: decodedToken.lastName,
                avatar: `https://ui-avatars.com/api/?name=${decodedToken.firstName}+${decodedToken.lastName}&background=random`
              };
              
              // Sauvegarder le token
              authService.setToken(response.accessToken);
              
              // Mettre à jour le state
              set({ 
                isAuthenticated: true,
                user: userData
              });
              
              return true;
            }
          }
          return false;
        } catch (error) {
          console.error('Login error in store:', error);
          return false;
        }
      },
      
      logout: () => {
        // Effacer le token et les données d'authentification
        authService.logout();
        
        // Effacer tous les stores du localStorage
        localStorage.removeItem('auth-storage');  // Store d'authentification
        localStorage.removeItem('asso-storage');  // Store des associations
        localStorage.removeItem('token');         // Token JWT
        localStorage.removeItem('user');          // Données utilisateur
        localStorage.removeItem('rememberMeEmail'); // Email mémorisé
        
        // Réinitialiser le state
        set({ 
          isAuthenticated: false,
          user: null
        });
      },

      // Nouvelle fonction pour récupérer les données utilisateur
      fetchUser: async () => {
        try {
          const currentUser = useAuthStore.getState().user;
          if (!currentUser || !currentUser.sub) {
            console.error('No user ID found in store');
            return;
          }

          const userData = await authService.getUserById(currentUser.sub);
          
          // Mettre à jour le state avec les nouvelles données
          set({
            user: {
              ...currentUser,
              firstName: userData.firstname,
              lastName: userData.lastname,
              // On garde l'avatar existant ou on en crée un nouveau
              avatar: currentUser.avatar || `https://ui-avatars.com/api/?name=${userData.firstname}+${userData.lastname}&background=random`
            }
          });
        } catch (error) {
          console.error('Error fetching user data:', error);
          // En cas d'erreur, on ne modifie pas le state
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user
      })
    }
  )
); 