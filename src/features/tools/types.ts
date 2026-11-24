import type { EvaluationSummary } from '@/features/catalog/types';

// Import Job status
export type ImportJobStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

export type ImportJobType = 'csv' | 'bulk_images' | 'image_bank';

// What a CSV or image bank job changed, and the catalogue evaluation after it
export type ImportSummary = {
  created: number;
  updated: number;
  priceChanged: number;
  // Image bank jobs only
  images?: { stored: number; failed: number };
  // Full DBF snapshots only: products this upload marked as missing from the table
  missingFromSource?: number;
  evaluation: EvaluationSummary | null;
};

// Import Job entity from API
export type ImportJob = {
  id: string;
  userId: string;
  type: ImportJobType;
  filename: string;
  fileKey: string;
  fileSize: number;
  status: ImportJobStatus;
  totalRows: number;
  processedRows: number;
  successRows: number;
  errorRows: number;
  summary: ImportSummary | null;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

// API Response types
export type ImportJobResponse = {
  data: ImportJob;
};

export type ImportJobsResponse = {
  data: {
    items: ImportJob[];
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

// Query params for listing import jobs
export type ImportJobsParams = {
  page?: number;
  limit?: number;
  status?: ImportJobStatus;
};
