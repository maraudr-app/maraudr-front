import { useEffect } from 'react';
import { useAssoStore } from '../store/assoStore';

/**
 * Hook personnalisé pour gérer les changements d'association
 * @param callback - Fonction à exécuter quand l'association change
 * @param dependencies - Dépendances supplémentaires pour le useEffect
 */
export const useAssociationChange = (
    callback: (association: any) => void | Promise<void>,
    dependencies: any[] = []
) => {
    const selectedAssociation = useAssoStore(state => state.selectedAssociation);

    useEffect(() => {
        if (selectedAssociation) {
            console.log('🔄 useAssociationChange: Association changée vers:', selectedAssociation.name);
            callback(selectedAssociation);
        }
    }, [selectedAssociation, ...dependencies]);

    // Écouter l'événement personnalisé pour plus de robustesse
    useEffect(() => {
        const handleAssociationChange = (event: CustomEvent) => {
            console.log('🎯 useAssociationChange: Événement reçu:', event.detail.association);
        };

        window.addEventListener('associationChanged', handleAssociationChange as EventListener);
        
        return () => {
            window.removeEventListener('associationChanged', handleAssociationChange as EventListener);
        };
    }, []);

    return selectedAssociation;
}; 