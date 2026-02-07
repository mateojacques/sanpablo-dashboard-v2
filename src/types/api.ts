// Generic API response wrapper
export type ApiResponse<T> = {
  data: T;
};

// Paginated response
export type PaginatedResponse<T> = {
  data: {
    items: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

// API error response
export type ApiError = {
  message: string;
  statusCode: number;
  error?: string;
};

// Query params for paginated lists
export type PaginationParams = {
  page?: number;
  limit?: number;
};

// Sort params
export type SortParams = {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
};
