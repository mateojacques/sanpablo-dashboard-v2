import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { storefrontConfigApi } from './storefront-config.api';
import type {
  UpdateBrandingInput,
  UpdateColorsInput,
  UpdateBannersInput,
  UpdateContactInput,
  UpdateSeoInput,
} from '../types';

// Query keys
export const storefrontConfigKeys = {
  all: ['storefront-config'] as const,
  config: () => [...storefrontConfigKeys.all, 'config'] as const,
};

// Get storefront configuration
export function useStorefrontConfig() {
  return useQuery({
    queryKey: storefrontConfigKeys.config(),
    queryFn: () => storefrontConfigApi.getConfig(),
  });
}

// Update branding mutation
export function useUpdateBranding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateBrandingInput) => storefrontConfigApi.updateBranding(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: storefrontConfigKeys.config() });
    },
  });
}

// Update colors mutation
export function useUpdateColors() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateColorsInput) => storefrontConfigApi.updateColors(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: storefrontConfigKeys.config() });
    },
  });
}

// Update banners mutation
export function useUpdateBanners() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateBannersInput) => storefrontConfigApi.updateBanners(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: storefrontConfigKeys.config() });
    },
  });
}

// Update contact mutation
export function useUpdateContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateContactInput) => storefrontConfigApi.updateContact(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: storefrontConfigKeys.config() });
    },
  });
}

// Update SEO mutation
export function useUpdateSeo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateSeoInput) => storefrontConfigApi.updateSeo(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: storefrontConfigKeys.config() });
    },
  });
}

// Update legal mutation
export function useUpdateLegal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { termsMarkdown: string }) => storefrontConfigApi.updateLegal(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: storefrontConfigKeys.config() });
    },
  });
}
