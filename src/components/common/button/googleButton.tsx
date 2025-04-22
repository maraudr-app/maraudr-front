import React from 'react';
import { ButtonProps } from '../../../types/ButtonProps';
import { GoogleIcon } from '../../../assets/icon/googleIcon';
import { Button } from './button';

export interface GoogleButtonProps extends Omit<ButtonProps, 'children'> {
    text?: string;
}

export const GoogleButton: React.FC<GoogleButtonProps> = ({
                                                              onClick,
                                                              className = "",
                                                              disabled = false,
                                                              isLoading = false,
                                                              type = "button",
                                                              text = "Se connecter avec Google"
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
                <GoogleIcon />
                <span>{text}</span>
            </div>
        </Button>
    );
};