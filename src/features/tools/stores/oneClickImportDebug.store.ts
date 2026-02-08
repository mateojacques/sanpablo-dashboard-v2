type GeneratedCsvDebug = {
  blob: Blob;
  filename: string;
  recordCount: number;
  createdAt: number;
};

// Ephemeral in-memory store for passing a generated CSV between pages.
// NOTE: This does NOT persist across reloads.
const debugByJobId = new Map<string, GeneratedCsvDebug>();

export function setOneClickDebugCsv(jobId: string, csv: Omit<GeneratedCsvDebug, 'createdAt'>): void {
  debugByJobId.set(jobId, { ...csv, createdAt: Date.now() });
}

export function getOneClickDebugCsv(jobId: string): GeneratedCsvDebug | undefined {
  return debugByJobId.get(jobId);
}

export function clearOneClickDebugCsv(jobId: string): void {
  debugByJobId.delete(jobId);
}
