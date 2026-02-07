import { api } from '@/lib/axios';
import type { MetricsOverviewResponse, MetricsParams } from '../types';

export const metricsApi = {
  getOverview: async (params?: MetricsParams): Promise<MetricsOverviewResponse> => {
    const { data } = await api.get('/api/metrics/overview', { params });
    return data;
  },
};
