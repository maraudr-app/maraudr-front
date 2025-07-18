import axios from 'axios';
import { tokenManager } from './tokenManager';
import { getModuleApiUrl, debugApiUrls } from '../config/api';

// Debug de la configuration API au démarrage
debugApiUrls();

// Créer une instance axios avec la configuration de base
export const api = axios.create({
    baseURL: getModuleApiUrl('user'), // Utilise le module 'user' par défaut
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true // Ajout de cette ligne pour permettre l'envoi des credentials
});

// Intercepteur pour ajouter le token d'authentification
api.interceptors.request.use(async (config) => {
    try {
        const token = await tokenManager.ensureValidToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        // Log des requêtes PUT (mise à jour utilisateur)
        if (config.method === 'put' && config.url?.includes('/users/')) {

        }
    } catch (error) {

    }
    return config;
});

// Intercepteur pour gérer les erreurs
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {

            
            // Laisser le tokenManager gérer l'erreur 401
            try {
                const newToken = await tokenManager.refreshToken();
                
                // Refaire la requête avec le nouveau token
                if (newToken && error.config) {
                    error.config.headers.Authorization = `Bearer ${newToken}`;
                    return api.request(error.config);
                }
            } catch (refreshError) {
            ;
                // Le tokenManager s'occupe déjà du nettoyage et de la redirection
            }
        }
        return Promise.reject(error);
    }
);