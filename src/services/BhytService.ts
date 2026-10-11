import BhytCustomer from '@/models/BhytCustomer';
import { connectToDatabase } from '@/lib/mongodb';
import { createUnaccentRegex } from '@/lib/search';
import { buildPagination, type PageParams } from '@/lib/pagination';
import {
  cleanPhone,
  deduplicateCustomers,
  expiryStatus,
  getWorkflow,
  isoDate,
  isSameCustomer,
  mergeDuplicateRecords,
} from '@/lib/bhyt';
import type {
  BhytCustomerInput,
  BhytCustomerRecord,
  ExpiryBucket,
  Pagination,
  SortDirection,
} from '@/lib/types';

export interface BhytListFilters extends PageParams {
  q?: string;
  bucket?: ExpiryBucket | '';
  loaiHoSo?: string;
  sortKey?: string;
  sortDir?: SortDirection;
}

export type RenewalScope = 'priority' | 'expired' | 'due15' | 'due30' | 'all';

const SORT_FIELDS: Record<string, string> = {
  name: 'hoTen',
  bhxh: 'maBHXH',
  phone: 'dienThoai',
  kcb: 'noiKCB',
  expiry: 'hanTheISO',
};

const PLAIN_STRING_FIELDS = [
  'gioiTinh',
  'noiKhaiSinh',
  'noiKCB',
  'soBienLai',
  'soTienDong',
  'hoTroThem',
  'thoiHanTheThang',
  'maNVThu',
  'canLienHe',
  'loaiHoSo',
  'nguoiGioiThieu',
  'ghiChu',
  'workflowStatus',
] as const;

// [raw field, derived ISO field] — the RAW value always wins so editing a date works.
const DATE_PAIRS: [string, string][] = [
  ['ngaySinh', 'ngaySinhISO'],
  ['ngayBienLai', 'ngayBienLaiISO'],
  ['hanThe', 'hanTheISO'],
  ['ngayGoi', 'ngayGoiISO'],
];

/** Fields never written via `$set` (immutable / server-managed). */
const FORBIDDEN_SET_FIELDS = new Set(['_id', 'createdAt', 'updatedAt']);

function addDaysISO(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return isoDate(d);
}

function isSet(value: unknown): boolean {
  return value !== undefined && value !== null;
}

/**
 * Build a write payload containing ONLY the fields the caller actually sent, so a
 * partial update can never blank fields it didn't touch. Dates are normalised and
 * the raw value takes precedence over any stale derived `*ISO`.
 */
function normalizeRecord(data: BhytCustomerInput): Record<string, unknown> {
  const src = data as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  const set = (key: string, value: unknown) => {
    if (value !== undefined && !FORBIDDEN_SET_FIELDS.has(key)) out[key] = value;
  };

  if (isSet(src.hoTen)) set('hoTen', String(data.hoTen ?? '').trim());
  if (isSet(src.maBHXH)) set('maBHXH', String(data.maBHXH ?? '').trim());
  if (isSet(src.cccd)) set('cccd', String(data.cccd ?? '').trim());
  if (isSet(src.dienThoai)) set('dienThoai', cleanPhone(data.dienThoai));

  for (const key of PLAIN_STRING_FIELDS) {
    if (isSet(src[key])) set(key, String(data[key as keyof BhytCustomerInput] ?? '').trim());
  }

  for (const [rawKey, isoKey] of DATE_PAIRS) {
    if (isSet(src[rawKey])) {
      const raw = String(data[rawKey as keyof BhytCustomerInput] ?? '').trim();
      set(rawKey, raw);
      set(isoKey, isoDate(raw));
    } else if (isSet(src[isoKey])) {
      set(isoKey, isoDate(data[isoKey as keyof BhytCustomerInput]));
    }
  }

  return out;
}

/** Derive the workflow when the caller changed notes but didn't set a status. */
function withDerivedWorkflow<T extends object>(payload: T): T & Record<string, unknown> {
  const target = payload as T & Record<string, unknown>;
  const rec = target as Record<string, unknown>;
  const touchesWorkflow =
    rec.workflowStatus === undefined &&
    (rec.ghiChu !== undefined || rec.loaiHoSo !== undefined || rec.ngayGoi !== undefined);
  if (touchesWorkflow) {
    rec.workflowStatus = getWorkflow(rec as unknown as BhytCustomerRecord);
  }
  return target;
}

function buildSearchQuery(filters: BhytListFilters): Record<string, unknown> {
  const and: Record<string, unknown>[] = [];

  if (filters.q) {
    const regex = createUnaccentRegex(filters.q.trim());
    and.push({
      $or: [{ hoTen: regex }, { maBHXH: regex }, { cccd: regex }, { dienThoai: regex }, { noiKCB: regex }],
    });
  }
  if (filters.loaiHoSo) and.push({ loaiHoSo: filters.loaiHoSo });

  // Empty `hanTheISO` must never leak into the dated buckets (`''` sorts before
  // every real date in Mongo), so each range is anchored at '0000'.
  const today = isoDate(new Date());
  const cutoff15 = addDaysISO(15);
  const cutoff30 = addDaysISO(30);

  switch (filters.bucket) {
    case 'expired':
      and.push({ hanTheISO: { $gte: '0000', $lt: today } });
      break;
    case 'due15':
      and.push({ hanTheISO: { $gte: today, $lte: cutoff15 } });
      break;
    case 'due30':
      and.push({ hanTheISO: { $gt: cutoff15, $lte: cutoff30 } });
      break;
    case 'active':
      and.push({ hanTheISO: { $gt: cutoff30 } });
      break;
    case 'unknown':
      and.push({ $or: [{ hanTheISO: '' }, { hanTheISO: { $exists: false } }] });
      break;
    default:
      break;
  }

  if (and.length === 0) return {};
  return and.length === 1 ? and[0] : { $and: and };
}

export class BhytService {
  static async getAll(filters: BhytListFilters): Promise<{ items: BhytCustomerRecord[]; pagination: Pagination }> {
    await connectToDatabase();
    const query = buildSearchQuery(filters);
    const { page, pageSize } = filters;

    const sortField = SORT_FIELDS[filters.sortKey || ''] ?? 'hanTheISO';
    const sort: Record<string, 1 | -1> = { [sortField]: filters.sortDir === 'desc' ? -1 : 1 };

    const [totalFiltered, items] = await Promise.all([
      BhytCustomer.countDocuments(query),
      BhytCustomer.find(query).sort(sort).skip((page - 1) * pageSize).limit(pageSize).lean(),
    ]);

    return {
      items: items as unknown as BhytCustomerRecord[],
      pagination: buildPagination(page, pageSize, totalFiltered),
    };
  }

  /** All matching customers (no pagination) — used by the Excel/CSV export. */
  static async listAll(filters: BhytListFilters): Promise<BhytCustomerRecord[]> {
    await connectToDatabase();
    const query = buildSearchQuery(filters);
    const sortField = SORT_FIELDS[filters.sortKey || ''] ?? 'hanTheISO';
    const sort: Record<string, 1 | -1> = { [sortField]: filters.sortDir === 'desc' ? -1 : 1 };
    const items = await BhytCustomer.find(query).sort(sort).lean();
    return items as unknown as BhytCustomerRecord[];
  }

  static async upsert(data: BhytCustomerInput): Promise<{ item: BhytCustomerRecord | null; created: boolean }> {
    await connectToDatabase();
    const payload = withDerivedWorkflow(normalizeRecord(data));

    if (data._id) {
      const item = await BhytCustomer.findByIdAndUpdate(data._id, { $set: payload }, { new: true }).lean();
      return { item: item as unknown as BhytCustomerRecord | null, created: false };
    }

    const item = await BhytCustomer.create({
      ...payload,
      hoTen: String(data.hoTen ?? '').trim(),
      workflowStatus: payload.workflowStatus || getWorkflow(payload as unknown as BhytCustomerRecord),
    });
    return { item: item.toObject() as unknown as BhytCustomerRecord, created: true };
  }

  /**
   * Import a batch: collapse duplicates inside the batch AND against records
   * already in the DB (matched by BHYT/CCCD code + name + birth year).
   */
  static async importMany(
    items: BhytCustomerInput[]
  ): Promise<{ received: number; inserted: number; updated: number; merged: number }> {
    await connectToDatabase();
    const normalized = items.filter((r) => r.hoTen || r.maBHXH).map((r) => normalizeRecord(r));
    const batch = deduplicateCustomers(normalized);

    const cards = batch.records.map((r) => r.maBHXH).filter(Boolean) as string[];
    const ids = batch.records.map((r) => r.cccd).filter(Boolean) as string[];
    const existing: BhytCustomerRecord[] =
      cards.length || ids.length
        ? ((await BhytCustomer.find({
            $or: [{ maBHXH: { $in: cards } }, { cccd: { $in: ids } }],
          }).lean()) as unknown as BhytCustomerRecord[])
        : [];

    const usedExisting = new Set<string>();
    const inserts: Record<string, unknown>[] = [];
    const updates: { id: string; doc: Record<string, unknown> }[] = [];
    let merged = 0;

    for (const incoming of batch.records) {
      const match = existing.find(
        (e) => !usedExisting.has(e._id) && isSameCustomer(e, incoming as unknown as BhytCustomerRecord)
      );
      if (match) {
        usedExisting.add(match._id);
        const doc = withDerivedWorkflow(
          mergeDuplicateRecords(match, incoming as unknown as BhytCustomerRecord)
        );
        updates.push({ id: match._id, doc });
        merged++;
      } else if (incoming.hoTen) {
        inserts.push(withDerivedWorkflow({ ...incoming }));
      }
    }

    if (inserts.length) await BhytCustomer.insertMany(inserts, { ordered: false });
    if (updates.length) {
      await BhytCustomer.bulkWrite(
        updates.map((u) => ({ updateOne: { filter: { _id: u.id }, update: { $set: u.doc } } })),
        { ordered: false }
      );
    }

    return {
      received: items.length,
      inserted: inserts.length,
      updated: updates.length,
      merged: batch.removed + merged,
    };
  }

  static async delete(id: string): Promise<{ success: boolean; message: string }> {
    await connectToDatabase();
    await BhytCustomer.findByIdAndDelete(id);
    return { success: true, message: 'Xóa thành công' };
  }

  static async bulkDelete(ids: string[]): Promise<{ success: boolean; message: string }> {
    await connectToDatabase();
    await BhytCustomer.deleteMany({ _id: { $in: ids } });
    return { success: true, message: `Đã xóa ${ids.length} khách hàng` };
  }

  static async deleteAll(): Promise<{ success: boolean; message: string }> {
    await connectToDatabase();
    await BhytCustomer.deleteMany({});
    return { success: true, message: 'Đã xóa toàn bộ dữ liệu BHYT.' };
  }

  /**
   * Renewal queue. The "already renewed" test depends on derived fields
   * (ghiChu/loaiHoSo/ngayGoi) so it is applied after reading the candidates —
   * this keeps the counts correct instead of trusting a possibly-blank
   * `workflowStatus` column.
   */
  static async getRenewalQueue(
    scope: RenewalScope,
    page: number,
    pageSize: number,
    all = false
  ): Promise<{ items: BhytCustomerRecord[]; pagination: Pagination }> {
    await connectToDatabase();
    const today = isoDate(new Date());
    const cutoff15 = addDaysISO(15);
    const cutoff30 = addDaysISO(30);

    const range: Record<string, unknown> = {};
    switch (scope) {
      case 'expired':
        range.hanTheISO = { $gte: '0000', $lt: today };
        break;
      case 'due15':
        range.hanTheISO = { $gte: today, $lte: cutoff15 };
        break;
      case 'due30':
        range.hanTheISO = { $gte: '0000', $lte: cutoff30 };
        break;
      case 'all':
        range.hanTheISO = { $gte: '0000' };
        break;
      case 'priority':
      default:
        range.hanTheISO = { $gte: '0000', $lte: cutoff15 };
        break;
    }

    const docs = (await BhytCustomer.find(range).sort({ hanTheISO: 1 }).lean()) as unknown as BhytCustomerRecord[];
    const rows = scope === 'all' ? docs : docs.filter((d) => getWorkflow(d) !== 'Đã gia hạn');

    const totalFiltered = rows.length;
    const start = all ? 0 : (page - 1) * pageSize;
    const items = all ? rows : rows.slice(start, start + pageSize);

    return { items, pagination: buildPagination(page, pageSize, totalFiltered) };
  }

  static async getStats(): Promise<{
    total: number;
    counts: Record<ExpiryBucket, number>;
    renewed: number;
    missingPhone: number;
  }> {
    await connectToDatabase();
    const rows = (await BhytCustomer.find(
      {},
      'hanThe hanTheISO workflowStatus dienThoai ghiChu loaiHoSo ngayGoi ngayGoiISO'
    ).lean()) as unknown as BhytCustomerRecord[];

    const counts: Record<ExpiryBucket, number> = { expired: 0, due15: 0, due30: 0, active: 0, unknown: 0 };
    let renewed = 0;
    let missingPhone = 0;

    for (const r of rows) {
      counts[expiryStatus(r)]++;
      if (getWorkflow(r) === 'Đã gia hạn') renewed++;
      if (!cleanPhone(r.dienThoai)) missingPhone++;
    }

    return { total: rows.length, counts, renewed, missingPhone };
  }
}
