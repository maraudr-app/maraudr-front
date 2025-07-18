import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { tokenManager } from './tokenManager';
import { getModuleApiUrl } from '../config/api';
import { 
    StockItem, 
    CreateStockItemRequest, 
    StockItemFilter, 
    CreateStockRequest,
    StockResponse,
    Category
} from '../types/stock/StockItem';

const API_URL = getModuleApiUrl('stock');

// URL spéciale pour les opérations avec /stock : ajoute /stock en production pour avoir stock/stock
const getStockUrl = (): string => {
    const isProduction = !window.location.hostname.includes('localhost');
    return isProduction ? `${API_URL}/stock/stock` : `${API_URL}/stock`;
};

// URL spéciale pour les opérations /item : ajoute /stock en production pour avoir stock/item
const getItemUrl = (): string => {
    const isProduction = !window.location.hostname.includes('localhost');
    return isProduction ? `${API_URL}/stock/item` : `${API_URL}/item`;
};

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
    // Récupérer l'identifiant du stock d'une association
    getStockId: async (associationId: string): Promise<string | null> => {
        const token = await tokenManager.ensureValidToken();
        if (!token) {
            throw new Error('No authentication token available');
        }

        try {
            const response = await axios.get(`${getStockUrl()}/${associationId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                withCredentials: true
            });
            // Retourner directement la valeur string du stockId
            return response.data.stockId || response.data;
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 404) {
                return null;
            }
            throw error;
        }
    },

    // Créer un stock pour une association
    createStock: async (associationId: string): Promise<string> => {
        const token = await tokenManager.ensureValidToken();
        if (!token) {
            throw new Error('No authentication token available');
        }

        const response = await axios.post<{ stockId: string }>(
            `${API_URL}/stock`,
            { associationId },
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                withCredentials: true
            }
        );
        return response.data.stockId;
    },

    // Récupérer tous les articles d'une association
    getStockItems: async (associationId: string, filter?: StockItemFilter): Promise<StockItem[]> => {
        const token = await tokenManager.ensureValidToken();
        if (!token) {
            throw new Error('No authentication token available');
        }

        const response = await axios.get<any[]>(`${getStockUrl()}/items`, {
            params: { associationId },
            headers: {
                'Authorization': `Bearer ${token}`
            },
            withCredentials: true
        });
        
        // Mapper les réponses du backend vers le format frontend
        return response.data.map(mapBackendItemToFrontend);
    },

    // Créer un article à partir d'un code-barres
    createItemFromBarcode: async (barcode: string, associationId: string): Promise<string> => {
        const token = await tokenManager.ensureValidToken();
        if (!token) {
            throw new Error('No authentication token available');
        }

        const response = await axios.post<{ id: string }>(
            `${getItemUrl()}/${barcode}`,
            { associationId },
            { 
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                withCredentials: true 
            }
        );
        return response.data.id;
    },

    // Ajouter un article à une association (ancienne méthode, gardée pour compatibilité)
    addItemToAssociation: async (barcode: string, associationId: string): Promise<void> => {
        const token = await tokenManager.ensureValidToken();
        if (!token) {
            throw new Error('No authentication token available');
        }

        await axios.post(
            `${getItemUrl()}/${barcode}`,
            { associationId },
            { 
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                withCredentials: true 
            }
        );
    },

    // Créer un nouvel item manuellement
    createItem: async (item: CreateStockItemRequest, associationId: string): Promise<string> => {
        const token = await tokenManager.ensureValidToken();
        if (!token) {
            throw new Error('No authentication token available');
        }

        try {
            // D'abord, récupérer le stockId de l'association
            const stockId = await stockService.getStockId(associationId);
            if (!stockId) {
                throw new Error('Stock not found for this association');
            }

            const requestData = { 
                stockId: stockId,
                name: item.name,
                description: item.description || "",
                barCode: item.barCode || "",
                itemType: item.category
            };

            const response = await axios.post<{ id: string }>(
                `${getItemUrl()}`,
                requestData,
                { 
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    withCredentials: true 
                }
            );
            return response.data.id;
        } catch (error: any) {
            throw error;
        }
    },

    // Réduire la quantité d'un article dans le stock
    updateItemQuantity: async (itemId: string, quantity: number): Promise<void> => {
        const token = await tokenManager.ensureValidToken();
        if (!token) {
            throw new Error('No authentication token available');
        }

        await axios.put(
            `${getStockUrl()}/item/${itemId}`,
            { quantity },
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                withCredentials: true
            }
        );
    },

    // Mettre à jour un item (garde l'ancienne fonction pour compatibilité)
    updateItem: async (item: StockItem, associationId: string): Promise<void> => {
        const token = await tokenManager.ensureValidToken();
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
            await axios.put(`${getItemUrl()}`, requestData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                withCredentials: true
            });
        } catch (error) {

            throw error;
        }
    },

    // Supprimer un article du stock
    deleteItem: async (itemId: string, associationId: string): Promise<void> => {
        const token = await tokenManager.ensureValidToken();
        if (!token) {
            throw new Error('No authentication token available');
        }

        await axios.delete(`${getStockUrl()}/item/${itemId}?associationId=${associationId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            },
            withCredentials: true
        });
    },

    // Récupérer un article du stock
    getItemById: async (itemId: string): Promise<StockItem> => {
        const token = await tokenManager.ensureValidToken();
        if (!token) {
            throw new Error('No authentication token available');
        }

        const response = await axios.get<any>(`${getStockUrl()}/item/${itemId}`, {
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
        const token = await tokenManager.ensureValidToken();
        if (!token) {
            throw new Error('No authentication token available');
        }

        const response = await axios.get<any[]>(`${getItemUrl()}/type/${category}`, {
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
        const token = await tokenManager.ensureValidToken();
        if (!token) {
            throw new Error('No authentication token available');
        }

        const response = await axios.get<any>(`${getItemUrl()}/barcode/${barcode}`, {
            params: { associationId },
            headers: {
                'Authorization': `Bearer ${token}`
            },
            withCredentials: true
        });
        
        // Mapper la réponse du backend vers le format frontend
        return mapBackendItemToFrontend(response.data);
    },

    reduceItemStock: async (barcode: string, data: { associationId: string, quantity: number }) => {
        const token = await tokenManager.ensureValidToken();
        if (!token) {
            throw new Error('No authentication token available');
        }
        await axios.put(
            `${getItemUrl()}/reduce/${barcode}`,
            data,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                withCredentials: true
            }
        );
    },

    // Nouvelle fonction pour modifier la quantité d'un item avec la nouvelle route de Khalil
    updateItemQuantityById: async (itemId: string, data: { associationId: string, quantity: number }) => {
        const token = await tokenManager.ensureValidToken();
        if (!token) {
            throw new Error('No authentication token available');
        }
        
        // URL spéciale pour cette nouvelle route
        const getUpdateQuantityUrl = (): string => {
            const isProduction = !window.location.hostname.includes('localhost');
            return isProduction ? `${API_URL}/stock/item/update-quantity` : `${API_URL}/item/update-quantity`;
        };

        await axios.put(
            `${getUpdateQuantityUrl()}/${itemId}`,
            data,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                withCredentials: true
            }
        );
    }
}; 