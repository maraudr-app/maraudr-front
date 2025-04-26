import React from 'react';
import { ButtonProps } from '../../../types/ButtonProps';

export const Button: React.FC<ButtonProps> = ({
    onClick,
    className = "",
    disabled = false,
    isLoading = false,
    type = "button",
    children
}) => {
    // Définir les styles de base qui s'adaptent au mode sombre
    const baseClasses = "px-4 py-3 rounded font-medium flex items-center justify-center transition-colors";
    const disabledClasses = disabled || isLoading ? "opacity-70 cursor-not-allowed" : "";
    
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled || isLoading}
            className={`${baseClasses} ${disabledClasses} ${className}`}
        >
            {isLoading ? (
                <div className="w-5 h-5 border-b-2 border-current rounded-full animate-spin" />
            ) : (
                children
            )}
        </button>
    );
};

export default Button;

