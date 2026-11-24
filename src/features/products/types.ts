import type { Timestamps } from '@/types/common';
import type { PublicationIssue, PublicationStatus } from '@/features/catalog/types';

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
  // From the customer's stock table
  supplierName: string | null;
  supplierCode: string | null;
  barcode: string | null;
  priceUpdatedAt: string | null;
  // Units per pack: from the stock table (STUNICOMP), the admin's override
  // (null follows the table, 1 = no pack) and the result (null = sold only by unit)
  sourcePackSize: number | null;
  packSizeOverride: number | null;
  packSize: number | null;
  // Set by the catalogue evaluation
  publicationStatus: PublicationStatus;
  publicationIssues: PublicationIssue[];
  publicationCheckedAt: string | null;
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
  publicationStatus?: PublicationStatus;
  issue?: PublicationIssue;
  // Products whose effective pack size is above 1
  hasPack?: boolean;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'name' | 'sku' | 'regularPrice' | 'price' | 'createdAt' | 'updatedAt' | 'random';
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
  // Edit only; null follows the stock table
  packSizeOverride?: number | null;
};

export type UpdateProductInput = Partial<CreateProductInput>;
