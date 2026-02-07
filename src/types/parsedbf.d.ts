declare module 'parsedbf' {
  /**
   * Parse a DBF (dBase) file and return an array of records.
   * @param data - DataView containing the DBF file data
   * @returns Array of record objects with field names as keys
   */
  function parseDbf(data: DataView): Record<string, unknown>[];
  export default parseDbf;
}
