import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { carouselsApi } from './carousels.api';
import type {
  CreateCarouselInput,
  UpdateCarouselInput,
  AddProductsToCarouselInput,
  ReorderCarouselProductsInput,
} from '../types';

// Query keys factory
export const carouselKeys = {
  all: ['carousels'] as const,
  lists: () => [...carouselKeys.all, 'list'] as const,
  list: () => [...carouselKeys.lists()] as const,
  details: () => [...carouselKeys.all, 'detail'] as const,
  detail: (id: string) => [...carouselKeys.details(), id] as const,
};

// Get all carousels
export function useCarousels() {
  return useQuery({
    queryKey: carouselKeys.list(),
    queryFn: () => carouselsApi.getAll(),
  });
}

// Get single carousel by ID (with products)
export function useCarousel(id: string) {
  return useQuery({
    queryKey: carouselKeys.detail(id),
    queryFn: () => carouselsApi.getById(id),
    enabled: !!id,
  });
}

// Create carousel mutation
export function useCreateCarousel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateCarouselInput) => carouselsApi.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: carouselKeys.lists() });
    },
  });
}

// Update carousel mutation
export function useUpdateCarousel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCarouselInput }) =>
      carouselsApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: carouselKeys.lists() });
      queryClient.invalidateQueries({ queryKey: carouselKeys.detail(id) });
    },
  });
}

// Delete carousel mutation
export function useDeleteCarousel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => carouselsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: carouselKeys.lists() });
    },
  });
}

// Reorder carousels mutation
export function useReorderCarousels() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (carouselIds: string[]) => carouselsApi.reorder(carouselIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: carouselKeys.lists() });
    },
  });
}

// Add products to carousel mutation
export function useAddProductsToCarousel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      carouselId,
      productIds,
    }: {
      carouselId: string;
      productIds: string[];
    }) => carouselsApi.addProducts(carouselId, { productIds } as AddProductsToCarouselInput),
    onSuccess: (_, { carouselId }) => {
      queryClient.invalidateQueries({ queryKey: carouselKeys.detail(carouselId) });
    },
  });
}

// Remove products from carousel mutation
export function useRemoveProductsFromCarousel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      carouselId,
      productIds,
    }: {
      carouselId: string;
      productIds: string[];
    }) => carouselsApi.removeProducts(carouselId, productIds),
    onSuccess: (_, { carouselId }) => {
      queryClient.invalidateQueries({ queryKey: carouselKeys.detail(carouselId) });
    },
  });
}

// Reorder products within carousel mutation
export function useReorderCarouselProducts() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      carouselId,
      productIds,
    }: {
      carouselId: string;
      productIds: string[];
    }) =>
      carouselsApi.reorderProducts(carouselId, { productIds } as ReorderCarouselProductsInput),
    onSuccess: (_, { carouselId }) => {
      queryClient.invalidateQueries({ queryKey: carouselKeys.detail(carouselId) });
    },
  });
}
