import { ButtonProps } from "../../../types/ButtonProps";

const Button: React.FC<ButtonProps> = ({
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
        className={`relative inline-flex items-center justify-center rounded-md px-4 py-3.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${className}`}
        >
            {isLoading && (
            <span className="absolute inset-0 flex items-center justify-center">
                <svg className="h-5 w-5 animate-spin text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            </span>
            )}
            <span className={`${isLoading ? 'opacity-0' : 'opacity-100'}`}>
            {children}
            </span>
    </button>
);
};

export default Button;