# DBF Processing in the API: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `sanpablo-api-v2` the only place that reads the client's DBF and maps it to products. The dashboard stops parsing DBF files and only uploads them.

**Architecture:** The API gets a TypeScript DBF reader and a stock-table mapper that replace `dbf-to-csv-parser.py`. `POST /api/imports/dbf` converts the upload to the import CSV inside the request, then reuses the existing CSV job path (S3, SQS, worker), so the worker doesn't change. `POST /api/imports/dbf/csv` returns the converted CSV (import format or all columns) for the converter tool. `GET /api/imports/:id/file` serves the file a job imported, which replaces the dashboard's in-memory debug CSV. On the dashboard side, the Web Worker, the `shapefile` dependency and the copy of the Python script are deleted.

**Tech Stack:**
- **API:** Node 20, Express 4, multer 2, Zod 3, Vitest 2, ESM with `.js` relative imports.
- **Dashboard:** React 18, TanStack Query, axios, papaparse (already installed), shadcn/ui.

**Spec:** There is no separate spec document. The decisions come from the conversation of 2026-10-30 and are listed under "Design decisions" below. The reference for the table is `sanpablo-api-v2/src/scripts/import-products/STOCK_DBF.md`.

## Design decisions

1. **The mapping uses exact field names only** (`STCODIGO`, `STDESCRIP`, …), as the Python script does. The dashboard worker's fuzzy aliases (`CODIGO`, `SKU`, `nombre`, …) are dropped, because they hide structure changes.
2. **The structure is checked up front.** If any of `STCODIGO`, `STDESCRIP` or `STPRECUNI2` is missing, the request fails with `400 DBF_MISSING_FIELDS` and `details.missing`, and no job is created. A changed table fails loudly instead of importing garbage.
3. **Unknown field types don't fail the import.** They decode as trimmed strings, so a new column the mapping doesn't use can't break an import. An unsupported code page does fail: `400 UNSUPPORTED_CODE_PAGE`.
4. **Conversion runs inside the request, not in the worker.** The table has 23k records at 877 bytes each (about 20MB), which converts in well under a second. The stored S3 object is the generated CSV, so `GET /:id/file` gives the exact CSV that was imported. The job keeps `type: 'csv'`, and its `filename` is the upload name with `.dbf` replaced by `.csv`.
5. **The Python script is deleted** once a parity run against `stock/stockWeb.DBF` passes (Task 4). Inspecting a new copy of the table moves to `npm run dbf:export -- --format raw`.
6. **The API must deploy before the dashboard.** The dashboard tasks call endpoints that only exist after Tasks 1–5.

## Global Constraints

- API imports are relative paths ending in `.js`, never `@/` (see `sanpablo-api-v2/AGENTS.md`).
- API error shape: `{ "error": { "code", "message", "details?" } }`. Error messages are in English.
- All dashboard text (labels, toasts, errors) is in Spanish, and numbers use `es-AR` formatting.
- The DBF upload limit is 100MB, the same on both sides.
- Read text as `windows-1252`. Generated CSVs are UTF-8 **without a BOM** (`parseRow` would see `﻿sku`), use `\n` line endings and RFC 4180 quoting.
- CSV columns are exactly `CSV_HEADERS` from `src/modules/imports/imports.schemas.ts`, in that order.
- The dashboard has no test runner. Its tasks are verified with `npm run typecheck`, `npm run lint`, `npm run build` and a manual run.
- API branch: `feat/dbf-imports`. Dashboard branch: `feat/dbf-via-api`. Commit messages are conventional (`feat:`, `fix:`, `refactor:`, `docs:`, `chore:`).

## Review Focus

1. **A product name that contains a comma or a double quote** (for example `ROLLO "FILM", 30cm`) must import with the name intact. Today `parseCsvLine` drops escaped quotes. Pinned in Task 3.
2. **Prices with an exact half-cent** (for example `10.125`) round to `10.13` in JS but `10.12` in Python. Expected behavior: JS half-up wins, and the Task 4 parity run lists these rows as the only allowed differences.
3. **A file over 100MB** reaching the API must return `400 FILE_TOO_LARGE`, not a 500. Today a `MulterError` falls through to the 500 branch. Pinned in Task 5.
4. **The production image decodes windows-1252.** `TextDecoder('windows-1252')` needs ICU. Check it inside the `node:20-alpine` image before deploying (Task 5, final step).
5. **A `.DBF` (uppercase) extension** must be accepted by the multer filter and the dashboard dropzone. The client's file is `stockWeb.DBF`. Pinned in Task 5 (curl) and Task 7 (manual).

---

## Part A: `sanpablo-api-v2`

All paths in Part A are relative to `/home/mateo/Repositorios/sanpablo-api-v2`. Start from a clean `main` with the current uncommitted parser and `STOCK_DBF.md` changes committed first (`docs: document stock DBF structure`), so the deletion in Task 4 shows up as its own diff.

Unit tests go next to the code as `*.test.ts`. Add `"src/**/*.test.ts"` and `"src/**/test-utils/**"` to `exclude` in `tsconfig.json` so `tsc` doesn't emit them to `dist/`. Vitest picks them up with no config.

### Task 1: DBF reader

**Files:**
- Create: `src/modules/imports/dbf/dbf-reader.ts`
- Create: `src/modules/imports/dbf/dbf-errors.ts`
- Create: `src/modules/imports/dbf/test-utils/build-dbf.ts`
- Test: `src/modules/imports/dbf/dbf-reader.test.ts`
- Modify: `tsconfig.json` (the exclude entries above)

**Interfaces:**
- Produces:
  - `type DbfValue = string | number | boolean | null`
  - `type DbfRecord = Record<string, DbfValue>`
  - `type DbfField = { name: string; type: string; length: number; decimals: number }`
  - `type DbfTable = { fields: DbfField[]; records: DbfRecord[]; deletedCount: number }`
  - `readDbf(buffer: Buffer): DbfTable`
  - `class DbfFormatError extends Error`, with `constructor(code: 'INVALID_DBF' | 'UNSUPPORTED_CODE_PAGE' | 'DBF_MISSING_FIELDS', message: string, details?: unknown)`. It exposes `code` and `details` as readonly properties.
  - Test helper `buildDbf(opts: { fields: Array<{ name: string; type: string; length: number; decimals?: number }>; records: Array<{ values: string[]; deleted?: boolean }>; codePage?: number }): Buffer`. Each value is the raw field text, padded by the helper. The helper writes version `0x30`, the record count, header and record lengths, the code page at byte 29, 32-byte field descriptors terminated by `0x0D`, then each record as a flag byte (`0x20` or `0x2A`) plus its fields, encoded as windows-1252 bytes.

**Format rules the reader implements:**
- **Header:**
  - The record count is a uint32 LE at byte 4.
  - The header length is a uint16 LE at byte 8, and the record length a uint16 LE at byte 10.
  - The code page is at byte 29. `0x03` and `0x00` mean windows-1252. Anything else throws `UNSUPPORTED_CODE_PAGE`, with the byte's hex value in the message.
- **Field descriptors:**
  - They start at byte 32, 32 bytes each, until a `0x0D` byte.
  - The name is bytes 0–10 (ASCII, cut at the first NUL), the type is byte 11, the length byte 16 and the decimals byte 17.
  - Skip fields of type `0` (the VFP `_NullFlags` field) when building records and `fields`, but still advance the offset past them.
- **Records:**
  - Records start at the header length. Each one is a flag byte followed by the fields in descriptor order.
  - Skip records flagged `*` and count them in `deletedCount`.
  - The `0x1A` EOF byte is ignored.
- **Values by field type:**
  - `C`: decoded text with trailing spaces trimmed (`trimEnd`).
  - `N` and `F`: trimmed text parsed with `Number()`. Blank or non-numeric gives `null`.
  - `L`: `T`/`t`/`Y`/`y` give `true`, `F`/`f`/`N`/`n` give `false`, anything else `null`.
  - `D`: `YYYYMMDD` becomes `'YYYY-MM-DD'`, blank gives `null`.
  - `I`: int32 LE. `B`: float64 LE. `Y`: int64 LE / 10000, as a number.
  - `M`, `G`, `W` and `T`: `null`. Memo files are never read.
  - Any other type: decoded text, trimmed.
- **Malformed files:** a buffer shorter than 32 bytes, a missing `0x0D` terminator, or `headerLength + count × recordLength` beyond the buffer length all throw `INVALID_DBF`.

- [ ] **Step 1: Write the failing tests** in `dbf-reader.test.ts`:
  - `reads C, N, L, D and M fields`: given fields `STCODIGO C9`, `STPRECUNI2 N12,3`, `STBORRAR L1`, `STFECACTU D8`, `STDETALLE M4`, and values `'0000694'`, `'  1234.500'`, `'F'`, `'20261014'`, `'    '`, expect `{ STCODIGO: '0000694', STPRECUNI2: 1234.5, STBORRAR: false, STFECACTU: '2026-10-14', STDETALLE: null }`.
  - `skips deleted records and counts them`: given 3 records with the middle one deleted, expect `records.length === 2` and `deletedCount === 1`.
  - `decodes windows-1252`: a `C` value with bytes `0x85` and `0xF1` gives `'…ñ'`.
  - `blank numeric is null`.
  - `skips _NullFlags`: a type-`0` field is absent from `fields` and from the records, and the field after it still decodes correctly.
  - `unknown type decodes as trimmed string`: type `V`, `'abc  '` gives `'abc'`.
  - `rejects truncated buffer`: `readDbf(buf.subarray(0, buf.length - 10))` throws `DbfFormatError` with code `INVALID_DBF`.
  - `rejects unsupported code page`: `codePage: 0x65` throws with code `UNSUPPORTED_CODE_PAGE`.
- [ ] **Step 2: Run** `npx vitest run src/modules/imports/dbf/dbf-reader.test.ts`. Expected: FAIL, because the module isn't found.
- [ ] **Step 3: Implement** `readDbf` and `DbfFormatError` following the format rules above. Create one `TextDecoder('windows-1252')` per call.
- [ ] **Step 4: Run** the same command. Expected: all 8 PASS.
- [ ] **Step 5: Commit** `feat: add DBF reader for Visual FoxPro tables`.

### Task 2: Stock table mapping

**Files:**
- Create: `src/modules/imports/dbf/stock-mapping.ts`
- Test: `src/modules/imports/dbf/stock-mapping.test.ts`

**Interfaces:**
- Consumes: `DbfRecord` and `DbfFormatError` (Task 1), and `CSV_HEADERS` (`imports.schemas.ts`).
- Produces:
  - `REQUIRED_STOCK_FIELDS = ['STCODIGO', 'STDESCRIP', 'STPRECUNI2'] as const`
  - `assertStockFields(fieldNames: string[]): void`. It throws `DbfFormatError('DBF_MISSING_FIELDS', 'Missing required DBF fields: A, B', { missing: string[] })`.
  - `mapStockRecord(rec: DbfRecord): string[]`. Its values follow the order of `CSV_HEADERS`.

The mapping is a straight port of `map_record_to_api_row` in the current `dbf-to-csv-parser.py`, including its helpers:
- `pick_str`, `pick_num`, `format_price` (as `toFixed(2)`), `slugify` (ASCII `a-z0-9` only, as in Python) and `parse_boolish`.
- The `'000'` family rule.
- The `special < regular` and `> 0` guards on `special_price`.
- `sale_price` is always empty, keeping the Python TODO as a comment.

Add a header comment saying that this file, together with `STOCK_DBF.md`, is the single source of truth for the mapping.

- [ ] **Step 1: Write the failing tests.** Build each record as a plain `DbfRecord` literal:
  - `maps a typical record`: `{ STCODIGO: '0000001', STDESCRIP: 'CUADERNO A4', STDETALLE: null, STPRECUNI2: 1500, STPRECUNI1: 1200, STNOMFAM: 'HOJAS VARIAS', STFAMILIA: '110', STBORRAR: false }` maps to `['0000001','CUADERNO A4','CUADERNO A4','1500.00','','1200.00','hojas-varias','','','','','','','true']`.
  - `special price omitted when not lower than regular`: `STPRECUNI1: 1500, STPRECUNI2: 1500` gives `special_price` `''`.
  - `special price omitted when zero`.
  - `family 000 means no category`: `STNOMFAM: '', STFAMILIA: '000'` gives `category_slug` `''`.
  - `falls back to family code`: `STNOMFAM: '', STFAMILIA: '30'` gives `'30'`.
  - `slugify collapses accents and symbols like Python`: `'SOBRES OFICIO INGLÉS'` gives `'sobres-oficio-ingl-s'`.
  - `STBORRAR true marks inactive`, and `missing STBORRAR stays active`.
  - `assertStockFields lists every missing field`: `assertStockFields(['STCODIGO'])` throws with `details.missing` equal to `['STDESCRIP','STPRECUNI2']`.
- [ ] **Step 2: Run** `npx vitest run src/modules/imports/dbf/stock-mapping.test.ts`. Expected: FAIL.
- [ ] **Step 3: Implement** `stock-mapping.ts`.
- [ ] **Step 4: Run** the same command. Expected: PASS.
- [ ] **Step 5: Commit** `feat: port stock DBF mapping from Python to TypeScript`.

### Task 3: CSV writer, `dbfToCsv`, and quote-safe CSV line parsing

**Files:**
- Create: `src/modules/imports/dbf/dbf-to-csv.ts`
- Create: `src/modules/imports/csv-line.ts` (moves `parseCsvLine` out of the service, so it can be tested without loading db/aws config)
- Modify: `src/modules/imports/imports.service.ts`. Delete the `parseCsvLine` method and call the imported `parseCsvLine` at its two call sites in `processImportJob`.
- Test: `src/modules/imports/dbf/dbf-to-csv.test.ts` and `src/modules/imports/csv-line.test.ts`

**Interfaces:**
- Consumes: `readDbf` (Task 1), and `assertStockFields` and `mapStockRecord` (Task 2).
- Produces:
  - `type DbfCsvFormat = 'api' | 'raw'`
  - `toCsv(headers: string[], rows: string[][]): string`. It quotes a value only when it contains `,`, `"`, `\r` or `\n`, doubles inner quotes, joins lines with `\n` and adds a trailing `\n`. No BOM.
  - `dbfToCsv(buffer: Buffer, format: DbfCsvFormat): { csv: string; rowCount: number }`.
    - `'api'` calls `assertStockFields` and then maps every record.
    - `'raw'` uses every non-skipped field name as the header row. Values become: `null` → `''`, booleans → `'true'`/`'false'`, numbers → `String(n)`, strings → trimmed.
  - `parseCsvLine(line: string): string[]`. RFC 4180: `""` inside a quoted value becomes `"`. Values are trimmed, as today.

- [ ] **Step 1: Write the failing tests:**
  - `csv-line.test.ts`:
    - `parseCsvLine('a,"b, c",d')` gives `['a','b, c','d']`.
    - `parseCsvLine('"ROLLO ""FILM"", 30cm",x')` gives `['ROLLO "FILM", 30cm','x']`.
  - `dbf-to-csv.test.ts`, using `buildDbf`:
    - `toCsv round-trips through parseCsvLine`: for `['ROLLO "FILM", 30cm', '12']`, `parseCsvLine(toCsv(['a','b'], [row]).split('\n')[1])` equals the row.
    - `api format`: 2 stock records give `rowCount === 2`, a first line equal to `CSV_HEADERS.join(',')`, and `csv.charCodeAt(0) !== 0xfeff`.
    - `api format rejects a table without STPRECUNI2`: throws code `DBF_MISSING_FIELDS`.
    - `raw format keeps every column`: the header is the DBF field names, and a boolean field renders as `'false'`.
- [ ] **Step 2: Run** `npx vitest run src/modules/imports`. Expected: FAIL.
- [ ] **Step 3: Implement** the two modules and update the service call sites.
- [ ] **Step 4: Run** `npx vitest run && npm run typecheck && npm run lint`. Expected: everything PASS, no errors.
- [ ] **Step 5: Commit** `feat: convert DBF to import CSV and parse escaped CSV quotes`.

### Task 4: Export CLI, parity check, and removal of the Python script

**Files:**
- Create: `src/scripts/import-products/dbf-to-csv.ts`
- Modify: `package.json`. Add the script `"dbf:export": "tsx src/scripts/import-products/dbf-to-csv.ts"`.
- Delete: `src/scripts/import-products/dbf-to-csv-parser.py`
- Modify: `src/scripts/import-products/STOCK_DBF.md`. Make these changes:
  - The mapping now lives in `src/modules/imports/dbf/stock-mapping.ts`.
  - The "Inspecting a new copy" command becomes `npm run dbf:export -- --format raw --out tmp/stock-all-fields.csv`.
  - Remove the `pip install` line.
  - Add `DBF_MISSING_FIELDS` to what's worth re-checking.

**Interfaces:**
- Consumes: `dbfToCsv` (Task 3).
- CLI flags, parsed with `node:util` `parseArgs`:
  - `--dbf` (default `stock/stockWeb.DBF`)
  - `--out` (default `stock_export.csv`)
  - `--format api|raw` (default `api`)
- It writes the file and prints `[OK] <rowCount> rows -> <absolute path>`. The Python `--limit`, `--offset` and `--delim` flags are not ported (YAGNI).

- [ ] **Step 1: Implement** the CLI and the npm script.
- [ ] **Step 2: Produce the TS output.** Run `npm run dbf:export -- --out /tmp/claude-1000/ts.csv`. Expected: `[OK] 23040 rows -> …`, since 23,045 records minus 5 deleted.
- [ ] **Step 3: Produce the Python output** before deleting it. Run it in a throwaway venv:

  ```bash
  python3 -m venv /tmp/claude-1000/venv && /tmp/claude-1000/venv/bin/pip install dbfread python-dotenv
  /tmp/claude-1000/venv/bin/python src/scripts/import-products/dbf-to-csv-parser.py --salida /tmp/claude-1000/py.csv
  ```

- [ ] **Step 4: Diff the two outputs.** Normalize the Python output first (strip the BOM, convert CRLF to LF):

  ```bash
  sed '1s/^\xEF\xBB\xBF//' /tmp/claude-1000/py.csv | tr -d '\r' > /tmp/claude-1000/py.norm.csv
  diff /tmp/claude-1000/py.norm.csv /tmp/claude-1000/ts.csv
  ```

  Expected: no output, or only rows where a price has an exact half-cent (Review Focus 2). Look up every other differing row in `STOCK_DBF.md` and fix the mapping before going on.
- [ ] **Step 5: Delete** the Python script and update `STOCK_DBF.md` as described in Files.
- [ ] **Step 6: Commit** `refactor: replace Python DBF parser with TypeScript export CLI`.

### Task 5: Endpoints

**Files:**
- Modify: `src/shared/middleware/upload.ts`. Add `dbfUpload`: memory storage, `fileSize: 100 * 1024 * 1024`, and a filter that accepts when `file.originalname.toLowerCase().endsWith('.dbf')`. Otherwise it rejects with `badRequest('INVALID_FILE_TYPE', 'Only DBF files are allowed')`.
- Modify: `src/shared/middleware/error-handler.ts`. Map `MulterError` with code `LIMIT_FILE_SIZE` to `400 FILE_TOO_LARGE`, and map `DbfFormatError` to `400` with its own `code`, `message` and `details`.
- Modify: `src/modules/imports/imports.schemas.ts`. Add `dbfConvertQuerySchema = z.object({ format: z.enum(['api', 'raw']).default('api') })`.
- Modify: `src/modules/imports/imports.service.ts`
- Modify: `src/modules/imports/imports.controller.ts`
- Modify: `src/modules/imports/imports.routes.ts`. Add Swagger blocks matching the style of the existing ones.
- Modify: `src/app.ts`. Change `cors()` to `cors({ exposedHeaders: ['Content-Disposition', 'X-Row-Count'] })`.
- Modify: `openapi-spec.json`. Regenerate it with `curl -s localhost:3000/api/docs.json > openapi-spec.json`.

**Interfaces:**
- Consumes: `dbfToCsv` and `DbfCsvFormat` (Task 3), and the existing `createImportJob` and `getById`.
- Produces, in `importsService`:
  - `createDbfImportJob(file: Buffer, filename: string, userId: string)`. It runs `dbfToCsv(file, 'api')`, then returns `this.createImportJob(Buffer.from(csv, 'utf-8'), filename.replace(/\.dbf$/i, '.csv'), userId)`.
  - `getJobFile(jobId: string, userId?: string, isAdmin?: boolean): Promise<{ body: Buffer; contentType: string; filename: string }>`. It calls `getById` for the access check, then `GetObject` on `job.fileKey`. `contentType` is `application/json` for `bulk_images` and `text/csv; charset=utf-8` otherwise. `filename` is `job.filename`.
- HTTP contract (the dashboard codes against this):

  | Method & path | Guards | Request | Success |
  | --- | --- | --- | --- |
  | `POST /api/imports/dbf` | `requireAuth`, `requireAdmin`, `dbfUpload.single('file')` | multipart `file` | `201 { data: ImportJob }` |
  | `POST /api/imports/dbf/csv?format=api\|raw` | `requireAuth`, `requireAdmin`, `validateRequest({ query: dbfConvertQuerySchema })`, `dbfUpload.single('file')` | multipart `file` | `200 text/csv; charset=utf-8`, `Content-Disposition: attachment; filename="<name>.csv"`, `X-Row-Count: <n>` |
  | `GET /api/imports/:id/file` | `requireAuth`, `validateRequest({ params: importIdParamSchema })` | — | `200` with the stored file, `Content-Disposition` set |

  Errors:
  - `400 FILE_REQUIRED` when no file is sent.
  - `400 INVALID_FILE_TYPE`, `400 FILE_TOO_LARGE`, `400 INVALID_DBF` and `400 UNSUPPORTED_CODE_PAGE`.
  - `400 DBF_MISSING_FIELDS` with `details.missing`.
  - `404 IMPORT_JOB_NOT_FOUND`.

  Register the two `/dbf` routes before the `/:id` routes.

- [ ] **Step 1: Implement** the middleware, error handler, schema, service, controller, routes and CORS changes.
- [ ] **Step 2: Run** `npx vitest run && npm run typecheck && npm run lint`. Expected: PASS, no errors.
- [ ] **Step 3: Smoke-test** against the dev stack (`docker compose -f docker/docker-compose.yml up -d postgres localstack`, then `npm run dev`). Get an admin token with `POST /api/auth/login` and export it as `$T`.
  - `curl -s -o /dev/null -w '%{http_code}' -H "Authorization: Bearer $T" -F file=@stock/stockWeb.DBF localhost:3000/api/imports/dbf`. Expected: `201`. Then poll `GET /api/imports/<id>` until `completed`, which should show `totalRows: 23040`.
  - `curl -s -D - -H "Authorization: Bearer $T" -F file=@stock/stockWeb.DBF 'localhost:3000/api/imports/dbf/csv?format=raw' -o /tmp/claude-1000/raw.csv`. Expected: `200`, `X-Row-Count: 23040`, and the first line of `raw.csv` starts with `STCODIGO,`.
  - `curl … localhost:3000/api/imports/<id>/file`. Expected: `200`, and the body equals `npm run dbf:export` output from Task 4.
  - Upload `example.csv` renamed to `x.dbf`. Expected: `400 INVALID_DBF`.
  - Upload a 101MB file (`head -c 105906176 /dev/zero > /tmp/claude-1000/big.dbf`). Expected: `400 FILE_TOO_LARGE`.
- [ ] **Step 4: Check ICU in the production image.** Run `docker run --rm node:20-alpine node -e "console.log(new TextDecoder('windows-1252').decode(Buffer.from([0x85])))"`. Expected: `…`. If it throws instead, have the reader fall back to a static 128-entry table for bytes `0x80`–`0xFF`, and add a test for that path.
- [ ] **Step 5: Update the docs.** In `AGENTS.md` and `CLAUDE.md`, list the three endpoints and say that DBF parsing lives in `src/modules/imports/dbf/`.
- [ ] **Step 6: Commit** `feat: add DBF import, conversion and job file endpoints`.

---

## Part B: `sanpablo-dashboard-v2`

All paths in Part B are relative to `/home/mateo/Repositorios/sanpablo-dashboard-v2/src/features/tools` unless they start with `src/`, `package.json` or a doc filename. Start Part B after Part A is merged, and run it against a local API on `:3000`.

### Task 6: API client, hooks and helpers

**Files:**
- Modify: `api/imports.api.ts`
- Modify: `api/imports.queries.ts`. Also switch `useDownloadTemplate` to `downloadBlob`.
- Modify: `src/lib/utils.ts`

**Interfaces:**
- Produces:
  - `downloadBlob(blob: Blob, filename: string): void` in `src/lib/utils.ts`. This is the object-URL and anchor code that is currently copied four times.
  - `getApiErrorCode(error: unknown): { code?: string; message?: string; details?: unknown }` in `src/lib/utils.ts`. It reads `error.response.data.error` when `axios.isAxiosError(error)`.
  - `importsApi.createFromDbf(file: File, onUploadProgress?: (percent: number) => void): Promise<ImportJobResponse>`. It calls `POST /api/imports/dbf` and maps axios `onUploadProgress` to a 0–100 integer.
  - `importsApi.convertDbfToCsv(file: File, format: 'api' | 'raw'): Promise<{ blob: Blob; rowCount: number }>`. It uses `responseType: 'blob'` and reads `rowCount` from the `x-row-count` header.
  - `importsApi.getFile(id: string): Promise<Blob>`, calling `GET /api/imports/${id}/file` with a blob response type.
  - Hooks:
    - `useCreateDbfImportJob()`, a mutation taking `{ file: File; onUploadProgress?: (p: number) => void }`. It invalidates `importKeys.lists()`.
    - `useConvertDbfToCsv()`, a mutation taking `{ file: File; format: 'api' | 'raw' }`.
  - `DBF_ERROR_MESSAGES: Record<string, string>` in `api/imports.api.ts`, with Spanish copy for:
    - `INVALID_FILE_TYPE`: "Solo se permiten archivos DBF"
    - `FILE_TOO_LARGE`: "El archivo no puede superar los 100MB"
    - `INVALID_DBF`: "El archivo no es un DBF válido o está dañado"
    - `UNSUPPORTED_CODE_PAGE`: "El DBF usa una codificación no soportada"
    - `DBF_MISSING_FIELDS`: "Al DBF le faltan campos requeridos: {campos}". Fill `{campos}` from `details.missing.join(', ')`.
  - `getDbfErrorMessage(error: unknown, fallback: string): string`, which combines the two.

- [ ] **Step 1: Implement** the helpers, API methods and hooks.
- [ ] **Step 2: Run** `npm run typecheck && npm run lint`. Expected: no errors.
- [ ] **Step 3: Commit** `feat: add DBF endpoints to imports API client`.

### Task 7: 1-click import uploads the DBF

**Files:**
- Modify: `components/OneClickImporter.tsx`
- Modify: `pages/OneClickImportPage.tsx`. Remove `pendingCsv`, `setOneClickDebugCsv`, `clearOneClickDebugCsv` and the `onCsvGenerated` prop.
- Modify: `components/OneClickImportDebugPanel.tsx`
- Delete: `stores/oneClickImportDebug.store.ts`

**Interfaces:**
- Consumes: `useCreateDbfImportJob`, `getDbfErrorMessage`, `importsApi.getFile` and `downloadBlob` (Task 6).
- `OneClickImporterProps` becomes `{ onImportStarted?: (jobId: string) => void }`.
- `OneClickImportDebugPanel({ jobId })` keeps its name and props. It fetches the file only when the user clicks "Ver preview" or "Descargar CSV", so it no longer depends on in-memory state. It now works after a reload and for any job. Card title: "Archivo importado". Description: "Descargá o revisá el CSV que el servidor generó y procesó."

Component behavior:
- **State:** `phase: 'idle' | 'uploading' | 'processing' | 'done'` and `uploadPercent: number`.
- **Phases:**
  - `uploading` shows "Subiendo archivo..." with the upload percent.
  - Once the upload reaches 100% and until the response arrives, `processing` shows "Procesando DBF en el servidor..." with the bar full and a spinner.
  - When the call succeeds, switch to `done`, show the toast `Importación iniciada` and call `onImportStarted(result.data.id)`.
- **Errors:** set the error to `getDbfErrorMessage(err, 'Error al iniciar la importación')` and go back to `idle`.
- **Removed:** the worker, `recordCount`, `generatedCsv`, `csvPreview`, and the inline "Debug CSV generado" block.
- **Kept:** the dropzone validation (`.dbf`, case-insensitive, max 100MB).
- **"Cómo funciona" step 3** now reads "El servidor convierte el DBF al formato de importación".

- [ ] **Step 1: Implement** the changes above.
- [ ] **Step 2: Run** `npm run typecheck && npm run lint`. Expected: no errors.
- [ ] **Step 3: Run it manually** (`npm run dev`, API on `:3000`):
  - Drop `stockWeb.DBF` (uppercase extension). It should go through the upload and processing phases, then show `ImportProgress` until it reaches `completed`.
  - The "Archivo importado" panel should download the CSV, and still work after reloading `/herramientas/importaciones/<id>`.
  - A table without `STPRECUNI2` should show "Al DBF le faltan campos requeridos: STPRECUNI2".
- [ ] **Step 4: Commit** `feat: send DBF to API in 1-click import`.

### Task 8: The DBF converter uses the API

**Files:**
- Modify: `components/DbfConverter.tsx`

**Interfaces:**
- Consumes: `useConvertDbfToCsv`, `getDbfErrorMessage` and `downloadBlob` (Task 6), `papaparse`, and `components/ui/select`.

Component behavior:
- **Format selector.** Add a `Select` above the action button:
  - "Formato de importación" (`api`, the default).
  - "Todas las columnas del DBF" (`raw`). Helper text: "Útil para revisar si cambió la estructura del archivo".
- **Processing.** "Procesar archivo" calls the mutation. While it is pending, show a spinner with "Procesando en el servidor...".
- **Result.** On success, keep `{ blob, rowCount, format }`. Parse the first 64KB of the blob with `Papa.parse(text, { preview: 11 })`: row 0 is the headers, rows 1–10 are the preview.
- **Preview card.** It stays, rendering from those headers and rows. The badges show the column count and `formatNumber(rowCount)` filas.
- **Download.** "Descargar CSV" calls `downloadBlob(blob, file.name.replace(/\.dbf$/i, format === 'raw' ? '-completo.csv' : '.csv'))`.
- **Instructions.** Replace "El archivo sera procesado localmente (no se sube a ningun servidor)" with "El archivo se procesa en el servidor con las mismas reglas que la importación". Delete the "segundo plano" bullet.
- **Removed:** the worker, `ParsedDbfData` and `ProcessingState`.

- [ ] **Step 1: Implement** the changes above.
- [ ] **Step 2: Run** `npm run typecheck && npm run lint`. Expected: no errors.
- [ ] **Step 3: Run it manually** at `/herramientas/convertir-dbf`:
  - In `api` format, the preview headers equal `CSV_HEADERS` and the count shows `23.040 filas`.
  - In `raw` format, the headers start with `STCODIGO` and there are 60 columns, or 59 if `_NullFlags` is present.
  - The downloaded file opens and has no BOM.
- [ ] **Step 4: Commit** `feat: convert DBF to CSV through the API`.

### Task 9: Remove client-side DBF parsing and update the docs

**Files:**
- Delete:
  - `workers/dbf.worker.ts`, `workers/dbf.types.ts` and `workers/shapefile.d.ts` (the whole `workers/` folder)
  - `import-products/dbf-to-csv-parser.py` and `import-products/example.csv` (the whole folder; the API keeps its own `example.csv`)
- Modify: `package.json` and `package-lock.json`. Run `npm uninstall shapefile`.
- Modify: `CLAUDE.md`. Rewrite the "Tools / import pipeline" bullets:
  - The 1-click import uploads the `.dbf` to `POST /api/imports/dbf`.
  - The converter calls `POST /api/imports/dbf/csv?format=api|raw`.
  - The job's file is served by `GET /api/imports/:id/file`.
  - All DBF knowledge lives in `sanpablo-api-v2/src/modules/imports/dbf/`, and this repo has no DBF parsing.
- Modify: `AGENTS.md`:
  - Drop the `shapefile` row from the stack table (line ~41).
  - Remove `workers/`, `stores/` and `import-products/` from the tree (lines ~131–138).
  - Rewrite the "Import Tools" section (lines ~728–732) to match CLAUDE.md.
  - Add the three endpoints to the API endpoint reference.

- [ ] **Step 1: Delete** the files and uninstall the package.
- [ ] **Step 2: Check for leftovers.** Run `grep -rnE "dbf\.worker|dbf\.types|shapefile|oneClickImportDebug|dbf-to-csv-parser" src CLAUDE.md AGENTS.md package.json`. Expected: no output.
- [ ] **Step 3: Run** `npm run typecheck && npm run lint && npm run build`. Expected: all succeed, and the build output has no `dbf.worker` chunk.
- [ ] **Step 4: Update** `CLAUDE.md` and `AGENTS.md` as described in Files.
- [ ] **Step 5: Commit** `chore: remove client-side DBF parsing`.

---

## Noticed, out of scope

- The dashboard's `ImportJobsResponse` (`types.ts`) expects `{ data: { items, … } }`, but the API's `list` returns `{ data: [], meta }`. CLAUDE.md repeats the dashboard's version. Check `ImportJobsTable` before trusting either. This is a separate fix.
- `STOCK_DBF.md` lists the duplicate SKU `0000694`. The import still upserts by SKU, so one of the two products is lost. The mapping move doesn't change that.
