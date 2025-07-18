import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { useAuthStore } from '../store/authStore';
import { useAssoStore } from '../store/assoStore';
import { getModuleApiUrl } from '../config/api';

const API_URL = getModuleApiUrl('user');

interface DecodedToken {
  exp: number;
  sub: string;
  email: string;
  firstName: string;
  lastName: string;
  userType: string;
}

interface RefreshTokenResponse {
  accessToken: string;
  refreshToken?: string;
}

class TokenManager {
  private refreshPromise: Promise<string> | null = null;
  private isRefreshing = false;

  // Vérifier si le token va expirer dans les 5 prochaines minutes
  isTokenExpiringSoon(token: string): boolean {
    try {
      const decoded = jwtDecode<DecodedToken>(token);
      const currentTime = Math.floor(Date.now() / 1000);
      const expirationTime = decoded.exp;
      const timeUntilExpiration = expirationTime - currentTime;
      
      // Token expire dans moins de 5 minutes (300 secondes)
      return timeUntilExpiration < 300;
    } catch (error) {

      return true; // Si on ne peut pas décoder, considérer comme expiré
    }
  }

  // Vérifier si le token est expiré
  isTokenExpired(token: string): boolean {
    try {
      const decoded = jwtDecode<DecodedToken>(token);
      const currentTime = Math.floor(Date.now() / 1000);
      return decoded.exp < currentTime;
    } catch (error) {

      return true;
    }
  }

  // Nettoyer complètement le localStorage et les stores
  clearAllUserData(): void {

    
    // Supprimer tous les éléments liés à l'authentification
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('auth-storage');
    localStorage.removeItem('asso-storage');
    
    // Nettoyer complètement si nécessaire
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes('auth') || key.includes('user') || key.includes('asso') || key.includes('token'))) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    // Réinitialiser les stores Zustand
    try {
      useAuthStore.getState().logout();
      useAssoStore.getState().clearAssociations();
    } catch (error) {

    }
    

  }

  // Refresh token
  async refreshToken(): Promise<string> {
    // Si un refresh est déjà en cours, attendre le résultat
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    this.isRefreshing = true;
    
    this.refreshPromise = this.performTokenRefresh();
    
    try {
      const newToken = await this.refreshPromise;
      this.isRefreshing = false;
      this.refreshPromise = null;
      return newToken;
    } catch (error) {
      this.isRefreshing = false;
      this.refreshPromise = null;
      throw error;
    }
  }

  private async performTokenRefresh(): Promise<string> {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      const currentToken = localStorage.getItem('token');

      if (!refreshToken && !currentToken) {
        throw new Error('Aucun token disponible pour le refresh');
      }

      // Essayer avec le refresh token d'abord
      let response: any;
      
      if (refreshToken) {
        try {
          response = await axios.post<RefreshTokenResponse>(`${API_URL}/auth/refresh`, {
            refreshToken: refreshToken
          });
        } catch (refreshError: any) {

          
          // Si le refresh token échoue, essayer avec le token actuel
          if (currentToken && !this.isTokenExpired(currentToken)) {
            response = await axios.post<RefreshTokenResponse>(`${API_URL}/auth/refresh`, {}, {
              headers: { Authorization: `Bearer ${currentToken}` }
            });
          } else {
            throw refreshError;
          }
        }
      } else if (currentToken && !this.isTokenExpired(currentToken)) {
        response = await axios.post<RefreshTokenResponse>(`${API_URL}/auth/refresh`, {}, {
          headers: { Authorization: `Bearer ${currentToken}` }
        });
      } else {
        throw new Error('Tous les tokens sont expirés');
      }

      const { accessToken, refreshToken: newRefreshToken } = response.data;

      if (!accessToken) {
        throw new Error('Nouveau token non reçu');
      }

      // Sauvegarder les nouveaux tokens
      localStorage.setItem('token', accessToken);
      if (newRefreshToken) {
        localStorage.setItem('refreshToken', newRefreshToken);
      }

      // Mettre à jour le store
      useAuthStore.getState().setToken(accessToken);


      return accessToken;

    } catch (error: any) {

      
      // ✅ Ne pas nettoyer/rediriger si on est sur une page d'invitation
      const isInvitationPage = window.location.pathname === '/accept-invitation' || 
                             window.location.pathname.includes('/accept-invitation');
      
      if (!isInvitationPage) {
        // Si le refresh échoue, nettoyer tout et rediriger
        this.clearAllUserData();
        this.redirectToLogin();
      } else {

      }
      
      throw new Error('Session expirée, veuillez vous reconnecter');
    }
  }

  // Redirection vers la page de connexion
  redirectToLogin(): void {

    const isInvitationPage = window.location.pathname === '/accept-invitation' || 
                           window.location.pathname.includes('/accept-invitation');
    
    if (isInvitationPage) {

      return;
    }
    
    // Éviter les redirections en boucle
    if (window.location.pathname !== '/login') {

      window.location.href = '/login';
    }
  }

  // Vérifier et rafraîchir le token si nécessaire
  async ensureValidToken(): Promise<string | null> {
    const currentToken = localStorage.getItem('token');
    
    if (!currentToken) {

      
      // ✅ Ne pas nettoyer/rediriger si on est sur une page d'invitation
      const isInvitationPage = window.location.pathname === '/accept-invitation' || 
                             window.location.pathname.includes('/accept-invitation');
      
      if (!isInvitationPage) {
        this.clearAllUserData();
        this.redirectToLogin();
      } else {

      }
      return null;
    }

    // Si le token est complètement expiré
    if (this.isTokenExpired(currentToken)) {

      try {
        return await this.refreshToken();
      } catch (error) {

        return null;
      }
    }

    // Si le token expire bientôt, le rafraîchir préventivement
    if (this.isTokenExpiringSoon(currentToken)) {

      try {
        return await this.refreshToken();
      } catch (error) {

        return currentToken; // Utiliser le token actuel si le refresh échoue
      }
    }

    return currentToken;
  }

  // Initialiser la vérification automatique
  startTokenMonitoring(): void {
    // Vérifier le token toutes les minutes
    setInterval(async () => {
      const token = localStorage.getItem('token');
      if (token && useAuthStore.getState().isAuthenticated) {
        try {
          await this.ensureValidToken();
        } catch (error) {

        }
      }
    }, 60000); // 60 secondes

  }
}

// Instance singleton
export const tokenManager = new TokenManager(); 