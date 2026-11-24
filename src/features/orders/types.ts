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
  // Sale units: loose units or whole packs
  quantity: number;
  // 'unit' for orders placed before packs existed
  saleUnit: 'unit' | 'pack';
  unitsPerSale: number;
  // Price of one sale unit (the pack price for a pack line)
  unitPrice: string;
  totalPrice: string;
};

export type IvaStatus =
  | 'responsable_inscripto'
  | 'monotributo'
  | 'exento'
  | 'consumidor_final';

export const IVA_STATUS_LABELS: Record<IvaStatus, string> = {
  responsable_inscripto: 'Responsable inscripto',
  monotributo: 'Monotributo',
  exento: 'Exento',
  consumidor_final: 'Consumidor final',
};

/** The institution as it was when the order was placed. */
export type InstitutionSnapshot = {
  name: string;
  cuit: string | null;
  legalName: string | null;
  ivaStatus: IvaStatus | null;
};

export type Order = {
  id: string;
  orderNumber: string;
  userId: string | null;
  status: OrderStatus;
  institutionId?: string | null;
  /** Null on orders placed before institutional accounts. */
  institutionSnapshot?: InstitutionSnapshot | null;
  /** Only on the order detail. */
  user?: { id: string; email: string; fullName: string; phone: string | null } | null;
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

/** CUIT as it's usually read: 20-12345678-6. */
export function formatCuit(cuit: string): string {
  return /^\d{11}$/.test(cuit) ? `${cuit.slice(0, 2)}-${cuit.slice(2, 10)}-${cuit.slice(10)}` : cuit;
}
