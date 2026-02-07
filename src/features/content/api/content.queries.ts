import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { contentApi } from './content.api';
import type { FaqItem, UpdateTermsInput } from '../types';

// Query keys
export const contentKeys = {
  all: ['content'] as const,
  faq: () => [...contentKeys.all, 'faq'] as const,
  terms: () => [...contentKeys.all, 'terms'] as const,
};

// FAQ queries
export function useFaq() {
  return useQuery({
    queryKey: contentKeys.faq(),
    queryFn: () => contentApi.getFaq(),
  });
}

// Update entire FAQ list mutation
export function useUpdateFaq() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (faq: Omit<FaqItem, 'id'>[]) => contentApi.updateFaq(faq),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contentKeys.faq() });
    },
  });
}

// Terms queries
export function useTerms() {
  return useQuery({
    queryKey: contentKeys.terms(),
    queryFn: () => contentApi.getTerms(),
  });
}

export function useUpdateTerms() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateTermsInput) => contentApi.updateTerms(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contentKeys.terms() });
    },
  });
}
