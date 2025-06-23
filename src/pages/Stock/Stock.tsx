import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { StockNavbar } from '../../components/stock/StockNavbar';
import { StockChart } from '../../components/stock/StockChart';
import { EditItemModal } from '../../components/stock/EditItemModal';
import { stockService } from '../../services/stockService';
import { useAssoStore } from '../../store/assoStore';
import { StockItem, Category, getAllCategories, getCategoryName } from '../../types/stock/StockItem';
import { toast } from 'react-hot-toast';
import { FaTrash, FaPencilAlt } from 'react-icons/fa';
import { Button } from '../../components/common/button/button';
import { Select } from '../../components/common/select/select';
import { Input } from '../../components/common/input/input';
import { Dialog } from '@headlessui/react';
import { XMarkIcon, ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import { AssociationDebug } from '../../components/debug/AssociationDebug';

interface FilterState {
    category: string;
    name: string;
    minQuantity: string;
    maxQuantity: string;
}

export const Stock = () => {
    const navigate = useNavigate();
  const { t } = useTranslation();
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
    const { selectedAssociation, associations, setSelectedAssociation } = useAssoStore();
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [highlightedItemId, setHighlightedItemId] = useState<string | null>(null);
    const [highlightedItemName, setHighlightedItemName] = useState<string | null>(null);

    useEffect(() => {
        const checkStock = async () => {
            console.log('🔄 Stock: useEffect déclenché pour association:', selectedAssociation?.id);
            
            // Si aucune association n'est sélectionnée mais qu'il y en a dans la liste, sélectionner la première
            if (!selectedAssociation && associations.length > 0) {
                console.log('📌 Stock: Sélection automatique de la première association');
                setSelectedAssociation(associations[0]);
                return;
            }

            // Si aucune association n'est disponible, afficher un message et rediriger vers la création
            if (!selectedAssociation) {
                console.log('❌ Stock: Aucune association disponible');
                toast.error(t('stock.noAssociation', 'Vous n\'avez pas encore d\'association'));
                navigate('/maraudApp/create-asso');
                return;
            }

            setIsLoading(true);
            try {
                console.log('🔍 Stock: Vérification du stock pour association:', selectedAssociation.id);
                let stockId = await stockService.getStockId(selectedAssociation.id);
                console.log('📦 Stock: Stock ID trouvé:', stockId);
                
                if (!stockId) {
                    console.log('🆕 Stock: Aucun stock trouvé, création en cours...');
                    stockId = await stockService.createStock(selectedAssociation.id);
                    console.log('✅ Stock: Stock créé avec ID:', stockId);
                }
                
                console.log('📋 Stock: Chargement des items pour le stock:', stockId);
                await fetchItems();
                console.log('✅ Stock: Items chargés avec succès');
            } catch (error) {
                console.error('❌ Stock: Erreur détaillée lors de la vérification du stock:', error);
                toast.error('Erreur lors de la vérification du stock: ' + (error as Error).message);
            } finally {
                setIsLoading(false);
            }
        };

        checkStock();
    }, [selectedAssociation, associations, navigate, setSelectedAssociation, t]);

    // Ajouter un useEffect pour écouter les changements d'association via l'événement personnalisé
    useEffect(() => {
        const handleAssociationChange = (event: CustomEvent) => {
            console.log('🎯 Stock: Événement de changement d\'association reçu:', event.detail.association);
            // Les useEffects ci-dessus vont automatiquement se déclencher grâce à la dépendance selectedAssociation
        };

        window.addEventListener('associationChanged', handleAssociationChange as EventListener);
        
        return () => {
            window.removeEventListener('associationChanged', handleAssociationChange as EventListener);
        };
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [filter.category, filter.name]);

    const fetchItems = async () => {
        if (!selectedAssociation) {
            console.log('❌ fetchItems: Aucune association sélectionnée');
            return;
        }

        console.log('🔄 fetchItems: Début du chargement pour association:', selectedAssociation.id);
        setIsLoading(true);
        try {
            const fetchedItems = await stockService.getStockItems(selectedAssociation.id, filter);
            console.log('✅ fetchItems: Items récupérés:', fetchedItems.length, 'items');
            setItems(fetchedItems);
        } catch (error) {
            console.error('❌ fetchItems: Erreur:', error);
            toast.error('Erreur lors du chargement des items');
        } finally {
            setIsLoading(false);
        }
    };

    const highlightNewItem = (itemName: string) => {
        console.log('Highlighting item:', itemName);
        // Stocker le nom de l'item à highlighter
        setHighlightedItemName(itemName);
    };

    const onItemAdded = async () => {
        console.log('onItemAdded called');
        await fetchItems();
    };

    // UseEffect pour gérer le highlight après que les items soient mis à jour
    useEffect(() => {
        if (highlightedItemName && items.length > 0) {
            const newItem = items.find(item => item.name === highlightedItemName);
            console.log('Found item to highlight:', newItem);
            if (newItem) {
                setHighlightedItemId(newItem.id);
                setHighlightedItemName(null); // Reset le nom
                // Supprimer le highlight après 3 secondes
                setTimeout(() => {
                    setHighlightedItemId(null);
                }, 3000);
            }
        }
    }, [items, highlightedItemName]);

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
            // Appel API pour mettre à jour l'item
            await stockService.updateItem(updatedItem, selectedAssociation.id);
            
            // Mettre à jour la liste locale
            const index = items.findIndex(item => item.id === updatedItem.id);
            if (index !== -1) {
                const newItems = [...items];
                newItems[index] = updatedItem;
                setItems(newItems);
            }
            
            toast.success('Item modifié avec succès');
            
            // Déclencher l'effet de highlight pour l'item modifié
            setHighlightedItemId(updatedItem.id);
            setTimeout(() => {
                setHighlightedItemId(null);
            }, 3000);
            
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
        return null;
    }

  return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <StockNavbar 
                onItemAdded={onItemAdded} 
                isAddButtonDisabled={false} 
                onItemHighlight={highlightNewItem}
            />

            <main className="pt-16">
                {/* Section Stock Critique */}
                {!isLoading && items.length > 0 && (
                    <div className="mb-8 px-4 sm:px-6 lg:px-8">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                                <ExclamationTriangleIcon className="w-6 h-6 text-orange-500 mr-3" />
                                Stock Critique
                            </h2>
                            
                            {(() => {
                                const criticalItems = items.filter(item => item.quantity <= 10);
                                const lowStockItems = items.filter(item => item.quantity > 10 && item.quantity <= 20);
                                
                                return (
                                    <div className="space-y-4">
                                        {/* Articles critiques (≤ 10) */}
                                        {criticalItems.length > 0 && (
                                            <div>
                                                <h3 className="text-lg font-semibold text-red-700 dark:text-red-400 mb-3 flex items-center">
                                                    <ExclamationTriangleIcon className="w-5 h-5 mr-2" />
                                                    Stock critique (≤ 10 unités) - {criticalItems.length} articles
                                                </h3>
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                    {criticalItems.map(item => (
                                                        <div key={item.id} className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                                                            <div className="flex items-center justify-between mb-2">
                                                                <h4 className="font-medium text-red-900 dark:text-red-200">{item.name}</h4>
                                                                <span className="text-sm font-bold text-red-700 dark:text-red-400">
                                                                    {item.quantity} restant{item.quantity > 1 ? 's' : ''}
                                                                </span>
                                                            </div>
                                                            <p className="text-sm text-red-600 dark:text-red-300 mb-2">
                                                                Catégorie: {getCategoryName(item.category)}
                                                            </p>
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-xs text-red-500 dark:text-red-400">
                                                                    Réapprovisionnement urgent
                                                                </span>
                                                                <Button
                                                                    onClick={() => handleEditClick(item)}
                                                                    className="text-xs px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
                                                                >
                                                                    Réapprovisionner
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        
                                        {/* Articles en stock faible (11-20) */}
                                        {lowStockItems.length > 0 && (
                                            <div>
                                                <h3 className="text-lg font-semibold text-orange-700 dark:text-orange-400 mb-3 flex items-center">
                                                    <ExclamationTriangleIcon className="w-5 h-5 mr-2" />
                                                    Stock faible (11-20 unités) - {lowStockItems.length} articles
                                                </h3>
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                    {lowStockItems.map(item => (
                                                        <div key={item.id} className="p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                                                            <div className="flex items-center justify-between mb-2">
                                                                <h4 className="font-medium text-orange-900 dark:text-orange-200">{item.name}</h4>
                                                                <span className="text-sm font-bold text-orange-700 dark:text-orange-400">
                                                                    {item.quantity} restant{item.quantity > 1 ? 's' : ''}
                                                                </span>
                                                            </div>
                                                            <p className="text-sm text-orange-600 dark:text-orange-300 mb-2">
                                                                Catégorie: {getCategoryName(item.category)}
                                                            </p>
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-xs text-orange-500 dark:text-orange-400">
                                                                    Surveillance recommandée
                                                                </span>
                                                                <Button
                                                                    onClick={() => handleEditClick(item)}
                                                                    className="text-xs px-3 py-1 bg-orange-600 hover:bg-orange-700 text-white rounded-md transition-colors"
                                                                >
                                                                    Gérer
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        
                                        {/* Message si tout va bien */}
                                        {criticalItems.length === 0 && lowStockItems.length === 0 && (
                                            <div className="text-center py-8">
                                                <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
                                                <h3 className="text-lg font-semibold text-green-700 dark:text-green-400 mb-2">
                                                    Excellent ! Tous les stocks sont suffisants
                                                </h3>
                                                <p className="text-green-600 dark:text-green-300">
                                                    Aucun article ne nécessite de réapprovisionnement immédiat
                                                </p>
                                            </div>
                                        )}
                                        
                                        {/* Statistiques rapides */}
                                        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                                <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{items.length}</div>
                                                    <div className="text-sm text-gray-600 dark:text-gray-400">Articles total</div>
                                                </div>
                                                <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                                                    <div className="text-2xl font-bold text-red-600 dark:text-red-400">{criticalItems.length}</div>
                                                    <div className="text-sm text-red-600 dark:text-red-400">Stock critique</div>
                                                </div>
                                                <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                                                    <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{lowStockItems.length}</div>
                                                    <div className="text-sm text-orange-600 dark:text-orange-400">Stock faible</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>
                    </div>
                )}

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
                                    {getAllCategories().map(category => (
                                        <option key={category.value} value={category.value}>
                                            {category.label}
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
                            <div className="w-full flex items-center justify-center min-h-96">
                                <div className="text-center">
                                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto mb-4"></div>
                                    <p className="text-gray-600 dark:text-gray-400 text-lg">
                                        Chargement de votre stock...
                                    </p>
                                    <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">
                                        Récupération des articles en cours
                                    </p>
                                </div>
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
                                        {currentItems.map((item, index) => {
                                            const isHighlighted = highlightedItemId === item.id;
                                            const baseRowClass = index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700';
                                            const highlightClass = isHighlighted 
                                                ? 'bg-gradient-to-r from-green-50 via-orange-100 to-blue-50 dark:from-green-900/20 dark:via-orange-900/30 dark:to-blue-900/20 animate-pulse border-l-4 border-green-300' 
                                                : '';
                                            
                                            return (
                                            <tr key={item.id} className={`${baseRowClass} ${highlightClass} transition-all duration-500`}>
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
                                                        {getCategoryName(item.category)}
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
                                            );
                                        })}
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
            <EditItemModal
                isOpen={showEditModal}
                onClose={() => {
                    setShowEditModal(false);
                    setEditingItem(null);
                }}
                onItemUpdated={handleEditSubmit}
                item={editingItem}
            />

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