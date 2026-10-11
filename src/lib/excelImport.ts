import { normalizeText } from '@/lib/bhyt';
import { loadXLSX, type Worksheet } from '@/lib/excel';

export type CellMatrix = unknown[][];

/** Read every row of a sheet into an array-of-arrays. */
export async function readSheetMatrix(file: File, sheetName?: string): Promise<CellMatrix> {
  const XLSX = await loadXLSX();
  const buffer = await file.arrayBuffer();
  const book = XLSX.read(new Uint8Array(buffer), { type: 'array' });
  const target = sheetName && book.SheetNames.includes(sheetName) ? sheetName : book.SheetNames[0];
  const sheet: Worksheet = book.Sheets[target];
  return XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' }) as CellMatrix;
}

/** List the sheet names of a workbook (for a sheet picker). */
export async function readSheetNames(file: File): Promise<string[]> {
  const XLSX = await loadXLSX();
  const buffer = await file.arrayBuffer();
  const book = XLSX.read(new Uint8Array(buffer), { type: 'array' });
  return book.SheetNames;
}

/** Header key used for fuzzy column matching: no diacritics, alphanumeric only. */
export function headerKey(v: unknown): string {
  return normalizeText(v).replace(/[^a-z0-9]/g, '');
}

/**
 * Find the row that looks like the header (first row where every predicate
 * matches at least one cell). Falls back to `fallback`.
 */
export function detectHeaderRow(
  matrix: CellMatrix,
  predicates: ((key: string) => boolean)[],
  fallback = 0
): number {
  const limit = Math.min(matrix.length, 15);
  for (let i = 0; i < limit; i++) {
    const row = matrix[i];
    if (!Array.isArray(row)) continue;
    const keys = row.map((c) => headerKey(c));
    if (predicates.every((p) => keys.some(p))) return i;
  }
  return fallback;
}

/** Map header cells to field names using ordered regex rules (first match wins). */
export function mapColumnsByRegex(
  headers: string[],
  rules: [RegExp, string][]
): Record<string, number> {
  const map: Record<string, number> = {};
  headers.forEach((raw, index) => {
    const key = normalizeText(raw).replace(/\s+/g, ' ').trim();
    if (!key) return;
    for (const [re, field] of rules) {
      if (re.test(key) && map[field] === undefined) {
        map[field] = index;
        return;
      }
    }
  });
  return map;
}

/** Turn rows below the header into objects using a field → column-index map. */
export function rowsToObjects(
  matrix: CellMatrix,
  headerIndex: number,
  fieldMap: Record<string, number>
): Record<string, unknown>[] {
  const out: Record<string, unknown>[] = [];
  for (let i = headerIndex + 1; i < matrix.length; i++) {
    const row = matrix[i];
    if (!Array.isArray(row) || !row.some((v) => String(v ?? '').trim())) continue;
    const obj: Record<string, unknown> = {};
    for (const [field, col] of Object.entries(fieldMap)) {
      if (col >= 0) obj[field] = row[col] ?? '';
    }
    out.push(obj);
  }
  return out;
}
