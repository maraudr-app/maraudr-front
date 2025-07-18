import { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon, QrCodeIcon } from '@heroicons/react/24/outline';
import { Input } from '../common/input/input';
import { Button } from '../common/button/button';
import { Select } from '../common/select/select';
import { QRScanner } from '../common/qr/QRScanner';
import { Category, getAllCategories, getTranslatedCategories, StockItem } from '../../types/stock/StockItem';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

interface EditItemModalProps {
    isOpen: boolean;
    onClose: () => void;
    onItemUpdated: (updatedItem: StockItem) => void;
    item: StockItem | null;
}

export const EditItemModal = ({ isOpen, onClose, onItemUpdated, item }: EditItemModalProps) => {
    const { t } = useTranslation();
    const [isLoading, setIsLoading] = useState(false);
    const [showQRScanner, setShowQRScanner] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        barCode: '',
        category: Category.Food,
        quantity: 1
    });

    // Fonction pour les traductions du stock
    const t_stock = (key: string): string => {
        return t(`stock.${key}` as any);
    };

    // Initialiser le formulaire avec les données de l'item
    useEffect(() => {
        if (item && isOpen) {
            // S'assurer que la catégorie est un nombre
            const categoryValue = typeof item.category === 'string' 
                ? parseInt(item.category) as Category 
                : item.category || Category.Food;
                
            setFormData({
                name: item.name || '',
                description: item.description || '',
                barCode: item.barCode || '',
                category: categoryValue,
                quantity: item.quantity || 1
            });
        }
    }, [item, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!item) {
            toast.error(t_stock('noItemToModify'));
            return;
        }

        setIsLoading(true);
        try {
            const updatedItem: StockItem = {
                ...item,
                ...formData
            };

            onItemUpdated(updatedItem);
            onClose();
        } catch (error) {

            const errorMessage = error instanceof Error ? error.message : t_stock('unknownError');
            toast.error(`${t_stock('modificationError')}: ${errorMessage}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'quantity' ? parseInt(value) || 0 : 
                    name === 'category' ? parseInt(value) as Category : value
        }));
    };

    const handleQRScan = (result: string) => {
        // Le résultat du QR code est placé dans le champ code-barres
        setFormData(prev => ({
            ...prev,
            barCode: result
        }));
        setShowQRScanner(false);
        toast.success('Code QR scanné avec succès !');
    };

    return (
        <>
            <Dialog
                open={isOpen}
                onClose={onClose}
                className="fixed inset-0 z-50 overflow-y-auto"
            >
                <div className="flex items-center justify-center min-h-screen px-4">
                    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />

                    <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full mx-auto p-6 space-y-6">
                        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-4">
                            <Dialog.Title className="text-xl font-semibold text-maraudr-darkText dark:text-maraudr-lightText">
                                {t_stock('editItemTitle')}
                            </Dialog.Title>
                            <button
                                onClick={onClose}
                                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
                            >
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-4">
                                <div>
                                    <Input
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        placeholder={t_stock('enterItemName')}
                                    />
                                </div>

                                <div>
                                    <Input
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        placeholder={t_stock('enterDescription')}
                                    />
                                </div>

                                <div>
                                    <Select
                                        name="category"
                                        value={String(formData.category)}
                                        onChange={handleChange}
                                        required
                                    >
                                        {getTranslatedCategories(t).map(category => (
                                            <option key={category.value} value={category.value}>
                                                {category.label}
                                            </option>
                                        ))}
                                    </Select>
                                </div>

                                <div>
                                    <Input
                                        type="number"
                                        name="quantity"
                                        value={formData.quantity}
                                        onChange={handleChange}
                                        required
                                        min="0"
                                        placeholder={t_stock('enterQuantity')}
                                    />
                                </div>

                                <div>
                                    <div className="flex space-x-2">
                                        <div className="flex-1">
                                            <Input
                                                name="barCode"
                                                value={formData.barCode}
                                                onChange={handleChange}
                                                placeholder={t_stock('enterBarcode')}
                                            />
                                        </div>
                                        <Button
                                            type="button"
                                            onClick={() => setShowQRScanner(true)}
                                            className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center"
                                        >
                                            <QrCodeIcon className="h-5 w-5" />
                                        </Button>
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        {t_stock('scanBarcodeHelp')}
                                    </p>
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <Button
                                    type="button"
                                    onClick={onClose}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                                >
                                    {t_stock('cancel')}
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isLoading}
                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
                                >
                                    {isLoading ? t_stock('modifying') : t_stock('modify')}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </Dialog>

            {/* QR Scanner Modal */}
            <QRScanner
                isOpen={showQRScanner}
                onClose={() => setShowQRScanner(false)}
                onScan={handleQRScan}
                title={t_stock('scanBarcode')}
            />
        </>
    );
}; 