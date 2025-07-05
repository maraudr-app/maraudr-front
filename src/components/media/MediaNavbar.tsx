import { useState } from 'react';
import { useAssoStore } from '../../store/assoStore';
import { FaImages, FaFileAlt } from 'react-icons/fa';

interface MediaNavbarProps {
    activeTab: 'photos' | 'documents';
    onTabChange: (tab: 'photos' | 'documents') => void;
}

export const MediaNavbar = ({ activeTab, onTabChange }: MediaNavbarProps) => {
    const { sidebarCollapsed } = useAssoStore();

    // Définir la largeur de la sidebar en pixels
    const sidebarWidth = sidebarCollapsed ? '56px' : '192px';

    return (
        <nav className={`fixed top-16 right-0 z-40 bg-white dark:bg-gray-800 shadow transition-all duration-300`} style={{ left: sidebarWidth }}>
            <div className="flex items-center justify-between h-16">
                <div className="flex items-center gap-3 pl-7">
                    <FaImages className="w-5 h-5" />
                    <div className="text-gray-900 dark:text-white">
                        Médias
                    </div>
                </div>
                <div className="flex items-center space-x-0 px-4">
                    <button
                        className={`px-6 py-3 text-base font-medium focus:outline-none transition-all border-b-2 -mb-px
                            ${activeTab === 'photos'
                                ? 'border-maraudr-blue dark:border-maraudr-orange text-maraudr-blue dark:text-maraudr-orange bg-white dark:bg-gray-800'
                                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-maraudr-blue dark:hover:text-maraudr-orange hover:bg-gray-50 dark:hover:bg-gray-700'}
                        `}
                        onClick={() => onTabChange('photos')}
                    >
                        Photos
                    </button>
                    <button
                        className={`px-6 py-3 text-base font-medium focus:outline-none transition-all border-b-2 -mb-px
                            ${activeTab === 'documents'
                                ? 'border-maraudr-blue dark:border-maraudr-orange text-maraudr-blue dark:text-maraudr-orange bg-white dark:bg-gray-800'
                                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-maraudr-blue dark:hover:text-maraudr-orange hover:bg-gray-50 dark:hover:bg-gray-700'}
                        `}
                        onClick={() => onTabChange('documents')}
                    >
                        Documents
                    </button>
                </div>
            </div>
        </nav>
    );
}; 