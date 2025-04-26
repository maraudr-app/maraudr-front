import React from 'react';
import { useTranslation } from 'react-i18next';
import i18n from 'i18next';

export const TranslationDebug: React.FC = () => {
  const { t } = useTranslation();
  
  return (
    <div className="fixed bottom-4 right-4 bg-gray-800 text-white p-4 rounded-lg opacity-75 max-w-md max-h-64 overflow-auto z-50">
      <h3 className="text-lg font-bold mb-2">i18n Debug Info</h3>
      <div className="text-sm">
        <p><strong>Current Language:</strong> {i18n.language}</p>
        <p><strong>Available Languages:</strong> {i18n.languages.join(', ')}</p>
        <p><strong>Default Namespace:</strong> {i18n.options.defaultNS}</p>
        <p><strong>Fallback Language:</strong> {String(i18n.options.fallbackLng)}</p>
        <div className="mt-2">
          <strong>Translation Test:</strong>
          <ul className="ml-4 list-disc">
            <li>home:hero.title: {t('home:hero.title', '⚠️ Missing')}</li>
            <li>common key: {t('header.home', '⚠️ Missing')}</li>
          </ul>
        </div>
        <p className="mt-2 text-xs">
          <button 
            className="bg-blue-500 hover:bg-blue-600 text-white rounded px-2 py-1 mr-2"
            onClick={() => i18n.changeLanguage('fr')}
          >
            Switch to FR
          </button>
          <button 
            className="bg-blue-500 hover:bg-blue-600 text-white rounded px-2 py-1"
            onClick={() => i18n.changeLanguage('en')}
          >
            Switch to EN
          </button>
        </p>
      </div>
    </div>
  );
};

export default TranslationDebug; 