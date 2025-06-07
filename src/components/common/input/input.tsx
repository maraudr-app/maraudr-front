import { useState } from "react";
import { InputProps } from "../../../types/inputProps";

interface ExtendedInputProps extends InputProps {
    borderColor?: string;
    rightIcon?: React.ReactNode;
    isFocused?: boolean;
    setIsFocused?: (focused: boolean) => void;
    error?: string;
}

const Input: React.FC<ExtendedInputProps> = ({
                                                 placeholder = "Placeholder",
                                                 type = "text",
                                                 className = "",
                                                 value,
                                                 onChange,
                                                 name,
                                                 id,
                                                 required = false,
                                                 autoComplete,
                                                 borderColor = "border-gray-300",
                                                 rightIcon,
                                                 isFocused: externalIsFocused,
                                                 setIsFocused: setExternalIsFocused,
                                                 error
                                             }) => {
    const [internalFocus, setInternalFocus] = useState(false);

    const isFocused = externalIsFocused !== undefined ? externalIsFocused : internalFocus;
    const setIsFocused = setExternalIsFocused !== undefined ? setExternalIsFocused : setInternalFocus;

    const isActive = isFocused || (!!value && value.toString().length > 0);

    return (
        <div className={`relative ${className}`}>
            <div className="relative">
                <input
                    type={type}
                    name={name}
                    id={id}
                    value={value}
                    onChange={onChange}
                    required={required}
                    autoComplete={autoComplete}
                    className={`peer w-full border ${borderColor} rounded px-5 py-3 pr-10 outline-none transition-all duration-200 focus:border-blue-500 dark:focus:border-blue-400 dark:bg-gray-700 dark:text-white ${error ? 'border-red-500' : ''}`}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                />

                {/* Icône à droite */}
                {rightIcon && (
                    <div className="absolute inset-y-0 right-3 flex items-center">
                        <div className="cursor-pointer pointer-events-auto">
                            {rightIcon}
                        </div>
                    </div>
                )}

                {/* Label flottant */}
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

            {/* Message d'erreur */}
            {error && (
                <p className="mt-1 text-sm text-red-500">{error}</p>
            )}
        </div>
    );
};

export { Input };
