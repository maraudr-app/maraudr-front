

import { MicrosoftIcon } from '../../../assets/icon/microsoftIcon';
import { ButtonProps } from '../../../types/ButtonProps';
import Button from './button';

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
            className={`bg-white text-gray-800 border border-gray-300 hover:bg-gray-100 focus:ring-blue-500 ${className}`}
        >
            <div className="flex items-center justify-center">
                <MicrosoftIcon />
                <span>{text}</span>
            </div>
        </Button>
    );
};