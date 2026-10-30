import { api } from '@/lib/axios';
import { getApiErrorCode } from '@/lib/utils';
import type {
  ImportJobResponse,
  ImportJobsResponse,
  ImportJobsParams,
} from '../types';

export type DbfCsvFormat = 'api' | 'raw';

// Spanish copy for the API's DBF error codes
export const DBF_ERROR_MESSAGES: Record<string, string> = {
  INVALID_FILE_TYPE: 'Solo se permiten archivos DBF',
  FILE_TOO_LARGE: 'El archivo no puede superar los 100MB',
  INVALID_DBF: 'El archivo no es un DBF válido o está dañado',
  UNSUPPORTED_CODE_PAGE: 'El DBF usa una codificación no soportada',
  DBF_MISSING_FIELDS: 'Al DBF le faltan campos requeridos: {campos}',
};

export function getDbfErrorMessage(error: unknown, fallback: string): string {
  const { code, details } = getApiErrorCode(error);
  const message = code ? DBF_ERROR_MESSAGES[code] : undefined;
  if (!message) return fallback;

  if (code === 'DBF_MISSING_FIELDS') {
    const missing = (details as { missing?: string[] } | undefined)?.missing ?? [];
    return message.replace('{campos}', missing.join(', '));
  }
  return message;
}

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

  // Upload a DBF file; the API converts it to CSV and creates an import job
  createFromDbf: async (
    file: File,
    onUploadProgress?: (percent: number) => void
  ): Promise<ImportJobResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    const { data } = await api.post('/api/imports/dbf', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (event) => {
        if (onUploadProgress && event.total) {
          onUploadProgress(Math.round((event.loaded / event.total) * 100));
        }
      },
    });
    return data;
  },

  // Convert a DBF file to CSV without importing it
  convertDbfToCsv: async (
    file: File,
    format: DbfCsvFormat
  ): Promise<{ blob: Blob; rowCount: number }> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/api/imports/dbf/csv', formData, {
      params: { format },
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      responseType: 'blob',
    });
    return {
      blob: response.data,
      rowCount: Number(response.headers['x-row-count'] ?? 0),
    };
  },

  // Download the file an import job imported
  getFile: async (id: string): Promise<Blob> => {
    const { data } = await api.get(`/api/imports/${id}/file`, {
      responseType: 'blob',
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
