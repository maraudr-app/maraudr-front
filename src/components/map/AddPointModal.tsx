import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { XMarkIcon, MapPinIcon, MagnifyingGlassIcon, CheckIcon } from '@heroicons/react/24/outline';
import { Dialog } from '@headlessui/react';
import { Input } from '../common/input/input';
import { Button } from '../common/button/button';
import { useAssoStore } from '../../store/assoStore';
import { geoService } from '../../services/geoService';
import { getModuleApiUrl } from '../../config/api';

interface AddPointModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPointAdded: () => void;
  initialLat?: number;
  initialLng?: number;
}

interface AddressSuggestion {
  properties: {
    formatted: string;
    lat: number;
    lon: number;
  };
}

const AddPointModal: React.FC<AddPointModalProps> = ({
  isOpen,
  onClose,
  onPointAdded,
  initialLat,
  initialLng
}) => {
  const { t } = useTranslation();
  const { selectedAssociation } = useAssoStore();

  const t_map = (key: string): string => {
    return t(`map.${key}` as any);
  };

  // États du formulaire
  const [latitude, setLatitude] = useState<number | ''>('');
  const [longitude, setLongitude] = useState<number | ''>('');
  const [notes, setNotes] = useState('');
  const [addressQuery, setAddressQuery] = useState('');
  const [addressSuggestions, setAddressSuggestions] = useState<AddressSuggestion[]>([]);
  const [showAddressSuggestions, setShowAddressSuggestions] = useState(false);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Mode de saisie (coordonnées directes ou adresse)
  const [inputMode, setInputMode] = useState<'coordinates' | 'address'>('address');

  // Initialiser les coordonnées si fournies
  useEffect(() => {
    if (initialLat && initialLng) {
      setLatitude(initialLat);
      setLongitude(initialLng);
      setInputMode('coordinates');
    }
  }, [initialLat, initialLng]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setLatitude('');
      setLongitude('');
      setNotes('');
      setAddressQuery('');
      setAddressSuggestions([]);
      setShowAddressSuggestions(false);
      setError(null);
      setSuccess(null);
      setInputMode('address');
    }
  }, [isOpen]);

  // Recherche d'adresses avec debounce
  useEffect(() => {
    if (!addressQuery || addressQuery.trim().length < 3) {
      setAddressSuggestions([]);
      setShowAddressSuggestions(false);
      return;
    }

    const timeoutId = setTimeout(async () => {
      await searchAddresses(addressQuery);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [addressQuery]);

  // Recherche d'adresses via l'API
  const searchAddresses = async (query: string) => {
    if (!query || query.trim().length < 3) return;

    try {
      setIsLoadingAddresses(true);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error(t_map('auth_error'));
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
        throw new Error(t_map('address_search_error'));
      }

      const data = await response.json();
      
      if (data.features && Array.isArray(data.features)) {
        setAddressSuggestions(data.features.slice(0, 5)); // Limiter à 5 suggestions
        setShowAddressSuggestions(true);
      } else {
        setAddressSuggestions([]);
        setShowAddressSuggestions(false);
      }
    } catch (error: any) {
      console.error('Erreur lors de la recherche d\'adresses:', error);
      setError(error.message || t_map('address_search_error'));
      setAddressSuggestions([]);
      setShowAddressSuggestions(false);
    } finally {
      setIsLoadingAddresses(false);
    }
  };

  // Sélection d'une adresse
  const handleAddressSelect = (suggestion: AddressSuggestion) => {
    setAddressQuery(suggestion.properties.formatted);
    setLatitude(suggestion.properties.lat);
    setLongitude(suggestion.properties.lon);
    setShowAddressSuggestions(false);
  };

  // Validation des coordonnées
  const validateCoordinates = (): boolean => {
    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      setError(t_map('coordinates_required'));
      return false;
    }

    if (latitude < -90 || latitude > 90) {
      setError(t_map('invalid_latitude'));
      return false;
    }

    if (longitude < -180 || longitude > 180) {
      setError(t_map('invalid_longitude'));
      return false;
    }

    return true;
  };

  // Soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedAssociation?.id) {
      setError(t_map('no_association'));
      return;
    }

    if (!validateCoordinates()) {
      return;
    }

    if (!notes.trim()) {
      setError(t_map('notes_required'));
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const pointData = {
        associationId: selectedAssociation.id,
        latitude: latitude as number,
        longitude: longitude as number,
        notes: notes.trim()
      };

      await geoService.addGeoPoint(pointData);
      
      setSuccess(t_map('point_added_success'));
      
      // Fermer le modal après un délai
      setTimeout(() => {
        onPointAdded();
        onClose();
      }, 1500);

    } catch (error: any) {
      console.error('Erreur lors de l\'ajout du point:', error);
      
      if (error.response?.status === 401) {
        setError(t_map('auth_error'));
      } else if (error.response?.status === 400) {
        setError(t_map('invalid_data'));
      } else if (error.message?.includes('network') || error.message?.includes('connection')) {
        setError(t_map('network_error'));
      } else {
        setError(error.message || t_map('unknown_error'));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Utiliser la position actuelle
  const useCurrentLocation = async () => {
    try {
      setError(null);
      const position = await geoService.getCurrentPosition();
      setLatitude(position.coords.latitude);
      setLongitude(position.coords.longitude);
      setInputMode('coordinates');
    } catch (error: any) {
      setError(error.message || t_map('location_error'));
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl">
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <Dialog.Title className="text-lg font-semibold text-gray-900 dark:text-white">
                {t_map('add_point_title')}
              </Dialog.Title>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            {/* Messages d'erreur et de succès */}
            {error && (
              <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-lg">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 rounded-lg flex items-center">
                <CheckIcon className="w-5 h-5 mr-2" />
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Mode de saisie */}
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setInputMode('coordinates')}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                    inputMode === 'coordinates'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {t_map('coordinates_mode')}
                </button>
                <button
                  type="button"
                  onClick={() => setInputMode('address')}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                    inputMode === 'address'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {t_map('address_mode')}
                </button>
              </div>

              {/* Saisie par adresse */}
              {inputMode === 'address' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t_map('address_label')}
                    </label>
                    <div className="relative w-full">
                      <Input
                        value={addressQuery}
                        onChange={(e) => setAddressQuery(e.target.value)}
                        placeholder={t_map('address_placeholder')}
                        className="pr-10 w-full"
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
                  </div>

                  <button
                    type="button"
                    onClick={useCurrentLocation}
                    className="w-full flex items-center justify-center space-x-2 py-2 px-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
                  >
                    <MapPinIcon className="w-4 h-4" />
                    <span>{t_map('use_current_location')}</span>
                  </button>
                </div>
              )}

              {/* Saisie par coordonnées */}
              {inputMode === 'coordinates' && (
                <div className="grid grid-cols-2 gap-3 w-full">
                  <div className="w-full">
                    <Input
                      type="number"
                      step="any"
                      value={latitude}
                      onChange={(e) => setLatitude(e.target.value === '' ? '' : parseFloat(e.target.value))}
                      placeholder={t_map('latitude_placeholder')}
                      className="w-full"
                    />
                  </div>
                  <div className="w-full">
                    <Input
                      type="number"
                      step="any"
                      value={longitude}
                      onChange={(e) => setLongitude(e.target.value === '' ? '' : parseFloat(e.target.value))}
                      placeholder={t_map('longitude_placeholder')}
                      className="w-full"
                    />
                  </div>
                </div>
              )}

              {/* Description */}
              <div>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={t_map('notes_placeholder')}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Actions */}
              <div className="flex space-x-3 pt-4">
                <Button
                  type="button"
                  onClick={onClose}
                  className="flex-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
                >
                  {t_map('cancel')}
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-blue-500 hover:from-orange-600 hover:to-blue-600 text-white disabled:opacity-50"
                >
                  {isSubmitting ? t_map('adding') : t_map('add_point')}
                </Button>
              </div>
            </form>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default AddPointModal; 