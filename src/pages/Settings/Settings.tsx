import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../useTheme';

const Settings = () => {
  const { t, i18n } = useTranslation();
  const [notificationEnabled, setNotificationEnabled] = useState(true);
  const { theme, toggleTheme } = useTheme();
  const isDarkMode = theme === 'dark';
  
  // Changer la langue
  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
        {t('sidebar.settings', 'Paramètres')}
      </h1>

      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg divide-y divide-gray-200 dark:divide-gray-700">
        {/* Section Apparence */}
        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            {t('settings.appearance', 'Apparence')}
          </h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-700 dark:text-gray-300">{t('settings.darkMode', 'Mode sombre')}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('settings.darkModeDescription', 'Activer le mode sombre pour réduire la fatigue oculaire')}
              </p>
            </div>
            <button
              onClick={toggleTheme}
              className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                isDarkMode ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
              }`}
            >
              <span
                className={`inline-block w-4 h-4 transform rounded-full bg-white transition-transform ${
                  isDarkMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Section Langue */}
        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            {t('settings.language', 'Langue')}
          </h2>
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => changeLanguage('fr')}
              className={`px-4 py-2 rounded-md transition-colors ${
                i18n.language === 'fr' 
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' 
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {t('languages.fr', 'Français')}
            </button>
            <button 
              onClick={() => changeLanguage('en')}
              className={`px-4 py-2 rounded-md transition-colors ${
                i18n.language === 'en' 
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' 
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {t('languages.en', 'Anglais')}
            </button>
          </div>
        </div>

        {/* Section Notifications */}
        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            {t('settings.notifications', 'Notifications')}
          </h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-700 dark:text-gray-300">
                {t('settings.enableNotifications', 'Activer les notifications')}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('settings.notificationsDescription', 'Recevoir des alertes pour les stocks faibles et les événements')}
              </p>
            </div>
            <button
              onClick={() => setNotificationEnabled(!notificationEnabled)}
              className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                notificationEnabled ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
              }`}
            >
              <span
                className={`inline-block w-4 h-4 transform rounded-full bg-white transition-transform ${
                  notificationEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Section Compte */}
        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            {t('settings.account', 'Compte')}
          </h2>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition mb-3 w-full sm:w-auto">
            {t('settings.changePassword', 'Changer le mot de passe')}
          </button>
          <button className="px-4 py-2 border border-red-300 text-red-600 rounded-md hover:bg-red-50 dark:hover:bg-red-900 transition w-full sm:w-auto sm:ml-2">
            {t('settings.deleteAccount', 'Supprimer mon compte')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings; 