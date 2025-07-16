import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, GeoJSON, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { 
    MapPinIcon, 
    PlusIcon, 
    TrashIcon, 
    EyeIcon,
    ClockIcon,
    UserIcon,
    WifiIcon,
    ExclamationTriangleIcon,
    XMarkIcon,
    MapIcon,
    FireIcon
} from '@heroicons/react/24/outline';
import { useAssoStore } from '../../store/assoStore';
import { useAuthStore } from '../../store/authStore';
import { geoService, GeoPoint, TravelTimes, RouteResponse } from '../../services/geoService';
import { Input } from '../../components/common/input/input';
import { Select } from '../../components/common/select/select';
import { useToast } from '../../hooks/useToast';
import Toast from '../../components/common/toast/Toast';
import RouteInfoModal from '../../components/common/modal/RouteInfoModal';
import HeatmapLayer from '../../components/common/map/HeatmapLayer';
import MapNavbar from '../../components/map/MapNavbar';
import AddPointModal from '../../components/map/AddPointModal';
import { Event, CreateEventDto } from '../../types/planning/event';
import { planningService } from '../../services/planningService';
import { useTranslation } from 'react-i18next';
import { getModuleApiUrl } from '../../config/api';

// Fix for default marker icons
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// Icônes personnalisées pour différents types de points
const createCustomIcon = (color: string) => L.divIcon({
    html: `<div style="background-color: ${color}; width: 25px; height: 25px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
    iconSize: [25, 25],
    iconAnchor: [12, 12],
    className: 'custom-marker'
});

const defaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = defaultIcon;

// Composant pour gérer les clics sur la carte
function MapClickHandler({ onMapClick, isAddingPoint, onMapClickForRoute, isCreatingRoute }: { 
    onMapClick: (lat: number, lng: number) => void, 
    isAddingPoint: boolean,
    onMapClickForRoute: (lat: number, lng: number) => void,
    isCreatingRoute: boolean
}) {
    useMapEvents({
        click: (e) => {
            if (isAddingPoint) {
                onMapClick(e.latlng.lat, e.latlng.lng);
            } else if (isCreatingRoute) {
                onMapClickForRoute(e.latlng.lat, e.latlng.lng);
            }
        }
    });
    return null;
}

// Composant pour centrer la carte
function SetViewOnLoad({ coords }: { coords: [number, number] }) {
    const map = useMapEvents({});
    React.useEffect(() => {
        map.setView(coords, 13);
    }, [map, coords]);
    return null;
}

// Composant pour afficher manuellement les routes sans utiliser GeoJSON
const RouteRenderer: React.FC<{
    geoJsonData: any,
    color: string,
    routeId: string,
    opacity?: number
}> = ({geoJsonData, color, routeId, opacity = 0.8}) => {
    const [hasError, setHasError] = React.useState(false);
    
    if (hasError || !geoJsonData || !geoJsonData.features) {
        return null;
    }
    
    try {
        return (
            <>
                {geoJsonData.features.map((feature: any, featureIndex: number) => {
                    if (feature.geometry && feature.geometry.type === 'LineString' && feature.geometry.coordinates) {
                        // Convertir les coordonnées [lng, lat] en [lat, lng] pour Leaflet
                        const positions = feature.geometry.coordinates.map((coord: number[]) => [coord[1], coord[0]]);
                        
                        return (
                            <Polyline
                                key={`${routeId}-${featureIndex}`}
                                positions={positions}
                                color={color}
                                weight={4}
                                opacity={opacity}
                            >
                                {feature.properties && feature.properties.summary && (
                                    <Popup>
                                        <div className="p-2">
                                            <h4 className="font-semibold">
                                                {routeId === 'example-route' ? 'Route d\'exemple' : 'Informations de route'}
                                            </h4>
                                            <p>Distance: {feature.properties.summary.distance} m</p>
                                            <p>Durée: {feature.properties.summary.duration} s</p>
                                        </div>
                                    </Popup>
                                )}
                            </Polyline>
                        );
                    }
                    return null;
                })}
            </>
        );
    } catch (error) {
        console.error('Erreur dans RouteRenderer:', error);
        setHasError(true);
        return null;
    }
};

const Plan: React.FC = () => {
    const { selectedAssociation } = useAssoStore();
    const { user } = useAuthStore();
    const { toasts, removeToast, toast } = useToast();
    const { t } = useTranslation();

    const t_map = (key: string): string => {
        return t(`map.${key}` as any);
    };
    
    // États
    const [geoPoints, setGeoPoints] = useState<GeoPoint[]>([]);
    const [isAddingPoint, setIsAddingPoint] = useState(false);
    const [newPointNotes, setNewPointNotes] = useState('');
    const [selectedPoint, setSelectedPoint] = useState<GeoPoint | null>(null);
    const [showPointModal, setShowPointModal] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [loading, setLoading] = useState(true);
    const [daysFilter, setDaysFilter] = useState(7);
    
    // États pour l'itinéraire
    const [showRouteModal, setShowRouteModal] = useState(false);
    const [routeInfo, setRouteInfo] = useState<TravelTimes | null>(null);
    const [routeLoading, setRouteLoading] = useState(false);
    const [userPosition, setUserPosition] = useState<{ lat: number; lng: number } | null>(null);
    const [selectedPointForRoute, setSelectedPointForRoute] = useState<GeoPoint | null>(null);
    
    // États pour la heatmap
    const [showHeatmap, setShowHeatmap] = useState(false);
    
    // États pour les routes d'événements
    const [events, setEvents] = useState<Event[]>([]);
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
    const [routes, setRoutes] = useState<RouteResponse[]>([]);
    const [isCreatingRoute, setIsCreatingRoute] = useState(false);
    const [selectedRoutePoint, setSelectedRoutePoint] = useState<{ lat: number; lng: number } | null>(null);
    const [showRouteCreationModal, setShowRouteCreationModal] = useState(false);
    const [showRouteConfirmationModal, setShowRouteConfirmationModal] = useState(false);
    const [routesDisabled, setRoutesDisabled] = useState(false);
    
    // États pour la recherche d'adresse et le rayon
    const [selectedRouteAddress, setSelectedRouteAddress] = useState<any>(null);
    const [radiusKm, setRadiusKm] = useState(10);
    
    // États pour les itinéraires existants
    const [itineraries, setItineraries] = useState<any[]>([]);
    const [loadingItineraries, setLoadingItineraries] = useState(false);
    const [selectedItinerary, setSelectedItinerary] = useState<string | null>(null);
    
    // États pour l'autocomplétion d'adresse (même logique qu'AddPointModal)
    const [addressQuery, setAddressQuery] = useState('');
    const [addressSuggestions, setAddressSuggestions] = useState<any[]>([]);
    const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
    const [showAddressSuggestions, setShowAddressSuggestions] = useState(false);
    const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout | null>(null);
    const [selectionMode, setSelectionMode] = useState<'map' | 'address'>('map');
    
    // Position par défaut (Paris)
    const [mapCenter] = useState<[number, number]>([48.8566, 2.3522]);
    
    // Référence connexion temps réel
    const connectionRef = useRef<{ close: () => void } | null>(null);

    const { sidebarCollapsed } = useAssoStore();
    const sidebarWidth = sidebarCollapsed ? '56px' : '192px';

    // Ajoute les états pour la suppression d'itinéraire
    const [showDeleteItineraryModal, setShowDeleteItineraryModal] = useState(false);
    const [itineraryToDelete, setItineraryToDelete] = useState<any>(null);
    const [deletingItinerary, setDeletingItinerary] = useState(false);

    // Obtenir la position de l'utilisateur au chargement
    useEffect(() => {
        const getUserPosition = async () => {
            try {
                const position = await geoService.getCurrentPosition();
                setUserPosition({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                });
                // Afficher la notification après un délai pour éviter la superposition
                setTimeout(() => {
                    toast.success('Position utilisateur détectée');
                }, 500);
            } catch (error) {
                console.error('Erreur géolocalisation:', error);
                // Délai pour éviter la superposition avec autres notifications
                setTimeout(() => {
                    toast.error('Impossible d\'obtenir votre position. Autorisez la géolocalisation pour voir les itinéraires.');
                }, 300);
            }
        };

        getUserPosition();
    }, []);

    // Charger les points existants
    useEffect(() => {
        const loadGeoPoints = async () => {
            if (!selectedAssociation?.id) return;
            
            try {
                setLoading(true);
                const points = await geoService.getGeoPoints(selectedAssociation.id, daysFilter);
                setGeoPoints(points);
            } catch (error) {
                console.error('Erreur lors du chargement des points:', error);
                // Délai pour éviter la superposition avec autres notifications
                setTimeout(() => {
                    toast.error('Erreur lors du chargement des points de géolocalisation');
                }, 800);
            } finally {
                setLoading(false);
            }
        };

        loadGeoPoints();
    }, [selectedAssociation?.id, daysFilter]);

    // Connexion WebSocket pour les mises à jour en temps réel
    useEffect(() => {
        if (!selectedAssociation?.id) return;

        const connectLiveUpdates = async () => {
            try {
                connectionRef.current = await geoService.createLiveConnection(
                    selectedAssociation.id,
                    (data) => {
                        console.log('Nouvelle donnée reçue:', data);
                        if (data.type === 'new_point') {
                            setGeoPoints(prev => [...prev, data.point]);
                            toast.success('Nouveau point ajouté en temps réel !');
                        } else if (data.type === 'point_updated') {
                            setGeoPoints(prev => prev.map(p => p.id === data.point.id ? data.point : p));
                        }
                    },
                    (error) => {
                        console.error('Erreur connexion temps réel:', error);
                        setIsConnected(false);
                        toast.error('Connexion temps réel interrompue');
                    }
                );

                // Simulation des événements WebSocket
                setIsConnected(true);
                // Afficher la notification après un délai pour éviter la superposition avec la géolocalisation
                setTimeout(() => {
                    toast.success('Surveillance temps réel activée');
                }, 1200);

            } catch (error) {
                console.error('Erreur lors de la connexion temps réel:', error);
                setIsConnected(false);
                // Délai pour éviter la superposition avec autres notifications
                setTimeout(() => {
                    toast.error(`Erreur temps réel: ${error instanceof Error ? error.message : 'Connexion impossible'}`);
                }, 1000);
            }
        };

        connectLiveUpdates();

        return () => {
            if (connectionRef.current) {
                connectionRef.current.close();
                setIsConnected(false);
            }
        };
    }, [selectedAssociation?.id]);

    // Charger les événements de l'association
    useEffect(() => {
        const loadEvents = async () => {
            if (!selectedAssociation?.id) return;
            
            try {
                console.log('🔄 Chargement des événements pour l\'association:', selectedAssociation.id);
                const eventsData = await planningService.getAllEvents(selectedAssociation.id);
                console.log('✅ Événements récupérés:', eventsData);
                setEvents(eventsData);
            } catch (error) {
                console.error('❌ Erreur lors du chargement des événements:', error);
                // Délai pour éviter la superposition avec autres notifications
                setTimeout(() => {
                    toast.error('Erreur lors du chargement des événements');
                }, 1400);
            }
        };

        loadEvents();
    }, [selectedAssociation?.id]);

    // Charger les itinéraires existants
    useEffect(() => {
        const loadItineraries = async () => {
            if (!selectedAssociation?.id) return;
            
            try {
                setLoadingItineraries(true);
                console.log('🔄 Chargement des itinéraires pour l\'association:', selectedAssociation.id);
                
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error('Token d\'authentification non trouvé');
                }
                
                const itinerariesData = await geoService.getItineraries(selectedAssociation.id);
                console.log('✅ Itinéraires récupérés:', itinerariesData);
                console.log('📊 Structure des données:', {
                    type: typeof itinerariesData,
                    isArray: Array.isArray(itinerariesData),
                    length: Array.isArray(itinerariesData) ? itinerariesData.length : 'N/A',
                    sample: Array.isArray(itinerariesData) && itinerariesData.length > 0 ? itinerariesData[0] : 'Aucun échantillon'
                });
                
                // Vérifier que les itinéraires appartiennent à l'association
                if (Array.isArray(itinerariesData)) {
                    const filteredItineraries = itinerariesData.filter(itinerary => {
                        const belongsToAssociation = itinerary.associationId === selectedAssociation.id;
                        if (!belongsToAssociation) {
                            console.warn('⚠️ Itinéraire ignoré - associationId différent:', {
                                itineraryId: itinerary.id,
                                itineraryAssociationId: itinerary.associationId,
                                currentAssociationId: selectedAssociation.id
                            });
                        }
                        return belongsToAssociation;
                    });
                    
                    console.log('🔍 Filtrage par association:', {
                        total: itinerariesData.length,
                        filtered: filteredItineraries.length,
                        associationId: selectedAssociation.id
                    });
                    
                    setItineraries(filteredItineraries);
                } else {
                    console.warn('⚠️ Les données ne sont pas un tableau:', itinerariesData);
                    setItineraries([]);
                }
            } catch (error) {
                console.error('❌ Erreur lors du chargement des itinéraires:', error);
                // Délai pour éviter la superposition avec autres notifications
                setTimeout(() => {
                    toast.error('Erreur lors du chargement des itinéraires');
                }, 1600);
            } finally {
                setLoadingItineraries(false);
            }
        };

        loadItineraries();
    }, [selectedAssociation?.id]);

    // Fonction pour calculer l'itinéraire vers un point
    const handleShowRoute = async (point: GeoPoint) => {
        if (!userPosition) {
            // Ce toast n'est pas au chargement mais lors d'une action utilisateur, pas de délai nécessaire
            toast.error('Position utilisateur non disponible. Autorisez la géolocalisation.');
            return;
        }

        setSelectedPointForRoute(point);
        setShowRouteModal(true);
        setRouteLoading(true);
        setRouteInfo(null);

        try {
            const travelTimes = await geoService.calculateTravelTimes(
                userPosition.lat,
                userPosition.lng,
                point.latitude,
                point.longitude
            );
            setRouteInfo(travelTimes);
        } catch (error) {
            console.error('Erreur calcul itinéraire:', error);
            toast.error('Erreur lors du calcul de l\'itinéraire');
        } finally {
            setRouteLoading(false);
        }
    };

    // Gérer le clic sur la carte pour ajouter un point
    const handleMapClick = (lat: number, lng: number) => {
        if (!isAddingPoint || !selectedAssociation?.id) return;
        
        setSelectedPoint({
            associationId: selectedAssociation.id,
            latitude: lat,
            longitude: lng,
            notes: newPointNotes
        });
        setShowPointModal(true);
    };

    // Gérer le clic sur la carte pour créer une route
    const handleMapClickForRoute = (lat: number, lng: number) => {
        console.log('🎯 handleMapClickForRoute appelé avec:', { lat, lng });
        console.log('🔍 États actuels:', { 
            isCreatingRoute, 
            selectedEvent: selectedEvent?.title, 
            selectionMode 
        });
        
        if (!isCreatingRoute || !selectedEvent || selectionMode !== 'map') {
            console.log('❌ Conditions non remplies:', { 
                isCreatingRoute, 
                hasSelectedEvent: !!selectedEvent, 
                selectionMode 
            });
            return;
        }
        
        console.log('✅ Conditions remplies, sélection du point');
        setSelectedRoutePoint({ lat, lng });
        setShowRouteConfirmationModal(true); // Réafficher le modal de confirmation
        setIsCreatingRoute(false); // Arrêter le mode création
        
        console.log('🎉 Modal de confirmation activé');
    };

    // Ajouter un nouveau point
    const handleAddPoint = async () => {
        if (!selectedPoint || !selectedAssociation?.id) return;

        try {
            const pointToAdd = {
                associationId: selectedAssociation.id,
                latitude: selectedPoint.latitude,
                longitude: selectedPoint.longitude,
                notes: newPointNotes || 'Point sans description'
            };

            await geoService.addGeoPoint(pointToAdd);
            
            // Recharger les points
            const updatedPoints = await geoService.getGeoPoints(selectedAssociation.id, daysFilter);
            setGeoPoints(updatedPoints);
            
            toast.success('Point ajouté avec succès !');
            setIsAddingPoint(false);
            setNewPointNotes('');
            setShowPointModal(false);
            setSelectedPoint(null);
        } catch (error) {
            console.error('Erreur lors de l\'ajout du point:', error);
            toast.error('Erreur lors de l\'ajout du point');
        }
    };

    // Obtenir la couleur d'un point selon son âge
    const getPointColor = (timestamp?: string) => {
        if (!timestamp) return '#6B7280'; // Gris par défaut
        
        const pointDate = new Date(timestamp);
        const now = new Date();
        const hoursDiff = (now.getTime() - pointDate.getTime()) / (1000 * 60 * 60);
        
        if (hoursDiff < 1) return '#EF4444'; // Rouge - très récent
        if (hoursDiff < 6) return '#F97316'; // Orange - récent
        if (hoursDiff < 24) return '#EAB308'; // Jaune - aujourd'hui
        return '#6B7280'; // Gris - ancien
    };

    // Formater la date
    const formatDate = (timestamp?: string, observedAt?: string) => {
        // Utiliser observedAt en priorité, sinon timestamp
        const dateString = observedAt || timestamp;
        if (!dateString) return 'Date inconnue';
        
        // Le serveur envoie les dates en UTC, on les affiche directement en heure locale
        const date = new Date(dateString);
        return date.toLocaleString('fr-FR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'Europe/Paris'
        });
    };



    // Créer une route pour un événement
    const handleCreateRoute = async () => {
        console.log('🚀 handleCreateRoute appelé');
        
        // Vérifier qu'on a soit une adresse soit un point sélectionné
        const hasAddress = selectedRouteAddress && selectedRouteAddress.geometry;
        const hasPoint = selectedRoutePoint;
        
        if (!selectedEvent || !selectedAssociation?.id || (!hasAddress && !hasPoint)) {
            console.log('❌ Données manquantes pour créer la route');
            toast.error(t_map('select_event_and_address'));
            return;
        }

        try {
            console.log('✅ Données complètes, début de création');
            
            // Utiliser l'adresse si disponible, sinon le point sélectionné
            let centerLat, centerLng;
            if (hasAddress) {
                centerLat = selectedRouteAddress.geometry.coordinates[1];
                centerLng = selectedRouteAddress.geometry.coordinates[0];
            } else {
                centerLat = selectedRoutePoint!.lat;
                centerLng = selectedRoutePoint!.lng;
            }
            
            const routeData = {
                associationId: selectedAssociation.id,
                eventId: selectedEvent.id,
                centerLat,
                centerLng,
                radiusKm, // Utiliser le rayon du slider
                startLat: centerLat,
                startLng: centerLng
            };

            console.log('🔄 Création de route avec les données:', routeData);
            console.log('📋 Événement sélectionné:', selectedEvent);
            console.log('📍 Position sélectionnée:', { centerLat, centerLng });
            console.log('🎯 Rayon:', radiusKm, 'km');

            const newRoute = await geoService.createRoute(routeData);
            console.log('✅ Route créée avec succès:', newRoute);
            setRoutes(prev => [...prev, newRoute]);
            toast.success(t_map('route_created_success'));
            
            // Réinitialiser les états
            setSelectedEvent(null);
            setSelectedRoutePoint(null);
            setSelectedRouteAddress(null);
            setAddressQuery('');
            setRadiusKm(10);
            setShowRouteCreationModal(false);
            setShowRouteConfirmationModal(false);
            
        } catch (error: any) {
            console.error('❌ Erreur lors de la création de la route:', error);
            
            // Gestion spécifique du cas "aucun point d'intérêt"
            if (error.response?.status === 404 || error.message?.includes('point')) {
                toast.error(`${t_map('no_points_in_radius')} ${radiusKm}km. ${t_map('increase_radius_or_change_address')}.`);
            } else {
                toast.error(t_map('route_creation_error'));
            }
        }
    };

    // Parser le GeoJSON d'une route
    const parseRouteGeoJson = (geoJsonString: string) => {
        try {
            console.log('🔄 Parsing GeoJSON:', geoJsonString);
            
            // Vérifier que la chaîne n'est pas vide
            if (!geoJsonString || geoJsonString.trim() === '') {
                console.warn('⚠️ GeoJSON vide ou null');
                return null;
            }
            
            const parsed = JSON.parse(geoJsonString);
            console.log('✅ GeoJSON parsé:', parsed);
            
            // Si le GeoJSON n'a pas de type mais a des features, on ajoute le type
            if (!parsed.type && parsed.features) {
                console.log('🔧 Ajout du type FeatureCollection au GeoJSON (auto-correction)');
                parsed.type = 'FeatureCollection';
            }
            
            // Vérifier que c'est un GeoJSON valide
            if (!parsed.type || !parsed.features) {
                console.warn('⚠️ GeoJSON invalide - manque type ou features:', parsed);
                return null;
            }
            
            // Vérifier que chaque feature a une géométrie valide
            if (parsed.features && Array.isArray(parsed.features)) {
                for (let i = 0; i < parsed.features.length; i++) {
                    const feature = parsed.features[i];
                    if (!feature.geometry || !feature.geometry.type || !feature.geometry.coordinates) {
                        console.warn(`⚠️ Feature ${i} invalide:`, feature);
                        return null;
                    }
                    
                    // Vérifier que les coordonnées sont des nombres
                    if (feature.geometry.coordinates && Array.isArray(feature.geometry.coordinates)) {
                        const coords = feature.geometry.coordinates;
                        if (coords.length > 0 && Array.isArray(coords[0])) {
                            // Pour LineString, vérifier chaque point
                            for (let j = 0; j < coords.length; j++) {
                                const point = coords[j];
                                if (!Array.isArray(point) || point.length < 2 || 
                                    typeof point[0] !== 'number' || typeof point[1] !== 'number') {
                                    console.warn(`⚠️ Coordonnées invalides dans feature ${i}, point ${j}:`, point);
                                    return null;
                                }
                            }
                        } else if (coords.length >= 2) {
                            // Pour Point, vérifier les coordonnées
                            if (typeof coords[0] !== 'number' || typeof coords[1] !== 'number') {
                                console.warn(`⚠️ Coordonnées invalides dans feature ${i}:`, coords);
                                return null;
                            }
                        }
                    }
                }
            }
            
            console.log('✅ GeoJSON final validé:', parsed);
            return parsed;
        } catch (error) {
            console.error('❌ Erreur lors du parsing du GeoJSON:', error);
            console.error('📄 Contenu du GeoJSON:', geoJsonString);
            return null;
        }
    };

    // Fonction d'autocomplétion d'adresse avec debounce (même logique qu'AddPointModal)
    const searchAddresses = async (query: string) => {
        if (!query || query.trim().length < 3) {
            setAddressSuggestions([]);
            setShowAddressSuggestions(false);
            return;
        }

        try {
            setIsLoadingAddresses(true);
            console.log('🔍 Recherche d\'adresses pour:', query);
            
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Token d\'authentification manquant');
            }

            const GEO_API_URL = getModuleApiUrl('geo');
            const response = await fetch(`${GEO_API_URL}/autocomplete?text=${encodeURIComponent(query)}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Erreur lors de la recherche d\'adresses');
            }

            const data = await response.json();
            
            if (data.features && Array.isArray(data.features)) {
                console.log('✅ Suggestions trouvées:', data.features.length);
                setAddressSuggestions(data.features.slice(0, 5)); // Limiter à 5 suggestions
                setShowAddressSuggestions(true);
            } else {
                console.log('⚠️ Aucune suggestion trouvée');
                setAddressSuggestions([]);
                setShowAddressSuggestions(false);
            }
        } catch (error) {
            console.error('❌ Erreur lors de la recherche d\'adresses:', error);
            setAddressSuggestions([]);
            setShowAddressSuggestions(false);
        } finally {
            setIsLoadingAddresses(false);
        }
    };

    // Fonction pour gérer la saisie d'adresse avec debounce (même logique qu'AddPointModal)
    const handleAddressInput = (value: string) => {
        setAddressQuery(value);
        setSelectedRouteAddress(null);
        
        // Annuler le timeout précédent
        if (debounceTimeout) {
            clearTimeout(debounceTimeout);
        }
        
        // Créer un nouveau timeout (debounce de 500ms)
        const timeout = setTimeout(() => {
            searchAddresses(value);
        }, 500);
        
        setDebounceTimeout(timeout);
    };

    // Fonction pour sélectionner une adresse (même logique qu'AddPointModal)
    const handleAddressSelect = (suggestion: any) => {
        setAddressQuery(suggestion.properties.formatted);
        setSelectedRouteAddress(suggestion);
        setShowAddressSuggestions(false);
        setAddressSuggestions([]);
        
        // Mettre à jour les coordonnées pour la création de route
        const lat = suggestion.properties.lat;
        const lng = suggestion.properties.lon;
        
        if (lat && lng) {
            setSelectedRoutePoint({ lat, lng });
        }
    };

    // Ajoute la fonction de suppression d'itinéraire
    const handleDeleteItinerary = async () => {
        if (!itineraryToDelete || !selectedAssociation?.id) return;
        setDeletingItinerary(true);
        try {
            await geoService.deleteItinerary(itineraryToDelete.id);
            toast.success('Itinéraire supprimé avec succès');
            setShowDeleteItineraryModal(false);
            setItineraryToDelete(null);
            // Recharge la liste
            const data = await geoService.getItineraries(selectedAssociation.id);
            setItineraries(data.filter((it: any) => it.associationId === selectedAssociation.id));
        } catch (error) {
            toast.error('Erreur lors de la suppression de l\'itinéraire');
        } finally {
            setDeletingItinerary(false);
        }
    };

    return (
        <div className="h-full bg-gradient-to-br from-orange-50/30 via-blue-50/30 to-orange-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            {/* Navbar Carte, style StockNavbar */}
            <MapNavbar
                isConnected={isConnected}
                showHeatmap={showHeatmap}
                onToggleHeatmap={() => setShowHeatmap(!showHeatmap)}
                onAddPoint={() => {
                    setIsAddingPoint(true);
                    setShowPointModal(true);
                    setSelectedPoint(null);
                    setNewPointNotes('');
                }}
                daysFilter={daysFilter}
                onDaysFilterChange={setDaysFilter}
                onCreateRoute={() => {
                    if (events.length === 0) {
                        toast.error('Aucun événement disponible. Vérifiez que les événements sont bien chargés depuis le service Planning.');
                        return;
                    }
                    setShowRouteCreationModal(true);
                    setSelectedEvent(null);
                    setSelectedRoutePoint(null);
                }}
                eventsCount={events.length}
            />
            {/* Main content scrolls under the navbar, with correct padding */}
            <div className="pt-16" />

            <div className="flex h-[calc(100vh-140px)]">
                {/* Carte */}
                <div className="flex-1 relative">
                    {loading ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
                                <p className="text-gray-600 dark:text-gray-400">Chargement de la carte...</p>
                            </div>
                        </div>
                    ) : (
                        <MapContainer
                            style={{ height: '100%', width: '100%' }}
                            scrollWheelZoom={true}
                            className="z-0"
                        >
                            <SetViewOnLoad coords={mapCenter} />
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            
                            <MapClickHandler onMapClick={handleMapClick} isAddingPoint={isAddingPoint} onMapClickForRoute={handleMapClickForRoute} isCreatingRoute={isCreatingRoute} />
                            
                            {/* Affichage de la heatmap */}
                            {showHeatmap && geoPoints.length > 0 && (
                                <HeatmapLayer 
                                    points={geoPoints}
                                    options={{
                                        radius: 30,
                                        blur: 20,
                                        maxZoom: 17,
                                        max: 2.0,
                                        minOpacity: 0.3
                                    }}
                                />
                            )}
                            
                            {/* Affichage des points existants (masqués si heatmap active) */}
                            {!showHeatmap && geoPoints.map((point, index) => (
                                <Marker
                                    key={point.id || index}
                                    position={[point.latitude, point.longitude]}
                                    icon={createCustomIcon(getPointColor(point.observedAt || point.timestamp))}
                                >
                                    <Popup>
                                        <div className="p-2 min-w-[200px]">
                                            <h3 className="font-semibold text-gray-900 mb-2">
                                                {point.name || 'Point de géolocalisation'}
                                            </h3>
                                            {point.address && (
                                                <p className="text-xs text-gray-500 mb-2">
                                                    📍 {point.address}
                                                </p>
                                            )}
                                            <p className="text-sm text-gray-600 mb-2">{point.notes}</p>
                                            <div className="text-xs text-gray-500 dark:text-gray-500 mb-3">
                                                <div>{formatDate(point.timestamp, point.observedAt)}</div>
                                                <div className="mt-1">
                                                    {point.latitude.toFixed(4)}, {point.longitude.toFixed(4)}
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleShowRoute(point)}
                                                className="w-full flex items-center justify-center space-x-2 px-2 py-1 bg-gradient-to-r from-orange-500 to-blue-500 hover:from-orange-600 hover:to-blue-600 text-white text-xs rounded transition-all"
                                            >
                                                <MapIcon className="w-3 h-3" />
                                                <span>Itinéraire</span>
                                            </button>
                                        </div>
                                    </Popup>
                                </Marker>
                            ))}

                            {/* Affichage des routes d'événements */}
                            {!routesDisabled && routes.map((route, index) => {
                                console.log(`🔍 Traitement de la route ${index}:`, route.id);
                                console.log(`📄 GeoJSON brut:`, route.geoJson);
                                
                                const geoJsonData = parseRouteGeoJson(route.geoJson);
                                console.log(`✅ GeoJSON parsé pour route ${index}:`, geoJsonData);
                                
                                const isValidGeoJson = geoJsonData && geoJsonData.type === 'FeatureCollection' && Array.isArray(geoJsonData.features) && geoJsonData.features.length > 0;
                                console.log(`✅ Validation GeoJSON route ${index}:`, isValidGeoJson);
                                
                                // Si le GeoJSON est invalide, désactiver toutes les routes
                                if (geoJsonData && !isValidGeoJson) {
                                    console.error(`❌ GeoJSON invalide détecté pour la route ${route.id}, désactivation des routes`);
                                    setRoutesDisabled(true);
                                    return null;
                                }
                                
                                return (
                                    <React.Fragment key={route.id || index}>
                                        {/* Marker pour le point de départ de la route */}
                                        <Marker
                                            position={[route.startLat, route.startLng]}
                                            icon={createCustomIcon(route.id === 'example-route' ? '#10B981' : '#3B82F6')} // Vert pour l'exemple, bleu pour les vraies routes
                                        >
                                            <Popup>
                                                <div className="p-2 min-w-[200px]">
                                                    <h3 className="font-semibold text-gray-900 mb-2">
                                                        {route.id === 'example-route' ? 'Route d\'exemple' : 'Point de départ'}
                                                    </h3>
                                                    <div className="text-xs text-gray-500 space-y-1 mb-3">
                                                        <div className="text-xs text-gray-400">
                                                            Lat: {route.startLat.toFixed(6)}, Lng: {route.startLng.toFixed(6)}
                                                        </div>
                                                        <div className="text-xs text-gray-400">
                                                            Distance: {route.distanceKm} km
                                                        </div>
                                                        <div className="text-xs text-gray-400">
                                                            Durée: {route.durationMinutes} min
                                                        </div>
                                                    </div>
                                                    <a
                                                        href={route.googleMapsUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg transition-all"
                                                    >
                                                        <MapIcon className="w-4 h-4" />
                                                        <span>Voir sur Google Maps</span>
                                                    </a>
                                                </div>
                                            </Popup>
                                        </Marker>
                                        
                                        {/* Affichage du GeoJSON de la route avec protection d'erreur */}
                                        {geoJsonData && isValidGeoJson && (
                                            <RouteRenderer
                                                key={`route-renderer-${route.id}-${index}`}
                                                geoJsonData={geoJsonData}
                                                color={route.id === 'example-route' ? '#10B981' : '#3B82F6'}
                                                routeId={route.id}
                                            />
                                        )}
                                    </React.Fragment>
                                );
                            })}
                            
                            {/* Affichage des itinéraires existants */}
                            {itineraries.map((itinerary, index) => {
                                console.log(`🗺️ Traitement de l'itinéraire ${index}:`, itinerary.id, 'Association:', itinerary.associationId);
                                
                                const geoJsonData = parseRouteGeoJson(itinerary.geoJson);
                                console.log(`✅ GeoJSON parsé pour itinéraire ${index}:`, geoJsonData);
                                
                                const isValidGeoJson = geoJsonData && geoJsonData.type === 'FeatureCollection' && Array.isArray(geoJsonData.features) && geoJsonData.features.length > 0;
                                console.log(`✅ Validation GeoJSON itinéraire ${index}:`, isValidGeoJson);
                                
                                const isSelected = selectedItinerary === itinerary.id;
                                const markerColor = isSelected ? '#FF6B6B' : '#8B5CF6'; // Rouge si sélectionné, violet sinon
                                const routeColor = isSelected ? '#FF6B6B' : '#8B5CF6';
                                const opacity = isSelected ? 1.0 : 0.6; // Plus opaque si sélectionné
                                
                                return (
                                    <React.Fragment key={`itinerary-${itinerary.id || index}`}>
                                        {/* Marker pour le point de départ de l'itinéraire */}
                                        <Marker
                                            position={[itinerary.startLat, itinerary.startLng]}
                                            icon={createCustomIcon(markerColor)}
                                        >
                                            <Popup>
                                                <div className="p-2 min-w-[200px]">
                                                    <h3 className="font-semibold text-gray-900 mb-2">
                                                        Itinéraire #{index + 1}
                                                    </h3>
                                                    <div className="text-xs text-gray-500 space-y-1 mb-3">
                                                        <div className="text-xs text-gray-400">
                                                            Lat: {itinerary.startLat.toFixed(6)}, Lng: {itinerary.startLng.toFixed(6)}
                                                        </div>
                                                        {itinerary.associationId && (
                                                            <div className="text-xs text-gray-400">
                                                                Association: {itinerary.associationId}
                                                            </div>
                                                        )}
                                                        {itinerary.distanceKm && (
                                                            <div className="text-xs text-gray-400">
                                                                Distance: {itinerary.distanceKm} km
                                                            </div>
                                                        )}
                                                        {itinerary.durationMinutes && (
                                                            <div className="text-xs text-gray-400">
                                                                Durée: {itinerary.durationMinutes} min
                                                            </div>
                                                        )}
                                                    </div>
                                                    {itinerary.googleMapsUrl && (
                                                        <a
                                                            href={itinerary.googleMapsUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-purple-500 hover:bg-purple-600 text-white text-sm rounded-lg transition-all"
                                                        >
                                                            <MapIcon className="w-4 h-4" />
                                                            <span>Voir sur Google Maps</span>
                                                        </a>
                                                    )}
                                                    <button onClick={e => { e.stopPropagation(); setItineraryToDelete(itinerary); setShowDeleteItineraryModal(true); }}
                                                        className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 rounded transition-colors ml-2"
                                                        title="Supprimer l'itinéraire">
                                                        <TrashIcon className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </Popup>
                                        </Marker>
                                        
                                        {/* Affichage du GeoJSON de l'itinéraire */}
                                        {geoJsonData && isValidGeoJson && (
                                            <RouteRenderer
                                                key={`itinerary-renderer-${itinerary.id}-${index}`}
                                                geoJsonData={geoJsonData}
                                                color={routeColor}
                                                routeId={`itinerary-${itinerary.id}`}
                                                opacity={opacity}
                                            />
                                        )}
                                    </React.Fragment>
                                );
                            })}
                            
                            {/* Message si les routes sont désactivées */}
                            {routesDisabled && (
                                <div style={{
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    backgroundColor: 'rgba(255, 0, 0, 0.9)',
                                    color: 'white',
                                    padding: '15px',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    zIndex: 1000,
                                    textAlign: 'center'
                                }}>
                                    <div style={{marginBottom: '10px'}}>
                                        ⚠️ Affichage des routes désactivé
                                    </div>
                                    <div style={{fontSize: '12px', marginBottom: '10px'}}>
                                        Un GeoJSON invalide a été détecté
                                    </div>
                                    <button
                                        onClick={() => setRoutesDisabled(false)}
                                        style={{
                                            backgroundColor: 'white',
                                            color: 'red',
                                            border: 'none',
                                            padding: '5px 10px',
                                            borderRadius: '4px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Réactiver
                                    </button>
                                </div>
                            )}
                        </MapContainer>
                    )}
                </div>

                {/* Panneau latéral */}
                <div className="w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col">
                    {/* En-tête du panneau */}
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            Points d'interet
                        </h2>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            {geoPoints.length} point{geoPoints.length !== 1 ? 's' : ''} trouvé{geoPoints.length !== 1 ? 's' : ''}
                        </div>
                    </div>

                  

                    {/* Liste des points */}
                    <div className="flex-1 overflow-y-auto max-h-80">
                        {geoPoints.length === 0 ? (
                            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                                <MapPinIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                <p>Aucun point de géolocalisation</p>
                                <p className="text-xs mt-1">Ajoutez un point en cliquant sur la carte</p>
                            </div>
                        ) : (
                            <div className="p-4 space-y-3">
                                {geoPoints.map((point, index) => (
                                    <div
                                        key={point.id || index}
                                        className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center mb-2">
                                                    <div 
                                                        className="w-3 h-3 rounded-full mr-2"
                                                        style={{ backgroundColor: getPointColor(point.observedAt || point.timestamp) }}
                                                    ></div>
                                                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {point.name || `Point #${index + 1}`}
                                                    </h4>
                                                </div>
                                                {point.address && (
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                                                        📍 {point.address}
                                                    </p>
                                                )}
                                                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                                                    {point.notes || 'Aucune description'}
                                                </p>
                                                <div className="text-xs text-gray-500 dark:text-gray-500 mb-3">
                                                    <div>{formatDate(point.timestamp, point.observedAt)}</div>
                                                    <div className="mt-1">
                                                        {point.latitude.toFixed(4)}, {point.longitude.toFixed(4)}
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleShowRoute(point)}
                                                    className="w-full flex items-center justify-center space-x-2 px-2 py-1 bg-gradient-to-r from-orange-500 to-blue-500 hover:from-orange-600 hover:to-blue-600 text-white text-xs rounded transition-all"
                                                >
                                                    <MapIcon className="w-3 h-3" />
                                                    <span>Itinéraire</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Section des itinéraires existants */}
                    <div className="border-t border-gray-200 dark:border-gray-700">
                        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                Itinéraires existants
                            </h2>
                            <div className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                                {loadingItineraries ? (
                                    <div className="flex items-center space-x-2">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-500"></div>
                                        <span>Chargement...</span>
                                    </div>
                                ) : (
                                    `${itineraries.length} itinéraire${itineraries.length !== 1 ? 's' : ''} trouvé${itineraries.length !== 1 ? 's' : ''}`
                                )}
                            </div>
                            
                            {/* Liste des itinéraires */}
                            <div className="max-h-64 overflow-y-auto">
                                <div className="p-4 space-y-3">
                                    {itineraries.length === 0 ? (
                                        <div className="text-center text-gray-500 dark:text-gray-400">
                                            <MapIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                            <p className="text-sm">Aucun itinéraire</p>
                                        </div>
                                    ) : (
                                        itineraries.map((itinerary, index) => {
                                            const isSelected = selectedItinerary === itinerary.id;
                                            return (
                                            <div
                                                key={itinerary.id || index}
                                                className={`p-3 border rounded-lg cursor-pointer transition-all ${
                                                    isSelected 
                                                        ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20' 
                                                        : 'border-purple-200 dark:border-purple-700 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30'
                                                }`}
                                                onClick={() => setSelectedItinerary(isSelected ? null : itinerary.id)}
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center mb-2">
                                                            <div className={`w-3 h-3 rounded-full mr-2 ${
                                                                isSelected ? 'bg-red-500' : 'bg-purple-500'
                                                            }`}></div>
                                                            <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                                                                Itinéraire #{index + 1}
                                                                {isSelected && <span className="ml-2 text-xs text-red-600 dark:text-red-400">(Sélectionné)</span>}
                                                            </h4>
                                                        </div>
                                                        <div className="text-xs text-gray-500 dark:text-gray-500 mb-3">
                                                            {itinerary.distanceKm && (
                                                                <div>Distance: {itinerary.distanceKm} km</div>
                                                            )}
                                                            {itinerary.durationMinutes && (
                                                                <div>Durée: {itinerary.durationMinutes} min</div>
                                                            )}
                                                            <div className="mt-1">
                                                                {itinerary.startLat.toFixed(4)}, {itinerary.startLng.toFixed(4)}
                                                            </div>
                                                        </div>
                                                        {itinerary.googleMapsUrl && (
                                                            <a
                                                                href={itinerary.googleMapsUrl}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="w-full flex items-center justify-center space-x-2 px-2 py-1 bg-purple-500 hover:bg-purple-600 text-white text-xs rounded transition-all"
                                                            >
                                                                <MapIcon className="w-3 h-3" />
                                                                <span>Google Maps</span>
                                                            </a>
                                                        )}
                                                    </div>
                                                    <button onClick={e => { e.stopPropagation(); setItineraryToDelete(itinerary); setShowDeleteItineraryModal(true); }}
                                                        className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 rounded transition-colors ml-2"
                                                        title="Supprimer l'itinéraire">
                                                        <TrashIcon className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                        })
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal d'ajout de point */}
            <AddPointModal
                isOpen={showPointModal}
                onClose={() => {
                    setShowPointModal(false);
                    setSelectedPoint(null);
                    setIsAddingPoint(false);
                }}
                onPointAdded={() => {
                    // Recharger les points après ajout
                    if (selectedAssociation?.id) {
                        geoService.getGeoPoints(selectedAssociation.id, daysFilter)
                            .then(setGeoPoints)
                            .catch(console.error);
                    }
                }}
                initialLat={selectedPoint?.latitude}
                initialLng={selectedPoint?.longitude}
            />

            {/* Modal de création de route */}
            {showRouteCreationModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-[500px] max-w-[90vw] mx-4 max-h-[80vh] overflow-y-auto">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            {t_map('create_route')}
                        </h3>
                        
                        <div className="space-y-4 mb-6">
                            {/* Sélection d'événement */}
                            <div>
                                <Select
                                    value={selectedEvent?.id || ''}
                                    onChange={(e) => {
                                        const event = events.find(ev => ev.id === e.target.value);
                                        setSelectedEvent(event || null);
                                    }}
                                    placeholder={t_map('choose_event')}
                                    className="w-full"
                                >
                                    {events.map((event) => (
                                        <option key={event.id} value={event.id}>
                                            {event.title} - {new Date(event.beginningDate).toLocaleDateString()}
                                        </option>
                                    ))}
                                </Select>
                            </div>
                            
                            {/* Recherche d'adresse */}
                            {selectedEvent && (
                                <div className="relative">
                                    <Input
                                        type="text"
                                        placeholder={t_map('address_departure')}
                                        value={addressQuery}
                                        onChange={(e) => handleAddressInput(e.target.value)}
                                        onBlur={() => setTimeout(() => setShowAddressSuggestions(false), 100)}
                                        onFocus={() => searchAddresses(addressQuery)}
                                        className="w-full pr-10"
                                    />
                                    {isLoadingAddresses && (
                                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                                        </div>
                                    )}
                                    {showAddressSuggestions && addressSuggestions.length > 0 && (
                                        <div
                                            className="absolute left-0 z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-48 overflow-y-auto"
                                            style={{ minWidth: '100%' }}
                                        >
                                            {addressSuggestions.map((suggestion, index) => (
                                                <button
                                                    key={index}
                                                    type="button"
                                                    onClick={() => handleAddressSelect(suggestion)}
                                                    className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 border-b border-gray-100 dark:border-gray-600 last:border-b-0"
                                                >
                                                    {suggestion.properties.formatted}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                            
                            {/* Slider de rayon */}
                            {selectedEvent && selectedRouteAddress && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        {t_map('search_radius')}: <span className="font-bold text-blue-600">{radiusKm} {t_map('radius_km')}</span>
                                    </label>
                                    <input
                                        type="range"
                                        min="1"
                                        max="50"
                                        value={radiusKm}
                                        onChange={(e) => setRadiusKm(parseInt(e.target.value))}
                                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                                        style={{
                                            background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(radiusKm / 50) * 100}%, #e5e7eb ${(radiusKm / 50) * 100}%, #e5e7eb 100%)`
                                        }}
                                    />
                                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        <span>1 km</span>
                                        <span>25 km</span>
                                        <span>50 km</span>
                                    </div>
                                </div>
                            )}
                            
                            {/* Affichage de l'événement sélectionné */}
                            {selectedEvent && (
                                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
                                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                                        {t_map('event_selected')}
                                    </h4>
                                    <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                                        <div><strong>Titre:</strong> {selectedEvent.title}</div>
                                        <div><strong>Date:</strong> {new Date(selectedEvent.beginningDate).toLocaleDateString()}</div>
                                        <div><strong>Heure:</strong> {new Date(selectedEvent.beginningDate).toLocaleTimeString()} - {new Date(selectedEvent.endDate).toLocaleTimeString()}</div>
                                        {selectedEvent.location && (
                                            <div><strong>Lieu:</strong> {selectedEvent.location}</div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Affichage de l'adresse sélectionnée */}
                            {selectedRouteAddress && (
                                <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
                                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                                        {t_map('departure_address')}
                                    </h4>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                        <div>{selectedRouteAddress.properties.label}</div>
                                        <div className="text-xs mt-1">
                                            {t_map('coordinates')}: {selectedRouteAddress.geometry.coordinates[1].toFixed(6)}, {selectedRouteAddress.geometry.coordinates[0].toFixed(6)}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex space-x-3">
                            {selectedEvent && selectedRouteAddress ? (
                                <>
                                    <button
                                        onClick={handleCreateRoute}
                                        className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-4 py-2 rounded-lg font-medium transition-all"
                                    >
                                        {t_map('create_route_button')}
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowRouteCreationModal(false);
                                            setSelectedEvent(null);
                                            setSelectedRouteAddress(null);
                                            setAddressQuery('');
                                            setRadiusKm(10);
                                        }}
                                        className="flex-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                                    >
                                        {t_map('cancel')}
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={() => {
                                        setShowRouteCreationModal(false);
                                        setSelectedEvent(null);
                                        setSelectedRouteAddress(null);
                                        setAddressQuery('');
                                        setRadiusKm(10);
                                    }}
                                    className="w-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                                >
                                    {t_map('close')}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}



            {/* Modal d'itinéraire */}
            {selectedPointForRoute && (
                <RouteInfoModal
                    isOpen={showRouteModal}
                    onClose={() => {
                        setShowRouteModal(false);
                        setSelectedPointForRoute(null);
                        setRouteInfo(null);
                    }}
                    pointName={selectedPointForRoute.notes || `Point de géolocalisation`}
                    coordinates={{
                        lat: selectedPointForRoute.latitude,
                        lng: selectedPointForRoute.longitude
                    }}
                    travelTimes={routeInfo}
                    isLoading={routeLoading}
                    userPosition={userPosition}
                />
            )}

            {/* Toasts */}
            <div className="fixed top-4 right-4 z-50 space-y-2">
                {toasts.map((toast) => (
                    <Toast
                        key={toast.id}
                        message={toast.message}
                        type={toast.type}
                        onClose={() => removeToast(toast.id)}
                    />
                ))}
            </div>

            {showDeleteItineraryModal && itineraryToDelete && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96 max-w-md mx-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Supprimer l'itinéraire
                        </h3>
                        <p className="text-gray-700 dark:text-gray-300 mb-6">
                            Êtes-vous sûr de vouloir supprimer cet itinéraire ? Cette action est irréversible.
                        </p>
                        <div className="flex space-x-3">
                            <button
                                onClick={() => setShowDeleteItineraryModal(false)}
                                disabled={deletingItinerary}
                                className="flex-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleDeleteItinerary}
                                disabled={deletingItinerary}
                                className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-600 transition-all"
                            >
                                {deletingItinerary ? 'Suppression...' : 'Confirmer'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Plan;