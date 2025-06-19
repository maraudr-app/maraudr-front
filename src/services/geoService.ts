import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const GEO_API_URL = 'http://localhost:8084';

export interface GeoPoint {
    id?: string;
    associationId: string;
    latitude: number;
    longitude: number;
    notes: string;
    timestamp?: string;
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

export const geoService = {
    // Ajouter un point de géolocalisation
    addGeoPoint: async (geoPoint: Omit<GeoPoint, 'id' | 'timestamp' | 'userId'>): Promise<any> => {
        const token = useAuthStore.getState().token;
        if (!token) {
            throw new Error('No authentication token available');
        }

        try {
            const response = await axios.post(`${GEO_API_URL}/geo`, geoPoint, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                withCredentials: true
            });
            return response.data;
        } catch (error) {
            console.error('Error adding geo point:', error);
            throw error;
        }
    },

    // Sauvegarder le store de géolocalisation
    saveGeoStore: async (associationId: string): Promise<any> => {
        const token = useAuthStore.getState().token;
        if (!token) {
            throw new Error('No authentication token available');
        }

        try {
            const response = await axios.post(`${GEO_API_URL}/geo/store`, 
                { associationId }, 
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    withCredentials: true
                }
            );
            return response.data;
        } catch (error) {
            console.error('Error saving geo store:', error);
            throw error;
        }
    },

    // Récupérer les points de géolocalisation pour une association
    getGeoPoints: async (associationId: string, days: number): Promise<GeoPoint[]> => {
        const token = useAuthStore.getState().token;
        if (!token) {
            throw new Error('No authentication token available');
        }

        try {
            const response = await axios.get(`${GEO_API_URL}/geo/${associationId}`, {
                params: { days },
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                withCredentials: true
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching geo points:', error);
            throw error;
        }
    },

    // Récupérer le store de géolocalisation
    getGeoStore: async (associationId: string): Promise<GeoStore> => {
        const token = useAuthStore.getState().token;
        if (!token) {
            throw new Error('No authentication token available');
        }

        try {
            const response = await axios.get(`${GEO_API_URL}/geo/store/${associationId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                withCredentials: true
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching geo store:', error);
            throw error;
        }
    },

    // Créer une connexion WebSocket pour les mises à jour en temps réel
    createLiveConnection: (associationId: string, onMessage: (data: any) => void, onError?: (error: Event) => void): WebSocket => {
        const socket = new WebSocket(`ws://localhost:8084/geo/live?associationId=${associationId}`);
        
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
    }
}; 