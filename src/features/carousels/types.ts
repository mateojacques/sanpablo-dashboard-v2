import type { Timestamps } from '@/types/common';
import type { Product } from '@/features/products/types';

export type CarouselType = 'manual' | 'category';

export type CarouselProduct = {
  id: string;
  carouselId: string;
  productId: string;
  sortOrder: number;
  product: Product;
} & Timestamps;

export type Carousel = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  type: CarouselType;
  categoryId: string | null;
  isActive: boolean;
  sortOrder: number;
  maxProducts: number;
  products?: CarouselProduct[];
  category?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  _count?: {
    products: number;
  };
} & Timestamps;

export type CarouselsResponse = {
  data: Carousel[];
};

export type CarouselResponse = {
  data: Carousel;
};

export type CreateCarouselInput = {
  name: string;
  slug?: string;
  description?: string | null;
  type?: CarouselType;
  categoryId?: string | null;
  isActive?: boolean;
  maxProducts?: number;
};

export type UpdateCarouselInput = Partial<CreateCarouselInput>;

export type AddProductsToCarouselInput = {
  productIds: string[];
};

export type ReorderCarouselProductsInput = {
  productIds: string[];
};
