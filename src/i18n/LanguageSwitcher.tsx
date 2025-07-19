import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface LanguageSwitcherProps {
  className?: string;
}

// Composant pour le drapeau français dans un cercle
const FrenchFlag = ({ className = "h-6 w-6" }: { className?: string }) => (
  <div className={`${className} rounded-full overflow-hidden border-1 border-black`}>
    <svg className="w-full h-full" viewBox="0 0 24 16" fill="none">
      <rect width="8" height="16" fill="#002395" />
      <rect x="8" width="10" height="16" fill="#FFFFFF" />
      <rect x="16" width="10" height="16" fill="#ED2939" />
    </svg>
  </div>
);

// Composant pour le drapeau anglais (Union Jack) dans un cercle
const EnglishFlag = ({ className = "h-6 w-6" }: { className?: string }) => (
  <div className={`${className} rounded-full overflow-hidden border-2 border-black`}>
    <svg className="w-full h-full" viewBox="0 0 24 16" fill="none">
      <rect width="24" height="16" fill="#012169" />
      <path d="M0 0L24 16M24 0L0 16" stroke="#FFFFFF" strokeWidth="2" />
      <path d="M12 0V16M0 8H24" stroke="#FFFFFF" strokeWidth="3" />
      <path d="M0 0L24 16M24 0L0 16" stroke="#C8102E" strokeWidth="1" />
      <path d="M12 0V16M0 8H24" stroke="#C8102E" strokeWidth="1.5" />
    </svg>
  </div>
);

export const LanguageSwitcher = ({ className = '' }: LanguageSwitcherProps) => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language);

  const languages = [
    { 
      code: 'fr', 
      label: 'Français',
      flag: <FrenchFlag className="h-5 w-5" />
    },
    { 
      code: 'en', 
      label: 'English',
      flag: <EnglishFlag className="h-5 w-5" />
    }
  ];

  // Mettre à jour l'état local lorsque la langue i18n change
  useEffect(() => {
    setCurrentLanguage(i18n.language);
  }, [i18n.language]);

  const changeLanguage = (langCode: string) => {
    i18n.changeLanguage(langCode);
    setIsOpen(false);
  };

  const getCurrentLanguage = () => {
    const lang = languages.find(lang => lang.code === currentLanguage);
    return lang ? lang : languages[0];
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center px-2 py-1 rounded text-sm transition-colors hover:bg-gray-200 dark:hover:bg-gray-700"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {getCurrentLanguage().flag}
        <span className="ml-2 text-gray-800 dark:text-gray-200">{getCurrentLanguage().label}</span>
      </button>

      {isOpen && (
        <div className="absolute mt-1 right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-lg z-50">
          <ul className="py-1">
            {languages.map((lang) => (
              <li key={lang.code}>
                <button
                  onClick={() => changeLanguage(lang.code)}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center
                    ${currentLanguage === lang.code 
                      ? 'font-semibold text-blue-600 dark:text-blue-400' 
                      : 'text-gray-700 dark:text-gray-300'}`}
                >
                  {lang.flag}
                  <span className="ml-2">{lang.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}; 