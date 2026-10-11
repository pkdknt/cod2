import BhytCase from '@/models/BhytCase';
import { connectToDatabase } from '@/lib/mongodb';
import { buildPagination, type PageParams } from '@/lib/pagination';
import {
  compareTotals,
  groupTotals,
  monthKey,
  normalizeCaseDate,
  safeNum,
  sumQty,
  todayISO,
  yearKey,
  type BhytCaseInput,
  type BhytCaseRecord,
  type GroupStat,
} from '@/lib/bhytCase';
import type { BhytCaseType } from '@/models/BhytCase';
import type { Pagination } from '@/lib/types';

export interface BhytCaseFilters extends PageParams {
  q?: string;
  month?: string;
  type?: string;
}

export interface BhytCaseStats {
  today: number;
  todayBuy: number;
  todayRenew: number;
  month: number;
  monthBuy: number;
  monthRenew: number;
  year: number;
  yearBuy: number;
  yearRenew: number;
  all: number;
  rows: number;
  dayStats: GroupStat[];
  monthStats: GroupStat[];
  yearStats: GroupStat[];
  typeStats: { type: string; total: number }[];
}

export interface BhytCaseCompare {
  labelA: string;
  valueA: number;
  labelB: string;
  valueB: number;
  diff: number;
  pct: number;
}

/** Full document for a create. */
function buildCreatePayload(data: BhytCaseInput): Record<string, unknown> {
  return {
    date: normalizeCaseDate(data.date) || todayISO(),
    type: data.type === 'Gia hạn' ? 'Gia hạn' : 'Mua mới',
    qty: Math.max(1, safeNum(data.qty) || 1),
    note: data.note != null ? String(data.note) : undefined,
  };
}

/** Only the keys the caller actually sent — a partial update must not reset the rest. */
function buildUpdatePayload(data: BhytCaseInput): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (data.date !== undefined && data.date !== null) out.date = normalizeCaseDate(data.date) || todayISO();
  if (data.type !== undefined) out.type = data.type === 'Gia hạn' ? 'Gia hạn' : 'Mua mới';
  if (data.qty !== undefined && data.qty !== null) out.qty = Math.max(1, safeNum(data.qty) || 1);
  if (data.note !== undefined) out.note = data.note == null ? '' : String(data.note);
  return out;
}

export class BhytCaseService {
  static async getAll(
    filters: BhytCaseFilters
  ): Promise<{ items: BhytCaseRecord[]; pagination: Pagination }> {
    await connectToDatabase();
    const query: Record<string, unknown> = {};
    if (filters.q) query.note = { $regex: filters.q.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' };
    if (filters.month) query.date = { $regex: `^${filters.month}` };
    if (filters.type) query.type = filters.type;

    const { page, pageSize } = filters;
    const [totalFiltered, items] = await Promise.all([
      BhytCase.countDocuments(query),
      BhytCase.find(query).sort({ date: -1 }).skip((page - 1) * pageSize).limit(pageSize).lean(),
    ]);

    return {
      items: items as unknown as BhytCaseRecord[],
      pagination: buildPagination(page, pageSize, totalFiltered),
    };
  }

  static async upsert(data: BhytCaseInput): Promise<{ item: BhytCaseRecord | null; created: boolean }> {
    await connectToDatabase();

    if (data._id) {
      const item = await BhytCase.findByIdAndUpdate(data._id, { $set: buildUpdatePayload(data) }, { new: true }).lean();
      return { item: item as unknown as BhytCaseRecord | null, created: false };
    }
    const item = await BhytCase.create(buildCreatePayload(data));
    return { item: item.toObject() as unknown as BhytCaseRecord, created: true };
  }

  static async delete(id: string): Promise<{ success: boolean; message: string }> {
    await connectToDatabase();
    await BhytCase.findByIdAndDelete(id);
    return { success: true, message: 'Đã xóa dòng dữ liệu.' };
  }

  private static async readAll(): Promise<BhytCaseRecord[]> {
    return (await BhytCase.find({}).lean()) as unknown as BhytCaseRecord[];
  }

  static async getStats(): Promise<BhytCaseStats> {
    await connectToDatabase();
    const rows = await this.readAll();
    const today = todayISO();
    const curMonth = today.slice(0, 7);
    const curYear = today.slice(0, 4);

    const todayRows = rows.filter((r) => r.date === today);
    const monthRows = rows.filter((r) => monthKey(r.date) === curMonth);
    const yearRows = rows.filter((r) => yearKey(r.date) === curYear);

    return {
      today: sumQty(todayRows),
      todayBuy: sumQty(todayRows, 'Mua mới'),
      todayRenew: sumQty(todayRows, 'Gia hạn'),
      month: sumQty(monthRows),
      monthBuy: sumQty(monthRows, 'Mua mới'),
      monthRenew: sumQty(monthRows, 'Gia hạn'),
      year: sumQty(yearRows),
      yearBuy: sumQty(yearRows, 'Mua mới'),
      yearRenew: sumQty(yearRows, 'Gia hạn'),
      all: sumQty(rows),
      rows: rows.length,
      dayStats: groupTotals(rows, (r) => r.date).slice(0, 10),
      monthStats: groupTotals(rows, (r) => monthKey(r.date)).slice(0, 12),
      yearStats: groupTotals(rows, (r) => yearKey(r.date)).slice(0, 10),
      typeStats: [
        { type: 'Mua mới', total: sumQty(rows, 'Mua mới') },
        { type: 'Gia hạn', total: sumQty(rows, 'Gia hạn') },
      ],
    };
  }

  static async compare(kind: 'month' | 'year', a: string, b: string): Promise<BhytCaseCompare> {
    await connectToDatabase();
    const rows = await this.readAll();
    const keyOf = kind === 'month' ? monthKey : yearKey;
    const valueA = sumQty(rows.filter((r) => keyOf(r.date) === a));
    const valueB = sumQty(rows.filter((r) => keyOf(r.date) === b));
    const { diff, pct } = compareTotals(valueA, valueB);
    return { labelA: a, valueA, labelB: b, valueB, diff, pct };
  }

  /** Distinct month/year keys, newest first (for the compare dropdowns). */
  static async periods(): Promise<{ months: string[]; years: string[] }> {
    await connectToDatabase();
    const rows = await this.readAll();
    const months = [...new Set(rows.map((r) => monthKey(r.date)).filter(Boolean))].sort().reverse();
    const years = [...new Set(rows.map((r) => yearKey(r.date)).filter(Boolean))].sort().reverse();
    return { months, years };
  }
}

export type { BhytCaseType };
