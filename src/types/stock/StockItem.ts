export enum Category {
    Default = '',
    Unknown = 'Unknown',
    Food = 'Food',
    Liquid = 'Liquid',
    Medical = 'Medical',
    Clothes = 'Clothes'
}

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