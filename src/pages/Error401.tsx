import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ShieldExclamationIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

const Error401 = () => {
  const { t } = useTranslation(['common']);

  return (
    <div className="min-h-screen bg-gradient-to-br from-maraudr-lightBg via-blue-50/30 to-orange-50/30 dark:from-maraudr-darkBg dark:via-gray-800 dark:to-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Icône d'erreur */}
        <div className="mb-8 flex justify-center">
          <div className="w-24 h-24 bg-gradient-to-r from-maraudr-blue to-maraudr-orange rounded-full flex items-center justify-center">
            <ShieldExclamationIcon className="w-12 h-12 text-white" />
          </div>
        </div>

        {/* Code d'erreur */}
        <h1 className="text-8xl font-bold bg-gradient-to-r from-maraudr-blue to-maraudr-orange bg-clip-text text-transparent mb-4">
          401
        </h1>

        {/* Titre */}
        <h2 className="text-3xl font-bold text-maraudr-darkText dark:text-maraudr-lightText mb-4">
          {t('error.401.title', 'Accès non autorisé')}
        </h2>

        {/* Description */}
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
          {t('error.401.description', 'Vous devez être connecté pour accéder à cette page. Veuillez vous connecter pour continuer.')}
        </p>

        {/* Boutons d'action */}
        <div className="space-y-4">
          <Link
            to="/login"
            className="w-full px-8 py-4 bg-maraudr-blue hover:bg-maraudr-orange text-white font-bold text-lg rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
          >
            {t('error.401.loginButton', 'Se connecter')}
            <ArrowLeftIcon className="w-5 h-5 rotate-180" />
          </Link>
          
          <Link
            to="/"
            className="w-full px-8 py-4 border-2 border-maraudr-blue dark:border-maraudr-orange text-maraudr-blue dark:text-maraudr-orange hover:bg-maraudr-blue hover:text-white dark:hover:bg-maraudr-orange dark:hover:text-white font-bold text-lg rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-3"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            {t('error.401.homeButton', 'Retour à l\'accueil')}
          </Link>
        </div>

        {/* Logo */}
        <div className="mt-12">
          <div className="text-2xl font-bold text-maraudr-blue dark:text-maraudr-orange">
            maraudr
          </div>
        </div>
      </div>
    </div>
  );
};

export default Error401; 