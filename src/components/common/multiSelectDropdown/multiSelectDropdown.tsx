import React, { useState, useRef, useEffect, useMemo } from 'react';
import { FaChevronDown, FaCheck } from 'react-icons/fa';

interface Option {
    value: string;
    label: string;
}

interface MultiSelectDropdownProps {
    options: Option[];
    selectedValues: string[];
    onChange: (values: string[]) => void;
    label?: string;
    placeholder?: string;
    className?: string;
}

export const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = (
    { options, selectedValues, onChange, label, placeholder = 'Sélectionner...', className }
) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const handleToggle = () => {
        setIsOpen(!isOpen);
    };

    const handleOptionClick = (value: string) => {
        const newSelectedValues = selectedValues.includes(value)
            ? selectedValues.filter(val => val !== value)
            : [...selectedValues, value];
        onChange(newSelectedValues);
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

    const isActive = isOpen || selectedValues.length > 0;

    const displayValue = useMemo(() => {
        if (selectedValues.length === 0) {
            return '';
        } else if (selectedValues.length === options.length) {
            return 'Tous les items';
        } else if (selectedValues.length === 1) {
            return options.find(opt => opt.value === selectedValues[0])?.label;
        } else {
            return `${selectedValues.length} items sélectionnés`;
        }
    }, [selectedValues, options]);

    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            <div className="relative">
                <button
                    type="button"
                    className={`peer w-full flex justify-between items-center px-5 py-3 pr-10 border rounded outline-none transition-all duration-200
                        ${isOpen ? 'border-blue-500 dark:border-blue-400' : 'border-gray-300 dark:border-gray-600'}
                        bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                    onClick={handleToggle}
                >
                    <span className="truncate">{displayValue}</span>
                    <FaChevronDown className={`ml-2 h-3 w-3 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                <label
                    className={`absolute transition-all duration-200 pointer-events-none
                        ${isActive
                            ? "text-xs -top-2 left-3 bg-white dark:bg-gray-700 px-1 text-blue-500 dark:text-blue-400"
                            : "text-gray-500 dark:text-gray-400 top-1/2 left-5 transform -translate-y-1/2"
                        }
                    `}
                >
                    {label || placeholder}
                </label>
            </div>

            {isOpen && (
                <div className="absolute z-10 mt-1 w-full rounded-md bg-white dark:bg-gray-700 shadow-lg border border-gray-200 dark:border-gray-600 max-h-60 overflow-auto">
                    {options.map(option => (
                        <div
                            key={option.value}
                            className="flex items-center px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                            onClick={() => handleOptionClick(option.value)}
                        >
                            <input
                                type="checkbox"
                                readOnly
                                checked={selectedValues.includes(option.value)}
                                className="form-checkbox h-4 w-4 text-blue-600 transition duration-150 ease-in-out dark:bg-gray-600 dark:border-gray-500 dark:checked:bg-blue-500"
                            />
                            <span className="ml-2 text-gray-900 dark:text-white">{option.label}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}; 