import type { Timestamps } from '@/types/common';

export type Product = {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  regularPrice: string;
  salePrice: string | null;
  specialPrice: string | null;
  imageUrl: string | null;
  thumbnailUrl: string | null;
  videoUrl: string | null;
  weight: string | null;
  dimensionLength: string | null;
  dimensionWidth: string | null;
  dimensionHeight: string | null;
  categoryId: string | null;
  isActive: boolean;
  category?: {
    id: string;
    name: string;
    slug: string;
  } | null;
} & Timestamps;

export type ProductsListParams = {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  isActive?: boolean;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'name' | 'sku' | 'regularPrice' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
};

// API returns: { data: Product[], total, page, limit, totalPages }
export type ProductsResponse = {
  data: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type CreateProductInput = {
  sku: string;
  name: string;
  description?: string | null;
  regularPrice: string;
  salePrice?: string | null;
  specialPrice?: string | null;
  imageUrl?: string | null;
  thumbnailUrl?: string | null;
  videoUrl?: string | null;
  weight?: string | null;
  dimensionLength?: string | null;
  dimensionWidth?: string | null;
  dimensionHeight?: string | null;
  categoryId?: string | null;
  isActive?: boolean;
};

export type UpdateProductInput = Partial<CreateProductInput>;
