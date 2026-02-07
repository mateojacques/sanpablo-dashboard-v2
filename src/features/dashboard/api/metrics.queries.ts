import { useQuery } from '@tanstack/react-query';
import { metricsApi } from './metrics.api';
import type { MetricsParams } from '../types';

// Query keys factory
export const metricsKeys = {
  all: ['metrics'] as const,
  overview: (params?: MetricsParams) => [...metricsKeys.all, 'overview', params ?? {}] as const,
};

// Get metrics overview
export function useMetricsOverview(params?: MetricsParams) {
  return useQuery({
    queryKey: metricsKeys.overview(params),
    queryFn: () => metricsApi.getOverview(params),
  });
}
