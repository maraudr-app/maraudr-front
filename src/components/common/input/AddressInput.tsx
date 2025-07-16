import React, { useState, useRef, useEffect } from 'react';
import { Input } from './input';
import { geoService } from '../../../services/geoService';

interface AddressSuggestion {
    properties: {
        name?: string;
        label: string;
    };
    geometry: {
        coordinates: [number, number]; // [lng, lat]
    };
}

interface AddressInputProps {
    value: string;
    onChange: (value: string) => void;
    onAddressSelect?: (address: AddressSuggestion) => void;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
    error?: string;
}

export const AddressInput: React.FC<AddressInputProps> = ({
    value,
    onChange,
    onAddressSelect,
    placeholder = "Entrez une adresse...",
    className = "",
    disabled = false,
    error
}) => {
    const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Fonction de recherche d'adresses
    const searchAddresses = async (query: string) => {
        if (query.length < 3) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        try {
            setIsLoading(true);
            const data = await geoService.searchAddresses(query);
            const addressSuggestions = data.features || [];
            setSuggestions(addressSuggestions);
            setShowSuggestions(addressSuggestions.length > 0);
        } catch (error) {
            console.error('Erreur lors de la recherche d\'adresses:', error);
            setSuggestions([]);
            setShowSuggestions(false);
        } finally {
            setIsLoading(false);
        }
    };

    // Gérer le changement de valeur
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        onChange(newValue);
        searchAddresses(newValue);
    };

    // Gérer la sélection d'une suggestion
    const handleSuggestionSelect = (suggestion: AddressSuggestion) => {
        onChange(suggestion.properties.label);
        setShowSuggestions(false);
        onAddressSelect?.(suggestion);
    };

    // Gérer le focus
    const handleFocus = () => {
        if (suggestions.length > 0) {
            setShowSuggestions(true);
        }
    };

    // Gérer le blur avec délai pour permettre le clic sur les suggestions
    const handleBlur = () => {
        setTimeout(() => {
            setShowSuggestions(false);
        }, 200);
    };

    // Fermer les suggestions si on clique en dehors
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className={`relative ${className}`} ref={containerRef}>
            <Input
                type="text"
                value={value}
                onChange={handleInputChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                placeholder={placeholder}
                disabled={disabled}
                error={error}
                className="w-full"
                rightIcon={isLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                ) : undefined}
            />

            {/* Dropdown des suggestions */}
            {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-[60] w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                    {suggestions.map((suggestion, index) => (
                        <button
                            key={index}
                            type="button"
                            onMouseDown={(e) => {
                                e.preventDefault(); // Empêche le blur de l'input
                                handleSuggestionSelect(suggestion);
                            }}
                            className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 text-sm text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-600 last:border-b-0 transition-colors"
                        >
                            <div className="font-medium truncate">
                                {suggestion.properties.name || suggestion.properties.label}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                {suggestion.properties.label}
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}; 