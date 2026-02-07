import { api } from '@/lib/axios';
import type {
  FaqItem,
  TermsResponse,
  UpdateTermsInput,
} from '../types';

// Response type for FAQ from storefront config
type StorefrontConfigResponse = {
  data: {
    faq: FaqItem[];
    [key: string]: unknown;
  };
};

export const contentApi = {
  // FAQ endpoints - FAQ is managed as part of storefront config
  getFaq: async (): Promise<{ data: FaqItem[] }> => {
    const { data } = await api.get<StorefrontConfigResponse>('/api/storefront/config');
    return { data: data.data.faq ?? [] };
  },

  // Update entire FAQ list (replaces all FAQ items)
  updateFaq: async (faq: Omit<FaqItem, 'id'>[]): Promise<{ data: FaqItem[] }> => {
    const { data } = await api.patch<StorefrontConfigResponse>('/api/storefront/config/faq', { faq });
    return { data: data.data.faq ?? [] };
  },

  // Terms & Conditions endpoints
  // Note: Terms may not be a separate endpoint in the API - check if it exists
  // For now, keeping a placeholder that can be adjusted
  getTerms: async (): Promise<TermsResponse> => {
    // Terms might be stored as a separate field or might not exist
    // This is a placeholder - adjust based on actual API
    const { data } = await api.get('/api/storefront/terms');
    return data;
  },

  updateTerms: async (input: UpdateTermsInput): Promise<TermsResponse> => {
    const { data } = await api.put('/api/storefront/terms', input);
    return data;
  },
};
