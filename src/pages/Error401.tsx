import { useTranslation } from 'react-i18next';
import { ShieldExclamationIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import Button from '../components/common/button/button';

const Error401 = () => {
  const { t } = useTranslation(['common']);
  const navigate = useNavigate();

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
        <div className="space-y-3">
          <Button onClick={() => navigate('/login')} className="w-full mt-3 bg-blue-600 hover:bg-blue-700 text-white">
            <ArrowLeftIcon className="w-4 h-4 rotate-180 mr-2" />
            {t('error.401.loginButton', 'Se connecter')}
          </Button>
          <Button onClick={() => navigate('/')} className="w-full mt-3 bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50 dark:bg-gray-900 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-950">
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            {t('error.401.homeButton', 'Retour à l\'accueil')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Error401; 