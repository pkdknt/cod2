/**
 * Shared helpers for exporting styled Excel workbooks with xlsx-js-style.
 * The library is always loaded dynamically (client-side only) to avoid SSR
 * issues and to keep it out of the initial bundle.
 */

// xlsx-js-style ships as CommonJS without a clean ESM default type, so the
// dynamically imported module is typed loosely (allowed for dynamic libs).
export type XLSXModule = any;
export type Worksheet = Record<string, any>;

export async function loadXLSX(): Promise<XLSXModule> {
  const { default: XLSX } = await import('xlsx-js-style');
  return XLSX;
}

/**
 * Apply a style to every cell in the used range.
 * When `createMissing` is true, empty cells are created so borders render on
 * merged/spacer rows too.
 */
export function applyCellStyle(
  XLSX: XLSXModule,
  ws: Worksheet,
  styleFn: (row: number, col: number) => Record<string, unknown> | undefined,
  options: { createMissing?: boolean } = {}
): void {
  const range = XLSX.utils.decode_range(ws['!ref'] || 'A1:A1');
  for (let R = range.s.r; R <= range.e.r; ++R) {
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const ref = XLSX.utils.encode_cell({ c: C, r: R });
      if (!ws[ref]) {
        if (!options.createMissing) continue;
        ws[ref] = { t: 'z', v: '' };
      }
      const style = styleFn(R, C);
      if (style) ws[ref].s = style;
    }
  }
}

export interface WriteSheetOptions {
  ws: Worksheet;
  sheetName: string;
  fileName: string;
  merges?: Worksheet['!merges'];
  cols?: Worksheet['!cols'];
  rows?: Worksheet['!rows'];
}

/** Write a single-sheet workbook to disk via the browser download. */
export function writeSheet(XLSX: XLSXModule, options: WriteSheetOptions): void {
  const { ws, sheetName, fileName, merges, cols, rows } = options;
  if (merges) ws['!merges'] = merges;
  if (cols) ws['!cols'] = cols;
  if (rows) ws['!rows'] = rows;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, fileName);
}

export const THIN_BORDER = {
  top: { style: 'thin', color: { rgb: 'A0A0A0' } },
  bottom: { style: 'thin', color: { rgb: 'A0A0A0' } },
  left: { style: 'thin', color: { rgb: 'A0A0A0' } },
  right: { style: 'thin', color: { rgb: 'A0A0A0' } },
} as const;
