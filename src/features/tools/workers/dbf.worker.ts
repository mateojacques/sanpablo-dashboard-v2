/**
 * Web Worker for DBF parsing and CSV conversion
 * Runs in a separate thread to avoid blocking the main UI
 * 
 * Uses shapefile library (by Mike Bostock) for reliable DBF parsing
 * with proper encoding support (windows-1252 for Latin characters)
 */

import { openDbf } from 'shapefile';
import type { DbfRecord, DbfWorkerMessage, DbfWorkerResponse } from './dbf.types';

// -------- API Format Column Headers (matching Python script) --------
const API_HEADERS = [
  'sku',
  'name',
  'description',
  'regular_price',
  'sale_price',
  'special_price',
  'category_slug',
  'image_url',
  'video_url',
  'weight',
  'dimension_length',
  'dimension_width',
  'dimension_height',
  'is_active',
];

// -------- Utility Functions for API Format Mapping --------

function isBlankString(v: unknown): boolean {
  return typeof v === 'string' && v.trim() === '';
}

function normalizeValue(v: unknown): string {
  if (v === null || v === undefined) return '';
  if (typeof v === 'string') return v.trim();
  return String(v);
}

function normalizeKey(k: string): string {
  // Normalize to lowercase and remove spaces/special chars for comparison
  return k.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
}

type KeyMap = Record<string, string>;

function buildKeyMap(sampleRecord: DbfRecord): KeyMap {
  const map: KeyMap = {};
  for (const key of Object.keys(sampleRecord)) {
    // Map both the normalized version and the original lowercase
    map[normalizeKey(key)] = key;
    map[key.toLowerCase()] = key;
    map[key] = key;  // Also keep exact match
  }
  return map;
}

function getValueByField(rec: DbfRecord, keyMap: KeyMap, field: string): unknown {
  // Try direct first (exact match)
  if (field in rec) return rec[field];

  // Try lowercase direct match
  const lowerField = field.toLowerCase();
  if (lowerField in rec) return rec[lowerField];

  // Try via keyMap (normalized lookup)
  const normalizedField = normalizeKey(field);
  const actualKey = keyMap[normalizedField] || keyMap[lowerField] || keyMap[field];
  if (actualKey && actualKey in rec) return rec[actualKey];
  
  return undefined;
}

function pickStr(rec: DbfRecord, keyMap: KeyMap, fields: string[]): string {
  for (const field of fields) {
    const v = getValueByField(rec, keyMap, field);
    if (v === null || v === undefined || isBlankString(v)) continue;
    return normalizeValue(v);
  }
  return '';
}

function parseNumberish(v: unknown): number | null {
  if (v === null || v === undefined) return null;
  if (typeof v === 'number') return Number.isFinite(v) ? v : null;

  let s = String(v).trim();
  if (!s) return null;

  // Handle decimal comma (e.g. "123,45")
  if (s.includes(',') && !s.includes('.')) {
    s = s.replace(',', '.');
  }

  const num = parseFloat(s);
  return Number.isNaN(num) ? null : num;
}

function pickNum(rec: DbfRecord, keyMap: KeyMap, fields: string[]): number | null {
  for (const field of fields) {
    const v = getValueByField(rec, keyMap, field);
    const num = parseNumberish(v);
    if (num !== null) return num;
  }
  return null;
}

function formatPrice(v: number | null): string {
  if (v === null) return '';
  return v.toFixed(2);
}

function slugify(v: string): string {
  const s = (v || '').trim().toLowerCase();
  if (!s) return '';
  
  const out: string[] = [];
  let prevDash = false;
  
  for (const ch of s) {
    const isAlnum = (ch >= 'a' && ch <= 'z') || (ch >= '0' && ch <= '9');
    if (isAlnum) {
      out.push(ch);
      prevDash = false;
    } else {
      if (!prevDash) {
        out.push('-');
        prevDash = true;
      }
    }
  }
  
  let slug = out.join('').replace(/^-+|-+$/g, '');
  while (slug.includes('--')) {
    slug = slug.replace(/--/g, '-');
  }
  return slug;
}

function parseBoolish(v: unknown): boolean | null {
  if (v === null || v === undefined) return null;
  if (typeof v === 'boolean') return v;
  if (typeof v === 'number') return Boolean(v);
  if (typeof v === 'string') {
    const s = v.trim().toLowerCase();
    if (s === '' || s === 'null' || s === 'none') return null;
    if (['1', 'true', 't', 'y', 'yes', 'si', 's'].includes(s)) return true;
    if (['0', 'false', 'f', 'n', 'no'].includes(s)) return false;
  }
  return null;
}

/**
 * Map a single DBF record to API format row
 * Based on the Python script's map_record_to_api_row function
 * 
 * Field name variants to handle different DBF formats:
 * - Some DBFs use STCODIGO, STDESCRIP, etc. (Visual FoxPro style)
 * - parsedbf might return lowercase or different names
 * - We try multiple variants for each expected field
 */
function mapRecordToApiRow(rec: DbfRecord, keyMap: KeyMap): string[] {
  // SKU: product code - try various field name patterns
  const sku = pickStr(rec, keyMap, [
    'STCODIGO',    // Standard Visual FoxPro
    'stcodigo',    // Lowercase variant
    'CODIGO',      // Short form
    'codigo',
    'COD',
    'cod',
    'SKU',
    'sku',
    'PRODUCT_CODE',
    'product_code',
  ]);

  // Name: product description/name
  const name = pickStr(rec, keyMap, [
    'STDESCRIP',   // Standard Visual FoxPro
    'stdescrip',
    'DESCRIP',
    'descrip',
    'DESCRIPCION',
    'descripcion',
    'NOMBRE',
    'nombre',
    'NAME',
    'name',
    'PRODUCT_NAME',
  ]);

  // Description: detailed description (fallback to name)
  const description = pickStr(rec, keyMap, [
    'STDETALLE',   // Standard Visual FoxPro (detail)
    'stdetalle',
    'DETALLE',
    'detalle',
    'STDESCRIP',   // Fallback to main description
    'stdescrip',
    'DESCRIPCION_LARGA',
    'DESCRIPTION',
  ]) || name;  // Use name as final fallback

  // Regular price (main selling price)
  const regular = pickNum(rec, keyMap, [
    'STPRECUNI2',  // Standard Visual FoxPro (unit price 2 = selling price)
    'stprecuni2',
    'PRECUNI2',
    'precuni2',
    'PRECIO',
    'precio',
    'PRECIO_VENTA',
    'precio_venta',
    'PRICE',
    'price',
    'REGULAR_PRICE',
    'STPRECIO',
    'stprecio',
    'PRECIOVTA',
    'preciovta',
  ]);

  // Sale price (promotional price) - usually not in DBF
  const sale: number | null = null;

  // Special price (cost or alternative price)
  const special = pickNum(rec, keyMap, [
    'STPRECUNI1',  // Standard Visual FoxPro (unit price 1 = cost or special)
    'stprecuni1',
    'PRECUNI1',
    'precuni1',
    'COSTO',
    'costo',
    'COST',
    'PRECIO_ESPECIAL',
  ]);

  let salePrice = '';
  if (sale !== null && regular !== null && sale > 0 && sale < regular) {
    salePrice = formatPrice(sale);
  }

  let specialPrice = '';
  if (special !== null && regular !== null && special > 0 && special < regular) {
    specialPrice = formatPrice(special);
  }

  // Category: family name or code
  const famName = pickStr(rec, keyMap, [
    'STNOMFAM',    // Standard Visual FoxPro (family name)
    'stnomfam',
    'NOMFAM',
    'nomfam',
    'FAMILIA_NOMBRE',
    'CATEGORY_NAME',
    'CATEGORIA',
    'categoria',
  ]);
  const famCode = pickStr(rec, keyMap, [
    'STFAMILIA',   // Standard Visual FoxPro (family code)
    'stfamilia',
    'FAMILIA',
    'familia',
    'CATEGORY',
    'category',
    'CAT',
    'cat',
  ]);
  const categorySlug = slugify(famName) || slugify(famCode);

  // No image/video URLs in DBF
  const imageUrl = '';
  const videoUrl = '';

  // No weight/dimensions in DBF
  const weight = '';
  const dimensionLength = '';
  const dimensionWidth = '';
  const dimensionHeight = '';

  // Deletion flag: STBORRAR is usually a deletion flag. If "true", product is not active.
  const borrar = parseBoolish(getValueByField(rec, keyMap, 'STBORRAR')) 
    ?? parseBoolish(getValueByField(rec, keyMap, 'stborrar'))
    ?? parseBoolish(getValueByField(rec, keyMap, 'BORRAR'))
    ?? parseBoolish(getValueByField(rec, keyMap, 'borrar'))
    ?? parseBoolish(getValueByField(rec, keyMap, 'DELETED'))
    ?? parseBoolish(getValueByField(rec, keyMap, 'deleted'));
  const isActive = borrar === null ? true : !borrar;

  return [
    sku,
    name,
    description,
    formatPrice(regular),
    salePrice,
    specialPrice,
    categorySlug,
    imageUrl,
    videoUrl,
    weight,
    dimensionLength,
    dimensionWidth,
    dimensionHeight,
    isActive ? 'true' : 'false',
  ];
}

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
 * Convert records to API format CSV with mapped columns
 */
function convertToApiFormatCsvBlob(
  records: DbfRecord[],
  onProgress: (percent: number) => void
): Blob {
  const BATCH_SIZE = 2000;
  const chunks: string[] = [];
  const keyMap = buildKeyMap(records[0] ?? {});

  // Header row with API column names
  chunks.push(API_HEADERS.join(',') + '\n');

  // Process in batches
  for (let i = 0; i < records.length; i += BATCH_SIZE) {
    const end = Math.min(i + BATCH_SIZE, records.length);
    const batch = records.slice(i, end);

    // Convert batch to API format CSV rows
    const batchCsv = batch
      .map((record) => {
        const row = mapRecordToApiRow(record, keyMap);
        // Escape and format each value
        return row
          .map((value) => {
            if (value.includes(',') || value.includes('"') || value.includes('\n') || value.includes('\r')) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
          })
          .join(',');
      })
      .join('\n');
    chunks.push(batchCsv + '\n');

    // Report progress
    const percent = Math.round((end / records.length) * 100);
    onProgress(percent);
  }

  // IMPORTANT: Do NOT add BOM for API uploads.
  // Some CSV parsers treat the first header as "\uFEFFsku" and then fail validation.
  return new Blob(chunks, { type: 'text/csv;charset=utf-8;' });
}

/**
 * Main worker message handler
 */
self.onmessage = (event: MessageEvent<DbfWorkerMessage>) => {
  const { type, buffer } = event.data;

  if (type === 'parse') {
    handleParseOriginal(buffer).catch((err) => {
      console.error('[DBF Worker] Unhandled error in parse:', err);
      self.postMessage({
        type: 'error',
        message: err instanceof Error ? err.message : 'Error desconocido',
      } as DbfWorkerResponse);
    });
  } else if (type === 'parse-api-format') {
    handleParseApiFormat(buffer).catch((err) => {
      console.error('[DBF Worker] Unhandled error in parse-api-format:', err);
      self.postMessage({
        type: 'error',
        message: err instanceof Error ? err.message : 'Error desconocido',
      } as DbfWorkerResponse);
    });
  } else {
    self.postMessage({
      type: 'error',
      message: 'Unknown message type',
    } as DbfWorkerResponse);
  }
};

/**
 * Parse DBF file using shapefile library
 * Returns array of records with proper field values
 */
async function parseDbfFile(buffer: ArrayBuffer): Promise<DbfRecord[]> {
  // Open DBF with windows-1252 encoding for Latin characters (Spanish)
  const source = await openDbf(buffer, { encoding: 'windows-1252' });
  
  const records: DbfRecord[] = [];
  let result = await source.read();
  
  while (!result.done) {
    records.push(result.value as DbfRecord);
    result = await source.read();
    
    // Report progress every 1000 records during parsing
    if (records.length % 1000 === 0) {
      self.postMessage({
        type: 'progress',
        phase: 'parsing',
        percent: -1, // Indeterminate since we don't know total count yet
        message: `Leyendo registro ${records.length}...`,
      } as DbfWorkerResponse);
    }
  }
  
  return records;
}

/**
 * Handle original parse (all DBF columns)
 */
async function handleParseOriginal(buffer: ArrayBuffer): Promise<void> {
  try {
    // Phase 1: Parse DBF
    self.postMessage({
      type: 'progress',
      phase: 'parsing',
      percent: 0,
    } as DbfWorkerResponse);

    const records = await parseDbfFile(buffer);

    if (!records || records.length === 0) {
      throw new Error('El archivo DBF no contiene registros');
    }

    const fields = Object.keys(records[0]);
    
    // Debug: Log field names to console
    console.log('[DBF Worker] Parsed fields:', fields);
    console.log('[DBF Worker] Sample record:', JSON.stringify(records[0], null, 2));

    self.postMessage({
      type: 'progress',
      phase: 'parsing',
      percent: 100,
    } as DbfWorkerResponse);

    // Send preview
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
    console.error('[DBF Worker] Error in handleParseOriginal:', err);
    const message = err instanceof Error ? err.message : 'Error desconocido al procesar el archivo';
    self.postMessage({
      type: 'error',
      message,
    } as DbfWorkerResponse);
  }
}

/**
 * Handle API format parse (mapped columns for import)
 */
async function handleParseApiFormat(buffer: ArrayBuffer): Promise<void> {
  try {
    // Phase 1: Parse DBF
    self.postMessage({
      type: 'progress',
      phase: 'parsing',
      percent: 0,
    } as DbfWorkerResponse);

    const records = await parseDbfFile(buffer);

    if (!records || records.length === 0) {
      throw new Error('El archivo DBF no contiene registros');
    }

    // Debug: log the actual field names from the DBF
    const sampleRecord = records[0];
    const actualFieldNames = Object.keys(sampleRecord);
    console.log('[DBF Worker] Actual field names in DBF:', actualFieldNames);
    console.log('[DBF Worker] Sample record (first):', JSON.stringify(sampleRecord, null, 2));
    
    // Also log a few more records to verify consistency
    if (records.length > 3) {
      console.log('[DBF Worker] Sample record (4th):', JSON.stringify(records[3], null, 2));
    }
    
    // Log what we're mapping to help debug
    const keyMap = buildKeyMap(sampleRecord);
    console.log('[DBF Worker] KeyMap keys:', Object.keys(keyMap));
    
    // Test field lookup for common fields
    const testFields = ['STCODIGO', 'stcodigo', 'CODIGO', 'codigo', 'STDESCRIP', 'STPRECUNI2'];
    for (const tf of testFields) {
      const val = getValueByField(sampleRecord, keyMap, tf);
      if (val !== undefined) {
        console.log(`[DBF Worker] Field "${tf}" found with value:`, val);
      }
    }

    self.postMessage({
      type: 'progress',
      phase: 'parsing',
      percent: 100,
    } as DbfWorkerResponse);

    // Phase 2: Map and convert to API format CSV
    self.postMessage({
      type: 'progress',
      phase: 'mapping',
      percent: 0,
    } as DbfWorkerResponse);

    const csvBlob = convertToApiFormatCsvBlob(records, (percent) => {
      self.postMessage({
        type: 'progress',
        phase: 'mapping',
        percent,
      } as DbfWorkerResponse);
    });

    // Send final result
    self.postMessage({
      type: 'api-format-complete',
      csvBlob,
      recordCount: records.length,
      fields: API_HEADERS,
    } as DbfWorkerResponse);
  } catch (err) {
    console.error('[DBF Worker] Error in handleParseApiFormat:', err);
    const message = err instanceof Error ? err.message : 'Error desconocido al procesar el archivo';
    self.postMessage({
      type: 'error',
      message,
    } as DbfWorkerResponse);
  }
}
