import { api } from '@/lib/axios';
import type {
  ImportJobResponse,
  ImportJobsResponse,
  ImportJobsParams,
} from '../types';

export const importsApi = {
  // List import jobs with pagination and optional status filter
  getAll: async (params?: ImportJobsParams): Promise<ImportJobsResponse> => {
    const { data } = await api.get('/api/imports', { params });
    return data;
  },

  // Get a single import job by ID
  getById: async (id: string): Promise<ImportJobResponse> => {
    const { data } = await api.get(`/api/imports/${id}`);
    return data;
  },

  // Create a new import job by uploading a CSV file
  create: async (file: File): Promise<ImportJobResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    const { data } = await api.post('/api/imports', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },

  // Cancel an import job
  cancel: async (id: string): Promise<ImportJobResponse> => {
    const { data } = await api.post(`/api/imports/${id}/cancel`);
    return data;
  },

  // Download CSV template
  getTemplate: async (): Promise<Blob> => {
    const { data } = await api.get('/api/imports/template', {
      responseType: 'blob',
    });
    return data;
  },

  // Upload JSON file for bulk image updates
  uploadBulkImages: async (file: File): Promise<ImportJobResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    const { data } = await api.post('/api/imports/bulk-images', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },
};
