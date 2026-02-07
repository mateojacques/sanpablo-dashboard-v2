import type { Timestamps } from '@/types/common';

export const ORDER_STATUSES = [
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export type OrderItem = {
  id: string;
  productId: string | null;
  productSku: string;
  productName: string;
  quantity: number;
  unitPrice: string;
  totalPrice: string;
};

export type Order = {
  id: string;
  orderNumber: string;
  userId: string | null;
  status: OrderStatus;
  contactFullName: string;
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
  subtotal: string;
  total: string;
  customerNotes: string | null;
  internalNotes: string | null;
  items: OrderItem[];
} & Timestamps;

export type OrdersListParams = {
  page?: number;
  limit?: number;
  status?: OrderStatus;
  userId?: string;
  search?: string;
};

// API returns: { data: Order[], meta: { total, page, limit, totalPages } }
export type OrdersResponse = {
  data: Order[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

export type UpdateOrderStatusInput = {
  status: OrderStatus;
  internalNotes?: string;
};

// Utility maps for UI
export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmado',
  processing: 'En proceso',
  shipped: 'Enviado',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
};

export const ORDER_STATUS_VARIANTS: Record<OrderStatus, 'default' | 'secondary' | 'success' | 'warning' | 'destructive'> = {
  pending: 'warning',
  confirmed: 'default',
  processing: 'secondary',
  shipped: 'default',
  delivered: 'success',
  cancelled: 'destructive',
};
