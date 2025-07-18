export enum Category {
    Unknown = 0,
    Food = 1,
    Liquid = 2,
    Medical = 3,
    Clothes = 4
}

// Fonction pour obtenir toutes les catégories pour les sélecteurs
export const getAllCategories = () => {
    return Object.values(Category)
        .filter(value => typeof value === 'number' && value !== Category.Unknown)
        .map(value => ({
            value: value as Category,
            label: Object.keys(Category)[Object.values(Category).indexOf(value)]
        }));
};

// Fonction pour obtenir le nom d'une catégorie à partir de sa valeur numérique
export const getCategoryName = (categoryValue: Category | string | number): string => {
    // Convertir en nombre si c'est une chaîne
    const numericValue = typeof categoryValue === 'string' ? parseInt(categoryValue) : Number(categoryValue);
    
    const categoryNames = Object.keys(Category) as (keyof typeof Category)[];
    const categoryName = categoryNames.find(key => Category[key] === numericValue);
    return categoryName || 'Inconnue';
};

// Fonction pour obtenir les catégories traduites
export const getTranslatedCategories = (t: any) => {
    return Object.values(Category)
        .filter(value => typeof value === 'number' && value !== Category.Unknown)
        .map(value => ({
            value: value as Category,
            label: t(`stock.category_${Object.keys(Category)[Object.values(Category).indexOf(value)].toLowerCase()}`)
        }));
};

// Fonction pour obtenir le nom traduit d'une catégorie
export const getTranslatedCategoryName = (categoryValue: Category | string | number, t: any): string => {
    const numericValue = typeof categoryValue === 'string' ? parseInt(categoryValue) : Number(categoryValue);
    
    const categoryNames = Object.keys(Category) as (keyof typeof Category)[];
    const categoryName = categoryNames.find(key => Category[key] === numericValue);
    
    if (categoryName) {
        return t(`stock.category_${categoryName.toLowerCase()}`);
    }
    
    return t('stock.category_unknown');
};

export interface StockItem {
    id: string;
    stockId: string;
    name: string;
    description?: string;
    barCode?: string;
    category: Category;
    entryDate: string;
    quantity: number;
}

export interface CreateStockItemRequest {
    name: string;
    description?: string;
    barCode?: string;
    category: Category;
    quantity: number;
}

export interface StockItemFilter {
    category?: string;
    name?: string;
}

export interface Stock {
    id: string;
    associationId: string;
    items: StockItem[];
}

export interface CreateStockRequest {
    associationId: string;
}

export interface StockResponse {
    stockId: string;
} 