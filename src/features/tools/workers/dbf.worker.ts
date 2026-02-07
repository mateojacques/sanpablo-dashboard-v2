/**
 * Web Worker for DBF parsing and CSV conversion
 * Runs in a separate thread to avoid blocking the main UI
 */

import parseDbf from 'parsedbf';
import type { DbfRecord, DbfWorkerMessage, DbfWorkerResponse } from './dbf.types';

/**
 * Convert a single record to a CSV row
 */
function formatCsvRow(record: DbfRecord, fields: string[]): string {
  return fields
    .map((field) => {
      const value = record[field];
      if (value === null || value === undefined) return '';

      let str = String(value);

      // Escape quotes and wrap in quotes if contains special characters
      if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
        str = `"${str.replace(/"/g, '""')}"`;
      }

      return str;
    })
    .join(',');
}

/**
 * Convert records to CSV using streaming approach with chunks
 * This avoids creating one giant string in memory
 */
function convertToCsvBlob(
  records: DbfRecord[],
  fields: string[],
  onProgress: (percent: number) => void
): Blob {
  const BATCH_SIZE = 2000;
  const chunks: string[] = [];

  // Header row
  chunks.push(fields.join(',') + '\n');

  // Process in batches
  for (let i = 0; i < records.length; i += BATCH_SIZE) {
    const end = Math.min(i + BATCH_SIZE, records.length);
    const batch = records.slice(i, end);

    // Convert batch to CSV rows
    const batchCsv = batch.map((record) => formatCsvRow(record, fields)).join('\n');
    chunks.push(batchCsv + '\n');

    // Report progress
    const percent = Math.round((end / records.length) * 100);
    onProgress(percent);
  }

  // Create Blob from chunks (more memory efficient than concatenating strings)
  return new Blob(chunks, { type: 'text/csv;charset=utf-8;' });
}

/**
 * Main worker message handler
 */
self.onmessage = (event: MessageEvent<DbfWorkerMessage>) => {
  const { type, buffer } = event.data;

  if (type !== 'parse') {
    self.postMessage({
      type: 'error',
      message: 'Unknown message type',
    } as DbfWorkerResponse);
    return;
  }

  try {
    // Phase 1: Parse DBF
    self.postMessage({
      type: 'progress',
      phase: 'parsing',
      percent: 0,
    } as DbfWorkerResponse);

    // parseDbf expects a DataView, not an ArrayBuffer
    const dataView = new DataView(buffer);
    const records = parseDbf(dataView) as DbfRecord[];

    if (!records || records.length === 0) {
      throw new Error('El archivo DBF no contiene registros');
    }

    // Get field names from first record
    const fields = Object.keys(records[0]);

    self.postMessage({
      type: 'progress',
      phase: 'parsing',
      percent: 100,
    } as DbfWorkerResponse);

    // Send preview immediately so user sees data quickly
    self.postMessage({
      type: 'preview',
      fields,
      preview: records.slice(0, 10),
      recordCount: records.length,
    } as DbfWorkerResponse);

    // Phase 2: Convert to CSV
    self.postMessage({
      type: 'progress',
      phase: 'converting',
      percent: 0,
    } as DbfWorkerResponse);

    const csvBlob = convertToCsvBlob(records, fields, (percent) => {
      self.postMessage({
        type: 'progress',
        phase: 'converting',
        percent,
      } as DbfWorkerResponse);
    });

    // Send final result
    self.postMessage({
      type: 'complete',
      csvBlob,
      recordCount: records.length,
      fields,
    } as DbfWorkerResponse);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error desconocido al procesar el archivo';
    self.postMessage({
      type: 'error',
      message,
    } as DbfWorkerResponse);
  }
};
