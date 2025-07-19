import React, { SelectHTMLAttributes, forwardRef, useState, useRef, useEffect, useMemo } from 'react';
import { FaChevronDown } from 'react-icons/fa';

interface Option {
    value: string;
    label: string;
}

// Définition de l'interface pour les props des éléments <option>
interface OptionElementProps {
    value: string | number | readonly string[] | undefined;
    children: React.ReactNode;
}

// Nettoyage de SelectProps: suppression de isFocused et setIsFocused
export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'isFocused' | 'setIsFocused'> {
    label?: string;
    error?: string;
    borderColor?: string;
    rightIcon?: React.ReactNode;
    placeholder?: string;
    // La prop options n'est plus utilisée car nous parsons les children
}

// Le ref est maintenant pour un HTMLButtonElement
export const Select = forwardRef<HTMLButtonElement, SelectProps>(
    ({
        className = '',
        error,
        children,
        borderColor = "border-gray-300",
        rightIcon,
        placeholder,
        value,
        onChange,
        ...props
    }, ref) => {
        const [isOpen, setIsOpen] = useState(false);
        const dropdownRef = useRef<HTMLDivElement>(null);

        const parsedOptions: Option[] = useMemo(() => {
            if (children) {
                // Utilisation de toArray pour une meilleure gestion des enfants
                return React.Children.toArray(children).map(child => {
                    // Vérifier si c'est un élément React valide et une balise <option>
                    if (React.isValidElement(child) && typeof child.type === 'string' && child.type === 'option') {
                        // Vérifier que child.props est défini et est un objet
                        if (child.props && typeof child.props === 'object') {
                            const { value, children: labelChildren } = child.props as { value: any, children: React.ReactNode };
                            // S'assurer que la valeur et le label sont définis
                            if (value !== undefined && labelChildren !== undefined) {
                                return { value: String(value), label: String(labelChildren) };
                            }
                        }
                    }
                    return null; // Retourner null pour les enfants invalides
                }).filter(Boolean) as Option[]; // Filtrer les null et caster le tableau final
            }
            return [];
        }, [children]);

        const selectedLabel = useMemo(() => {
            const selectedOption = parsedOptions.find(option => option.value === value);
            return selectedOption ? selectedOption.label : '';
        }, [value, parsedOptions]);

        const handleToggle = () => {
            setIsOpen(!isOpen);
        };

        const handleOptionClick = (optionValue: string) => {
            if (onChange) {
                // Simuler un événement de changement pour correspondre à l'API du <select> natif
                const syntheticEvent = {
                    target: { value: optionValue, name: props.name },
                } as React.ChangeEvent<HTMLSelectElement>; // Toujours simuler un événement de SelectHTMLAttributes
                onChange(syntheticEvent);
            }
            setIsOpen(false);
        };

        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        useEffect(() => {
            document.addEventListener('mousedown', handleClickOutside);
            return () => {
                document.removeEventListener('mousedown', handleClickOutside);
            };
        }, []);

        const isActive = isOpen || (value !== null && value !== undefined && String(value).length > 0);

        return (
            <div className={`relative ${className}`} ref={dropdownRef}>
                <div className="relative">
                    <button
                        type="button"
                        ref={ref as React.Ref<HTMLButtonElement>} // Caster le ref pour le bouton
                        className={`peer w-full flex justify-between items-center px-5 py-3 pr-10 border rounded outline-none transition-all duration-200
                            ${isOpen ? 'border-blue-500 dark:border-blue-400' : `${borderColor}`}
                            bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                            ${error ? 'border-red-500' : ''}
                        `}
                        onClick={handleToggle}
                        aria-haspopup="listbox"
                        aria-expanded={isOpen}
                        aria-labelledby="select-label"
                        {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)} // Propager les autres props au bouton
                    >
                        <span className="truncate">{selectedLabel || placeholder}</span>
                        {/* Icône à droite (par défaut ou personnalisée) */}
                        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                            {rightIcon ? rightIcon : (
                                <FaChevronDown className={`h-3 w-3 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                            )}
                        </div>
                    </button>

                    {/* Label flottant */}
                    <label
                        id="select-label"
                        className={`absolute transition-all duration-200 pointer-events-none
                            ${isActive
                                ? "text-xs -top-2 left-3 bg-white dark:bg-gray-700 px-1 text-blue-500 dark:text-blue-400"
                                : "text-gray-500 dark:text-gray-400 top-1/2 left-5 transform -translate-y-1/2"
                            }
                        `}
                    >
                        {props.label || placeholder || "Sélectionnez une catégorie"}
                    </label>
                </div>

                {isOpen && ( // Menu déroulant personnalisé
                    <div
                        className="absolute z-10 mt-1 w-full rounded-md bg-white dark:bg-gray-700 shadow-lg border border-gray-200 dark:border-gray-600 max-h-60 overflow-auto"
                        role="listbox"
                        tabIndex={-1}
                        aria-labelledby="select-label"
                    >
                        {parsedOptions.map(option => (
                            <div
                                key={option.value}
                                className={`px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-900 dark:text-white
                                    ${option.value === value ? 'bg-blue-50 dark:bg-blue-900' : ''}
                                `}
                                onClick={() => handleOptionClick(option.value)}
                                role="option"
                                aria-selected={option.value === value}
                            >
                                {option.label}
                            </div>
                        ))}
                    </div>
                )}

                {error && (
                    <p className="mt-1 text-sm text-red-500 dark:text-red-400">
                        {error}
                    </p>
                )}
            </div>
        );
    }
);

Select.displayName = 'Select'; 