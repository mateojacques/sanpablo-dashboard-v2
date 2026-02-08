/**
 * Types for DBF Worker communication
 */

export type DbfRecord = Record<string, unknown>;

// Messages sent TO the worker
export type DbfWorkerMessage =
  | {
      type: 'parse';
      buffer: ArrayBuffer;
    }
  | {
      type: 'parse-api-format';
      buffer: ArrayBuffer;
    };

// Messages sent FROM the worker
export type DbfWorkerResponse =
  | {
      type: 'progress';
      phase: 'parsing' | 'converting' | 'mapping';
      percent: number;
    }
  | {
      type: 'preview';
      fields: string[];
      preview: DbfRecord[];
      recordCount: number;
    }
  | {
      type: 'complete';
      csvBlob: Blob;
      recordCount: number;
      fields: string[];
    }
  | {
      type: 'api-format-complete';
      csvBlob: Blob;
      recordCount: number;
      fields: string[];
    }
  | {
      type: 'error';
      message: string;
    };

// Parsed data state for the component
export type ParsedDbfData = {
  filename: string;
  fields: string[];
  preview: DbfRecord[];
  recordCount: number;
  csvBlob: Blob | null;
};

// Processing state
export type ProcessingState = {
  isProcessing: boolean;
  phase: 'idle' | 'parsing' | 'converting' | 'mapping' | 'uploading' | 'done';
  percent: number;
};
