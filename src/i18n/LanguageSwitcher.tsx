import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { GlobeEuropeAfricaIcon } from '@heroicons/react/24/outline';

interface LanguageSwitcherProps {
  className?: string;
}

export const LanguageSwitcher = ({ className = '' }: LanguageSwitcherProps) => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language);

  const languages = [
    { code: 'fr', label: 'Français' },
    { code: 'en', label: 'English' }
  ];

  // Mettre à jour l'état local lorsque la langue i18n change
  useEffect(() => {
    setCurrentLanguage(i18n.language);
  }, [i18n.language]);

  const changeLanguage = (langCode: string) => {
    i18n.changeLanguage(langCode);
    setIsOpen(false);
  };

  const getCurrentLanguageLabel = () => {
    const lang = languages.find(lang => lang.code === currentLanguage);
    return lang ? lang.label : languages[0].label;
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center px-2 py-1 rounded text-sm transition-colors hover:bg-gray-200 dark:hover:bg-gray-700"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <GlobeEuropeAfricaIcon className="h-5 w-5 mr-1 text-gray-600 dark:text-gray-300" />
        <span className="text-gray-800 dark:text-gray-200">{getCurrentLanguageLabel()}</span>
      </button>

      {isOpen && (
        <div className="absolute mt-1 right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-lg z-50">
          <ul className="py-1">
            {languages.map((lang) => (
              <li key={lang.code}>
                <button
                  onClick={() => changeLanguage(lang.code)}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 
                    ${currentLanguage === lang.code 
                      ? 'font-semibold text-blue-600 dark:text-blue-400' 
                      : 'text-gray-700 dark:text-gray-300'}`}
                >
                  {lang.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}; 