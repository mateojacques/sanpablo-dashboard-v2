// Import Job status
export type ImportJobStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

// Import Job entity from API
export type ImportJob = {
  id: string;
  userId: string;
  filename: string;
  fileKey: string;
  fileSize: number;
  status: ImportJobStatus;
  totalRows: number;
  processedRows: number;
  successRows: number;
  errorRows: number;
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
