import React from 'react';
import { ButtonProps } from '../../../types/ButtonProps';
import { Button } from './button';

export interface MicrosoftButtonProps extends Omit<ButtonProps, 'children'> {
    text?: string;
}

export const MicrosoftButton: React.FC<MicrosoftButtonProps> = ({
    onClick,
    className = "",
    disabled = false,
    isLoading = false,
    type = "button",
    text = "Se connecter avec Microsoft"
}) => {
    return (
        <Button
            type={type}
            onClick={onClick}
            disabled={disabled}
            isLoading={isLoading}
            className={`bg-white text-gray-700 border border-gray-300 hover:bg-gray-100 focus:ring-blue-500 ${className}`}
        >
            <div className="flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 23 23" xmlns="http://www.w3.org/2000/svg" className="mr-2">
                    <path fill="#f1511b" d="M11.5 0h11.5v11.5h-11.5z"/>
                    <path fill="#80cc28" d="M0 0h11.5v11.5h-11.5z"/>
                    <path fill="#00adef" d="M0 11.5h11.5v11.5h-11.5z"/>
                    <path fill="#fbbc09" d="M11.5 11.5h11.5v11.5h-11.5z"/>
                </svg>
                <span>{text}</span>
            </div>
        </Button>
    );
};

