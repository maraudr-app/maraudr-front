export enum ItemCategory {
  FOOD = 0,
  CLOTHING = 1,
  ELECTRONICS = 2,
  FURNITURE = 3,
  OTHER = 4
}

export interface CreateItemCommand {
  name: string;
  description: string;
  barCode: string;
  itemType: ItemCategory;
}

export interface Item {
  id: string;
  name: string;
  description: string;
  barCode: string;
  itemType: ItemCategory;
  quantity: number;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateItemCommand {
  id: string;
  name?: string;
  description?: string;
  barCode?: string;
  itemType?: ItemCategory;
  quantity?: number;
} 