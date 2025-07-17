import { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon, QrCodeIcon, CheckIcon } from '@heroicons/react/24/outline';
import { Input } from '../common/input/input';
import { Button } from '../common/button/button';
import { Select } from '../common/select/select';
import { QRScanner } from '../common/qr/QRScanner';
import { Category, getAllCategories } from '../../types/stock/StockItem';
import { stockService } from '../../services/stockService';
import { useAssoStore } from '../../store/assoStore';
import { useTranslation } from 'react-i18next';

interface AddItemModalProps {
    isOpen: boolean;
    onClose: () => void;
    onItemAdded: () => void;
    onItemHighlight?: (itemName: string) => void;
}

type Mode = 'barcode' | 'manual';

export const AddItemModal = ({ isOpen, onClose, onItemAdded, onItemHighlight }: AddItemModalProps) => {
    const { t } = useTranslation();
    const [mode, setMode] = useState<Mode>('barcode');
    const [isLoading, setIsLoading] = useState(false);
    const [showQRScanner, setShowQRScanner] = useState(false);
    const [success, setSuccess] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [barcode, setBarcode] = useState('');
    const [loadingBarcode, setLoadingBarcode] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        barCode: '',
        category: Category.Food,
        quantity: 1 // Toujours 1 lors de la création
    });

    const selectedAssociation = useAssoStore(state => state.selectedAssociation);

    // Fonction pour les traductions du stock
    const t_stock = (key: string): string => {
        return t(`stock.${key}` as any);
    };

    // Effet pour faire disparaître les notifications automatiquement
    useEffect(() => {
        if (success || error) {
            const timer = setTimeout(() => {
                setSuccess(null);
                setError(null);
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [success, error]);

    // Reset form when modal opens/closes
    useEffect(() => {
        if (!isOpen) {
            setMode('barcode');
            setBarcode('');
            setFormData({
                name: '',
                description: '',
                barCode: '',
                category: Category.Food,
                quantity: 1 // Toujours 1 lors de la création
            });
            setSuccess(null);
            setError(null);
        }
    }, [isOpen]);

    // Handle barcode submission
    const handleBarcodeSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!selectedAssociation) {
            setError(t_stock('noAssociation'));
            return;
        }

        if (!barcode.trim()) {
            setError(t_stock('barcodeRequired'));
            return;
        }

        setLoadingBarcode(true);
        setError(null);
        setSuccess(null);

        try {
            // Try to create item from barcode
            await stockService.createItemFromBarcode(barcode, selectedAssociation.id);
            setSuccess(t_stock('itemAddedSuccess'));
            
            if (onItemHighlight) {
                onItemHighlight(barcode);
            }
            
            onItemAdded();
            onClose();
        } catch (error: any) {
            console.error('Erreur lors de l\'ajout par code-barres:', error);
            
            if (error.message?.includes('Produit inexistant') || error.message?.includes('not found')) {
                setError(t_stock('barcodeNotFound'));
            } else {
                setError(error.message || t_stock('unknownError'));
            }
        } finally {
            setLoadingBarcode(false);
        }
    };

    // Handle manual form submission
    const handleManualSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!selectedAssociation) {
            setError(t_stock('noAssociation'));
            return;
        }

        // Validation
        if (!formData.name.trim()) {
            setError(t_stock('nameRequired'));
            return;
        }

        if (!formData.category) {
            setError(t_stock('categoryRequired'));
            return;
        }

        // Pas de validation de quantité car elle est toujours 1 lors de la création

        setIsLoading(true);
        setError(null);
        setSuccess(null);

        try {
            // S'assurer que la quantité est toujours 1 lors de la création
            const itemData = {
                ...formData,
                quantity: 1
            };
            
            await stockService.createItem(itemData, selectedAssociation.id);
            setSuccess(t_stock('itemAddedSuccess'));
            
            if (onItemHighlight) {
                onItemHighlight(formData.name);
            }
            
            onItemAdded();
            onClose();
        } catch (error: any) {
            console.error('Erreur lors de l\'ajout manuel:', error);
            setError(error.message || t_stock('unknownError'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'category' ? parseInt(value) as Category : value
            // Suppression de la gestion de quantity car elle est toujours 1
        }));
    };

    const handleQRScan = (result: string) => {
        setBarcode(result);
        setShowQRScanner(false);
        setSuccess(t_stock('scanSuccess'));
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
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-4">
                            <Dialog.Title className="text-xl font-semibold text-maraudr-darkText dark:text-maraudr-lightText">
                                {t_stock('addItemTitle')}
                            </Dialog.Title>
                            <button
                                onClick={onClose}
                                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
                            >
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>

                        {/* Mode Switcher */}
                        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                            <button
                                onClick={() => setMode('barcode')}
                                className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
                                    mode === 'barcode'
                                        ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                }`}
                            >
                                {t_stock('barcodeMode')}
                            </button>
                            <button
                                onClick={() => setMode('manual')}
                                className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
                                    mode === 'manual'
                                        ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                }`}
                            >
                                {t_stock('manualMode')}
                            </button>
                        </div>

                        {/* Notifications */}
                        {error && (
                            <div className="fixed top-20 right-4 z-50 p-3 sm:p-4 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-lg shadow-lg max-w-xs sm:max-w-sm animate-in slide-in-from-right duration-300">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <XMarkIcon className="h-4 w-4 sm:h-5 sm:w-5 text-red-400" />
                                    </div>
                                    <div className="ml-2 sm:ml-3">
                                        <p className="text-xs sm:text-sm font-medium">{error}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {success && (
                            <div className="fixed top-20 right-4 z-50 p-3 sm:p-4 bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 rounded-lg shadow-lg max-w-xs sm:max-w-sm animate-in slide-in-from-right duration-300">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <CheckIcon className="h-4 w-4 sm:h-5 sm:w-5 text-green-400" />
                                    </div>
                                    <div className="ml-2 sm:ml-3">
                                        <p className="text-xs sm:text-sm font-medium">{success}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Barcode Mode */}
                        {mode === 'barcode' && (
                            <form onSubmit={handleBarcodeSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        {t_stock('barcodePlaceholder')}
                                    </label>
                                    <div className="flex space-x-2">
                                        <div className="flex-1">
                                            <Input
                                                value={barcode}
                                                onChange={(e) => setBarcode(e.target.value)}
                                                placeholder={t_stock('barcodePlaceholder')}
                                                required
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
                                        {t_stock('qrScanHelp')}
                                    </p>
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
                                        disabled={loadingBarcode || !barcode.trim()}
                                        className="px-4 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
                                    >
                                        {loadingBarcode ? t_stock('loadingBarcode') : t_stock('add')}
                                    </Button>
                                </div>
                            </form>
                        )}

                        {/* Manual Mode */}
                        {mode === 'manual' && (
                            <form onSubmit={handleManualSubmit} className="space-y-4">
                                <div>
                                    <Input
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        placeholder={t_stock('itemNamePlaceholder')}
                                    />
                                </div>

                                <div>
                                    <Input
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        placeholder={t_stock('descriptionPlaceholder')}
                                    />
                                </div>

                                <div>
                                    <Select
                                        name="category"
                                        value={String(formData.category)}
                                        onChange={handleChange}
                                        required
                                    >
                                        {getAllCategories().map(category => (
                                            <option key={category.value} value={category.value}>
                                                {category.label}
                                            </option>
                                        ))}
                                    </Select>
                                </div>

                                {/* Champ quantité supprimé - toujours 1 lors de la création */}

                                <div>
                                    <Input
                                        name="barCode"
                                        value={formData.barCode}
                                        onChange={handleChange}
                                        placeholder={t_stock('barcodeOptionalPlaceholder')}
                                    />
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
                                        {isLoading ? t_stock('adding') : t_stock('add')}
                                    </Button>
                                </div>
                            </form>
                        )}
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