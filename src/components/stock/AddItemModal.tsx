import { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Input } from '../common/input/input';
import { Button } from '../common/button/button';
import { Select } from '../common/select/select';
import { Category } from '../../types/stock/StockItem';
import { stockService } from '../../services/stockService';
import { useAssoStore } from '../../store/assoStore';
import { toast } from 'react-hot-toast';

interface AddItemModalProps {
    isOpen: boolean;
    onClose: () => void;
    onItemAdded: () => void;
}

export const AddItemModal = ({ isOpen, onClose, onItemAdded }: AddItemModalProps) => {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        barCode: '',
        category: Category.Unknown,
        quantity: 1
    });

    const selectedAssociation = useAssoStore(state => state.selectedAssociation);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!selectedAssociation) {
            toast.error('Aucune association sélectionnée');
            return;
        }

        setIsLoading(true);
        try {
            await stockService.createItem(formData, selectedAssociation.id);
            toast.success('Item ajouté avec succès !');
            onItemAdded();
        } catch (error) {
            toast.error('Erreur lors de l\'ajout de l\'item');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'quantity' ? parseInt(value) || 0 : value
        }));
    };

    return (
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
                            Ajouter un item
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
                                    placeholder="Entrez le nom de l'item"
                                />
                            </div>

                            <div>
                               
                                <Input
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Entrez une description (optionnel)"
                                />
                            </div>

                            <div>
                                
                                <Select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    required
                                >
                                    {Object.values(Category).map(category => (
                                        <option key={category} value={category}>
                                            {category}
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
                                    placeholder="Entrez la quantité"
                                />
                            </div>

                            <div>
                        
                                <Input
                                    name="barCode"
                                    value={formData.barCode}
                                    onChange={handleChange}
                                    placeholder="Entrez le code-barres (optionnel)"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <Button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                            >
                                Annuler
                            </Button>
                            <Button
                                type="submit"
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 rounded-lg transition-colors"
                            >
                                Ajouter
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </Dialog>
    );
}; 