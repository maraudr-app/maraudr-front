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
import { useTranslation } from 'react-i18next';
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
    opacity?: number,
    t_plan: (key: string) => string
}> = ({geoJsonData, color, routeId, opacity = 0.8, t_plan}) => {
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
                            <>
                                {/* Bordure sombre pour meilleur contraste */}
                                <Polyline
                                    key={`${routeId}-${featureIndex}-border`}
                                    positions={positions}
                                    color="#000000"
                                    weight={8}
                                    opacity={opacity * 0.6}
                                />
                                {/* Route principale */}
                                <Polyline
                                    key={`${routeId}-${featureIndex}`}
                                    positions={positions}
                                    color={color}
                                    weight={6}
                                    opacity={opacity}
                                >
                                    {feature.properties && feature.properties.summary && (
                                        <Popup>
                                            <div className="p-2">
                                                <h4 className="font-semibold">
                                                    {routeId === 'example-route' ? t_plan('exampleRoute') : t_plan('routeInformation')}
                                                </h4>
                                                <p>Distance: {feature.properties.summary.distance} m</p>
                                                <p>Durée: {feature.properties.summary.duration} s</p>
                                            </div>
                                        </Popup>
                                    )}
                                </Polyline>
                            </>
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
    const { t } = useTranslation();
    const { selectedAssociation } = useAssoStore();
    const { user } = useAuthStore();
    const { toasts, removeToast, toast } = useToast();
    
    // Fonction de traduction pour la section plan
    const t_plan = (key: string): string => {
        return t(`planning.${key}` as any);
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
    
    // États pour les itinéraires existants
    const [itineraries, setItineraries] = useState<any[]>([]);
    const [loadingItineraries, setLoadingItineraries] = useState(false);
    const [selectedItinerary, setSelectedItinerary] = useState<string | null>(null);
    const [itineraryFilter, setItineraryFilter] = useState<'all' | 'active' | 'archived'>('active');
    
    // État pour gérer le popup ouvert d'un point
    const [openPopupPoint, setOpenPopupPoint] = useState<GeoPoint | null>(null);
    
    // États pour l'activation/désactivation des points
    const [togglingPoints, setTogglingPoints] = useState<Set<string>>(new Set());
    const [togglingClusters, setTogglingClusters] = useState<Set<number>>(new Set());
    
    // États pour l'autocomplétion d'adresse
    const [addressQuery, setAddressQuery] = useState('');
    const [addressSuggestions, setAddressSuggestions] = useState<any[]>([]);
    const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
    const [showAddressSuggestions, setShowAddressSuggestions] = useState(false);
    const [selectedAddress, setSelectedAddress] = useState<any>(null);
    const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout | null>(null);
    const [selectionMode, setSelectionMode] = useState<'map' | 'address'>('address');
    
    // États pour le rayon de recherche
    const [radiusKm, setRadiusKm] = useState(10);
    
    // Position par défaut (Paris)
    const [mapCenter] = useState<[number, number]>([48.8566, 2.3522]);
    
    // Référence WebSocket
    const socketRef = useRef<{ close: () => void } | null>(null);
    
    // Références pour les markers des points
    const markerRefs = useRef<{ [key: string]: any }>({});

    const { sidebarCollapsed } = useAssoStore();
    const sidebarWidth = sidebarCollapsed ? '56px' : '192px';

    // Ajoute les états pour la suppression d'itinéraire
    const [showDeleteItineraryModal, setShowDeleteItineraryModal] = useState(false);
    const [itineraryToDelete, setItineraryToDelete] = useState<any>(null);
    const [deletingItinerary, setDeletingItinerary] = useState(false);

    // Obtenir la position de l'utilisateur au chargement
    useEffect(() => {
        // Réinitialiser l'état des routes au chargement
        setRoutesDisabled(false);
        
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
                toast.error(t_plan('errorLoadingGeoPoints'));
            } finally {
                setLoading(false);
            }
        };

        loadGeoPoints();
    }, [selectedAssociation?.id, daysFilter]);

    // Fonction utilitaire pour filtrer par date basée sur createdAt
    const filterByDate = React.useCallback((items: any[], daysFilter: number) => {
        if (!Array.isArray(items) || items.length === 0) {
            return items;
        }
        
        const now = new Date();
        const cutoffDate = new Date(now.getTime() - (daysFilter * 24 * 60 * 60 * 1000));
        
        console.log('🗓️ Application du filtre temporel basé sur createdAt:', {
            totalItems: items.length,
            daysFilter,
            cutoffDate: cutoffDate.toISOString(),
            now: now.toISOString()
        });
        
        const filtered = items.filter(item => {
            // Se baser uniquement sur createdAt
            if (!item.createdAt) {
                console.log('🚫 Item ignoré - pas de createdAt:', {
                    id: item.id || 'unknown',
                    availableFields: Object.keys(item)
                });
                return false;
            }
            
            const itemDate = new Date(item.createdAt);
            
            // Vérifier que la date est valide
            if (isNaN(itemDate.getTime())) {
                console.log('🚫 Item filtré - createdAt invalide:', {
                    id: item.id || 'unknown',
                    createdAt: item.createdAt
                });
                return false;
            }
            
            // Calculer la différence en millisecondes par rapport à la date courante
            const diffInMs = now.getTime() - itemDate.getTime();
            const diffInDays = diffInMs / (24 * 60 * 60 * 1000);
            
            // L'item est affiché si sa date de création est dans la plage de jours spécifiée
            const isValid = diffInDays >= 0 && diffInDays <= daysFilter;
            
            if (!isValid && item.id) {
                console.log('🚫 Item filtré:', {
                    id: item.id,
                    createdAt: item.createdAt,
                    itemDate: itemDate.toISOString(),
                    cutoffDate: cutoffDate.toISOString(),
                    diffInDays: diffInDays.toFixed(2),
                    daysFilter,
                    reason: diffInDays < 0 ? 'Date future' : 'Trop ancien'
                });
            }
            
            return isValid;
        });
        
        console.log('✅ Résultat du filtrage temporel par createdAt:', {
            avant: items.length,
            après: filtered.length,
            filtrés: items.length - filtered.length
        });
        
        return filtered;
    }, []);

    // Connexion WebSocket pour les mises à jour en temps réel
    useEffect(() => {
        if (!selectedAssociation?.id) return;

        const connectWebSocket = async () => {
            try {
                socketRef.current = await geoService.createLiveConnection(
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

                // Connexion établie avec succès
                setIsConnected(true);
                toast.success('Connexion temps réel établie');

            } catch (error) {
                console.error('Erreur lors de la connexion WebSocket:', error);
                setIsConnected(false);
                toast.error(`Erreur WebSocket: ${error instanceof Error ? error.message : 'Connexion impossible'}`);
            }
        };

        connectWebSocket();

        return () => {
            if (socketRef.current) {
                socketRef.current.close();
            }
        };
    }, [selectedAssociation?.id]);

    // Fonction pour charger les événements
    const loadEvents = React.useCallback(async () => {
        if (!selectedAssociation?.id) return;
        
        try {
            console.log('🔄 Chargement des événements pour l\'association:', selectedAssociation.id);
            const eventsData = await planningService.getAllEvents(selectedAssociation.id);
            console.log('✅ Événements récupérés:', eventsData);
            setEvents(eventsData);
        } catch (error) {
            console.error('❌ Erreur lors du chargement des événements:', error);
            toast.error(t_plan('errorLoadingEvents'));
        }
    }, [selectedAssociation?.id]);

    // Charger les événements de l'association
    useEffect(() => {
        loadEvents();
    }, [loadEvents]);

    // Fonction pour charger les itinéraires
    const loadItineraries = React.useCallback(async () => {
        if (!selectedAssociation?.id) return;
        
        try {
            setLoadingItineraries(true);
            console.log('🔄 Chargement des itinéraires pour l\'association:', selectedAssociation.id);
            console.log('📅 Filtre temporel appliqué:', daysFilter, 'jours');
            
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Token d\'authentification non trouvé');
            }
            
            const itinerariesData = await geoService.getItineraries(selectedAssociation.id);
            console.log('✅ Itinéraires récupérés (avant filtrage temporel):', itinerariesData);
            console.log('📊 Structure des données:', {
                type: typeof itinerariesData,
                isArray: Array.isArray(itinerariesData),
                length: Array.isArray(itinerariesData) ? itinerariesData.length : 'N/A',
                sample: Array.isArray(itinerariesData) && itinerariesData.length > 0 ? itinerariesData[0] : 'Aucun échantillon'
            });
            
            // Vérifier que les itinéraires appartiennent à l'association et appliquer le filtre temporel
            if (Array.isArray(itinerariesData)) {
                let filteredItineraries = itinerariesData.filter(itinerary => {
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
                
                // Appliquer le filtre temporel
                const beforeDateFilter = filteredItineraries.length;
                filteredItineraries = filterByDate(filteredItineraries, daysFilter);
                
                console.log('📅 Filtrage temporel:', {
                    beforeDateFilter,
                    afterDateFilter: filteredItineraries.length,
                    daysFilter
                });
                
                setItineraries(filteredItineraries);
            } else {
                console.warn('⚠️ Les données ne sont pas un tableau:', itinerariesData);
                setItineraries([]);
            }
        } catch (error) {
            console.error('❌ Erreur lors du chargement des itinéraires:', error);
            toast.error(t_plan('errorLoadingItineraries'));
        } finally {
            setLoadingItineraries(false);
        }
    }, [selectedAssociation?.id, daysFilter, filterByDate]);

    // Charger les itinéraires existants
    useEffect(() => {
        loadItineraries();
    }, [loadItineraries]);

    // Écouter les événements d'annulation et de suppression pour recharger les données
    useEffect(() => {
        const handleEventCanceled = (event: CustomEvent) => {
            const { associationId } = event.detail;
            if (associationId === selectedAssociation?.id) {
                console.log('🔄 Événement annulé détecté, rechargement des données...');
                loadEvents();
                loadItineraries();
                toast.success(t_plan('dataUpdatedEventCanceled'));
            }
        };

        const handleEventDeleted = (event: CustomEvent) => {
            const { associationId } = event.detail;
            if (associationId === selectedAssociation?.id) {
                console.log('🔄 Événement supprimé détecté, rechargement des données...');
                loadEvents();
                loadItineraries();
                toast.success(t_plan('dataUpdatedEventDeleted'));
            }
        };

        window.addEventListener('eventCanceled', handleEventCanceled as EventListener);
        window.addEventListener('eventDeleted', handleEventDeleted as EventListener);
        
        return () => {
            window.removeEventListener('eventCanceled', handleEventCanceled as EventListener);
            window.removeEventListener('eventDeleted', handleEventDeleted as EventListener);
        };
    }, [selectedAssociation?.id, loadEvents, loadItineraries]);

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
            toast.error(t_plan('errorCalculatingRoute'));
        } finally {
            setRouteLoading(false);
        }
    };

    // Fonction pour ouvrir le popup d'un point sur la carte
    const handleOpenPointPopup = (point: GeoPoint) => {
        setOpenPopupPoint(point);
        
        // Créer une clé unique pour le point
        const pointKey = `${point.latitude}-${point.longitude}-${point.timestamp}`;
        
        // Ouvrir le popup du marker correspondant et centrer la carte
        setTimeout(() => {
            const markerRef = markerRefs.current[pointKey];
            if (markerRef && markerRef.openPopup) {
                // Centrer la carte sur le point
                const map = markerRef._map;
                if (map) {
                    map.setView([point.latitude, point.longitude], map.getZoom());
                }
                // Ouvrir le popup
                markerRef.openPopup();
            } else {
                console.log('Marker ref non trouvé pour:', pointKey, 'Refs disponibles:', Object.keys(markerRefs.current));
            }
        }, 200);
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
            toast.error(t_plan('errorAddingPoint'));
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

    // Fonction pour activer/désactiver un point individuel
    const handleTogglePointStatus = async (point: GeoPoint) => {
        if (!point.id) return;
        
        try {
            setTogglingPoints(prev => new Set(prev).add(point.id!));
            const newStatus = !point.isActive;
            
            await geoService.togglePointStatus(point.id, newStatus);
            
            // Mettre à jour le point dans la liste
            setGeoPoints(prev => prev.map(p => 
                p.id === point.id ? { ...p, isActive: newStatus } : p
            ));
            
            toast.success(newStatus ? t_plan('point_activated') : t_plan('point_deactivated'));
        } catch (error) {
            console.error('Erreur lors du basculement du statut:', error);
            toast.error(t_plan('toggle_status_error'));
        } finally {
            setTogglingPoints(prev => {
                const newSet = new Set(prev);
                newSet.delete(point.id!);
                return newSet;
            });
        }
    };

    // Fonction pour activer/désactiver tous les points d'un cluster
    const handleToggleClusterStatus = async (cluster: { center: GeoPoint; points: GeoPoint[] }, clusterIndex: number) => {
        const pointIds = cluster.points.map(p => p.id).filter(Boolean) as string[];
        if (pointIds.length === 0) return;
        
        // Déterminer le nouveau statut basé sur le point principal
        const newStatus = !cluster.center.isActive;
        
        try {
            setTogglingClusters(prev => new Set(prev).add(clusterIndex));
            
            await geoService.toggleClusterStatus(pointIds, newStatus);
            
            // Mettre à jour tous les points du cluster
            setGeoPoints(prev => prev.map(p => 
                pointIds.includes(p.id!) ? { ...p, isActive: newStatus } : p
            ));
            
            toast.success(newStatus ? t_plan('all_points_activated') : t_plan('all_points_deactivated'));
        } catch (error) {
            console.error('Erreur lors du basculement du statut du cluster:', error);
            toast.error(t_plan('toggle_status_error'));
        } finally {
            setTogglingClusters(prev => {
                const newSet = new Set(prev);
                newSet.delete(clusterIndex);
                return newSet;
            });
        }
    };

    // Fonction pour calculer la distance entre deux points en mètres
    const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
        const R = 6371e3; // Rayon de la Terre en mètres
        const φ1 = lat1 * Math.PI/180;
        const φ2 = lat2 * Math.PI/180;
        const Δφ = (lat2-lat1) * Math.PI/180;
        const Δλ = (lng2-lng1) * Math.PI/180;

        const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                  Math.cos(φ1) * Math.cos(φ2) *
                  Math.sin(Δλ/2) * Math.sin(Δλ/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

        return R * c;
    };

    // Fonction pour grouper les points proches (clustering)
    const clusterPoints = (points: GeoPoint[], maxDistance: number = 50) => {
        const clusters: { center: GeoPoint; points: GeoPoint[]; }[] = [];
        const processed = new Set<number>();

        points.forEach((point, index) => {
            if (processed.has(index)) return;

            const cluster = {
                center: point,
                points: [point]
            };

            // Chercher tous les points dans le rayon
            points.forEach((otherPoint, otherIndex) => {
                if (otherIndex === index || processed.has(otherIndex)) return;

                const distance = calculateDistance(
                    point.latitude, point.longitude,
                    otherPoint.latitude, otherPoint.longitude
                );

                if (distance <= maxDistance) {
                    cluster.points.push(otherPoint);
                    processed.add(otherIndex);
                }
            });

            processed.add(index);
            clusters.push(cluster);
        });

        return clusters;
    };

    // Créer l'icône pour un cluster
    const createClusterIcon = (count: number, color: string) => L.divIcon({
        html: `
            <div style="
                background-color: ${color}; 
                width: 35px; 
                height: 35px; 
                border-radius: 50%; 
                border: 3px solid white; 
                box-shadow: 0 2px 6px rgba(0,0,0,0.4);
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
                color: white;
                font-size: 12px;
            ">${count}</div>
        `,
        iconSize: [35, 35],
        iconAnchor: [17, 17],
        className: 'cluster-marker'
    });

    // Obtenir les clusters de points
    const activePoints = geoPoints.filter(point => point.isActive !== false); // Afficher les points actifs ou sans statut défini
    const pointClusters = clusterPoints(geoPoints); // Utiliser tous les points pour les clusters

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
        console.log('📋 Données disponibles:', { 
            selectedEvent: selectedEvent?.title, 
            selectedRoutePoint, 
            selectedAssociation: selectedAssociation?.id 
        });
        
        if (!selectedEvent || !selectedRoutePoint || !selectedAssociation?.id) {
            console.log('❌ Données manquantes pour créer la route');
            return;
        }

        try {
            console.log('✅ Données complètes, début de création');
            
            // Pas de validation de rayon - on permet la création d'itinéraire peu importe les points
            
            setIsCreatingRoute(false);
            setShowRouteConfirmationModal(false);
            
            const routeData = {
                associationId: selectedAssociation.id,
                eventId: selectedEvent.id,
                centerLat: selectedRoutePoint.lat,
                centerLng: selectedRoutePoint.lng,
                radiusKm: radiusKm, // Utiliser le rayon sélectionné
                startLat: selectedRoutePoint.lat,
                startLng: selectedRoutePoint.lng
            };

            console.log('🔄 Création de route avec les données:', routeData);
            console.log('📋 Événement sélectionné:', selectedEvent);
            console.log('📍 Point sélectionné:', selectedRoutePoint);

            const newRoute = await geoService.createRoute(routeData);
            console.log('✅ Route créée avec succès:', newRoute);
            setRoutes(prev => [...prev, newRoute]);
            toast.success('Route créée avec succès !');
            
            // Recharger toutes les routes et itinéraires pour mettre à jour l'affichage
            try {
                console.log('🔄 Rechargement des itinéraires...');
                const updatedItineraries = await geoService.getItineraries(selectedAssociation.id);
                let filteredItineraries = updatedItineraries.filter((it: any) => it.associationId === selectedAssociation.id);
                // Appliquer le filtre temporel
                filteredItineraries = filterByDate(filteredItineraries, daysFilter);
                setItineraries(filteredItineraries);
                console.log('✅ Itinéraires rechargés (avec filtre temporel):', filteredItineraries.length);
            } catch (error) {
                console.error('❌ Erreur lors du rechargement des itinéraires:', error);
                // Pas grave, on garde l'ancienne liste
            }
            
            // Réinitialiser les états
            setSelectedEvent(null);
            setSelectedRoutePoint(null);
            setAddressQuery('');
            setSelectedAddress(null);
            setShowAddressSuggestions(false);
            setAddressSuggestions([]);
        } catch (error) {
            console.error('❌ Erreur lors de la création de la route:', error);
            toast.error(t_plan('errorCreatingRoute'));
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
            
            // Vérifier que chaque feature a une géométrie valide (validation plus permissive)
            if (parsed.features && Array.isArray(parsed.features)) {
                // Filtrer les features valides au lieu de rejeter tout
                parsed.features = parsed.features.filter((feature: any, i: number) => {
                    if (!feature.geometry || !feature.geometry.type || !feature.geometry.coordinates) {
                        console.warn(`⚠️ Feature ${i} invalide, ignorée:`, feature);
                        return false;
                    }
                    
                    // Vérifier les coordonnées de manière plus permissive
                    if (feature.geometry.coordinates && Array.isArray(feature.geometry.coordinates)) {
                        const coords = feature.geometry.coordinates;
                        if (coords.length > 0 && Array.isArray(coords[0])) {
                            // Pour LineString, compter les points valides
                            let validPoints = 0;
                            for (let j = 0; j < coords.length; j++) {
                                const point = coords[j];
                                if (Array.isArray(point) && point.length >= 2 && 
                                    typeof point[0] === 'number' && typeof point[1] === 'number') {
                                    validPoints++;
                                }
                            }
                            if (validPoints < 2) {
                                console.warn(`⚠️ Feature ${i} n'a pas assez de points valides (${validPoints}), ignorée`);
                                return false;
                            }
                        } else if (coords.length >= 2) {
                            // Pour Point, vérifier les coordonnées
                            if (typeof coords[0] !== 'number' || typeof coords[1] !== 'number') {
                                console.warn(`⚠️ Feature ${i} coordonnées invalides, ignorée:`, coords);
                                return false;
                            }
                        }
                    }
                    return true;
                });
                
                // Si aucune feature valide, retourner null
                if (parsed.features.length === 0) {
                    console.warn('⚠️ Aucune feature valide trouvée');
                    return null;
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

    // Fonction d'autocomplétion d'adresse avec debounce
    const searchAddresses = async (query: string) => {
        if (!query || query.trim().length < 3) {
            setAddressSuggestions([]);
            setShowAddressSuggestions(false);
            return;
        }

        try {
            setIsLoadingAddresses(true);
            console.log('🔍 Recherche d\'adresses pour:', query);
            
            const data = await geoService.searchAddresses(query);
            console.log('📄 Données reçues:', data);
            
            if (data.features && Array.isArray(data.features)) {
                console.log('✅ Suggestions trouvées:', data.features.length);
                setAddressSuggestions(data.features);
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

    // Fonction pour gérer la saisie d'adresse avec debounce
    const handleAddressInput = (value: string) => {
        setAddressQuery(value);
        setSelectedAddress(null);
        
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

    // Fonction pour sélectionner une adresse
    const handleAddressSelect = (address: any) => {
        setSelectedAddress(address);
        setAddressQuery(address.properties.formatted || address.properties.name);
        setShowAddressSuggestions(false);
        setAddressSuggestions([]);
        
        // Extraire les coordonnées
        const lat = address.properties.lat;
        const lng = address.properties.lon;
        
        if (lat && lng) {
            setSelectedRoutePoint({ lat, lng });
            setShowRouteCreationModal(false); // Fermer le modal de création
            setShowRouteConfirmationModal(true); // Passer directement à la confirmation
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
            let filteredData = data.filter((it: any) => it.associationId === selectedAssociation.id);
            // Appliquer le filtre temporel
            filteredData = filterByDate(filteredData, daysFilter);
            setItineraries(filteredData);
        } catch (error) {
            toast.error(t_plan('errorDeletingItinerary'));
        } finally {
            setDeletingItinerary(false);
        }
    };

    // Fonction pour basculer le statut d'un itinéraire
    const handleToggleItineraryStatus = async (itinerary: any, e: React.MouseEvent) => {
        e.stopPropagation(); // Empêcher la sélection de l'itinéraire
        
        try {
            await geoService.toggleItineraryStatus(itinerary.id);
            toast.success(itinerary.isActive ? 'Itinéraire désactivé' : 'Itinéraire activé');
            
            // Recharger les itinéraires
            if (selectedAssociation?.id) {
                const data = await geoService.getItineraries(selectedAssociation.id);
                let filteredData = data.filter((it: any) => it.associationId === selectedAssociation.id);
                filteredData = filterByDate(filteredData, daysFilter);
                setItineraries(filteredData);
            }
        } catch (error: any) {
            console.error('Erreur lors du basculement du statut:', error);
            toast.error('Erreur lors du basculement du statut');
        }
    };

    // Fonction pour trouver l'événement lié à un itinéraire
    const getEventForItinerary = (eventId: string) => {
        return events.find(event => event.id === eventId);
    };

    // Fonction pour filtrer les itinéraires selon le statut
    const getFilteredItineraries = () => {
        switch (itineraryFilter) {
            case 'active':
                // Un itinéraire est actif s'il a un eventId ET l'événement existe ET n'est pas annulé ET n'est pas explicitement désactivé
                return itineraries.filter(itinerary => {
                    if (!itinerary.eventId || itinerary.isActive === false) return false;
                    const linkedEvent = getEventForItinerary(itinerary.eventId);
                    return linkedEvent !== undefined && linkedEvent.status !== 'CANCELED';
                });
            case 'archived':
                // Un itinéraire est archivé s'il n'a pas d'eventId OU l'événement n'existe plus OU l'événement est annulé OU est explicitement désactivé
                return itineraries.filter(itinerary => {
                    if (itinerary.isActive === false) return true;
                    if (!itinerary.eventId) return true;
                    const linkedEvent = getEventForItinerary(itinerary.eventId);
                    return linkedEvent === undefined || linkedEvent.status === 'CANCELED';
                });
            case 'all':
            default:
                return itineraries;
        }
    };

    const filteredItineraries = getFilteredItineraries();

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
                                <p className="text-gray-600 dark:text-gray-400">{t_plan('loadingMap')}</p>
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
                            {showHeatmap && activePoints.length > 0 && (
                                <HeatmapLayer 
                                    points={activePoints}
                                    options={{
                                        radius: 30,
                                        blur: 20,
                                        maxZoom: 17,
                                        max: 2.0,
                                        minOpacity: 0.3
                                    }}
                                />
                            )}
                            
                            {/* Affichage des points existants avec clustering (masqués si heatmap active) */}
                            {!showHeatmap && pointClusters.map((cluster, clusterIndex) => {
                                const isCluster = cluster.points.length > 1;
                                const mainPoint = cluster.center;
                                
                                // Filtrer les points actifs pour l'affichage sur la carte
                                const activeClusterPoints = cluster.points.filter(point => point.isActive !== false);
                                
                                // Ne pas afficher le cluster s'il n'y a pas de points actifs
                                if (activeClusterPoints.length === 0) return null;
                                
                                // Déterminer la couleur du cluster basée sur le point le plus récent
                                const mostRecentColor = activeClusterPoints.reduce((latest, point) => {
                                    const pointTime = new Date(point.observedAt || point.timestamp || 0);
                                    const latestTime = new Date(latest.observedAt || latest.timestamp || 0);
                                    return pointTime > latestTime ? point : latest;
                                }, activeClusterPoints[0]);
                                
                                const clusterColor = getPointColor(mostRecentColor.observedAt || mostRecentColor.timestamp);
                                
                                return (
                                    <Marker
                                        key={`cluster-${clusterIndex}`}
                                        position={[mainPoint.latitude, mainPoint.longitude]}
                                        icon={isCluster 
                                            ? createClusterIcon(activeClusterPoints.length, clusterColor)
                                            : createCustomIcon(clusterColor)
                                        }
                                        ref={(ref) => {
                                            if (ref) {
                                                // Pour les clusters, on ne stocke pas de ref car on ne peut pas ouvrir le popup d'un point spécifique
                                                if (!isCluster) {
                                                    const pointKey = `${mainPoint.latitude}-${mainPoint.longitude}-${mainPoint.timestamp}`;
                                                    markerRefs.current[pointKey] = ref;
                                                }
                                            }
                                        }}
                                    >
                                        <Popup maxWidth={300}>
                                            <div className="p-2">
                                                {isCluster ? (
                                                    // Affichage pour un cluster de plusieurs points
                                                    <div>
                                                        <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                                                            📍 {activeClusterPoints.length} {t_plan('pointsNearby')}
                                                        </h3>
                                                        <div className="mb-3">
                                                            <button
                                                                onClick={() => handleToggleClusterStatus(cluster, clusterIndex)}
                                                                disabled={togglingClusters.has(clusterIndex)}
                                                                className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                                                    cluster.center.isActive
                                                                        ? 'bg-red-500 hover:bg-red-600 text-white'
                                                                        : 'bg-green-500 hover:bg-green-600 text-white'
                                                                } disabled:opacity-50`}
                                                            >
                                                                {togglingClusters.has(clusterIndex) ? (
                                                                    <div className="flex items-center justify-center">
                                                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                                        Traitement...
                                                                    </div>
                                                                ) : (
                                                                    cluster.center.isActive ? t_plan('deactivate_all') : t_plan('activate_all')
                                                                )}
                                                            </button>
                                                        </div>
                                                        <div className="max-h-48 overflow-y-auto space-y-3">
                                                            {activeClusterPoints.map((point, pointIndex) => (
                                                                <div key={`cluster-point-${pointIndex}`} className="border-l-4 pl-3 py-2" style={{ borderColor: getPointColor(point.observedAt || point.timestamp) }}>
                                                                    <h4 className="font-semibold text-sm text-gray-800 dark:text-white mb-1">
                                                                        {point.name || `${t_plan('pointNumber')}${pointIndex + 1}`}
                                                                    </h4>
                                                                    {point.address && (
                                                                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                                                            📍 {point.address}
                                                                        </p>
                                                                    )}
                                                                    {point.notes && point.notes !== 'description' && (
                                                                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                                                                            {point.notes}
                                                                        </p>
                                                                    )}
                                                                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                                                                        <div>{formatDate(point.timestamp, point.observedAt)}</div>
                                                                        <div className="mt-1">
                                                                            {point.latitude.toFixed(4)}, {point.longitude.toFixed(4)}
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex space-x-2 mb-2">
                                                                        <button
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                handleTogglePointStatus(point);
                                                                            }}
                                                                            disabled={togglingPoints.has(point.id!)}
                                                                            className={`flex-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
                                                                                point.isActive
                                                                                    ? 'bg-red-500 hover:bg-red-600 text-white'
                                                                                    : 'bg-green-500 hover:bg-green-600 text-white'
                                                                            } disabled:opacity-50`}
                                                                        >
                                                                            {togglingPoints.has(point.id!) ? (
                                                                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mx-auto"></div>
                                                                            ) : (
                                                                                point.isActive ? t_plan('deactivate') : t_plan('activate')
                                                                            )}
                                                                        </button>
                                                                        <button
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                handleShowRoute(point);
                                                                            }}
                                                                            className="flex-1 flex items-center justify-center space-x-1 px-2 py-1 bg-gradient-to-r from-orange-500 to-blue-500 hover:from-orange-600 hover:to-blue-600 text-white text-xs rounded transition-all"
                                                                        >
                                                                            <MapIcon className="w-2 h-2" />
                                                                            <span>{t_plan('itinerary')}</span>
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    // Affichage pour un point isolé (comportement normal)
                                                    <div className="min-w-[200px]">
                                                        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                                                            {mainPoint.name || t_plan('geoLocationPoint')}
                                                        </h3>
                                                        {mainPoint.address && (
                                                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                                                                📍 {mainPoint.address}
                                                            </p>
                                                        )}
                                                        {mainPoint.notes && mainPoint.notes !== 'description' && (
                                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{mainPoint.notes}</p>
                                                        )}
                                                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                                                            <div>{formatDate(mainPoint.timestamp, mainPoint.observedAt)}</div>
                                                            <div className="mt-1">
                                                                {mainPoint.latitude.toFixed(4)}, {mainPoint.longitude.toFixed(4)}
                                                            </div>
                                                        </div>
                                                        <div className="flex space-x-2">
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleTogglePointStatus(mainPoint);
                                                                }}
                                                                disabled={togglingPoints.has(mainPoint.id!)}
                                                                className={`flex-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
                                                                    mainPoint.isActive
                                                                        ? 'bg-red-500 hover:bg-red-600 text-white'
                                                                        : 'bg-green-500 hover:bg-green-600 text-white'
                                                                } disabled:opacity-50`}
                                                            >
                                                                {togglingPoints.has(mainPoint.id!) ? (
                                                                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mx-auto"></div>
                                                                ) : (
                                                                    mainPoint.isActive ? t_plan('deactivate') : t_plan('activate')
                                                                )}
                                                            </button>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleShowRoute(mainPoint);
                                                                }}
                                                                className="flex-1 flex items-center justify-center space-x-1 px-2 py-1 bg-gradient-to-r from-orange-500 to-blue-500 hover:from-orange-600 hover:to-blue-600 text-white text-xs rounded transition-all"
                                                            >
                                                                <MapIcon className="w-2 h-2" />
                                                                <span>{t_plan('itinerary')}</span>
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </Popup>
                                    </Marker>
                                );
                            })}

                            {/* Affichage des routes d'événements */}
                            {!routesDisabled && routes.map((route, index) => {
                                console.log(`🔍 Traitement de la route ${index}:`, route.id);
                                console.log(`📄 GeoJSON brut:`, route.geoJson);
                                
                                                                const geoJsonData = parseRouteGeoJson(route.geoJson);
                                console.log(`✅ GeoJSON parsé pour route ${index}:`, geoJsonData);
                                
                                const isValidGeoJson = geoJsonData && geoJsonData.type === 'FeatureCollection' && Array.isArray(geoJsonData.features) && geoJsonData.features.length > 0;
                                console.log(`✅ Validation GeoJSON route ${index}:`, isValidGeoJson);
                                console.log(`🚀 RouteRenderer sera rendu pour route ${route.id}:`, !!geoJsonData);
                                
                                return (
                                    <React.Fragment key={route.id || index}>
                                        {/* Marker pour le point de départ de la route */}
                                        <Marker
                                            position={[route.startLat, route.startLng]}
                                            icon={createCustomIcon(route.id === 'example-route' ? '#10B981' : '#3B82F6')} // Vert pour l'exemple, bleu pour les vraies routes
                                        >
                                            <Popup>
                                                <div className="p-2 min-w-[200px]">
                                                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                                                        {route.id === 'example-route' ? t_plan('sampleRoute') : t_plan('startingPoint')}
                                                    </h3>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1 mb-3">
                                                        <div className="text-xs text-gray-400 dark:text-gray-300">
                                                            {t_plan('lat')} {route.startLat.toFixed(6)}, {t_plan('lng')} {route.startLng.toFixed(6)}
                                                        </div>
                                                        <div className="text-xs text-gray-400 dark:text-gray-300">
                                                            {t_plan('distance')} {route.distanceKm} km
                                                        </div>
                                                        <div className="text-xs text-gray-400 dark:text-gray-300">
                                                            {t_plan('duration')} {route.durationMinutes} min
                                                        </div>
                                                    </div>
                                                    <a
                                                        href={route.googleMapsUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg transition-all"
                                                    >
                                                        <MapIcon className="w-4 h-4" />
                                                        <span>{t_plan('seeOnGoogleMaps')}</span>
                                                    </a>
                                                </div>
                                            </Popup>
                                        </Marker>
                                        
                                        {/* Affichage du GeoJSON de la route avec protection d'erreur */}
                                        {geoJsonData && (
                                            <RouteRenderer
                                                key={`route-renderer-${route.id}-${index}`}
                                                geoJsonData={geoJsonData}
                                                color={route.id === 'example-route' ? '#10B981' : '#3B82F6'}
                                                routeId={route.id}
                                                t_plan={t_plan}
                                            />
                                        )}
                                    </React.Fragment>
                                );
                            })}
                            
                            {/* Affichage des itinéraires existants */}
                            
                            {filteredItineraries.map((itinerary, index) => {
                                console.log(`🗺️ Traitement de l'itinéraire ${index}:`, itinerary.id, 'Association:', itinerary.associationId);
                                
                                const geoJsonData = parseRouteGeoJson(itinerary.geoJson);
                                console.log(`✅ GeoJSON parsé pour itinéraire ${index}:`, geoJsonData);
                                
                                const isValidGeoJson = geoJsonData && geoJsonData.type === 'FeatureCollection' && Array.isArray(geoJsonData.features) && geoJsonData.features.length > 0;
                                console.log(`✅ Validation GeoJSON itinéraire ${index}:`, isValidGeoJson);
                                console.log(`🚀 RouteRenderer sera rendu pour itinéraire ${itinerary.id}:`, !!geoJsonData);
                                
                                const isSelected = selectedItinerary === itinerary.id;
                                const linkedEvent = getEventForItinerary(itinerary.eventId);
                                
                                // Couleurs simples : rouge si sélectionné, violet sinon
                                const finalRouteColor = isSelected ? '#FF6B6B' : '#8B5CF6';
                                const finalMarkerColor = isSelected ? '#FF6B6B' : '#8B5CF6';
                                const finalOpacity = isSelected ? 1.0 : 0.6;
                                
                                return (
                                    <React.Fragment key={`itinerary-${itinerary.id || index}`}>
                                        {/* Marker pour le point de départ de l'itinéraire */}
                                        <Marker
                                            position={[itinerary.startLat, itinerary.startLng]}
                                            icon={createCustomIcon(finalMarkerColor)}
                                        >
                                            <Popup>
                                                <div 
                                                    className={`p-2 min-w-[200px] cursor-pointer rounded-lg transition-colors ${
                                                        isSelected 
                                                            ? 'bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-600' 
                                                            : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                                                    }`}
                                                    onClick={() => setSelectedItinerary(isSelected ? null : itinerary.id)}
                                                >
                                                    <h3 className="font-semibold text-gray-900 mb-2">
                                                        {t_plan('itineraryNumber')}{index + 1}
                                                        {isSelected && (
                                                            <span className="ml-2 text-red-600 dark:text-red-400 font-bold">
                                                                {t_plan('selected')}
                                                            </span>
                                                        )}
                                                        {/* Badge de statut cliquable dans le popup */}
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleToggleItineraryStatus(itinerary, e);
                                                            }}
                                                            className={`ml-2 px-2 py-0.5 text-xs rounded-full cursor-pointer hover:opacity-80 transition-opacity ${
                                                                itinerary.isActive === false || !itinerary.eventId || !getEventForItinerary(itinerary.eventId) || getEventForItinerary(itinerary.eventId)?.status === 'CANCELED'
                                                                    ? 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400' 
                                                                    : 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                                                            }`}
                                                            title="Cliquer pour basculer le statut"
                                                        >
                                                            {itinerary.isActive === false || !itinerary.eventId || !getEventForItinerary(itinerary.eventId) || getEventForItinerary(itinerary.eventId)?.status === 'CANCELED' ? t_plan('archived') : t_plan('active')}
                                                        </button>
                                                    </h3>
                                                    
                                                                                                            {/* Nom de l'événement lié dans le popup */}
                                                    {linkedEvent && (
                                                        <div className={`mb-3 px-2 py-1 rounded ${
                                                            linkedEvent.status === 'CANCELED' 
                                                                ? 'bg-red-100 dark:bg-red-900/20' 
                                                                : 'bg-blue-100 dark:bg-blue-900/20'
                                                        }`}>
                                                            <span className={`text-sm font-medium ${
                                                                linkedEvent.status === 'CANCELED'
                                                                    ? 'text-red-700 dark:text-red-400'
                                                                    : 'text-blue-700 dark:text-blue-400'
                                                            }`}>
                                                                📅 {linkedEvent.title}
                                                                {linkedEvent.status === 'CANCELED' && ` ${t_plan('canceled')}`}
                                                            </span>
                                                        </div>
                                                    )}
                                                    
                                                    {/* Messages d'information supplémentaires */}
                                                    {!linkedEvent && itinerary.eventId && (
                                                        <div className="mb-3 px-2 py-1 bg-orange-100 dark:bg-orange-900/20 rounded">
                                                            <span className="text-sm font-medium text-orange-700 dark:text-orange-400">
                                                                ⚠️ {t_plan('eventNotFound')}
                                                            </span>
                                                        </div>
                                                    )}
                                                    
                                                    {!itinerary.eventId && (
                                                        <div className="mb-3 px-2 py-1 bg-gray-100 dark:bg-gray-900/20 rounded">
                                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-400">
                                                                ❌ {t_plan('noLinkedEvent')}
                                                            </span>
                                                        </div>
                                                    )}
                                                    
                                                    {/* Affichage si pas d'événement lié dans le popup */}
                                                    {!itinerary.eventId && (
                                                        <div className="mb-3 px-2 py-1 bg-gray-100 rounded">
                                                            <span className="text-sm font-medium text-gray-600">
                                                                ❌ {t_plan('noLinkedEvent')}
                                                            </span>
                                                        </div>
                                                    )}
                                                    
                                                    {itinerary.eventId && !linkedEvent && (
                                                        <div className="mb-3 px-2 py-1 bg-orange-100 rounded">
                                                            <span className="text-sm font-medium text-orange-700">
                                                                ⚠️ Événement introuvable
                                                            </span>
                                                        </div>
                                                    )}
                                                    
                                                    <div className="text-xs text-gray-500 space-y-1 mb-3">
                                                        <div className="text-xs text-gray-400">
                                                            Départ: {itinerary.startLat.toFixed(6)}, {itinerary.startLng.toFixed(6)}
                                                        </div>
                                                        {itinerary.endLat && itinerary.endLng && (
                                                            <div className="text-xs text-gray-400">
                                                                Arrivée: {itinerary.endLat.toFixed(6)}, {itinerary.endLng.toFixed(6)}
                                                            </div>
                                                        )}
                                                        <div className="text-xs text-gray-400">
                                                            {t_plan('distanceLabel')} {itinerary.distanceKm ? `${itinerary.distanceKm} km` : t_plan('notCalculated')}
                                                        </div>
                                                        <div className="text-xs text-gray-400">
                                                            {t_plan('durationLabel')} {itinerary.durationMinutes ? `${itinerary.durationMinutes} min` : t_plan('notCalculated')}
                                                        </div>
                                                        {itinerary.createdAt && (
                                                            <div className="text-xs text-gray-400">
                                                                {t_plan('createdColon')} {new Date(itinerary.createdAt).toLocaleDateString('fr-FR')}
                                                            </div>
                                                        )}
                                                    </div>
                                                    {itinerary.googleMapsUrl && (
                                                        <a
                                                            href={itinerary.googleMapsUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="w-full flex items-center justify-center space-x-2 px-2 py-1 bg-purple-500 hover:bg-purple-600 text-white text-xs rounded transition-all"
                                                        >
                                                            <MapIcon className="w-4 h-4" />
                                                            <span>{t_plan('seeOnGoogleMaps')}</span>
                                                        </a>
                                                    )}
                                                </div>
                                            </Popup>
                                        </Marker>
                                        
                                        {/* Affichage du GeoJSON de l'itinéraire */}
                                        {geoJsonData && (
                                            <RouteRenderer
                                                key={`itinerary-renderer-${itinerary.id}-${index}`}
                                                geoJsonData={geoJsonData}
                                                color={finalRouteColor}
                                                routeId={`itinerary-${itinerary.id}`}
                                                opacity={finalOpacity}
                                                t_plan={t_plan}
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
                                        ⚠️ {t_plan('routesDisabled')}
                                    </div>
                                    <div style={{fontSize: '12px', marginBottom: '10px'}}>
                                        {t_plan('invalidGeoJSON')}
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
                                        {t_plan('reactivate')}
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
                            {t_plan('pointsOfInterest')}
                        </h2>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            {geoPoints.length} {geoPoints.length === 1 ? t_plan('pointFound') : t_plan('pointsFound')}
                        </div>
                    </div>

                  

                    {/* Liste des points */}
                    <div className="flex-1 overflow-y-auto max-h-80">
                        {geoPoints.length === 0 ? (
                            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                                <MapPinIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                <p>{t_plan('noGeoLocationPoints')}</p>
                                <p className="text-xs mt-1">{t_plan('addPointClickMap')}</p>
                            </div>
                        ) : (
                            <div className="space-y-2 p-2">
                                {pointClusters.map((cluster, clusterIndex) => {
                                    return (
                                    <div key={`cluster-${clusterIndex}`} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                                        {/* En-tête du cluster */}
                                        <div className="p-3 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-2">
                                                    <MapPinIcon className="w-4 h-4 text-gray-500" />
                                                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {t_plan('clusterOf')} {cluster.points.length} {t_plan('points')}
                                                    </span>
                                                </div>
                                                <button
                                                    onClick={() => handleToggleClusterStatus(cluster, clusterIndex)}
                                                    disabled={togglingClusters.has(clusterIndex)}
                                                    className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                                                        cluster.center.isActive 
                                                            ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30'
                                                            : 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/30'
                                                    } disabled:opacity-50`}
                                                >
                                                    {togglingClusters.has(clusterIndex) ? (
                                                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current mx-auto"></div>
                                                    ) : (
                                                        cluster.center.isActive ? t_plan('deactivate_all') : t_plan('activate_all')
                                                    )}
                                                </button>
                                            </div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                {t_plan('groupedWithinRadius')}
                                            </p>
                                        </div>
                                        
                                        {/* Points du cluster */}
                                        <div className="divide-y divide-gray-200 dark:divide-gray-700">
                                            {cluster.points.map((point, pointIndex) => (
                                                <div 
                                                    key={`sidebar-point-${pointIndex}`} 
                                                    className={`p-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors relative ${
                                                        point.isActive === false 
                                                            ? 'bg-gray-100 dark:bg-gray-800/50 opacity-60' 
                                                            : 'bg-white dark:bg-gray-800'
                                                    }`}
                                                    style={{ borderColor: getPointColor(point.observedAt || point.timestamp) }}
                                                    onClick={() => handleOpenPointPopup(point)}
                                                >
                                                    {/* Tag d'activation/désactivation en haut à droite */}
                                                    <div className="absolute top-1 right-1">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleTogglePointStatus(point);
                                                            }}
                                                            disabled={togglingPoints.has(point.id!)}
                                                            className={`px-2 py-1 text-xs font-medium rounded-full transition-colors ${
                                                                point.isActive 
                                                                    ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30'
                                                                    : 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/30'
                                                            } disabled:opacity-50`}
                                                        >
                                                            {togglingPoints.has(point.id!) ? (
                                                                <div className="animate-spin rounded-full h-2 w-2 border-b-2 border-current mx-auto"></div>
                                                            ) : (
                                                                point.isActive ? t_plan('deactivate') : t_plan('activate')
                                                            )}
                                                        </button>
                                                    </div>
                                                    
                                                    <div className="flex items-start space-x-3 pr-16">
                                                        <div className="flex-shrink-0 w-2 h-2 rounded-full mt-2" 
                                                             style={{ backgroundColor: getPointColor(point.observedAt || point.timestamp) }} />
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                                                {t_plan('pointNumber')}{pointIndex + 1}
                                                                {point.isActive === false && (
                                                                    <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                                                                        ({t_plan('deactivate')})
                                                                    </span>
                                                                )}
                                                            </p>
                                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                                {point.notes || t_plan('noDescription')}
                                                            </p>
                                                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                                                {new Date(point.observedAt || point.timestamp || Date.now()).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Section des itinéraires existants */}
                    <div className="border-t border-gray-200 dark:border-gray-700">
                        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                {t_plan('existingItineraries')}
                            </h2>
                            
                            {/* Filtres pour les itinéraires */}
                            <div className="flex space-x-2 mb-3">
                                <button
                                    onClick={() => setItineraryFilter('all')}
                                    className={`px-3 py-1 text-xs rounded-full transition-colors ${
                                        itineraryFilter === 'all' 
                                            ? 'bg-blue-500 text-white' 
                                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                                    }`}
                                >
                                    {t_plan('all')} ({itineraries.length})
                                </button>
                                <button
                                    onClick={() => setItineraryFilter('active')}
                                    className={`px-3 py-1 text-xs rounded-full transition-colors ${
                                        itineraryFilter === 'active' 
                                            ? 'bg-green-500 text-white' 
                                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                                    }`}
                                >
                                    {t_plan('active')} ({itineraries.filter(it => {
                                        if (!it.eventId || it.isActive === false) return false;
                                        const linkedEvent = getEventForItinerary(it.eventId);
                                        return linkedEvent !== undefined && linkedEvent.status !== 'CANCELED';
                                    }).length})
                                </button>
                                <button
                                    onClick={() => setItineraryFilter('archived')}
                                    className={`px-3 py-1 text-xs rounded-full transition-colors ${
                                        itineraryFilter === 'archived' 
                                            ? 'bg-red-500 text-white' 
                                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                                    }`}
                                >
                                    {t_plan('archived')} ({itineraries.filter(it => {
                                        if (it.isActive === false) return true;
                                        if (!it.eventId) return true;
                                        const linkedEvent = getEventForItinerary(it.eventId);
                                        return linkedEvent === undefined || linkedEvent.status === 'CANCELED';
                                    }).length})
                                </button>
                            </div>
                            
                            <div className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                                {loadingItineraries ? (
                                    <div className="flex items-center space-x-2">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-500"></div>
                                        <span>{t_plan('loading')}</span>
                                    </div>
                                ) : (
                                    `${filteredItineraries.length} ${filteredItineraries.length === 1 ? t_plan('itineraryFound') : t_plan('itinerariesFound')}`
                                )}
                            </div>
                            
                            {/* Liste des itinéraires */}
                            <div className="max-h-64 overflow-y-auto">
                                <div className="p-4 space-y-3">
                                    {filteredItineraries.length === 0 ? (
                                        <div className="text-center text-gray-500 dark:text-gray-400 py-6">
                                            <MapIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                            <p className="text-sm font-medium mb-1">
                                                {itineraryFilter === 'active' ? t_plan('noActiveItinerary') :
                                                 itineraryFilter === 'archived' ? t_plan('noArchivedItinerary') :
                                                 t_plan('noItinerary')}
                                            </p>
                                            <p className="text-xs text-gray-400">
                                                {itineraryFilter === 'active' ? t_plan('activeItinerariesDescription') :
                                                 itineraryFilter === 'archived' ? t_plan('archivedItinerariesDescription') :
                                                 t_plan('createItinerariesDescription')}
                                            </p>
                                        </div>
                                    ) : (
                                        filteredItineraries.map((itinerary, index) => {
                                            const isSelected = selectedItinerary === itinerary.id;
                                            const linkedEvent = getEventForItinerary(itinerary.eventId);
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
                                                                {t_plan('itineraryNumber')}{index + 1}
                                                                {isSelected && <span className="ml-2 text-xs text-red-600 dark:text-red-400">{t_plan('selected')}</span>}
                                                            </h4>
                                                            {/* Badge de statut cliquable */}
                                                            <button
                                                                onClick={(e) => handleToggleItineraryStatus(itinerary, e)}
                                                                className={`ml-auto px-2 py-0.5 text-xs rounded-full cursor-pointer hover:opacity-80 transition-opacity ${
                                                                    itinerary.isActive === false || !itinerary.eventId || !getEventForItinerary(itinerary.eventId) || getEventForItinerary(itinerary.eventId)?.status === 'CANCELED'
                                                                        ? 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400' 
                                                                        : 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                                                                }`}
                                                                title="Cliquer pour basculer le statut"
                                                            >
                                                                {itinerary.isActive === false || !itinerary.eventId || !getEventForItinerary(itinerary.eventId) || getEventForItinerary(itinerary.eventId)?.status === 'CANCELED' ? t_plan('archived') : t_plan('active')}
                                                            </button>
                                                        </div>
                                                        
                                                        {/* Nom de l'événement lié */}
                                                        {linkedEvent && (
                                                            <div className={`mb-2 px-2 py-1 rounded ${
                                                                linkedEvent.status === 'CANCELED' 
                                                                    ? 'bg-red-100 dark:bg-red-900/20' 
                                                                    : 'bg-blue-100 dark:bg-blue-900/20'
                                                            }`}>
                                                                <span className={`text-xs font-medium ${
                                                                    linkedEvent.status === 'CANCELED'
                                                                        ? 'text-red-700 dark:text-red-400'
                                                                        : 'text-blue-700 dark:text-blue-400'
                                                                }`}>
                                                                    📅 {linkedEvent.title}
                                                                    {linkedEvent.status === 'CANCELED' && ` ${t_plan('canceled')}`}
                                                                </span>
                                                            </div>
                                                        )}
                                                        
                                                        {/* Affichage si pas d'événement lié */}
                                                        {!itinerary.eventId && (
                                                            <div className="mb-2 px-2 py-1 bg-gray-100 dark:bg-gray-900/20 rounded">
                                                                <span className="text-xs font-medium text-gray-700 dark:text-gray-400">
                                                                    ❌ {t_plan('noLinkedEvent')}
                                                                </span>
                                                            </div>
                                                        )}
                                                        
                                                        {itinerary.eventId && !linkedEvent && (
                                                            <div className="mb-2 px-2 py-1 bg-orange-100 dark:bg-orange-900/20 rounded">
                                                                <span className="text-xs font-medium text-orange-700 dark:text-orange-400">
                                                                    ⚠️ {t_plan('eventNotFound')}
                                                                </span>
                                                            </div>
                                                        )}
                                                        
                                                        <div className="text-xs text-gray-500 dark:text-gray-500 mb-3">
                                                            <div>{t_plan('distanceLabel')} {itinerary.distanceKm ? `${itinerary.distanceKm} km` : t_plan('notCalculated')}</div>
                                                            <div>{t_plan('durationLabel')} {itinerary.durationMinutes ? `${itinerary.durationMinutes} min` : t_plan('notCalculated')}</div>
                                                            <div className="mt-1">
                                                                {t_plan('departure')} {itinerary.startLat.toFixed(4)}, {itinerary.startLng.toFixed(4)}
                                                            </div>
                                                            {itinerary.endLat && itinerary.endLng && (
                                                                <div>
                                                                    {t_plan('arrival')} {itinerary.endLat.toFixed(4)}, {itinerary.endLng.toFixed(4)}
                                                                </div>
                                                            )}
                                                            {itinerary.createdAt && (
                                                                <div className="mt-1 text-gray-400">
                                                                    {t_plan('created')} {new Date(itinerary.createdAt).toLocaleDateString('fr-FR')}
                                                                </div>
                                                            )}
                                                        </div>
                                                        {itinerary.googleMapsUrl && (
                                                            <a
                                                                href={itinerary.googleMapsUrl}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="w-full flex items-center justify-center space-x-2 px-2 py-1 bg-purple-500 hover:bg-purple-600 text-white text-xs rounded transition-all"
                                                            >
                                                                <MapIcon className="w-4 h-4" />
                                                                <span>{t_plan('googleMaps')}</span>
                                                            </a>
                                                        )}
                                                    </div>
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
                    <div className="bg-white dark:bg-gray-800 rounded-md p-6 w-[520px] max-w-[90vw] mx-4 max-h-[80vh] overflow-y-auto">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            {t_plan('createEventRoute')}
                        </h3>
                        
                        <div className="space-y-4 mb-6">
                            <div>
                                <Select
                                    value={selectedEvent?.id || ''}
                                    onChange={(e) => {
                                        const event = events.find(ev => ev.id === e.target.value);
                                        setSelectedEvent(event || null);
                                    }}
                                    placeholder={t_plan('selectAnEvent')}
                                >
                                    <option value="">{t_plan('chooseAnEvent')}</option>
                                    {events
                                        .filter(event => {
                                            // Filtrer les événements passés et annulés
                                            const eventDate = new Date(event.beginningDate);
                                            const now = new Date();
                                            const isNotPast = eventDate >= now;
                                            const isNotCanceled = event.status !== 'CANCELED';
                                            return isNotPast && isNotCanceled;
                                        })
                                        .map((event) => (
                                        <option key={event.id} value={event.id}>
                                            {event.title} - {new Date(event.beginningDate).toLocaleDateString()}
                                        </option>
                                    ))}
                                </Select>
                            </div>
                            
                            {selectedEvent && (
                                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-md">
                                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                                        {t_plan('selectedEvent')}
                                    </h4>
                                    <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                                        <div><strong>{t_plan('title')}</strong> {selectedEvent.title}</div>
                                        <div><strong>{t_plan('date')}</strong> {new Date(selectedEvent.beginningDate).toLocaleDateString()}</div>
                                        <div><strong>{t_plan('time')}</strong> {new Date(selectedEvent.beginningDate).toLocaleTimeString()} - {new Date(selectedEvent.endDate).toLocaleTimeString()}</div>
                                        {selectedEvent.location && (
                                            <div><strong>{t_plan('location')}</strong> {selectedEvent.location}</div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {selectedEvent && (
                                <>
                                    {/* Mode de sélection */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            {t_plan('selectionMode')}
                                        </label>
                                        <div className="flex space-x-2">
                                            <button
                                                type="button"
                                                onClick={() => setSelectionMode('address')}
                                                className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-colors ${
                                                    selectionMode === 'address'
                                                        ? 'bg-blue-500 text-white'
                                                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                                                }`}
                                            >
                                                📍 Par adresse
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setSelectionMode('map')}
                                                className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-colors ${
                                                    selectionMode === 'map'
                                                        ? 'bg-blue-500 text-white'
                                                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                                                }`}
                                            >
                                                {t_plan('seeOnMap')}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Recherche par adresse */}
                                    {selectionMode === 'address' && (
                                        <div>
                                            <div className="relative">
                                                <Input
                                                    type="text"
                                                    value={addressQuery}
                                                    onChange={(e) => handleAddressInput(e.target.value)}
                                                    placeholder={t_plan('typeAddress')}
                                                    rightIcon={isLoadingAddresses ? (
                                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                                                    ) : null}
                                                />
                                                {showAddressSuggestions && addressSuggestions.length > 0 && (
                                                    <div className="absolute left-0 z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg max-h-48 overflow-y-auto">
                                                        {addressSuggestions.map((suggestion, index) => (
                                                            <button
                                                                key={index}
                                                                type="button"
                                                                onClick={() => handleAddressSelect(suggestion)}
                                                                className="w-full px-4 py-3 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 border-b border-gray-100 dark:border-gray-600 last:border-b-0 transition-colors"
                                                            >
                                                                {suggestion.properties.formatted || suggestion.properties.name}
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Rayon de recherche */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            {t_plan('searchRadius')} {radiusKm} km
                                        </label>
                                        <input
                                            type="range"
                                            min="1"
                                            max="50"
                                            value={radiusKm}
                                            onChange={(e) => setRadiusKm(parseInt(e.target.value))}
                                            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-md appearance-none cursor-pointer"
                                        />
                                        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            <span>1 km</span>
                                            <span>50 km</span>
                                        </div>
                                    </div>

                                    {/* Instructions selon le mode */}
                                    <div className="p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded-md">
                                        <div className="flex items-center space-x-2 text-orange-800 dark:text-orange-400 mb-2">
                                            <MapPinIcon className="w-5 h-5" />
                                            <span className="font-medium">{t_plan('nextStep')}</span>
                                        </div>
                                        <p className="text-sm text-orange-700 dark:text-orange-300">
                                            {selectionMode === 'address' ? 
                                                t_plan('searchAddressOrStart') :
                                                t_plan('clickStartThenSelect')
                                            }
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="flex space-x-3">
                            {selectedEvent ? (
                                <>
                                    <button
                                        onClick={() => {
                                            if (selectionMode === 'map') {
                                                console.log('🚀 Bouton Commencer cliqué - Mode carte');
                                                console.log('📋 Événement sélectionné:', selectedEvent?.title);
                                                setIsCreatingRoute(true);
                                                setShowRouteCreationModal(false);
                                                console.log('✅ Mode création activé, modal fermé');
                                                toast.success(t_plan('clickToSelectPoint'));
                                            } else {
                                                toast.error(t_plan('selectAddressFirst'));
                                            }
                                        }}
                                        disabled={selectionMode === 'address' && !selectedRoutePoint}
                                        className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-6 py-3 rounded-md font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {selectionMode === 'address' ? 
                                            (selectedRoutePoint ? t_plan('continue') : t_plan('selectAddress')) : 
                                            t_plan('start')
                                        }
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowRouteCreationModal(false);
                                            setSelectedEvent(null);
                                            setSelectedRoutePoint(null);
                                            setAddressQuery('');
                                            setSelectedAddress(null);
                                            setShowAddressSuggestions(false);
                                            setAddressSuggestions([]);
                                        }}
                                        className="flex-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                                    >
                                        {t_plan('cancel')}
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={() => {
                                        setShowRouteCreationModal(false);
                                        setSelectedEvent(null);
                                    }}
                                    className="w-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                                >
                                    {t_plan('close')}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de confirmation de création de route */}
            {showRouteConfirmationModal && selectedRoutePoint && selectedEvent && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96 max-w-md mx-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            {t_plan('confirmRouteCreation')}
                        </h3>
                        
                        <div className="space-y-4 mb-6">
                            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
                                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                                    {t_plan('event')}
                                </h4>
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                    <div><strong>{selectedEvent.title}</strong></div>
                                    <div>{new Date(selectedEvent.beginningDate).toLocaleDateString()}</div>
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    {t_plan('selectedStartingPoint')}
                                </label>
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                    {selectedAddress ? (
                                        <>
                                            <div className="mb-2"><strong>{t_plan('address')}</strong> {addressQuery}</div>
                                            <div>{t_plan('latitude')} {selectedRoutePoint.lat.toFixed(6)}<br/>
                                            {t_plan('longitude')} {selectedRoutePoint.lng.toFixed(6)}</div>
                                        </>
                                    ) : (
                                        <>
                                            {t_plan('latitude')} {selectedRoutePoint.lat.toFixed(6)}<br/>
                                            {t_plan('longitude')} {selectedRoutePoint.lng.toFixed(6)}
                                        </>
                                    )}
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    {t_plan('searchRadius').replace(':', '')}
                                </label>
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                    {radiusKm} km {t_plan('searchRadiusInfo')}
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
                                    setShowRouteConfirmationModal(false);
                                    setAddressQuery('');
                                    setSelectedAddress(null);
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
                    pointName={selectedPointForRoute.notes || t_plan('defaultGeoPoint')}
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
                            {t_plan('confirmDeleteItinerary')}
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