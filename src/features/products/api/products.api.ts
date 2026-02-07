import { api } from '@/lib/axios';
import type {
  Product,
  ProductsResponse,
  ProductsListParams,
  CreateProductInput,
  UpdateProductInput,
} from '../types';

export const productsApi = {
  getAll: async (params?: ProductsListParams): Promise<ProductsResponse> => {
    const { data } = await api.get('/api/products', { params });
    return data;
  },

  getById: async (id: string): Promise<{ data: Product }> => {
    const { data } = await api.get(`/api/products/${id}`);
    return data;
  },

  getBySku: async (sku: string): Promise<{ data: Product }> => {
    const { data } = await api.get(`/api/products/sku/${sku}`);
    return data;
  },

  create: async (input: CreateProductInput): Promise<{ data: Product }> => {
    const { data } = await api.post('/api/products', input);
    return data;
  },

  update: async (id: string, input: UpdateProductInput): Promise<{ data: Product }> => {
    const { data } = await api.put(`/api/products/${id}`, input);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/products/${id}`);
  },

  toggleActive: async (id: string, isActive: boolean): Promise<{ data: Product }> => {
    const { data } = await api.put(`/api/products/${id}`, { isActive });
    return data;
  },
};
