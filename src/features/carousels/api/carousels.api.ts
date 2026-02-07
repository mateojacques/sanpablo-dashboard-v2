import { api } from '@/lib/axios';
import type {
  Carousel,
  CarouselsResponse,
  CarouselResponse,
  CreateCarouselInput,
  UpdateCarouselInput,
  AddProductsToCarouselInput,
  ReorderCarouselProductsInput,
} from '../types';

export const carouselsApi = {
  getAll: async (): Promise<CarouselsResponse> => {
    const { data } = await api.get('/api/carousels');
    return data;
  },

  getById: async (id: string): Promise<CarouselResponse> => {
    const { data } = await api.get(`/api/carousels/${id}`);
    return data;
  },

  getBySlug: async (slug: string): Promise<CarouselResponse> => {
    const { data } = await api.get(`/api/carousels/slug/${slug}`);
    return data;
  },

  getStorefront: async (): Promise<CarouselsResponse> => {
    const { data } = await api.get('/api/carousels/storefront');
    return data;
  },

  create: async (input: CreateCarouselInput): Promise<CarouselResponse> => {
    const { data } = await api.post('/api/carousels', input);
    return data;
  },

  update: async (id: string, input: UpdateCarouselInput): Promise<CarouselResponse> => {
    const { data } = await api.put(`/api/carousels/${id}`, input);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/carousels/${id}`);
  },

  reorder: async (carouselIds: string[]): Promise<{ data: Carousel[] }> => {
    const { data } = await api.put('/api/carousels/reorder', { carouselIds });
    return data;
  },

  // Product management within carousel
  addProducts: async (
    carouselId: string,
    input: AddProductsToCarouselInput
  ): Promise<CarouselResponse> => {
    const { data } = await api.post(`/api/carousels/${carouselId}/products`, input);
    return data;
  },

  removeProducts: async (
    carouselId: string,
    productIds: string[]
  ): Promise<CarouselResponse> => {
    const { data } = await api.delete(`/api/carousels/${carouselId}/products`, {
      data: { productIds },
    });
    return data;
  },

  reorderProducts: async (
    carouselId: string,
    input: ReorderCarouselProductsInput
  ): Promise<CarouselResponse> => {
    const { data } = await api.put(`/api/carousels/${carouselId}/products/reorder`, input);
    return data;
  },
};
