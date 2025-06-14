import axios from 'axios';
import { 
    StockItem, 
    CreateStockItemRequest, 
    StockItemFilter, 
    CreateStockRequest,
    StockResponse,
    Category
} from '../types/stock/StockItem';

const API_URL = 'http://localhost:8080';

// Données fictives pour le test
const MOCK_ITEMS: StockItem[] = [
    {
        id: '1',
        stockId: 'stock-1',
        name: 'Pâtes',
        description: 'Pâtes de blé dur',
        category: Category.Food,
        quantity: 50,
        entryDate: new Date('2024-03-15').toISOString(),
        barCode: '123456789012'
    },
    {
        id: '2',
        stockId: 'stock-1',
        name: 'Eau minérale',
        description: 'Bouteilles d\'eau 1.5L',
        category: Category.Liquid,
        quantity: 100,
        entryDate: new Date('2024-03-14').toISOString(),
        barCode: '234567890123'
    },
    {
        id: '3',
        stockId: 'stock-1',
        name: 'Pansements',
        description: 'Boîte de pansements adhésifs',
        category: Category.Medical,
        quantity: 4,
        entryDate: new Date('2024-03-13').toISOString(),
        barCode: '345678901234'
    },
    {
        id: '4',
        stockId: 'stock-1',
        name: 'T-shirts',
        description: 'T-shirts en coton',
        category: Category.Clothes,
        quantity: 25,
        entryDate: new Date('2024-03-12').toISOString(),
        barCode: '456789012345'
    },
    {
        id: '5',
        stockId: 'stock-1',
        name: 'Riz',
        description: 'Riz basmati',
        category: Category.Food,
        quantity: 40,
        entryDate: new Date('2024-03-11').toISOString(),
        barCode: '567890123456'
    },
    {
        id: '6',
        stockId: 'stock-1',
        name: 'Jus d\'orange',
        description: 'Bouteilles de jus d\'orange 1L',
        category: Category.Liquid,
        quantity: 30,
        entryDate: new Date('2024-03-10').toISOString(),
        barCode: '678901234567'
    },
    {
        id: '7',
        stockId: 'stock-1',
        name: 'Paracétamol',
        description: 'Boîte de 20 comprimés',
        category: Category.Medical,
        quantity: 15,
        entryDate: new Date('2024-03-09').toISOString(),
        barCode: '789012345678'
    },
    {
        id: '8',
        stockId: 'stock-1',
        name: 'Pantalons',
        description: 'Pantalons de jogging',
        category: Category.Clothes,
        quantity: 20,
        entryDate: new Date('2024-03-08').toISOString(),
        barCode: '890123456789'
    },
    {
        id: '9',
        stockId: 'stock-1',
        name: 'Pommes',
        description: 'Pommes Golden',
        category: Category.Food,
        quantity: 75,
        entryDate: new Date('2024-03-07').toISOString(),
        barCode: '901234567890'
    },
    {
        id: '10',
        stockId: 'stock-1',
        name: 'Lait',
        description: 'Briques de lait 1L',
        category: Category.Liquid,
        quantity: 45,
        entryDate: new Date('2024-03-06').toISOString(),
        barCode: '012345678901'
    },
    {
        id: '11',
        stockId: 'stock-1',
        name: 'Bandages',
        description: 'Rouleaux de bandages',
        category: Category.Medical,
        quantity: 8,
        entryDate: new Date('2024-03-05').toISOString(),
        barCode: '123456789012'
    },
    {
        id: '12',
        stockId: 'stock-1',
        name: 'Chaussettes',
        description: 'Paires de chaussettes',
        category: Category.Clothes,
        quantity: 50,
        entryDate: new Date('2024-03-04').toISOString(),
        barCode: '234567890123'
    },
    {
        id: '13',
        stockId: 'stock-1',
        name: 'Pommes de terre',
        description: 'Sac de 5kg',
        category: Category.Food,
        quantity: 10,
        entryDate: new Date('2024-03-03').toISOString(),
        barCode: '345678901234'
    },
    {
        id: '14',
        stockId: 'stock-1',
        name: 'Soda',
        description: 'Canettes de soda',
        category: Category.Liquid,
        quantity: 120,
        entryDate: new Date('2024-03-02').toISOString(),
        barCode: '456789012345'
    },
    {
        id: '15',
        stockId: 'stock-1',
        name: 'Antiseptique',
        description: 'Solution antiseptique 500ml',
        category: Category.Medical,
        quantity: 6,
        entryDate: new Date('2024-03-01').toISOString(),
        barCode: '567890123456'
    }
];

// Fonction pour simuler un délai réseau
const simulateNetworkDelay = () => new Promise(resolve => setTimeout(resolve, 500));

// Flag pour activer/désactiver le mode mock
const USE_MOCK_DATA = true;

export const stockService = {
    // Vérifier si un stock existe pour une association
    getStockId: async (associationId: string): Promise<string | null> => {
        if (USE_MOCK_DATA) {
            await simulateNetworkDelay();
            return 'stock-1'; // On simule toujours un stock existant
        }

        try {
            const response = await axios.get(`${API_URL}/stock/id`, {
                params: { associationId },
                withCredentials: true
            });
            return response.data.stockId;
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 404) {
                return null;
            }
            throw error;
        }
    },

    // Créer un nouveau stock
    createStock: async (associationId: string): Promise<string> => {
        if (USE_MOCK_DATA) {
            await simulateNetworkDelay();
            return 'stock-1';
        }

        const response = await axios.post<StockResponse>(
            `${API_URL}/create-stock`,
            { associationId },
            { withCredentials: true }
        );
        return response.data.stockId;
    },

    // Récupérer les items d'un stock
    getStockItems: async (associationId: string, filter?: StockItemFilter): Promise<StockItem[]> => {
        if (USE_MOCK_DATA) {
            await simulateNetworkDelay();
            let filteredItems = [...MOCK_ITEMS];

            if (filter) {
                if (filter.category) {
                    filteredItems = filteredItems.filter(item => item.category === filter.category);
                }
                if (filter.name) {
                    const searchTerm = filter.name.toLowerCase();
                    filteredItems = filteredItems.filter(item => 
                        item.name.toLowerCase().includes(searchTerm) ||
                        (item.description && item.description.toLowerCase().includes(searchTerm))
                    );
                }
            }

            return filteredItems;
        }

        const response = await axios.get<StockItem[]>(`${API_URL}/stock/items`, {
            params: { 
                associationId,
                ...filter
            },
            withCredentials: true
        });
        return response.data;
    },

    // Créer un nouvel item
    createItem: async (item: CreateStockItemRequest, associationId: string): Promise<string> => {
        if (USE_MOCK_DATA) {
            await simulateNetworkDelay();
            const newItem: StockItem = {
                id: `mock-${Date.now()}`,
                stockId: 'stock-1',
                ...item,
                entryDate: new Date().toISOString()
            };
            MOCK_ITEMS.push(newItem);
            return newItem.id;
        }

        const response = await axios.post<{ id: string }>(
            `${API_URL}/item`,
            { ...item, associationId },
            { withCredentials: true }
        );
        return response.data.id;
    },

    // Supprimer un item
    deleteItem: async (associationId: string, itemId: string): Promise<void> => {
        if (USE_MOCK_DATA) {
            await simulateNetworkDelay();
            const index = MOCK_ITEMS.findIndex(item => item.id === itemId);
            if (index !== -1) {
                MOCK_ITEMS.splice(index, 1);
            }
            return;
        }

        await axios.delete(`${API_URL}/stock/item`, {
            params: { associationId, itemId },
            withCredentials: true
        });
    },

    // Récupérer un item par son ID
    getItemById: async (id: string, associationId: string): Promise<StockItem> => {
        if (USE_MOCK_DATA) {
            await simulateNetworkDelay();
            const item = MOCK_ITEMS.find(item => item.id === id);
            if (!item) {
                throw new Error('Item not found');
            }
            return item;
        }

        const response = await axios.get<StockItem>(`${API_URL}/item/${id}`, {
            params: { associationId },
            withCredentials: true
        });
        return response.data;
    },

    // Récupérer les items par catégorie
    getItemsByCategory: async (category: Category): Promise<StockItem[]> => {
        if (USE_MOCK_DATA) {
            await simulateNetworkDelay();
            return MOCK_ITEMS.filter(item => item.category === category);
        }

        const response = await axios.get<StockItem[]>(`${API_URL}/item/type/${category}`, {
            withCredentials: true
        });
        return response.data;
    },

    // Récupérer un item par son code-barres
    getItemByBarcode: async (barcode: string): Promise<StockItem> => {
        if (USE_MOCK_DATA) {
            await simulateNetworkDelay();
            const item = MOCK_ITEMS.find(item => item.barCode === barcode);
            if (!item) {
                throw new Error('Item not found');
            }
            return item;
        }

        const response = await axios.get<StockItem>(`${API_URL}/item/barcode/${barcode}`, {
            withCredentials: true
        });
        return response.data;
    },

    // Créer un item à partir d'un code-barres
    createItemFromBarcode: async (barcode: string, associationId: string): Promise<string> => {
        if (USE_MOCK_DATA) {
            await simulateNetworkDelay();
            // Simuler la création d'un nouvel item avec le code-barres
            const newItem: StockItem = {
                id: `mock-${Date.now()}`,
                stockId: 'stock-1',
                name: `Item ${barcode}`,
                category: Category.Unknown,
                quantity: 1,
                entryDate: new Date().toISOString(),
                barCode: barcode
            };
            MOCK_ITEMS.push(newItem);
            return newItem.id;
        }

        const response = await axios.post<{ id: string }>(
            `${API_URL}/item/${barcode}`,
            { associationId },
            { withCredentials: true }
        );
        return response.data.id;
    }
}; 