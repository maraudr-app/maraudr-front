import { Dialog } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useState, useEffect } from 'react';
import { stockService } from '../../services/stockService';
import { useAssoStore } from '../../store/assoStore';
import { StockItem, getCategoryName } from '../../types/stock/StockItem';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

interface StockHistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const StockHistoryModal = ({ isOpen, onClose }: StockHistoryModalProps) => {
    const { t } = useTranslation();
    const [history, setHistory] = useState<StockItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const selectedAssociation = useAssoStore(state => state.selectedAssociation);

    // Fonction pour les traductions du stock
    const t_stock = (key: string): string => {
        return t(`stock.${key}` as any);
    };

    useEffect(() => {
        const fetchHistory = async () => {
            if (!selectedAssociation) return;

            setIsLoading(true);
            try {
                const items = await stockService.getStockItems(selectedAssociation.id);
                // Trier par date d'entrée décroissante
                const sortedItems = items.sort((a, b) => 
                    new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime()
                );
                setHistory(sortedItems);
            } catch (error) {
            toast.error(t_stock('errorLoadingHistory'));
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        };

        if (isOpen) {
            fetchHistory();
        }
    }, [isOpen, selectedAssociation]);

    return (
        <Dialog
            open={isOpen}
            onClose={onClose}
            className="fixed inset-0 z-50 overflow-y-auto"
        >
            <div className="flex items-center justify-center min-h-screen">
                <div className="fixed inset-0 bg-black opacity-30" aria-hidden="true" />

                <div className="relative bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full mx-4 p-6">
                    {/* En-tête */}
                    <div className="flex justify-between items-center mb-4">
                        <Dialog.Title className="text-lg font-semibold text-maraudr-darkText dark:text-maraudr-lightText">
                                                            {t_stock('modal_history_title')}
                        </Dialog.Title>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                        >
                            <XMarkIcon className="h-6 w-6" />
                        </button>
                    </div>

                    {/* Contenu */}
                    <div className="mt-4">
                        {isLoading ? (
                            <div className="flex justify-center items-center h-32">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-maraudr-blue"></div>
                            </div>
                        ) : history.length === 0 ? (
                            <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                                {t_stock('noHistoryAvailable')}
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-700">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                {t_stock('date')}
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                {t_stock('item')}
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                {t_stock('category')}
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                {t_stock('quantity')}
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                        {history.map((item) => (
                                            <tr key={item.id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                    {new Date(item.entryDate).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-maraudr-darkText dark:text-maraudr-lightText">
                                                        {item.name}
                                                    </div>
                                                    {item.description && (
                                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                                            {item.description}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                    {getCategoryName(item.category)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                    {item.quantity}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Dialog>
    );
}; 