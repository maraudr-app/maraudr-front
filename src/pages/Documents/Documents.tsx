import React from 'react';
import DocumentManager from '../../components/documents/DocumentManager';
import { useAssoStore } from '../../store/assoStore';
import { DocumentIcon } from '@heroicons/react/24/outline';

const Documents: React.FC = () => {
    const selectedAssociation = useAssoStore(state => state.selectedAssociation);
    const sidebarCollapsed = useAssoStore(state => state.sidebarCollapsed);
    
    // Définir la largeur de la sidebar en pixels
    const sidebarWidth = sidebarCollapsed ? '56px' : '192px';

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Navbar fixe */}
            <nav className="fixed top-16 right-0 z-40 bg-white dark:bg-gray-800 shadow transition-all duration-300" style={{ left: sidebarWidth }}>
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center gap-3 pl-7">
                        <DocumentIcon className="w-5 h-5" />
                        <div className="text-gray-900 dark:text-white">
                            Documents
                            {selectedAssociation && (
                                <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                                    - {selectedAssociation.name}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Contenu principal */}
            <main className="pt-16 max-w-7xl mx-auto">
                <div className="px-4 py-6">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Gestion des documents
                        </h1>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">
                            Upload, téléchargez et gérez les documents PDF, Word, Excel et autres fichiers de votre association
                        </p>
                    </div>

                    <DocumentManager />
                </div>
            </main>
        </div>
    );
};

export default Documents; 