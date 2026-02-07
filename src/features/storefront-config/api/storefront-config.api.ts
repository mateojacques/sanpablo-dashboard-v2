import { api } from '@/lib/axios';
import type {
  StorefrontConfigResponse,
  UpdateBrandingInput,
  UpdateColorsInput,
  UpdateBannersInput,
  UpdateContactInput,
  UpdateSeoInput,
  UpdateFaqInput,
  StorefrontConfig,
} from '../types';

/**
 * Removes null and undefined values from an object (shallow).
 * The API does not accept null values in PATCH requests.
 */
function removeNullValues<T extends Record<string, unknown>>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, value]) => value !== null && value !== undefined)
  ) as Partial<T>;
}

/**
 * Recursively removes null and undefined values from an object.
 * Used for nested objects like socialLinks in contact.
 */
function removeNullValuesDeep<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(removeNullValuesDeep) as T;
  }
  
  if (typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj as Record<string, unknown>)
        .filter(([, value]) => value !== null && value !== undefined)
        .map(([key, value]) => [key, removeNullValuesDeep(value)])
    ) as T;
  }
  
  return obj;
}

export const storefrontConfigApi = {
  // Get all configuration (public endpoint)
  getConfig: async (): Promise<StorefrontConfigResponse> => {
    const { data } = await api.get('/api/storefront/config');
    return data;
  },

  // Update full configuration (admin)
  updateConfig: async (input: Partial<StorefrontConfig>): Promise<StorefrontConfigResponse> => {
    const cleanedInput = removeNullValuesDeep(input);
    const { data } = await api.put('/api/storefront/config', cleanedInput);
    return data;
  },

  // Update branding section (admin)
  updateBranding: async (input: UpdateBrandingInput): Promise<StorefrontConfigResponse> => {
    const cleanedInput = removeNullValues(input);
    const { data } = await api.patch('/api/storefront/config/branding', cleanedInput);
    return data;
  },

  // Update colors section (admin)
  updateColors: async (input: UpdateColorsInput): Promise<StorefrontConfigResponse> => {
    const cleanedInput = removeNullValues(input);
    const { data } = await api.patch('/api/storefront/config/colors', cleanedInput);
    return data;
  },

  // Update banners section (admin)
  updateBanners: async (input: UpdateBannersInput): Promise<StorefrontConfigResponse> => {
    const cleanedInput = removeNullValuesDeep(input);
    const { data } = await api.patch('/api/storefront/config/banners', cleanedInput);
    return data;
  },

  // Update FAQ section (admin)
  updateFaq: async (input: UpdateFaqInput): Promise<StorefrontConfigResponse> => {
    const cleanedInput = removeNullValuesDeep(input);
    const { data } = await api.patch('/api/storefront/config/faq', cleanedInput);
    return data;
  },

  // Update contact section (admin)
  updateContact: async (input: UpdateContactInput): Promise<StorefrontConfigResponse> => {
    const cleanedInput = removeNullValuesDeep(input);
    const { data } = await api.patch('/api/storefront/config/contact', cleanedInput);
    return data;
  },

  // Update SEO section (admin)
  updateSeo: async (input: UpdateSeoInput): Promise<StorefrontConfigResponse> => {
    const cleanedInput = removeNullValues(input);
    const { data } = await api.patch('/api/storefront/config/seo', cleanedInput);
    return data;
  },
};
