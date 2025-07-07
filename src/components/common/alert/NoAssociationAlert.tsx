import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../button/button';
import { useAuthStore } from '../../../store/authStore';

interface NoAssociationAlertProps {
  title?: string;
  message?: string;
  showCreateButton?: boolean;
  className?: string;
}

const NoAssociationAlert: React.FC<NoAssociationAlertProps> = ({
  title = "Aucune association trouvée",
  message,
  showCreateButton = true,
  className = ""
}) => {
  const navigate = useNavigate();
  const user = useAuthStore(state => state.user);
  const isManager = user?.userType === 'Manager';

  // Message par défaut selon le type d'utilisateur
  const defaultMessage = isManager 
    ? "Vous devez créer une association pour accéder à cette fonctionnalité."
    : "Votre inscription est en attente de validation par votre manager. Vous recevrez une notification dès que votre adhésion sera approuvée.";

  const displayMessage = message || defaultMessage;

  return (
    <div className={`min-h-[60vh] flex flex-col items-center justify-center ${className}`}>
      <div className="w-full max-w-md mx-auto text-center">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">{title}</h2>
        <p className="mb-6 text-gray-700 dark:text-gray-300">{displayMessage}</p>
        {showCreateButton && isManager && (
          <Button
            onClick={() => navigate('/maraudApp/create-asso')}
            className="w-full max-w-xs mx-auto mb-3 bg-maraudr-blue hover:bg-maraudr-orange text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300"
          >
            Créer une association
          </Button>
        )}
      </div>
    </div>
  );
};

export default NoAssociationAlert; 