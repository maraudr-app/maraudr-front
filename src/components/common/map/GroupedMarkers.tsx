import React, { useState, useMemo } from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { MapPinIcon, UserIcon, ClockIcon, ExclamationTriangleIcon, FireIcon, EyeIcon } from '@heroicons/react/24/outline';
import { GeoPoint } from '../../../services/geoService';
import './GroupedMarkers.css';

interface GroupedMarkersProps {
    points: GeoPoint[];
    onShowRoute: (point: GeoPoint) => void;
    formatDate: (timestamp?: string, observedAt?: string) => string;
}

// Créer une icône personnalisée pour les groupes de points
const createGroupedIcon = (count: number, color: string) => {
    const size = Math.min(30 + count * 5, 50); // Taille adaptative selon le nombre de points
    
    return L.divIcon({
        html: `
            <div style="
                background: linear-gradient(135deg, ${color}, ${color}dd);
                width: ${size}px;
                height: ${size}px;
                border-radius: 50%;
                border: 3px solid white;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: bold;
                font-size: ${Math.max(12, 16 - count)}px;
                position: relative;
            ">
                ${count > 1 ? count : ''}
                ${count === 1 ? `
                    <div style="
                        position: absolute;
                        top: -2px;
                        right: -2px;
                        width: 8px;
                        height: 8px;
                        background: #10B981;
                        border-radius: 50%;
                        border: 2px solid white;
                    "></div>
                ` : ''}
            </div>
        `,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
        className: 'grouped-marker'
    });
};

// Créer une icône personnalisée pour les points individuels
const createIndividualIcon = (point: GeoPoint, color: string) => {
    const getIconType = (point: GeoPoint) => {
        if (point.notes?.toLowerCase().includes('urgence') || point.notes?.toLowerCase().includes('urgent')) {
            return 'emergency';
        }
        if (point.notes?.toLowerCase().includes('surveillance') || point.notes?.toLowerCase().includes('watch')) {
            return 'surveillance';
        }
        if (point.notes?.toLowerCase().includes('incident') || point.notes?.toLowerCase().includes('accident')) {
            return 'incident';
        }
        if (point.notes?.toLowerCase().includes('patrouille') || point.notes?.toLowerCase().includes('patrol')) {
            return 'patrol';
        }
        return 'default';
    };

    const iconType = getIconType(point);
    const iconColors = {
        emergency: '#EF4444',
        surveillance: '#3B82F6',
        incident: '#F59E0B',
        patrol: '#10B981',
        default: color
    };

    const iconSymbols = {
        emergency: '🚨',
        surveillance: '👁️',
        incident: '⚠️',
        patrol: '🚶',
        default: '📍'
    };

    return L.divIcon({
        html: `
            <div style="
                background: ${iconColors[iconType]};
                width: 35px;
                height: 35px;
                border-radius: 50%;
                border: 3px solid white;
                box-shadow: 0 3px 8px rgba(0,0,0,0.3);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 16px;
                position: relative;
            ">
                ${iconSymbols[iconType]}
            </div>
        `,
        iconSize: [35, 35],
        iconAnchor: [17.5, 17.5],
        className: `individual-marker ${iconType !== 'default' ? `marker-${iconType}` : ''}`
    });
};

export const GroupedMarkers: React.FC<GroupedMarkersProps> = ({ points, onShowRoute, formatDate }) => {
    const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

    // Grouper les points par adresse (avec une tolérance de 10 mètres)
    const groupedPoints = useMemo(() => {
        const groups: { [key: string]: GeoPoint[] } = {};
        
        points.forEach(point => {
            // Utiliser l'adresse si disponible, sinon créer une clé basée sur les coordonnées
            const key = point.address || `${point.latitude.toFixed(4)},${point.longitude.toFixed(4)}`;
            
            if (!groups[key]) {
                groups[key] = [];
            }
            groups[key].push(point);
        });

        // Trier les points dans chaque groupe par date (plus récent en premier)
        Object.keys(groups).forEach(key => {
            groups[key].sort((a, b) => {
                const dateA = new Date(a.observedAt || a.timestamp || 0);
                const dateB = new Date(b.observedAt || b.timestamp || 0);
                return dateB.getTime() - dateA.getTime();
            });
        });

        return Object.entries(groups).map(([address, groupPoints]) => ({
            address,
            points: groupPoints,
            center: {
                lat: groupPoints.reduce((sum, p) => sum + p.latitude, 0) / groupPoints.length,
                lng: groupPoints.reduce((sum, p) => sum + p.longitude, 0) / groupPoints.length
            }
        }));
    }, [points]);

    const toggleGroup = (address: string) => {
        const newExpanded = new Set(expandedGroups);
        if (newExpanded.has(address)) {
            newExpanded.delete(address);
        } else {
            newExpanded.add(address);
        }
        setExpandedGroups(newExpanded);
    };

    const getGroupColor = (groupPoints: GeoPoint[]) => {
        const hasEmergency = groupPoints.some(p => 
            p.notes?.toLowerCase().includes('urgence') || p.notes?.toLowerCase().includes('urgent')
        );
        const hasIncident = groupPoints.some(p => 
            p.notes?.toLowerCase().includes('incident') || p.notes?.toLowerCase().includes('accident')
        );
        
        if (hasEmergency) return '#EF4444';
        if (hasIncident) return '#F59E0B';
        return '#3B82F6';
    };

    return (
        <>
            {groupedPoints.map((group, groupIndex) => {
                const isExpanded = expandedGroups.has(group.address);
                const groupColor = getGroupColor(group.points);
                
                if (group.points.length === 1) {
                    // Point unique - afficher directement
                    const point = group.points[0];
                    return (
                        <Marker
                            key={`single-${point.id || groupIndex}`}
                            position={[point.latitude, point.longitude]}
                            icon={createIndividualIcon(point, groupColor)}
                        >
                            <Popup>
                                <div className="p-3 min-w-[250px] max-w-[300px]">
                                    <div className="flex items-start justify-between mb-3">
                                        <h3 className="font-semibold text-gray-900 text-lg">
                                            {point.name || 'Point de géolocalisation'}
                                        </h3>
                                        <div className="flex space-x-1">
                                            <button
                                                onClick={() => onShowRoute(point)}
                                                className="p-1 text-blue-600 hover:text-blue-800 rounded transition-colors"
                                                title="Voir l'itinéraire"
                                            >
                                                <MapPinIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                    
                                    {point.address && (
                                        <div className="flex items-center mb-2 text-sm text-gray-600">
                                            <MapPinIcon className="w-4 h-4 mr-1" />
                                            {point.address}
                                        </div>
                                    )}
                                    
                                    <div className="mb-3">
                                        <p className="text-sm text-gray-700 bg-gray-50 dark:bg-gray-700 dark:text-gray-300 p-2 rounded">
                                            {point.notes || 'Aucune description'}
                                        </p>
                                    </div>
                                    
                                    <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                                        <div className="flex items-center">
                                            <ClockIcon className="w-3 h-3 mr-1" />
                                            {formatDate(point.timestamp, point.observedAt)}
                                        </div>
                                        <div className="text-xs">
                                            {point.latitude.toFixed(4)}, {point.longitude.toFixed(4)}
                                        </div>
                                    </div>
                                    
                                    <button
                                        onClick={() => onShowRoute(point)}
                                        className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white text-sm rounded-lg transition-all"
                                    >
                                        <MapPinIcon className="w-4 h-4" />
                                        <span>Voir l'itinéraire</span>
                                    </button>
                                </div>
                            </Popup>
                        </Marker>
                    );
                } else {
                    // Groupe de points - afficher avec option d'expansion
                    return (
                        <Marker
                            key={`group-${groupIndex}`}
                            position={[group.center.lat, group.center.lng]}
                            icon={createGroupedIcon(group.points.length, groupColor)}
                        >
                            <Popup>
                                <div className="p-3 min-w-[280px] max-w-[350px]">
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="font-semibold text-gray-900 text-lg">
                                            {group.points.length} point{group.points.length > 1 ? 's' : ''}
                                        </h3>
                                        <button
                                            onClick={() => toggleGroup(group.address)}
                                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                        >
                                            {isExpanded ? 'Réduire' : 'Voir tous'}
                                        </button>
                                    </div>
                                    
                                    <div className="mb-3">
                                        <div className="flex items-center text-sm text-gray-600 mb-2">
                                            <MapPinIcon className="w-4 h-4 mr-1" />
                                            {group.address}
                                        </div>
                                    </div>
                                    
                                    {isExpanded && (
                                        <div className="space-y-2 max-h-48 overflow-y-auto">
                                            {group.points.map((point, pointIndex) => (
                                                <div key={point.id || pointIndex} className="border border-gray-200 dark:border-gray-600 rounded-lg p-2">
                                                    <div className="flex items-start justify-between mb-1">
                                                        <h4 className="font-medium text-sm text-gray-900 dark:text-white">
                                                            {point.name || `Point ${pointIndex + 1}`}
                                                        </h4>
                                                        <button
                                                            onClick={() => onShowRoute(point)}
                                                            className="p-1 text-blue-600 hover:text-blue-800 rounded transition-colors"
                                                            title="Voir l'itinéraire"
                                                        >
                                                            <MapPinIcon className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                                                        {point.notes || 'Aucune description'}
                                                    </p>
                                                    <div className="flex items-center justify-between text-xs text-gray-500">
                                                        <span>{formatDate(point.timestamp, point.observedAt)}</span>
                                                        <span>{point.latitude.toFixed(4)}, {point.longitude.toFixed(4)}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    
                                    {!isExpanded && (
                                        <div className="text-sm text-gray-600">
                                            Cliquez sur "Voir tous" pour afficher les détails de chaque point.
                                        </div>
                                    )}
                                </div>
                            </Popup>
                        </Marker>
                    );
                }
            })}
        </>
    );
}; 