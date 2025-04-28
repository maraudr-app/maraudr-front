import { ReactNode } from 'react';

export interface ButtonProps {
    onClick?: (event?: React.MouseEvent<HTMLButtonElement>) => void;
    className?: string;
    disabled?: boolean;
    isLoading?: boolean;
    type?: "button" | "submit" | "reset";
    children?: ReactNode;
}

