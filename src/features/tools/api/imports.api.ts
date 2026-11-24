import { api } from '@/lib/axios';
import { getApiErrorCode, normalizeBlobErrorBody } from '@/lib/utils';
import type {
  ImportJobResponse,
  ImportJobsResponse,
  ImportJobsParams,
} from '../types';

// Spanish copy for the API's DBF error codes
export const DBF_ERROR_MESSAGES: Record<string, string> = {
  INVALID_FILE_TYPE: 'Solo se permiten archivos DBF',
  FILE_TOO_LARGE: 'El archivo no puede superar los 100MB',
  INVALID_DBF: 'El archivo no es un DBF válido o está dañado',
  UNSUPPORTED_CODE_PAGE: 'El DBF usa una codificación no soportada',
  DBF_MISSING_FIELDS: 'Al DBF le faltan campos requeridos: {campos}',
};

// The 409 CONFIRM_REMOVALS details: products the upload would take out of the store
export type RemovalPreview = {
  count: number;
  total: number;
  sample: { sku: string; name: string }[];
};

export function getRemovalPreview(error: unknown): RemovalPreview | null {
  const { code, details } = getApiErrorCode(error);
  return code === 'CONFIRM_REMOVALS' ? (details as RemovalPreview) : null;
}

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

  // Upload a DBF file; the API converts it to CSV and creates an import job.
  // confirmRemovals accepts a file that hides many products (409 CONFIRM_REMOVALS otherwise)
  createFromDbf: async (
    file: File,
    onUploadProgress?: (percent: number) => void,
    confirmRemovals = false
  ): Promise<ImportJobResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    const { data } = await api.post('/api/imports/dbf', formData, {
      params: confirmRemovals ? { confirmRemovals: 'true' } : undefined,
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

  // Download the file an import job imported
  getFile: async (id: string): Promise<Blob> => {
    const { data } = await api
      .get(`/api/imports/${id}/file`, {
        responseType: 'blob',
      })
      .catch(async (error) => {
        await normalizeBlobErrorBody(error);
        throw error;
      });
    return data;
  },

  // Cancel an import job
  cancel: async (id: string): Promise<ImportJobResponse> => {
    const { data } = await api.post(`/api/imports/${id}/cancel`);
    return data;
  },

  // Upload the image bank JSON export; a job copies the photos into S3
  uploadImageBank: async (file: File): Promise<ImportJobResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    const { data } = await api.post('/api/imports/image-bank', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },
};
