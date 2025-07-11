import axios from 'axios';
import { tokenManager } from './tokenManager';
import { getModuleApiUrl } from '../config/api';

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
    } catch (error) {
        console.error('Erreur lors de la vérification du token:', error);
        // Continue sans token si erreur
    }
    return config;
});

// Intercepteur pour gérer les erreurs
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            console.log('❌ Erreur 401 détectée, gestion par tokenManager...');
            
            // Laisser le tokenManager gérer l'erreur 401
            try {
                const newToken = await tokenManager.refreshToken();
                
                // Refaire la requête avec le nouveau token
                if (newToken && error.config) {
                    error.config.headers.Authorization = `Bearer ${newToken}`;
                    return api.request(error.config);
                }
            } catch (refreshError) {
                console.error('❌ Impossible de refresh le token:', refreshError);
                // Le tokenManager s'occupe déjà du nettoyage et de la redirection
            }
        }
        return Promise.reject(error);
    }
);