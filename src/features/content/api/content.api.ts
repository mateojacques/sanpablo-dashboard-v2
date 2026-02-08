import { api } from '@/lib/axios';
import type {
  FaqItem,
  TermsResponse,
  UpdateTermsInput,
} from '../types';

import type { StorefrontConfigResponse } from '@/features/storefront-config/types';

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

  // Terms & Conditions (legal)
  getTerms: async (): Promise<TermsResponse> => {
    const { data } = await api.get<StorefrontConfigResponse>('/api/storefront/config');
    return {
      data: {
        termsMarkdown: data.data.legal?.termsMarkdown ?? '',
        lastUpdated: data.data.legal?.lastUpdated,
      },
    };
  },

  updateTerms: async (input: UpdateTermsInput): Promise<TermsResponse> => {
    const { data } = await api.patch<StorefrontConfigResponse>('/api/storefront/config/legal', input);
    return {
      data: {
        termsMarkdown: data.data.legal?.termsMarkdown ?? '',
        lastUpdated: data.data.legal?.lastUpdated,
      },
    };
  },
};
