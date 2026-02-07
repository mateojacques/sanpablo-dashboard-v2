import { api } from '@/lib/axios';
import type {
  Category,
  CategoriesResponse,
  CategoryResponse,
  CreateCategoryInput,
  UpdateCategoryInput,
} from '../types';

export const categoriesApi = {
  getAll: async (): Promise<CategoriesResponse> => {
    const { data } = await api.get('/api/categories');
    return data;
  },

  getById: async (id: string): Promise<CategoryResponse> => {
    const { data } = await api.get(`/api/categories/${id}`);
    return data;
  },

  create: async (input: CreateCategoryInput): Promise<CategoryResponse> => {
    const { data } = await api.post('/api/categories', input);
    return data;
  },

  update: async (id: string, input: UpdateCategoryInput): Promise<CategoryResponse> => {
    const { data } = await api.put(`/api/categories/${id}`, input);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/categories/${id}`);
  },

  reorder: async (categoryIds: string[]): Promise<{ data: Category[] }> => {
    const { data } = await api.put('/api/categories/reorder', { categoryIds });
    return data;
  },
};
