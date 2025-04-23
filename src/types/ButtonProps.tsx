export interface ButtonProps {
    onClick?: () => void;
    className?: string;
    disabled?: boolean;
    isLoading?: boolean;
    type?: "button" | "submit" | "reset";
    children?: React.ReactNode;
}

