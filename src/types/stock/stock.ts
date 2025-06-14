import { Category } from './StockItem';

export interface CreateItemCommand {
    name: string;
    description: string;
    barCode: string;
    itemType: Category;
}

export interface Item {
    id: string;
    name: string;
    description: string;
    barCode: string;
    itemType: Category;
    quantity: number;
    createdAt: string;
    updatedAt: string;
}

export interface UpdateItemCommand {
    id: string;
    name?: string;
    description?: string;
    barCode?: string;
    itemType?: Category;
    quantity?: number;
} 