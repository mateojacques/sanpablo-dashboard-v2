/**
 * Type declarations for shapefile library (by Mike Bostock)
 * @see https://github.com/mbostock/shapefile
 */

declare module 'shapefile' {
  export interface DbfSource {
    /**
     * Read the next record from the DBF file
     * Returns { done: true } when all records have been read
     * Returns { done: false, value: properties } for each record
     */
    read(): Promise<{ done: true } | { done: false; value: Record<string, unknown> }>;
  }

  export interface OpenDbfOptions {
    /**
     * Character encoding for text fields
     * @default 'windows-1252'
     */
    encoding?: string;
  }

  /**
   * Open a DBF file for reading
   * @param source - File path, ArrayBuffer, Uint8Array, or ReadableStream
   * @param options - Options including encoding
   * @returns Promise resolving to a DbfSource for reading records
   */
  export function openDbf(
    source: string | ArrayBuffer | Uint8Array | ReadableStream,
    options?: OpenDbfOptions
  ): Promise<DbfSource>;
}
