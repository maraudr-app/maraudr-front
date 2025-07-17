import { useState } from 'react';
import { FaBox, FaHistory, FaPlus } from 'react-icons/fa';
import { Button } from '../common/button/button';
import { AddItemModal } from './AddItemModal';
import { StockHistoryModal } from './StockHistoryModal';
import { useAssoStore } from '../../store/assoStore';
import CubeIcon from '@heroicons/react/24/solid/CubeIcon';
import { useTranslation } from 'react-i18next';

interface StockNavbarProps {
    onItemAdded: () => void;
    showCreateStock?: boolean;
    onCreateStock?: () => void;
    isAddButtonDisabled?: boolean;
    onItemHighlight?: (itemName: string) => void;
}

export const StockNavbar = ({ 
    onItemAdded, 
    showCreateStock, 
    onCreateStock,
    isAddButtonDisabled = false,
    onItemHighlight
}: StockNavbarProps) => {
    const { t } = useTranslation();
    const [showAddModal, setShowAddModal] = useState(false);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const { sidebarCollapsed } = useAssoStore();

    // Fonction pour les traductions du stock
    const t_stock = (key: string): string => {
        return t(`stock.${key}` as any);
    };

    // Définir la largeur de la sidebar en pixels
    const sidebarWidth = sidebarCollapsed ? '56px' : '192px';

    return (
        <nav className={`fixed top-16 right-0 z-40 bg-white dark:bg-gray-800 shadow transition-all duration-300`} style={{ left: sidebarWidth }}>
            <div className="flex items-center justify-between h-16">
                <div className="flex items-center gap-3 pl-7">
                        <CubeIcon className="w-5 h-5" />
                    <div className="text-gray-900  dark:text-white">
                        {t_stock('stockManagement')}
                    </div>
                </div>
                <div className="flex items-center space-x-4 px-4">
                    {showCreateStock && (
                        <Button
                            onClick={onCreateStock}
                            className="text-xs text-black px-3 py-2 rounded-md transition-colors"
                        >
                            {t_stock('createStock')}
                        </Button>
                    )}
                    
                    <Button
                        onClick={() => setShowHistoryModal(true)}
                        className="text-xs bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center space-x-2"
                    >
                        <FaHistory className="h-4 w-4" />
                        <span>{t_stock('history')}</span>
                    </Button>

                    <Button
                        onClick={() => setShowAddModal(true)}
                        disabled={isAddButtonDisabled}
                        className="text-black bg-maraudr-blue hover:bg-maraudr-orange"
                    >
                        {t_stock('addItem')}
                    </Button>
                </div>
            </div>

            {/* Modals */}
            <AddItemModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                onItemAdded={() => {
                    setShowAddModal(false);
                    onItemAdded();
                }}
                onItemHighlight={onItemHighlight}
            />

            <StockHistoryModal
                isOpen={showHistoryModal}
                onClose={() => setShowHistoryModal(false)}
            />
        </nav>
    );
}; 