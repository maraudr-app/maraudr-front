import React from 'react';
import { TravelTimes, geoService } from '../../../services/geoService';
import { 
    UserIcon, 
    BoltIcon, 
    TruckIcon,
    RocketLaunchIcon
} from '@heroicons/react/24/outline';

interface RouteInfoModalProps {
    isOpen: boolean;
    onClose: () => void;
    pointName: string;
    coordinates: { lat: number; lng: number };
    travelTimes: TravelTimes | null;
    isLoading: boolean;
    userPosition: { lat: number; lng: number } | null;
}

const RouteInfoModal: React.FC<RouteInfoModalProps> = ({
    isOpen,
    onClose,
    pointName,
    coordinates,
    travelTimes,
    isLoading,
    userPosition
}) => {
    if (!isOpen) return null;

    const directDistance = userPosition 
        ? geoService.calculateDistance(
            userPosition.lat, 
            userPosition.lng, 
            coordinates.lat, 
            coordinates.lng
        )
        : 0;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-orange-500 to-blue-600 text-white p-6 rounded-t-2xl">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-xl font-bold mb-2">Itinéraire vers</h2>
                            <p className="text-orange-100 text-sm">{pointName}</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-white hover:text-orange-200 transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div className="p-6">
                    {/* Coordonnées */}
                    <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Coordonnées</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Latitude: {coordinates.lat.toFixed(6)}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Longitude: {coordinates.lng.toFixed(6)}
                        </p>
                        {directDistance > 0 && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                Distance directe: {geoService.formatDistance(directDistance * 1000)}
                            </p>
                        )}
                    </div>

                    {/* État de chargement */}
                    {isLoading && (
                        <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                            <span className="ml-3 text-gray-600 dark:text-gray-400">
                                Calcul de l'itinéraire...
                            </span>
                        </div>
                    )}

                    {/* Informations d'itinéraire */}
                    {!isLoading && travelTimes && (
                        <div className="space-y-4">
                            <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-4">
                                Temps de trajet depuis votre position
                            </h3>

                            {/* À pied */}
                            <div className="flex items-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                                <div className="flex-shrink-0 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                                    <span className="text-white text-lg">🚶</span>
                                </div>
                                <div className="ml-4 flex-1">
                                    <h4 className="font-medium text-green-800 dark:text-green-200">À pied</h4>
                                    <div className="flex justify-between text-sm text-green-600 dark:text-green-300">
                                        <span>{geoService.formatDuration(travelTimes.walking.duration)}</span>
                                        <span>{geoService.formatDistance(travelTimes.walking.distance)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* À vélo */}
                            <div className="flex items-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                <div className="flex-shrink-0 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                                    <span className="text-white text-lg">🚴</span>
                                </div>
                                <div className="ml-4 flex-1">
                                    <h4 className="font-medium text-blue-800 dark:text-blue-200">À vélo</h4>
                                    <div className="flex justify-between text-sm text-blue-600 dark:text-blue-300">
                                        <span>{geoService.formatDuration(travelTimes.cycling.duration)}</span>
                                        <span>{geoService.formatDistance(travelTimes.cycling.distance)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* En voiture */}
                            <div className="flex items-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                                <div className="flex-shrink-0 w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                                    <span className="text-white text-lg">🚗</span>
                                </div>
                                <div className="ml-4 flex-1">
                                    <h4 className="font-medium text-orange-800 dark:text-orange-200">En voiture</h4>
                                    <div className="flex justify-between text-sm text-orange-600 dark:text-orange-300">
                                        <span>{geoService.formatDuration(travelTimes.driving.duration)}</span>
                                        <span>{geoService.formatDistance(travelTimes.driving.distance)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Message d'erreur si pas de position */}
                    {!isLoading && !userPosition && (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                            <p className="text-gray-600 dark:text-gray-400 text-sm">
                                Autorisez la géolocalisation pour voir les temps de trajet
                            </p>
                        </div>
                    )}

                    {/* Bouton de fermeture */}
                    <div className="mt-6 flex justify-end">
                        <button
                            onClick={onClose}
                            className="px-6 py-2 bg-gradient-to-r from-orange-500 to-blue-600 text-white rounded-lg hover:from-orange-600 hover:to-blue-700 transition-all duration-200 font-medium"
                        >
                            Fermer
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RouteInfoModal;
