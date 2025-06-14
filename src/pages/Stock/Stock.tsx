import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { StockNavbar } from '../../components/stock/StockNavbar';
import { StockChart } from '../../components/stock/StockChart';
import { stockService } from '../../services/stockService';
import { useAssoStore } from '../../store/assoStore';
import { StockItem, Category } from '../../types/stock/StockItem';
import { toast } from 'react-hot-toast';
import { FaTrash, FaPencilAlt } from 'react-icons/fa';
import { Button } from '../../components/common/button/button';
import { Select } from '../../components/common/select/select';
import { Input } from '../../components/common/input/input';
import { Dialog } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface FilterState {
    category: string;
    name: string;
    minQuantity: string;
    maxQuantity: string;
}

export const Stock = () => {
    const navigate = useNavigate();
    const [items, setItems] = useState<StockItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<FilterState>({
        category: '',
        name: '',
        minQuantity: '',
        maxQuantity: ''
    });
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<string | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingItem, setEditingItem] = useState<StockItem | null>(null);
    const selectedAssociation = useAssoStore(state => state.selectedAssociation);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    useEffect(() => {
        const checkStock = async () => {
            if (!selectedAssociation) {
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            try {
                const stockId = await stockService.getStockId(selectedAssociation.id);
                if (!stockId) {
                    await stockService.createStock(selectedAssociation.id);
                }
                await fetchItems();
            } catch (error) {
                toast.error('Erreur lors de la vérification du stock');
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        };

        checkStock();
    }, [selectedAssociation, navigate]);

    useEffect(() => {
        setCurrentPage(1);
    }, [filter.category, filter.name]);

    const fetchItems = async () => {
        if (!selectedAssociation) return;

        setIsLoading(true);
        try {
            const fetchedItems = await stockService.getStockItems(selectedAssociation.id, filter);
            setItems(fetchedItems);
        } catch (error) {
            toast.error('Erreur lors du chargement des items');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteClick = (itemId: string) => {
        setItemToDelete(itemId);
        setShowDeleteConfirm(true);
    };

    const handleDeleteConfirm = async () => {
        if (!selectedAssociation || !itemToDelete) return;

        try {
            await stockService.deleteItem(selectedAssociation.id, itemToDelete);
            toast.success('Item supprimé avec succès');
            await fetchItems();
        } catch (error) {
            toast.error('Erreur lors de la suppression de l\'item');
            console.error(error);
        } finally {
            setShowDeleteConfirm(false);
            setItemToDelete(null);
        }
    };

    const handleEditClick = (item: StockItem) => {
        setEditingItem(item);
        setShowEditModal(true);
    };

    const handleEditSubmit = async (updatedItem: StockItem) => {
        if (!selectedAssociation) return;

        try {
            // TODO: Implémenter l'appel API pour la mise à jour
            // Pour l'instant, on simule la mise à jour
            const index = items.findIndex(item => item.id === updatedItem.id);
            if (index !== -1) {
                const newItems = [...items];
                newItems[index] = updatedItem;
                setItems(newItems);
            }
            toast.success('Item modifié avec succès');
            setShowEditModal(false);
            setEditingItem(null);
        } catch (error) {
            toast.error('Erreur lors de la modification de l\'item');
            console.error(error);
        }
    };

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilter(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFilterSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setCurrentPage(1);
        fetchItems();
    };

    const handleResetFilters = () => {
        setFilter({
            category: '',
            name: '',
            minQuantity: '',
            maxQuantity: ''
        });
        fetchItems();
    };

    // Calcul des items pour la page courante
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = items.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(items.length / itemsPerPage);

    useEffect(() => {
        if (currentPage > totalPages && totalPages > 0) {
            setCurrentPage(totalPages);
        }
    }, [totalPages, currentPage]);

    const handlePageChange = (pageNumber: number) => {
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
            window.scrollTo({
                top: document.querySelector('table')?.offsetTop || 0,
                behavior: 'smooth'
            });
        }
    };

    if (!selectedAssociation) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
                        Aucune association sélectionnée
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Veuillez sélectionner une association pour accéder à la gestion des stocks.
                    </p>
                    <button
                        onClick={() => navigate('/associations')}
                        className="px-4 py-2 bg-maraudr-blue text-white rounded-md hover:bg-maraudr-orange transition-colors"
                    >
                        Sélectionner une association
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <StockNavbar onItemAdded={fetchItems} isAddButtonDisabled={true} />

            <main className="pt-16">
                {/* Graphique et Historique */}
                {!isLoading && items.length > 0 && (
                    <div className="mb-8">
                        <StockChart items={items} />
                    </div>
                )}

                {/* Section Tableau avec Filtres */}
                <div className="bg-white dark:bg-gray-800 shadow">
                    {/* Filtres */}
                    <form onSubmit={handleFilterSubmit} className="p-4 border-b border-gray-200 dark:border-gray-700">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <Input
                                type="text"
                                name="name"
                                value={filter.name}
                                onChange={handleFilterChange}
                                placeholder="Rechercher un item"
                            />
                            <div className="w-full">
                                <Select
                                    name="category"
                                    value={filter.category}
                                    onChange={handleFilterChange}
                                    placeholder="Toutes les catégories"
                                    className="w-full"
                                >
                                    <option value="">Toutes les catégories</option>
                                    {Object.values(Category).map(category => (
                                        <option key={category} value={category}>
                                            {category}
                                        </option>
                                    ))}
                                </Select>
                            </div>
                            <Input
                                type="number"
                                name="maxQuantity"
                                value={filter.maxQuantity}
                                onChange={handleFilterChange}
                                placeholder="Quantité maximum"
                            />
                            <Input
                                type="number"
                                name="minQuantity"
                                value={filter.minQuantity}
                                onChange={handleFilterChange}
                                placeholder="Quantité minimum"
                            />
                        </div>
                        <div className="mt-4 flex justify-end space-x-2">
                            <Button
                                type="button"
                                onClick={handleResetFilters}
                                className="text-black bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600"
                            >
                                Réinitialiser
                            </Button>
                            <Button
                                type="submit"
                                className="text-black bg-maraudr-blue hover:bg-maraudr-orange"
                            >
                                Filtrer
                            </Button>
                        </div>
                    </form>

                    {/* Tableau */}
                    <div className="overflow-x-auto">
                        {isLoading ? (
                            <div className="flex justify-center items-center h-64">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-maraudr-blue"></div>
                            </div>
                        ) : items.length === 0 ? (
                            <div className="text-center p-8">
                                <p className="text-gray-500 dark:text-gray-400">
                                    Aucun item trouvé dans le stock
                                </p>
                            </div>
                        ) : (
                            <>
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-700">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                Nom
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                Description
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                Catégorie
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                Quantité
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                Date d'entrée
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                Code-barres
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                        {currentItems.map((item, index) => (
                                            <tr key={item.id} className={index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700'}>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-maraudr-darkText dark:text-maraudr-lightText">
                                                        {item.name}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                                        {item.description || '-'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                                        {item.category}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                                        {item.quantity}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                                        {new Date(item.entryDate).toLocaleDateString()}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                                        {item.barCode || '-'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <div className="flex justify-end space-x-2">
                                                        {editingItem?.id === item.id ? (
                                                            <>
                                                                <Button
                                                                    onClick={() => handleEditSubmit(item)}
                                                                    className="text-green-500 hover:text-green-600 p-2"
                                                                >
                                                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                                    </svg>
                                                                </Button>
                                                                <Button
                                                                    onClick={() => setShowEditModal(false)}
                                                                    className="text-red-500 hover:text-red-600 p-2"
                                                                >
                                                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                                    </svg>
                                                                </Button>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Button
                                                                    onClick={() => handleEditClick(item)}
                                                                    className="text-blue-500 hover:text-blue-600 p-2"
                                                                >
                                                                    <FaPencilAlt className="h-4 w-4" />
                                                                </Button>
                                                                <Button
                                                                    onClick={() => handleDeleteClick(item.id)}
                                                                    className="text-red-500 hover:text-red-600 p-2"
                                                                >
                                                                    <FaTrash className="h-4 w-4" />
                                                                </Button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                
                                {/* Pagination - déplacée en dehors du overflow-x-auto */}
                                {totalPages > 1 && (
                                    <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 sm:px-6">
                                        <div className="flex-1 flex justify-between sm:hidden">
                                            <Button
                                                onClick={() => handlePageChange(currentPage - 1)}
                                                disabled={currentPage === 1}
                                                className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                Précédent
                                            </Button>
                                            <Button
                                                onClick={() => handlePageChange(currentPage + 1)}
                                                disabled={currentPage === totalPages}
                                                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                Suivant
                                            </Button>
                                        </div>
                                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                            <div>
                                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                                    Affichage de <span className="font-medium">{indexOfFirstItem + 1}</span> à{' '}
                                                    <span className="font-medium">
                                                        {Math.min(indexOfLastItem, items.length)}
                                                    </span>{' '}
                                                    sur <span className="font-medium">{items.length}</span> résultats
                                                </p>
                                            </div>
                                            <div>
                                                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                                    <Button
                                                        onClick={() => handlePageChange(currentPage - 1)}
                                                        disabled={currentPage === 1}
                                                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        <span className="sr-only">Précédent</span>
                                                        &laquo;
                                                    </Button>
                                                    {[...Array(totalPages)].map((_, index) => {
                                                        const pageNumber = index + 1;
                                                        if (
                                                            pageNumber === 1 ||
                                                            pageNumber === totalPages ||
                                                            (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                                                        ) {
                                                            return (
                                                                <Button
                                                                    key={pageNumber}
                                                                    onClick={() => handlePageChange(pageNumber)}
                                                                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                                                        currentPage === pageNumber
                                                                            ? 'z-10 bg-maraudr-blue border-maraudr-blue text-white'
                                                                            : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                                                                    }`}
                                                                >
                                                                    {pageNumber}
                                                                </Button>
                                                            );
                                                        } else if (
                                                            pageNumber === currentPage - 2 ||
                                                            pageNumber === currentPage + 2
                                                        ) {
                                                            return <span key={pageNumber} className="px-4 py-2">...</span>;
                                                        }
                                                        return null;
                                                    })}
                                                    <Button
                                                        onClick={() => handlePageChange(currentPage + 1)}
                                                        disabled={currentPage === totalPages}
                                                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        <span className="sr-only">Suivant</span>
                                                        &raquo;
                                                    </Button>
                                                </nav>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </main>

            {/* Modal de modification */}
            {editingItem && (
                <Dialog
                    open={showEditModal}
                    onClose={() => setShowEditModal(false)}
                    className="fixed inset-0 z-50 overflow-y-auto"
                >
                    <div className="flex items-center justify-center min-h-screen px-4">
                        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />

                        <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full mx-auto p-6 space-y-6">
                            <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-4">
                                <Dialog.Title className="text-xl font-semibold text-maraudr-darkText dark:text-maraudr-lightText">
                                    Modifier l'item
                                </Dialog.Title>
                                <button
                                    onClick={() => setShowEditModal(false)}
                                    className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
                                >
                                    <XMarkIcon className="h-6 w-6" />
                                </button>
                            </div>

                            <form onSubmit={(e) => {
                                e.preventDefault();
                                handleEditSubmit(editingItem);
                            }} className="space-y-5">
                                <div className="space-y-4">
                                    <div>
                                        <Input
                                            name="name"
                                            value={editingItem.name}
                                            onChange={(e) => setEditingItem({...editingItem, name: e.target.value})}
                                            required
                                            placeholder="Entrez le nom de l'item"
                                        />
                                    </div>

                                    <div>
                                        <Input
                                            name="description"
                                            value={editingItem.description || ''}
                                            onChange={(e) => setEditingItem({...editingItem, description: e.target.value})}
                                            placeholder="Entrez une description (optionnel)"
                                        />
                                    </div>

                                    <div>
                                        <Select
                                            name="category"
                                            value={editingItem.category}
                                            onChange={(e) => setEditingItem({...editingItem, category: e.target.value as Category})}
                                            required
                                            placeholder="Sélectionnez une catégorie"
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
                                            value={editingItem.quantity.toString()}
                                            onChange={(e) => setEditingItem({...editingItem, quantity: parseInt(e.target.value) || 0})}
                                            required
                                            min="0"
                                            placeholder="Entrez la quantité"
                                        />
                                    </div>

                                    <div>
                                        <Input
                                            name="barCode"
                                            value={editingItem.barCode || ''}
                                            onChange={(e) => setEditingItem({...editingItem, barCode: e.target.value})}
                                            placeholder="Entrez le code-barres (optionnel)"
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <Button
                                        type="button"
                                        onClick={() => setShowEditModal(false)}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                                    >
                                        Annuler
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="px-4 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 rounded-lg transition-colors"
                                    >
                                        Valider
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </Dialog>
            )}

            {/* Modal de confirmation de suppression */}
            <Dialog
                open={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                className="fixed inset-0 z-50 overflow-y-auto"
            >
                <div className="flex items-center justify-center min-h-screen px-4">
                    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />

                    <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full mx-auto p-6 space-y-6">
                        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-4">
                            <Dialog.Title className="text-xl font-semibold text-maraudr-darkText dark:text-maraudr-lightText">
                                Confirmer la suppression
                            </Dialog.Title>
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
                            >
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>

                        <p className="text-gray-500 dark:text-gray-400">
                            Êtes-vous sûr de vouloir supprimer cet item ? Cette action est irréversible.
                        </p>

                        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <Button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                            >
                                Annuler
                            </Button>
                            <Button
                                onClick={handleDeleteConfirm}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
                            >
                                Supprimer
                            </Button>
                        </div>
                    </div>
                </div>
            </Dialog>
        </div>
    );
};