import { useState } from "react";
import { InputProps } from "../../../types/inputProps";


const Input: React.FC<InputProps> = ({
                                         placeholder = "Placeholder",
                                         type = "text",
                                         className = "",
                                         value,
                                         onChange,
                                         name,
                                         id,
                                         required = false,
                                         autoComplete
                                     }) => {
    const [isFocused, setIsFocused] = useState<boolean>(false);

    // Déterminer si le champ est actif (focus ou contient une valeur)
    const isActive = isFocused || (value && value.length > 0);

    return (
        <div className={`relative ${className}`}>
            {/* Input */}
            <input
                type={type}
                name={name}
                id={id}
                value={value}
                onChange={onChange}
                required={required}
                autoComplete={autoComplete}
                className="peer w-full border border-gray-300 dark:border-gray-600 rounded px-5 py-3 outline-none transition-all duration-200 focus:border-blue-500 dark:focus:border-blue-400 dark:bg-gray-700 dark:text-white"
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
            />

            {/* Placeholder flottant */}
            <label
                className={`absolute transition-all duration-200 pointer-events-none
                    ${isActive
                    ? "text-xs -top-2 left-3 bg-white dark:bg-gray-700 px-1 text-blue-500 dark:text-blue-400"
                    : "text-gray-500 dark:text-gray-400 top-1/2 left-5 transform -translate-y-1/2"
                }
                `}
            >
                {placeholder}
            </label>
        </div>
    );
};

export { Input };