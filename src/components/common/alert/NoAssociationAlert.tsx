import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBuilding, FaPlus, FaExclamationTriangle } from 'react-icons/fa';
import { Button } from '../button/button';

interface NoAssociationAlertProps {
  title?: string;
  message?: string;
  showCreateButton?: boolean;
  className?: string;
}

const NoAssociationAlert: React.FC<NoAssociationAlertProps> = ({
  title = "Aucune association trouvée",
  message = "Vous devez créer une association pour accéder à cette fonctionnalité.",
  showCreateButton = true,
  className = ""
}) => {
  const navigate = useNavigate();

  return (
    <div className={`min-h-screen bg-gradient-to-br from-maraudr-lightBg via-blue-50/30 to-orange-50/30 dark:from-maraudr-darkBg dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4 ${className}`}>
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* En-tête */}
          <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 text-white text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaExclamationTriangle className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold">{title}</h2>
          </div>

          {/* Contenu */}
          <div className="p-6 text-center">
            <div className="w-20 h-20 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaBuilding className="w-10 h-10 text-maraudr-orange" />
            </div>
            
            <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
              {message}
            </p>

            {showCreateButton && (
              <div className="space-y-3">
                <Button
                  onClick={() => navigate('/maraudApp/createAsso')}
                  className="w-full bg-gradient-to-r from-maraudr-blue to-maraudr-orange hover:from-maraudr-orange hover:to-maraudr-blue text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <FaPlus className="w-4 h-4 mr-2" />
                  Créer ma première association
                </Button>
                
                <button
                  onClick={() => navigate('/maraudApp/dashboard')}
                  className="w-full text-gray-500 dark:text-gray-400 hover:text-maraudr-blue dark:hover:text-maraudr-orange transition-colors text-sm"
                >
                  Retour au dashboard
                </button>
              </div>
            )}
          </div>

          {/* Avantages */}
          <div className="bg-gray-50 dark:bg-gray-700/50 p-4">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Pourquoi créer une association ?
            </h4>
            <div className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-maraudr-blue rounded-full"></div>
                <span>Gérez vos équipes de bénévoles</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-maraudr-orange rounded-full"></div>
                <span>Organisez vos actions sociales</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Suivez votre impact</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoAssociationAlert; 