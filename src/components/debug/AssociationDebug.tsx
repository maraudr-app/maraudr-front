import React from 'react';
import { useAssoStore } from '../../store/assoStore';

export const AssociationDebug: React.FC = () => {
    const { associations, selectedAssociation, setSelectedAssociation } = useAssoStore();

    return (
        <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-4 shadow-lg z-50 max-w-sm">
            <h3 className="text-lg font-bold mb-2 text-gray-800 dark:text-gray-200">🔧 Debug Association</h3>
            
            <div className="mb-3">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Association actuelle:
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400">
                    {selectedAssociation ? `${selectedAssociation.name} (${selectedAssociation.id})` : 'Aucune'}
                </p>
            </div>

            <div className="mb-3">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Associations disponibles ({associations.length}):
                </p>
                {associations.map((asso) => (
                    <button
                        key={asso.id}
                        onClick={() => {
                            console.log('🧪 Debug: Changement forcé vers:', asso.name);
                            setSelectedAssociation(asso);
                        }}
                        className={`block w-full text-left text-xs p-1 mb-1 rounded ${
                            selectedAssociation?.id === asso.id
                                ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 font-bold'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                    >
                        {asso.name}
                    </button>
                ))}
            </div>

            <div className="text-xs text-gray-500 dark:text-gray-400">
                💡 Cliquez sur une association pour la sélectionner
            </div>
        </div>
    );
}; 