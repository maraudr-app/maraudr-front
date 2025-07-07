import React, { useEffect, useState } from 'react';
import { useAssoStore } from '../../store/assoStore';
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';
import NoAssociationAlert from './alert/NoAssociationAlert';

interface ProtectedAssociationRouteProps {
  children: React.ReactNode;
  title?: string;
  message?: string;
}

const ProtectedAssociationRoute: React.FC<ProtectedAssociationRouteProps> = ({
  children,
  title,
  message
}) => {
  const associations = useAssoStore(state => state.associations);
  const selectedAssociation = useAssoStore(state => state.selectedAssociation);
  const user = useAuthStore(state => state.user);
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const [isLoading, setIsLoading] = useState(true);
  const [hasCheckedAssociations, setHasCheckedAssociations] = useState(false);
  const navigate = useNavigate();

  // Charger les associations si l'utilisateur est connecté
  useEffect(() => {
    if (isAuthenticated && !hasCheckedAssociations) {
      const loadAssociations = async () => {
        try {
          await useAssoStore.getState().fetchUserAssociations();
        } catch (error) {
          console.error('Erreur lors du chargement des associations:', error);
        } finally {
          setHasCheckedAssociations(true);
          setIsLoading(false);
        }
      };
      loadAssociations();
    } else if (!isAuthenticated) {
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated, hasCheckedAssociations]);

  // On ne redirige plus automatiquement - laisser l'utilisateur choisir

  // Afficher un loader pendant le chargement
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-maraudr-lightBg via-blue-50/30 to-orange-50/30 dark:from-maraudr-darkBg dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-maraudr-orange mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Chargement de vos associations...</p>
        </div>
      </div>
    );
  }

  // Si l'utilisateur n'a pas d'association
  if (associations.length === 0) {
    return (
      <NoAssociationAlert
        title={title || "Aucune association trouvée"}
        message={message}
        showCreateButton={true}
      />
    );
  }

  // Si l'utilisateur a des associations mais aucune n'est sélectionnée
  if (!selectedAssociation) {
    return (
      <NoAssociationAlert
        title="Aucune association sélectionnée"
        message="Veuillez sélectionner une association pour continuer."
        showCreateButton={false}
      />
    );
  }

  // Si tout est OK, afficher le contenu
  return <>{children}</>;
};

export default ProtectedAssociationRoute; 