import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, GeoJSON } from 'react-leaflet';
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
import { useToast } from '../../hooks/useToast';
import Toast from '../../components/common/toast/Toast';
import RouteInfoModal from '../../components/common/modal/RouteInfoModal';
import HeatmapLayer from '../../components/common/map/HeatmapLayer';
import { Event } from '../../types/planning/event';
import { planningService } from '../../services/planningService';

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

const Plan: React.FC = () => {
    const { selectedAssociation } = useAssoStore();
    const { user } = useAuthStore();
    const { toasts, removeToast, toast } = useToast();
    
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
    
    // Route d'exemple pour tester l'affichage
    const [exampleRoute] = useState<RouteResponse>({
        id: 'example-route',
        associationId: '894979cd-bb2e-479a-a633-64be60f45079',
        eventId: '3830d4c2-5853-4f7c-a88d-074478f3fccf',
        startLat: 48.8471,
        startLng: 2.3866,
        centerLat: 48.8471,
        centerLng: 2.3866,
        radiusKm: 10,
        geoJson: '{"type":"FeatureCollection","features":[{"type":"Feature","geometry":{"type":"LineString","coordinates":[[2.386576,48.847205],[2.3866,48.8471],[2.4,48.85],[2.41,48.86],[2.42,48.87],[2.43,48.88]]},"properties":{"summary":{"distance":2500.0,"duration":900.0}}}]}',
        googleMapsUrl: 'https://www.google.com/maps/dir/48.8471,2.3866/48.8471,2.3866',
        distanceKm: 2.5,
        durationMinutes: 15,
        createdAt: new Date().toISOString()
    });
    
    // Position par défaut (Paris)
    const [mapCenter] = useState<[number, number]>([48.8566, 2.3522]);
    
    // Référence WebSocket
    const socketRef = useRef<WebSocket | null>(null);

    // Obtenir la position de l'utilisateur au chargement
    useEffect(() => {
        const getUserPosition = async () => {
            try {
                const position = await geoService.getCurrentPosition();
                setUserPosition({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                });
                toast.success('Position utilisateur détectée');
            } catch (error) {
                console.error('Erreur géolocalisation:', error);
                toast.error('Impossible d\'obtenir votre position. Autorisez la géolocalisation pour voir les itinéraires.');
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
                toast.error('Erreur lors du chargement des points de géolocalisation');
            } finally {
                setLoading(false);
            }
        };

        loadGeoPoints();
    }, [selectedAssociation?.id, daysFilter]);

    // Connexion WebSocket pour les mises à jour en temps réel
    useEffect(() => {
        if (!selectedAssociation?.id) return;

        const connectWebSocket = () => {
            try {
                socketRef.current = geoService.createLiveConnection(
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
                        console.error('Erreur WebSocket:', error);
                        setIsConnected(false);
                        toast.error('Connexion temps réel interrompue');
                    }
                );

                socketRef.current.onopen = () => {
                    setIsConnected(true);
                    toast.success('Connexion temps réel établie');
                };

                socketRef.current.onclose = () => {
                    setIsConnected(false);
                };

            } catch (error) {
                console.error('Erreur lors de la connexion WebSocket:', error);
                setIsConnected(false);
            }
        };

        connectWebSocket();

        return () => {
            if (socketRef.current) {
                socketRef.current.close();
            }
        };
    }, [selectedAssociation?.id]);

    // Charger les événements de l'association
    useEffect(() => {
        const loadEvents = async () => {
            if (!selectedAssociation?.id) return;
            
            try {
                const eventsData = await planningService.getAllEvents(selectedAssociation.id);
                setEvents(eventsData);
            } catch (error) {
                console.error('Erreur lors du chargement des événements:', error);
                toast.error('Erreur lors du chargement des événements');
            }
        };

        loadEvents();
    }, [selectedAssociation?.id]);

    // Fonction pour calculer l'itinéraire vers un point
    const handleShowRoute = async (point: GeoPoint) => {
        if (!userPosition) {
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
    const formatDate = (timestamp?: string) => {
        if (!timestamp) return 'Date inconnue';
        return new Date(timestamp).toLocaleString('fr-FR');
    };

    // Gérer le clic sur la carte pour créer une route
    const handleMapClickForRoute = (lat: number, lng: number) => {
        if (!isCreatingRoute || !selectedEvent) return;
        
        setSelectedRoutePoint({ lat, lng });
        setShowRouteCreationModal(true);
    };

    // Créer une route pour un événement
    const handleCreateRoute = async () => {
        if (!selectedEvent || !selectedRoutePoint || !selectedAssociation?.id) return;

        try {
            setIsCreatingRoute(false);
            setShowRouteCreationModal(false);
            
            const routeData = {
                associationId: selectedAssociation.id,
                eventId: selectedEvent.id,
                centerLat: selectedRoutePoint.lat,
                centerLng: selectedRoutePoint.lng,
                radiusKm: 10, // Rayon par défaut de 10km
                startLat: selectedRoutePoint.lat,
                startLng: selectedRoutePoint.lng
            };

            console.log('🔄 Création de route avec les données:', routeData);
            console.log('📋 Événement sélectionné:', selectedEvent);
            console.log('📍 Point sélectionné:', selectedRoutePoint);

            const newRoute = await geoService.createRoute(routeData);
            setRoutes(prev => [...prev, newRoute]);
            toast.success('Route créée avec succès !');
            
            // Réinitialiser les états
            setSelectedEvent(null);
            setSelectedRoutePoint(null);
        } catch (error) {
            console.error('Erreur lors de la création de la route:', error);
            toast.error('Erreur lors de la création de la route');
        }
    };

    // Parser le GeoJSON d'une route
    const parseRouteGeoJson = (geoJsonString: string) => {
        try {
            console.log('🔄 Parsing GeoJSON:', geoJsonString);
            const parsed = JSON.parse(geoJsonString);
            console.log('✅ GeoJSON parsé:', parsed);
            
            // Si le GeoJSON n'a pas de type, on l'ajoute
            if (!parsed.type && parsed.features) {
                console.log('🔧 Ajout du type FeatureCollection au GeoJSON');
                parsed.type = 'FeatureCollection';
            }
            
            // Vérifier que c'est un GeoJSON valide
            if (!parsed.type || !parsed.features) {
                console.warn('⚠️ GeoJSON invalide - manque type ou features:', parsed);
                return null;
            }
            
            console.log('✅ GeoJSON final:', parsed);
            return parsed;
        } catch (error) {
            console.error('❌ Erreur lors du parsing du GeoJSON:', error);
            console.error('📄 Contenu du GeoJSON:', geoJsonString);
            return null;
        }
    };

    return (
        <div className="h-full bg-gradient-to-br from-orange-50/30 via-blue-50/30 to-orange-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            {/* Header */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-orange-200/50 dark:border-gray-700 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-blue-600 bg-clip-text text-transparent flex items-center">
                            <MapPinIcon className="w-6 h-6 mr-3 text-orange-500" />
                            Plan & Géolocalisation
                        </h1>
                        
                        {/* Statut de connexion */}
                        <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
                            isConnected 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                        }`}>
                            <WifiIcon className="w-4 h-4" />
                            <span>{isConnected ? 'Temps réel actif' : 'Hors ligne'}</span>
                        </div>
                    </div>

                    <div className="flex items-center space-x-4">
                        {/* Filtre par jours */}
                        <select
                            value={daysFilter}
                            onChange={(e) => setDaysFilter(parseInt(e.target.value))}
                            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                        >
                            <option value={1}>Aujourd'hui</option>
                            <option value={7}>7 derniers jours</option>
                            <option value={30}>30 derniers jours</option>
                            <option value={90}>3 derniers mois</option>
                        </select>

                        {/* Bouton de heatmap */}
                        <button
                            onClick={() => setShowHeatmap(!showHeatmap)}
                            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
                                showHeatmap
                                    ? 'bg-purple-500 hover:bg-purple-600 text-white'
                                    : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
                            }`}
                        >
                            <FireIcon className="w-4 h-4" />
                            <span>{showHeatmap ? 'Masquer heatmap' : 'Afficher heatmap'}</span>
                        </button>

                        {/* Bouton d'ajout de point */}
                        <button
                            onClick={() => {
                                setIsAddingPoint(!isAddingPoint);
                                setNewPointNotes('');
                            }}
                            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
                                isAddingPoint
                                    ? 'bg-red-500 hover:bg-red-600 text-white'
                                    : 'bg-gradient-to-r from-orange-500 to-blue-500 hover:from-orange-600 hover:to-blue-600 text-white'
                            }`}
                        >
                            {isAddingPoint ? (
                                <>
                                    <XMarkIcon className="w-4 h-4" />
                                    <span>Annuler</span>
                                </>
                            ) : (
                                <>
                                    <PlusIcon className="w-4 h-4" />
                                    <span>Ajouter un point</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Instruction d'ajout */}
                {isAddingPoint && (
                    <div className="mt-4 p-4 bg-orange-100 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                        <div className="flex items-center space-x-2 text-orange-800 dark:text-orange-400 mb-2">
                            <MapPinIcon className="w-5 h-5" />
                            <span className="font-medium">Mode ajout de point activé</span>
                        </div>
                        <p className="text-sm text-orange-700 dark:text-orange-300">
                            Cliquez sur la carte pour placer un nouveau point de géolocalisation.
                        </p>
                        <div className="mt-3">
                            <Input
                                placeholder="Description du point (optionnel)"
                                value={newPointNotes}
                                onChange={(e) => setNewPointNotes(e.target.value)}
                            />
                        </div>
                    </div>
                )}

                {/* Instruction de création de route */}
                {isCreatingRoute && selectedEvent && (
                    <div className="mt-4 p-4 bg-blue-100 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <div className="flex items-center space-x-2 text-blue-800 dark:text-blue-400 mb-2">
                            <MapIcon className="w-5 h-5" />
                            <span className="font-medium">Mode création de route activé</span>
                        </div>
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                            Cliquez sur la carte pour sélectionner le point de départ de la route pour l'événement "{selectedEvent.title}".
                        </p>
                        <button
                            onClick={() => {
                                setIsCreatingRoute(false);
                                setSelectedEvent(null);
                            }}
                            className="mt-3 px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-sm rounded transition-all"
                        >
                            Annuler
                        </button>
                    </div>
                )}
            </div>

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
                                    icon={createCustomIcon(getPointColor(point.timestamp))}
                                >
                                    <Popup>
                                        <div className="p-2 min-w-[200px]">
                                            <h3 className="font-semibold text-gray-900 mb-2">Point de géolocalisation</h3>
                                            <p className="text-sm text-gray-600 mb-2">{point.notes}</p>
                                            <div className="text-xs text-gray-500 space-y-1 mb-3">
                                                <div className="flex items-center">
                                                    <ClockIcon className="w-3 h-3 mr-1" />
                                                    {formatDate(point.timestamp)}
                                                </div>
                                                {point.userId && (
                                                    <div className="flex items-center">
                                                        <UserIcon className="w-3 h-3 mr-1" />
                                                        Utilisateur: {point.userId}
                                                    </div>
                                                )}
                                                <div className="text-xs text-gray-400">
                                                    Lat: {point.latitude.toFixed(6)}, Lng: {point.longitude.toFixed(6)}
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleShowRoute(point)}
                                                className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-gradient-to-r from-orange-500 to-blue-500 hover:from-orange-600 hover:to-blue-600 text-white text-sm rounded-lg transition-all"
                                            >
                                                <MapIcon className="w-4 h-4" />
                                                <span>Voir l'itinéraire</span>
                                            </button>
                                        </div>
                                    </Popup>
                                </Marker>
                            ))}

                            {/* Affichage des routes d'événements */}
                            {[...routes, exampleRoute].map((route, index) => {
                                const geoJsonData = parseRouteGeoJson(route.geoJson);
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
                                        
                                        {/* Affichage du GeoJSON de la route */}
                                        {geoJsonData && geoJsonData.features?.length > 0 && (
                                            <GeoJSON 
                                                data={geoJsonData}
                                                style={{
                                                    color: route.id === 'example-route' ? '#10B981' : '#3B82F6',
                                                    weight: 4,
                                                    opacity: 0.8
                                                }}
                                                onEachFeature={(feature, layer) => {
                                                    if (feature.properties && feature.properties.summary) {
                                                        layer.bindPopup(`
                                                            <div class="p-2">
                                                                <h4 class="font-semibold">${route.id === 'example-route' ? 'Route d\'exemple' : 'Informations de route'}</h4>
                                                                <p>Distance: ${feature.properties.summary.distance} m</p>
                                                                <p>Durée: ${feature.properties.summary.duration} s</p>
                                                            </div>
                                                        `);
                                                    }
                                                }}
                                            />
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </MapContainer>
                    )}
                </div>

                {/* Panneau latéral */}
                <div className="w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col">
                    {/* En-tête du panneau */}
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            Points de géolocalisation
                        </h2>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            {geoPoints.length} point{geoPoints.length !== 1 ? 's' : ''} trouvé{geoPoints.length !== 1 ? 's' : ''}
                        </div>
                    </div>

                    {/* Légende des couleurs */}
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                            {showHeatmap ? 'Heatmap - Densité des points' : 'Légende par âge'}
                        </h3>
                        
                        {showHeatmap ? (
                            <div className="space-y-2 text-xs">
                                <div className="flex items-center">
                                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                                    <span className="text-gray-600 dark:text-gray-400">Faible densité</span>
                                </div>
                                <div className="flex items-center">
                                    <div className="w-3 h-3 bg-cyan-400 rounded-full mr-2"></div>
                                    <span className="text-gray-600 dark:text-gray-400">Densité modérée</span>
                                </div>
                                <div className="flex items-center">
                                    <div className="w-3 h-3 bg-green-400 rounded-full mr-2"></div>
                                    <span className="text-gray-600 dark:text-gray-400">Densité moyenne</span>
                                </div>
                                <div className="flex items-center">
                                    <div className="w-3 h-3 bg-yellow-400 rounded-full mr-2"></div>
                                    <span className="text-gray-600 dark:text-gray-400">Densité élevée</span>
                                </div>
                                <div className="flex items-center">
                                    <div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
                                    <span className="text-gray-600 dark:text-gray-400">Très haute densité</span>
                                </div>
                                <div className="flex items-center">
                                    <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                                    <span className="text-gray-600 dark:text-gray-400">Densité maximale</span>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-2 text-xs">
                                <div className="flex items-center">
                                    <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                                    <span className="text-gray-600 dark:text-gray-400">Moins d'1 heure</span>
                                </div>
                                <div className="flex items-center">
                                    <div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
                                    <span className="text-gray-600 dark:text-gray-400">Moins de 6 heures</span>
                                </div>
                                <div className="flex items-center">
                                    <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                                    <span className="text-gray-600 dark:text-gray-400">Aujourd'hui</span>
                                </div>
                                <div className="flex items-center">
                                    <div className="w-3 h-3 bg-gray-500 rounded-full mr-2"></div>
                                    <span className="text-gray-600 dark:text-gray-400">Plus ancien</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Liste des points */}
                    <div className="flex-1 overflow-y-auto">
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
                                                        style={{ backgroundColor: getPointColor(point.timestamp) }}
                                                    ></div>
                                                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                                                        Point #{index + 1}
                                                    </h4>
                                                </div>
                                                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                                                    {point.notes || 'Aucune description'}
                                                </p>
                                                <div className="text-xs text-gray-500 dark:text-gray-500 mb-3">
                                                    <div>{formatDate(point.timestamp)}</div>
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

                    {/* Section des routes d'événements */}
                    <div className="border-t border-gray-200 dark:border-gray-700">
                        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                Routes d'événements
                            </h2>
                            <div className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                                {routes.length + 1} route{(routes.length + 1) !== 1 ? 's' : ''} créée{(routes.length + 1) !== 1 ? 's' : ''} (incluant l'exemple)
                            </div>
                            
                            {/* Bouton pour créer une nouvelle route */}
                            <button
                                onClick={() => {
                                    if (events.length === 0) {
                                        toast.error('Aucun événement disponible pour créer une route');
                                        return;
                                    }
                                    setShowRouteCreationModal(true);
                                }}
                                className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white text-sm rounded-lg transition-all"
                            >
                                <PlusIcon className="w-4 h-4" />
                                <span>Créer une route</span>
                            </button>
                        </div>

                        {/* Liste des routes */}
                        <div className="max-h-64 overflow-y-auto">
                            <div className="p-4 space-y-3">
                                {/* Route d'exemple */}
                                <div className="p-3 border border-green-200 dark:border-green-700 rounded-lg bg-green-50 dark:bg-green-900/20">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center mb-2">
                                                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                                                <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                                                    Route d'exemple
                                                </h4>
                                            </div>
                                            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                                                Démonstration de l'affichage GeoJSON
                                            </p>
                                            <div className="text-xs text-gray-500 dark:text-gray-500 mb-3">
                                                <div>Distance: {exampleRoute.distanceKm} km</div>
                                                <div>Durée: {exampleRoute.durationMinutes} min</div>
                                                <div className="mt-1">
                                                    {exampleRoute.startLat.toFixed(4)}, {exampleRoute.startLng.toFixed(4)}
                                                </div>
                                            </div>
                                            <a
                                                href={exampleRoute.googleMapsUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="w-full flex items-center justify-center space-x-2 px-2 py-1 bg-green-500 hover:bg-green-600 text-white text-xs rounded transition-all"
                                            >
                                                <MapIcon className="w-3 h-3" />
                                                <span>Google Maps</span>
                                            </a>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Routes créées par l'utilisateur */}
                                {routes.map((route, index) => {
                                    const event = events.find(e => e.id === route.eventId);
                                    return (
                                        <div
                                            key={route.id || index}
                                            className="p-3 border border-blue-200 dark:border-blue-700 rounded-lg bg-blue-50 dark:bg-blue-900/20"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center mb-2">
                                                        <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                                                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                                                            Route #{index + 1}
                                                        </h4>
                                                    </div>
                                                    {event && (
                                                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                                                            Événement: {event.title}
                                                        </p>
                                                    )}
                                                    <div className="text-xs text-gray-500 dark:text-gray-500 mb-3">
                                                        <div>Distance: {route.distanceKm} km</div>
                                                        <div>Durée: {route.durationMinutes} min</div>
                                                        <div className="mt-1">
                                                            {route.startLat.toFixed(4)}, {route.startLng.toFixed(4)}
                                                        </div>
                                                    </div>
                                                    <a
                                                        href={route.googleMapsUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="w-full flex items-center justify-center space-x-2 px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded transition-all"
                                                    >
                                                        <MapIcon className="w-3 h-3" />
                                                        <span>Google Maps</span>
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Statistiques */}
                    <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Statistiques</h3>
                        <div className="grid grid-cols-2 gap-4 text-xs">
                            <div className="text-center">
                                <div className="text-lg font-bold text-orange-600 dark:text-orange-400">
                                    {geoPoints.length}
                                </div>
                                <div className="text-gray-500 dark:text-gray-400">Total points</div>
                            </div>
                            <div className="text-center">
                                <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                                    {geoPoints.filter(p => {
                                        if (!p.timestamp) return false;
                                        const hoursDiff = (new Date().getTime() - new Date(p.timestamp).getTime()) / (1000 * 60 * 60);
                                        return hoursDiff < 24;
                                    }).length}
                                </div>
                                <div className="text-gray-500 dark:text-gray-400">Aujourd'hui</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal de confirmation d'ajout de point */}
            {showPointModal && selectedPoint && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96 max-w-md mx-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Confirmer l'ajout du point
                        </h3>
                        
                        <div className="space-y-4 mb-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Position
                                </label>
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                    Latitude: {selectedPoint.latitude.toFixed(6)}<br/>
                                    Longitude: {selectedPoint.longitude.toFixed(6)}
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Description
                                </label>
                                <Input
                                    placeholder="Description du point"
                                    value={newPointNotes}
                                    onChange={(e) => setNewPointNotes(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex space-x-3">
                            <button
                                onClick={handleAddPoint}
                                className="flex-1 bg-gradient-to-r from-orange-500 to-blue-500 hover:from-orange-600 hover:to-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-all"
                            >
                                Ajouter le point
                            </button>
                            <button
                                onClick={() => {
                                    setShowPointModal(false);
                                    setSelectedPoint(null);
                                    setIsAddingPoint(false);
                                }}
                                className="flex-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                            >
                                Annuler
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de création de route */}
            {showRouteCreationModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96 max-w-md mx-4 max-h-[80vh] overflow-y-auto">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Créer une route d'événement
                        </h3>
                        
                        <div className="space-y-4 mb-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Sélectionner un événement
                                </label>
                                <select
                                    value={selectedEvent?.id || ''}
                                    onChange={(e) => {
                                        const event = events.find(ev => ev.id === e.target.value);
                                        setSelectedEvent(event || null);
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                                >
                                    <option value="">Choisir un événement...</option>
                                    {events.map((event) => (
                                        <option key={event.id} value={event.id}>
                                            {event.title} - {new Date(event.beginningDate).toLocaleDateString()}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            {selectedEvent && (
                                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
                                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                                        Événement sélectionné
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

                            {selectedEvent && (
                                <div className="p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded-lg">
                                    <div className="flex items-center space-x-2 text-orange-800 dark:text-orange-400 mb-2">
                                        <MapPinIcon className="w-5 h-5" />
                                        <span className="font-medium">Étape suivante</span>
                                    </div>
                                    <p className="text-sm text-orange-700 dark:text-orange-300">
                                        Cliquez sur "Commencer" puis sélectionnez un point sur la carte pour créer la route.
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="flex space-x-3">
                            {selectedEvent ? (
                                <>
                                    <button
                                        onClick={() => {
                                            setIsCreatingRoute(true);
                                            setShowRouteCreationModal(false);
                                            toast.success('Cliquez maintenant sur la carte pour sélectionner le point de départ');
                                        }}
                                        className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-4 py-2 rounded-lg font-medium transition-all"
                                    >
                                        Commencer
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowRouteCreationModal(false);
                                            setSelectedEvent(null);
                                        }}
                                        className="flex-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                                    >
                                        Annuler
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={() => {
                                        setShowRouteCreationModal(false);
                                        setSelectedEvent(null);
                                    }}
                                    className="w-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                                >
                                    Fermer
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de confirmation de création de route */}
            {selectedRoutePoint && selectedEvent && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96 max-w-md mx-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Confirmer la création de route
                        </h3>
                        
                        <div className="space-y-4 mb-6">
                            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
                                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                                    Événement
                                </h4>
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                    <div><strong>{selectedEvent.title}</strong></div>
                                    <div>{new Date(selectedEvent.beginningDate).toLocaleDateString()}</div>
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Point de départ sélectionné
                                </label>
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                    Latitude: {selectedRoutePoint.lat.toFixed(6)}<br/>
                                    Longitude: {selectedRoutePoint.lng.toFixed(6)}
                                </div>
                            </div>
                        </div>

                        <div className="flex space-x-3">
                            <button
                                onClick={handleCreateRoute}
                                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-4 py-2 rounded-lg font-medium transition-all"
                            >
                                Créer la route
                            </button>
                            <button
                                onClick={() => {
                                    setSelectedRoutePoint(null);
                                    setSelectedEvent(null);
                                    setIsCreatingRoute(false);
                                }}
                                className="flex-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                            >
                                Annuler
                            </button>
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
        </div>
    );
};

export default Plan;