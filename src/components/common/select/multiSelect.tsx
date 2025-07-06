import React, { forwardRef, useState, useRef, useEffect, useMemo } from 'react';
import { FaChevronDown, FaTimes } from 'react-icons/fa';

interface Option {
    value: string;
    label: string;
}

export interface MultiSelectProps {
    label?: string;
    error?: string;
    borderColor?: string;
    placeholder?: string;
    value: string[];
    onChange: (event: { target: { value: string[], name?: string } }) => void;
    name?: string;
    className?: string;
    children: React.ReactNode;
}

export const MultiSelect = forwardRef<HTMLButtonElement, MultiSelectProps>(
    ({
        className = '',
        error,
        children,
        borderColor = "border-gray-300",
        placeholder,
        value = [],
        onChange,
        name,
        ...props
    }, ref) => {
        const [isOpen, setIsOpen] = useState(false);
        const dropdownRef = useRef<HTMLDivElement>(null);

        const parsedOptions: Option[] = useMemo(() => {
            if (children) {
                return React.Children.toArray(children).map(child => {
                    if (React.isValidElement(child) && typeof child.type === 'string' && child.type === 'option') {
                        if (child.props && typeof child.props === 'object') {
                            const { value, children: labelChildren } = child.props as { value: any, children: React.ReactNode };
                            if (value !== undefined && labelChildren !== undefined) {
                                return { value: String(value), label: String(labelChildren) };
                            }
                        }
                    }
                    return null;
                }).filter(Boolean) as Option[];
            }
            return [];
        }, [children]);

        const selectedLabels = useMemo(() => {
            return parsedOptions
                .filter(option => value.includes(option.value))
                .map(option => option.label);
        }, [value, parsedOptions]);

        const handleToggle = () => {
            setIsOpen(!isOpen);
        };

        const handleOptionClick = (optionValue: string) => {
            const newValue = value.includes(optionValue)
                ? value.filter(v => v !== optionValue)
                : [...value, optionValue];
            
            if (onChange) {
                const syntheticEvent = {
                    target: { value: newValue, name },
                };
                onChange(syntheticEvent);
            }
        };

        const removeSelection = (optionValue: string, e: React.MouseEvent) => {
            e.stopPropagation();
            const newValue = value.filter(v => v !== optionValue);
            if (onChange) {
                const syntheticEvent = {
                    target: { value: newValue, name },
                };
                onChange(syntheticEvent);
            }
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

        const isActive = isOpen || value.length > 0;

        return (
            <div className={`relative ${className}`} ref={dropdownRef}>
                <div className="relative">
                    <button
                        type="button"
                        ref={ref}
                        className={`peer w-full flex justify-between items-center px-5 py-3 pr-10 border rounded outline-none transition-all duration-200
                            ${isOpen ? 'border-blue-500 dark:border-blue-400' : `${borderColor}`}
                            bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                            ${error ? 'border-red-500' : ''}
                        `}
                        onClick={handleToggle}
                        aria-haspopup="listbox"
                        aria-expanded={isOpen}
                        aria-labelledby="multiselect-label"
                        {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}
                    >
                        <div className="flex flex-wrap gap-1 flex-1 min-h-6">
                            {selectedLabels.length > 0 ? (
                                selectedLabels.map((label, index) => {
                                    const optionValue = parsedOptions.find(opt => opt.label === label)?.value;
                                    return (
                                        <span
                                            key={index}
                                            className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full"
                                        >
                                            {label}
                                            <button
                                                type="button"
                                                onClick={(e) => optionValue && removeSelection(optionValue, e)}
                                                className="hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-0.5"
                                            >
                                                <FaTimes className="w-2 h-2" />
                                            </button>
                                        </span>
                                    );
                                })
                            ) : (
                                <span className="text-gray-500 dark:text-gray-400">{placeholder}</span>
                            )}
                        </div>
                        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                            <FaChevronDown className={`h-3 w-3 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                        </div>
                    </button>

                    <label
                        id="multiselect-label"
                        className={`absolute transition-all duration-200 pointer-events-none
                            ${isActive
                                ? "text-xs -top-2 left-3 bg-white dark:bg-gray-700 px-1 text-blue-500 dark:text-blue-400"
                                : "text-gray-500 dark:text-gray-400 top-1/2 left-5 transform -translate-y-1/2"
                            }
                        `}
                    >
                        {props.label || placeholder || "Sélectionnez des options"}
                    </label>
                </div>

                {isOpen && (
                    <div
                        className="absolute z-10 mt-1 w-full rounded-md bg-white dark:bg-gray-700 shadow-lg border border-gray-200 dark:border-gray-600 max-h-60 overflow-auto"
                        role="listbox"
                        tabIndex={-1}
                        aria-labelledby="multiselect-label"
                    >
                        {parsedOptions.map(option => (
                            <div
                                key={option.value}
                                className={`px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-900 dark:text-white flex items-center gap-2
                                    ${value.includes(option.value) ? 'bg-blue-50 dark:bg-blue-900' : ''}
                                `}
                                onClick={() => handleOptionClick(option.value)}
                                role="option"
                                aria-selected={value.includes(option.value)}
                            >
                                <input
                                    type="checkbox"
                                    checked={value.includes(option.value)}
                                    onChange={() => {}} // Géré par onClick du parent
                                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                />
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

MultiSelect.displayName = 'MultiSelect'; 