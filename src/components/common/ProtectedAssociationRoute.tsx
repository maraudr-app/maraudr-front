import React from 'react';
import { useAssoStore } from '../../store/assoStore';
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

  // Si l'utilisateur n'a pas d'association
  if (associations.length === 0) {
    return (
      <NoAssociationAlert
        title={title || "Aucune association trouvée"}
        message={message || "Vous devez créer une association pour accéder à cette fonctionnalité."}
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