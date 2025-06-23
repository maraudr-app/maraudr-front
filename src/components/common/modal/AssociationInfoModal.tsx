import { XMarkIcon } from '@heroicons/react/24/outline';
import { AssociationAvatar } from '../avatar/AssociationAvatar';

interface AssociationInfoModalProps {
    isOpen: boolean;
    onClose: () => void;
    association: any;
    associationDetails: any;
}

const AssociationInfoModal: React.FC<AssociationInfoModalProps> = ({ 
    isOpen, 
    onClose, 
    association, 
    associationDetails 
}) => {
    if (!isOpen || !association) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-[200]">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-2xl rounded-xl bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <div className="mt-3">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center">
                            <AssociationAvatar name={association.name} size="lg" />
                            <div className="ml-4">
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                    {association.name}
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Association sélectionnée
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                            <XMarkIcon className="h-6 w-6" />
                        </button>
                    </div>
                    
                    {/* Content */}
                    <div className="space-y-4">
                        {/* Informations de base */}
                        <div className="bg-gradient-to-r from-orange-50 to-blue-50 dark:from-orange-900/20 dark:to-blue-900/20 rounded-lg p-4">
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                                Informations de base
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">ID</p>
                                    <p className="font-medium text-gray-900 dark:text-white">{association.id}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Nom</p>
                                    <p className="font-medium text-gray-900 dark:text-white">{association.name}</p>
                                </div>
                            </div>
                        </div>

                        {/* Détails supplémentaires si disponibles */}
                        {associationDetails && (
                            <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                                    Détails détaillés
                                </h4>
                                <div className="space-y-2">
                                    {Object.entries(associationDetails).map(([key, value]) => (
                                        <div key={key} className="flex justify-between">
                                            <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                                                {key.replace(/([A-Z])/g, ' $1').toLowerCase()}:
                                            </span>
                                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Message de test */}
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <span className="text-yellow-600 dark:text-yellow-400">⚠️</span>
                                </div>
                                <div className="ml-3">
                                    <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                                        Modal de test
                                    </h4>
                                    <p className="text-sm text-yellow-700 dark:text-yellow-300">
                                        Cette modal est temporaire pour vérifier le chargement des données d'association.
                                        Elle sera supprimée après les tests.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Footer */}
                    <div className="mt-6 flex justify-end space-x-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                            Fermer
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AssociationInfoModal; 