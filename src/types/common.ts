// Common utility types

export type ID = string;

export type Timestamps = {
  createdAt: string;
  updatedAt: string;
};

export type SoftDelete = {
  deletedAt: string | null;
};

// For select/dropdown options
export type SelectOption = {
  value: string;
  label: string;
};

// For table column definitions
export type SortDirection = 'asc' | 'desc' | null;

// Status badge variants
export type StatusVariant = 'default' | 'success' | 'warning' | 'destructive' | 'secondary';

// File upload
export type UploadedFile = {
  url: string;
  key: string;
  filename: string;
  size: number;
  mimeType: string;
};
