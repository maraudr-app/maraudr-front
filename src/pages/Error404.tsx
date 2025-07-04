import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ExclamationTriangleIcon, HomeIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useAuthStore } from '../store/authStore';

const Error404 = () => {
  const { t } = useTranslation(['common']);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-maraudr-lightBg via-blue-50/30 to-orange-50/30 dark:from-maraudr-darkBg dark:via-gray-800 dark:to-gray-900 flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full text-center">
        {/* Icône d'erreur */}
        <div className="mb-6 flex justify-center">
          <div className="w-20 h-20 bg-gradient-to-r from-maraudr-orange to-maraudr-blue rounded-full flex items-center justify-center">
            <ExclamationTriangleIcon className="w-10 h-10 text-white" />
          </div>
        </div>

        {/* Code d'erreur */}
        <h1 className="text-6xl font-bold bg-gradient-to-r from-maraudr-orange to-maraudr-blue bg-clip-text text-transparent mb-3">
          404
        </h1>

        {/* Titre */}
        <h2 className="text-2xl font-bold text-maraudr-darkText dark:text-maraudr-lightText mb-3">
          {t('error.404.title', 'Page non trouvée')}
        </h2>

        {/* Description */}
        <p className="text-base text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
          {t('error.404.description', 'La page que vous recherchez n\'existe pas ou a été déplacée.')}
        </p>

        {/* Boutons d'action */}
        <div className="space-y-3">
          {isAuthenticated ? (
            <Link
              to="/maraudApp/dashboard"
              className="w-full px-6 py-3 bg-maraudr-blue hover:bg-maraudr-orange text-white font-bold text-base rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              <HomeIcon className="w-4 h-4" />
              {t('error.404.dashboardButton', 'Retour au dashboard')}
            </Link>
          ) : (
            <Link
              to="/"
              className="w-full px-6 py-3 bg-maraudr-blue hover:bg-maraudr-orange text-white font-bold text-base rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              <HomeIcon className="w-4 h-4" />
              {t('error.404.homeButton', 'Retour à l\'accueil')}
            </Link>
          )}
          
          <button
            onClick={() => window.history.back()}
            className="w-full px-6 py-3 border-2 border-maraudr-blue dark:border-maraudr-orange text-maraudr-blue dark:text-maraudr-orange hover:bg-maraudr-blue hover:text-white dark:hover:bg-maraudr-orange dark:hover:text-white font-bold text-base rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            {t('error.404.backButton', 'Page précédente')}
          </button>
        </div>

        {/* Logo */}
        <div className="mt-8">
          <div className="text-xl font-bold text-maraudr-blue dark:text-maraudr-orange">
            maraudr
          </div>
        </div>
      </div>
    </div>
  );
};

export default Error404; 