import axios from 'axios';
import { authService } from './authService';
import { Item, CreateItemCommand, UpdateItemCommand } from '../models/stock';

const API_URL = 'http://localhost:8081';

class StockService {
  private getAuthHeader() {
    const token = authService.getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }
    return {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };
  }

  async createItem(item: CreateItemCommand): Promise<Item> {
    try {
      const response = await axios.post(`${API_URL}/api/stock/items`, item, this.getAuthHeader());
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getItems(): Promise<Item[]> {
    try {
      const response = await axios.get(`${API_URL}/api/stock/items`, this.getAuthHeader());
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getItemById(id: string): Promise<Item> {
    try {
      const response = await axios.get(`${API_URL}/api/stock/items/${id}`, this.getAuthHeader());
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateItem(item: UpdateItemCommand): Promise<Item> {
    try {
      const response = await axios.put(`${API_URL}/api/stock/items/${item.id}`, item, this.getAuthHeader());
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteItem(id: string): Promise<void> {
    try {
      await axios.delete(`${API_URL}/api/stock/items/${id}`, this.getAuthHeader());
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateItemQuantity(id: string, quantity: number): Promise<Item> {
    try {
      const response = await axios.patch(
        `${API_URL}/api/stock/items/${id}/quantity`,
        { quantity },
        this.getAuthHeader()
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private handleError(error: any): Error {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message || error.message;
      return new Error(message);
    }
    return error;
  }
}

export const stockService = new StockService(); 