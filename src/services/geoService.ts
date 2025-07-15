import axios from 'axios';
import { tokenManager } from './tokenManager';
import { getModuleApiUrl, getModuleBaseUrl } from '../config/api';

const GEO_API_URL = getModuleApiUrl('geo');
const GEO_BASE_URL = getModuleBaseUrl('geo');

// Instance API spécifique pour la géolocalisation (port 8084)
const geoApi = axios.create({
    baseURL: GEO_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true
});

// Intercepteur pour ajouter le token d'authentification
geoApi.interceptors.request.use(async (config) => {
    try {
        const token = await tokenManager.ensureValidToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    } catch (error) {
        console.error('Erreur lors de la vérification du token:', error);
    }
    return config;
});

// Intercepteur pour gérer les erreurs
geoApi.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            console.log('❌ Erreur 401 détectée dans geoService...');
            try {
                const newToken = await tokenManager.refreshToken();
                if (newToken && error.config) {
                    error.config.headers.Authorization = `Bearer ${newToken}`;
                    return geoApi.request(error.config);
                }
            } catch (refreshError) {
                console.error('❌ Impossible de refresh le token:', refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export interface GeoPoint {
    id?: string;
    geoStoreId?: string;
    name?: string;
    associationId: string;
    latitude: number;
    longitude: number;
    notes: string;
    timestamp?: string;
    observedAt?: string;
    address?: string;
    isActive?: boolean;
    userId?: string;
}

export interface GeoStore {
    associationId: string;
    points?: GeoPoint[];
    lastUpdated?: string;
}

export interface RouteInfo {
    distance: number; // en mètres
    duration: number; // en secondes
    geometry?: any;
}

export interface TravelTimes {
    walking: RouteInfo;
    cycling: RouteInfo;
    driving: RouteInfo;
}

export interface RouteResponse {
    id: string;
    associationId: string;
    eventId: string;
    startLat: number;
    startLng: number;
    centerLat: number;
    centerLng: number;
    radiusKm: number;
    geoJson: string;
    googleMapsUrl: string;
    distanceKm: number;
    durationMinutes: number;
    createdAt: string;
}

export const geoService = {
    // Ajouter un point de géolocalisation
    addGeoPoint: async (geoPoint: Omit<GeoPoint, 'id' | 'timestamp' | 'userId'>): Promise<any> => {
        try {
            const response = await geoApi.post('/geo', geoPoint);
            return response.data;
        } catch (error) {
            console.error('Error adding geo point:', error);
            throw error;
        }
    },

    // Sauvegarder le store de géolocalisation
    saveGeoStore: async (associationId: string): Promise<any> => {
        try {
            const response = await geoApi.post('/geo/store', { associationId });
            return response.data;
        } catch (error) {
            console.error('Error saving geo store:', error);
            throw error;
        }
    },

    // Récupérer les points de géolocalisation pour une association
    getGeoPoints: async (associationId: string, days: number): Promise<GeoPoint[]> => {
        try {
            const response = await geoApi.get(`/geo/${associationId}`, {
                params: { days }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching geo points:', error);
            throw error;
        }
    },

    // Récupérer le store de géolocalisation
    getGeoStore: async (associationId: string): Promise<GeoStore> => {
        try {
            const response = await geoApi.get(`/geo/store/${associationId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching geo store:', error);
            throw error;
        }
    },

    // Créer une connexion WebSocket pour les mises à jour en temps réel
    createLiveConnection: (associationId: string, onMessage: (data: any) => void, onError?: (error: Event) => void): WebSocket => {
        const isProd = import.meta.env.VITE_NODE_ENV === 'production';
        const wsUrl = isProd 
            ? `wss://${import.meta.env.VITE_API_DOMAIN_PROD?.replace('https://', '')}/geo/geo/live?associationId=${associationId}`
            : `ws://localhost:8084/geo/live?associationId=${associationId}`;
        const socket = new WebSocket(wsUrl);
        
        socket.onopen = () => {
            console.log('WebSocket connection opened for association:', associationId);
        };

        socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                onMessage(data);
            } catch (error) {
                console.error('Error parsing WebSocket message:', error);
            }
        };

        socket.onerror = (error) => {
            console.error('WebSocket error:', error);
            if (onError) {
                onError(error);
            }
        };

        socket.onclose = () => {
            console.log('WebSocket connection closed for association:', associationId);
        };

        return socket;
    },

    // Obtenir la position actuelle de l'utilisateur
    getCurrentPosition: (): Promise<GeolocationPosition> => {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Géolocalisation non supportée par ce navigateur'));
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve(position);
                },
                (error) => {
                    let message = 'Erreur de géolocalisation';
                    switch (error.code) {
                        case error.PERMISSION_DENIED:
                            message = 'Permission de géolocalisation refusée';
                            break;
                        case error.POSITION_UNAVAILABLE:
                            message = 'Position non disponible';
                            break;
                        case error.TIMEOUT:
                            message = 'Délai de géolocalisation dépassé';
                            break;
                    }
                    reject(new Error(message));
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 300000 // 5 minutes
                }
            );
        });
    },

    // Calculer les temps de trajet entre deux points
    calculateTravelTimes: async (fromLat: number, fromLng: number, toLat: number, toLng: number): Promise<TravelTimes> => {
        try {
            // Utilisation de l'API OSRM (Open Source Routing Machine) gratuite
            const baseUrl = 'https://router.project-osrm.org/route/v1';
            
            const coordinates = `${fromLng},${fromLat};${toLng},${toLat}`;
            
            // Calcul pour la marche
            const walkingResponse = await axios.get(`${baseUrl}/foot/${coordinates}`, {
                params: {
                    overview: 'false',
                    geometries: 'geojson'
                }
            });

            // Calcul pour le vélo
            const cyclingResponse = await axios.get(`${baseUrl}/cycling/${coordinates}`, {
                params: {
                    overview: 'false',
                    geometries: 'geojson'
                }
            });

            // Calcul pour la voiture
            const drivingResponse = await axios.get(`${baseUrl}/driving/${coordinates}`, {
                params: {
                    overview: 'false',
                    geometries: 'geojson'
                }
            });

            return {
                walking: {
                    distance: walkingResponse.data.routes[0]?.distance || 0,
                    duration: walkingResponse.data.routes[0]?.duration || 0,
                    geometry: walkingResponse.data.routes[0]?.geometry
                },
                cycling: {
                    distance: cyclingResponse.data.routes[0]?.distance || 0,
                    duration: cyclingResponse.data.routes[0]?.duration || 0,
                    geometry: cyclingResponse.data.routes[0]?.geometry
                },
                driving: {
                    distance: drivingResponse.data.routes[0]?.distance || 0,
                    duration: drivingResponse.data.routes[0]?.duration || 0,
                    geometry: drivingResponse.data.routes[0]?.geometry
                }
            };
        } catch (error) {
            console.error('Error calculating travel times:', error);
            // Fallback: calcul approximatif basé sur la distance à vol d'oiseau
            const distance = geoService.calculateDistance(fromLat, fromLng, toLat, toLng);
            
            return {
                walking: {
                    distance: distance * 1000,
                    duration: (distance * 1000) / (5000 / 3600) // 5 km/h = 1.39 m/s
                },
                cycling: {
                    distance: distance * 1000,
                    duration: (distance * 1000) / (15000 / 3600) // 15 km/h = 4.17 m/s
                },
                driving: {
                    distance: distance * 1000,
                    duration: (distance * 1000) / (50000 / 3600) // 50 km/h = 13.89 m/s
                }
            };
        }
    },

    // Calculer la distance à vol d'oiseau entre deux points (en km)
    calculateDistance: (lat1: number, lng1: number, lat2: number, lng2: number): number => {
        const R = 6371; // Rayon de la Terre en km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLng = (lng2 - lng1) * Math.PI / 180;
        const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    },

    // Formater la durée en texte lisible
    formatDuration: (seconds: number): string => {
        if (seconds < 60) {
            return `${Math.round(seconds)} sec`;
        } else if (seconds < 3600) {
            const minutes = Math.round(seconds / 60);
            return `${minutes} min`;
        } else {
            const hours = Math.floor(seconds / 3600);
            const minutes = Math.round((seconds % 3600) / 60);
            return minutes > 0 ? `${hours}h ${minutes}min` : `${hours}h`;
        }
    },

    // Formater la distance en texte lisible
    formatDistance: (meters: number): string => {
        if (meters < 1000) {
            return `${Math.round(meters)} m`;
        } else {
            const km = meters / 1000;
            return `${km.toFixed(1)} km`;
        }
    },

    // Créer une route pour un événement
    createRoute: async (routeData: {
        associationId: string;
        eventId: string;
        centerLat: number;
        centerLng: number;
        radiusKm: number;
        startLat: number;
        startLng: number;
    }): Promise<RouteResponse> => {
        try {
            console.log('🔄 Tentative de création de route vers:', `${GEO_API_URL}/itineraries`);
            console.log('📦 Données envoyées:', routeData);
            
            const response = await geoApi.post('/itineraries', routeData);
            console.log('✅ Route créée avec succès:', response.data);
            return response.data;
        } catch (error: any) {
            console.error('❌ Erreur lors de la création de la route:');
            console.error('   - URL:', `${GEO_API_URL}/itineraries`);
            console.error('   - Erreur:', error.message);
            console.error('   - Code:', error.code);
            console.error('   - Status:', error.response?.status);
            console.error('   - Données:', error.response?.data);
            
            if (error.code === 'ERR_NETWORK' || error.code === 'ERR_CONNECTION_REFUSED') {
                throw new Error(`Service géolocalisation non accessible sur ${GEO_API_URL}. Vérifiez que le service est démarré.`);
            }
            
            throw error;
        }
    }
}; 