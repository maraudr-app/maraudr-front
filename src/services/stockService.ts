import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { 
    StockItem, 
    CreateStockItemRequest, 
    StockItemFilter, 
    CreateStockRequest,
    StockResponse,
    Category
} from '../types/stock/StockItem';

const API_URL = 'http://localhost:8081';

// Fonction utilitaire pour mapper les réponses du backend vers le frontend
const mapBackendItemToFrontend = (backendItem: any): StockItem => {
    return {
        ...backendItem,
        category: typeof backendItem.itemType !== 'undefined' 
            ? (typeof backendItem.itemType === 'string' ? parseInt(backendItem.itemType) as Category : backendItem.itemType)
            : (typeof backendItem.category === 'string' ? parseInt(backendItem.category) as Category : backendItem.category)
    };
};

export const stockService = {
    // Vérifier si un stock existe pour une association
    getStockId: async (associationId: string): Promise<string | null> => {
        const token = useAuthStore.getState().token;
        if (!token) {
            throw new Error('No authentication token available');
        }

        try {
            const response = await axios.get(`${API_URL}/stock/id`, {
                params: { associationId },
                headers: {
                    'Authorization': `Bearer ${token}`
                },
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
        const token = useAuthStore.getState().token;
        if (!token) {
            throw new Error('No authentication token available');
        }

        const response = await axios.post<StockResponse>(
            `${API_URL}/create-stock`,
            { associationId },
            { 
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                withCredentials: true 
            }
        );
        return response.data.stockId;
    },

    // Récupérer les items d'un stock
    getStockItems: async (associationId: string, filter?: StockItemFilter): Promise<StockItem[]> => {
        const token = useAuthStore.getState().token;
        if (!token) {
            throw new Error('No authentication token available');
        }

        const response = await axios.get<any[]>(`${API_URL}/stock/items`, {
            params: { 
                associationId,
                ...filter
            },
            headers: {
                'Authorization': `Bearer ${token}`
            },
            withCredentials: true
        });
        
        // Mapper les réponses du backend vers le format frontend
        return response.data.map(mapBackendItemToFrontend);
    },

    // Créer un nouvel item
    createItem: async (item: CreateStockItemRequest, associationId: string): Promise<string> => {
        const token = useAuthStore.getState().token;
        if (!token) {
            throw new Error('No authentication token available');
        }

        // D'abord, récupérer ou créer le stock pour cette association
        let stockId = await stockService.getStockId(associationId);
        if (!stockId) {
            console.log('Aucun stock trouvé pour l\'association, création en cours...');
            stockId = await stockService.createStock(associationId);
        }

        console.log('Création d\'item avec stockId:', stockId);

        // Préparer les données selon le format attendu par le backend
        const requestData = { 
            stockId: stockId,
            name: item.name,
            description: item.description || "",
            barCode: item.barCode || "",
            itemType: item.category,
            quantity: item.quantity
        };
        console.log('Données envoyées à l\'API:', requestData);

        try {
            const response = await axios.post<{ id: string }>(
                `${API_URL}/item`,
                requestData,
                { 
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    withCredentials: true 
                }
            );
            console.log('Réponse de l\'API:', response.data);
            return response.data.id;
        } catch (error) {
            console.error('Erreur lors de la création de l\'item:', error);
            if (axios.isAxiosError(error)) {
                console.error('Détails de l\'erreur:', error.response?.data);
                console.error('Status:', error.response?.status);
            }
            throw error;
        }
    },

    // Mettre à jour un item
    updateItem: async (item: StockItem, associationId: string): Promise<void> => {
        const token = useAuthStore.getState().token;
        if (!token) {
            throw new Error('No authentication token available');
        }

        const requestData = {
            stockId: item.stockId,
            name: item.name,
            description: item.description || "",
            barCode: item.barCode || "",
            itemType: item.category,
            quantity: item.quantity
        };

        try {
            await axios.put(`${API_URL}/item`, requestData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                withCredentials: true
            });
        } catch (error) {
            console.error('Erreur lors de la mise à jour de l\'item:', error);
            throw error;
        }
    },

    // Supprimer un item
    deleteItem: async (associationId: string, itemId: string): Promise<void> => {
        const token = useAuthStore.getState().token;
        if (!token) {
            throw new Error('No authentication token available');
        }

        await axios.delete(`${API_URL}/stock/item`, {
            params: { associationId, itemId },
            headers: {
                'Authorization': `Bearer ${token}`
            },
            withCredentials: true
        });
    },

    // Récupérer un item par son ID
    getItemById: async (id: string, associationId: string): Promise<StockItem> => {
        const token = useAuthStore.getState().token;
        if (!token) {
            throw new Error('No authentication token available');
        }

        const response = await axios.get<any>(`${API_URL}/item/${id}`, {
            params: { associationId },
            headers: {
                'Authorization': `Bearer ${token}`
            },
            withCredentials: true
        });
        
        // Mapper la réponse du backend vers le format frontend
        return mapBackendItemToFrontend(response.data);
    },

    // Récupérer les items par catégorie
    getItemsByCategory: async (category: Category, associationId: string): Promise<StockItem[]> => {
        const token = useAuthStore.getState().token;
        if (!token) {
            throw new Error('No authentication token available');
        }

        const response = await axios.get<any[]>(`${API_URL}/item/type/${category}`, {
            params: { associationId },
            headers: {
                'Authorization': `Bearer ${token}`
            },
            withCredentials: true
        });
        
        // Mapper les réponses du backend vers le format frontend
        return response.data.map(mapBackendItemToFrontend);
    },

    // Récupérer un item par son code-barres
    getItemByBarcode: async (barcode: string, associationId: string): Promise<StockItem> => {
        const token = useAuthStore.getState().token;
        if (!token) {
            throw new Error('No authentication token available');
        }

        const response = await axios.get<any>(`${API_URL}/item/barcode/${barcode}`, {
            params: { associationId },
            headers: {
                'Authorization': `Bearer ${token}`
            },
            withCredentials: true
        });
        
        // Mapper la réponse du backend vers le format frontend
        return mapBackendItemToFrontend(response.data);
    },

    // Créer un item à partir d'un code-barres
    createItemFromBarcode: async (barcode: string, associationId: string): Promise<string> => {
        const token = useAuthStore.getState().token;
        if (!token) {
            throw new Error('No authentication token available');
        }

        const response = await axios.post<{ id: string }>(
            `${API_URL}/item/${barcode}`,
            { associationId },
            { 
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                withCredentials: true 
            }
        );
        return response.data.id;
    }
}; 