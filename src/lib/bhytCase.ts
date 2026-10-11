import type { BhytCaseType } from '@/models/BhytCase';

export interface BhytCaseRecord {
  _id: string;
  date: string;
  type: BhytCaseType;
  qty: number;
  note?: string;
}

export interface BhytCaseInput {
  _id?: string | null;
  date: string;
  type: BhytCaseType;
  qty: number | string;
  note?: string;
}

export function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Positive integers only; anything else becomes 0. */
export function safeNum(v: unknown): number {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? Math.round(n) : 0;
}

/**
 * Normalise the many date shapes in the source files to `YYYY-MM-DD`.
 * NOTE: 2-digit years here use the `>50 → 19xx` rule (deliberately different
 * from the CSKH module, matching the legacy tool).
 */
export function normalizeCaseDate(value: unknown): string {
  if (value instanceof Date && !isNaN(value.getTime())) {
    return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`;
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    // Excel serial → UTC date (avoids a one-day shift on negative-offset hosts).
    const d = new Date(Date.UTC(1899, 11, 30) + Math.round(value) * 86400000);
    return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
  }

  const s = String(value ?? '').trim();
  if (!s) return '';

  const iso = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (iso) return `${iso[1]}-${iso[2].padStart(2, '0')}-${iso[3].padStart(2, '0')}`;

  const m = s.match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{2,4})$/);
  if (m) {
    const y = m[3].length === 2 ? (Number(m[3]) > 50 ? `19${m[3]}` : `20${m[3]}`) : m[3];
    return `${y}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`;
  }

  return '';
}

export function fmtCaseDate(iso: string): string {
  if (!iso) return '';
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : iso;
}

export const monthKey = (iso: string) => iso.slice(0, 7);
export const yearKey = (iso: string) => iso.slice(0, 4);
export const monthLabel = (key: string) => (key ? `${key.slice(5)}/${key.slice(0, 4)}` : '');

export interface GroupStat {
  key: string;
  total: number;
  buy: number;
  renew: number;
}

export function groupTotals(rows: BhytCaseRecord[], keyFn: (r: BhytCaseRecord) => string): GroupStat[] {
  const map = new Map<string, GroupStat>();
  for (const r of rows) {
    const key = keyFn(r);
    if (!key) continue;
    const entry = map.get(key) ?? { key, total: 0, buy: 0, renew: 0 };
    const qty = safeNum(r.qty);
    entry.total += qty;
    if (r.type === 'Gia hạn') entry.renew += qty;
    else entry.buy += qty;
    map.set(key, entry);
  }
  return [...map.values()].sort((a, b) => (a.key < b.key ? 1 : a.key > b.key ? -1 : 0));
}

export function sumQty(rows: BhytCaseRecord[], type?: BhytCaseType): number {
  return rows.reduce((acc, r) => (type && r.type !== type ? acc : acc + safeNum(r.qty)), 0);
}

/** Legacy comparison: diff = b - a; pct falls back to 100 when a is 0 but b isn't. */
export function compareTotals(a: number, b: number): { diff: number; pct: number } {
  const diff = b - a;
  const pct = a ? (diff / a) * 100 : b ? 100 : 0;
  return { diff, pct };
}
