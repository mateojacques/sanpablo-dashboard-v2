import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { importsApi } from './imports.api';
import type { ImportJobsParams, ImportJobResponse } from '../types';

// Query keys
export const importKeys = {
  all: ['imports'] as const,
  lists: () => [...importKeys.all, 'list'] as const,
  list: (params: ImportJobsParams) => [...importKeys.lists(), params] as const,
  details: () => [...importKeys.all, 'detail'] as const,
  detail: (id: string) => [...importKeys.details(), id] as const,
};

// List import jobs with optional filters
export function useImportJobs(params?: ImportJobsParams) {
  return useQuery({
    queryKey: importKeys.list(params ?? {}),
    queryFn: () => importsApi.getAll(params),
  });
}

// Get a single import job by ID (with polling for active jobs)
export function useImportJob(id: string, options?: { refetchInterval?: number }) {
  return useQuery({
    queryKey: importKeys.detail(id),
    queryFn: () => importsApi.getById(id),
    enabled: !!id,
    refetchInterval: (query) => {
      const data = query.state.data as ImportJobResponse | undefined;
      const status = data?.data?.status;
      // Only poll while job is active
      if (status === 'pending' || status === 'processing') {
        return options?.refetchInterval ?? 2000;
      }
      return false;
    },
  });
}

// Create an import job from a DBF file
export function useCreateDbfImportJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      file,
      onUploadProgress,
      confirmRemovals,
    }: {
      file: File;
      onUploadProgress?: (percent: number) => void;
      confirmRemovals?: boolean;
    }) => importsApi.createFromDbf(file, onUploadProgress, confirmRemovals),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: importKeys.lists() });
    },
  });
}

// Cancel an import job
export function useCancelImportJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => importsApi.cancel(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: importKeys.lists() });
      queryClient.invalidateQueries({ queryKey: importKeys.detail(id) });
    },
  });
}

// Upload the image bank JSON export
export function useUploadImageBank() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => importsApi.uploadImageBank(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: importKeys.lists() });
    },
  });
}
