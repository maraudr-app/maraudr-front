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
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled || isLoading}
            className={`px-4 py-3 rounded font-medium flex items-center justify-center ${className}`}
        >
            {isLoading ? (
                <div className="w-5 h-5 border-b-2 border-white rounded-full animate-spin" />
            ) : (
                children
            )}
        </button>
    );
};

export default Button;

