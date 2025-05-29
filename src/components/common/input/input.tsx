import { useState } from "react";
import { InputProps } from "../../../types/inputProps";

interface ExtendedInputProps extends InputProps {
  rightIcon?: React.ReactNode;
  leftIcon?: React.ReactNode;
  borderColor?: string;
  focusBorderColor?: string;
  containerClassName?: string;
}

const Input: React.FC<ExtendedInputProps> = ({
  placeholder = "Placeholder",
  type = "text",
  className = "",
  containerClassName = "",
  value,
  onChange,
  name,
  id,
  required = false,
  autoComplete,
  rightIcon,
  leftIcon,
  borderColor,
  focusBorderColor,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState<boolean>(false);

  // Déterminer si le champ est actif (focus ou contient une valeur)
  const isActive = isFocused || (value && value.length > 0);

  // Classes pour les icônes
  const paddingLeft = leftIcon ? "pl-12" : "pl-5";
  const paddingRight = rightIcon ? "pr-12" : "pr-5";

  // Classes pour les bordures personnalisées
  const getBorderClasses = () => {
    if (borderColor && focusBorderColor) {
      return `border-2 ${borderColor} focus:${focusBorderColor}`;
    }
    if (borderColor) {
      return `border-2 ${borderColor}`;
    }
    return "border border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400";
  };

  return (
    <div className={`relative ${containerClassName}`}>
      {/* Icône gauche */}
      {leftIcon && (
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none z-10">
          {leftIcon}
        </div>
      )}

      {/* Input */}
      <input
        type={type}
        name={name}
        id={id}
        value={value}
        onChange={onChange}
        required={required}
        autoComplete={autoComplete}
        className={`peer w-full ${getBorderClasses()} rounded ${paddingLeft} ${paddingRight} py-3 outline-none transition-all duration-200 dark:bg-gray-700 dark:text-white ${className}`}
        onFocus={() => setIsFocused(true)}
        onBlur={(e) => {
          setIsFocused(false);
          if (props.onBlur) props.onBlur(e);
        }}
        {...props}
      />

      {/* Icône droite */}
      {rightIcon && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none z-10">
          {rightIcon}
        </div>
      )}

      {/* Placeholder flottant */}
      <label
        className={`absolute transition-all duration-200 pointer-events-none z-0
          ${isActive
            ? "text-xs -top-2 left-3 bg-white dark:bg-gray-700 px-1 text-blue-500 dark:text-blue-400"
            : `text-gray-500 dark:text-gray-400 top-1/2 transform -translate-y-1/2 ${leftIcon ? "left-12" : "left-5"}`
          }
        `}
      >
        {placeholder}
      </label>
    </div>
  );
};

export { Input };