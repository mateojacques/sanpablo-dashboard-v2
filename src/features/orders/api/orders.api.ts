import { api } from '@/lib/axios';
import type {
  Order,
  OrdersResponse,
  OrdersListParams,
  UpdateOrderStatusInput,
} from '../types';

export const ordersApi = {
  getAll: async (params?: OrdersListParams): Promise<OrdersResponse> => {
    const { data } = await api.get('/api/orders', { params });
    return data;
  },

  getById: async (id: string): Promise<{ data: Order }> => {
    const { data } = await api.get(`/api/orders/${id}`);
    return data;
  },

  getByOrderNumber: async (orderNumber: string): Promise<{ data: Order }> => {
    const { data } = await api.get(`/api/orders/number/${orderNumber}`);
    return data;
  },

  updateStatus: async (id: string, input: UpdateOrderStatusInput): Promise<{ data: Order }> => {
    const { data } = await api.put(`/api/orders/${id}/status`, input);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/orders/${id}`);
  },
};
