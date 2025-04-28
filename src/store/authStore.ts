import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Type pour les données utilisateur
type User = {
  email: string;
  name: string;
  avatar?: string;
};

// Interface du store d'authentification
interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  
  // Actions
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

// Création du store avec persistance
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      
      login: async (email: string, password: string) => {
        try {
          // Simuler un appel API
          await new Promise(resolve => setTimeout(resolve, 500));
          console.log('Login attempt:', { email, password });
          
          // Simuler un utilisateur
          // En production, cela viendrait de l'API
          let userName = email.split('@')[0];
          // Mettre la première lettre en majuscule
          userName = userName.charAt(0).toUpperCase() + userName.slice(1);
          
          const userData: User = {
            email,
            name: userName,
            avatar: `https://ui-avatars.com/api/?name=${userName}&background=random`
          };
          
          // Mettre à jour le state
          set({ 
            isAuthenticated: true,
            user: userData
          });
          
          return true;
        } catch (error) {
          console.error('Login error:', error);
          return false;
        }
      },
      
      logout: () => {
        set({ 
          isAuthenticated: false,
          user: null
        });
      }
    }),
    {
      name: 'auth-storage', // nom utilisé pour le localStorage
    }
  )
); 