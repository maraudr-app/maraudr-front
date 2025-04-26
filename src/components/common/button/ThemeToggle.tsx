import React from 'react';
import { useTheme } from '../../../context/useTheme';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';

interface ThemeToggleProps {
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();

  return (
    <button
      onClick={toggleTheme}
      className={`p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${className}`}
      aria-label={theme === 'dark' ? t('themes.switchToLight') : t('themes.switchToDark')}
    >
      {theme === 'dark' ? (
        <SunIcon className="h-5 w-5 text-yellow-400" />
      ) : (
        <MoonIcon className="h-5 w-5 text-gray-700" />
      )}
    </button>
  );
}; 