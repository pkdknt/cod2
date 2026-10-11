import CskhReferral from '@/models/CskhReferral';
import { connectToDatabase } from '@/lib/mongodb';
import { createUnaccentRegex } from '@/lib/search';
import { buildPagination, type PageParams } from '@/lib/pagination';
import { excelDate, needsCall, normalizeBhyt, todayReferralISO, type ReferralGroup, type ReferralInput, type ReferralRecord } from '@/lib/referral';
import type { Pagination, SortDirection } from '@/lib/types';

export interface ReferralListFilters extends PageParams {
  q?: string;
  from?: string;
  to?: string;
  status?: string;
  callResult?: string;
  sortKey?: string;
  sortDir?: SortDirection;
}

export interface ReferralReport {
  month: string;
  compareMonth: string;
  total: number;
  called: number;
  needCall: number;
  done: number;
  vip: number;
  diff: number;
  byHospital: ReferralGroup[];
  byDoctor: ReferralGroup[];
  byCallResult: ReferralGroup[];
  needList: ReferralRecord[];
}

const SORT_FIELDS: Record<string, string> = {
  name: 'name',
  date: 'date',
  age: 'age',
  admissionNo: 'admissionNo',
  patientCode: 'patientCode',
  phone: 'phone',
  hospital: 'destinationHospital',
  doctor: 'doctor',
  callResult: 'callResult',
  status: 'status',
};

const STRING_FIELDS = [
  'admissionNo', 'patientCode', 'cccd', 'birthDate', 'name', 'gender', 'age', 'address', 'phone',
  'bhyt', 'bhytNo', 'bhytExpiry', 'destinationHospital', 'diagnosis', 'treatment', 'clinic', 'doctor',
  'callDate', 'callResult', 'status', 'note', 'vip',
] as const;

function isSet(v: unknown): boolean {
  return v !== undefined && v !== null;
}

function normalizeRecord(data: ReferralInput): Record<string, unknown> {
  const src = data as Record<string, unknown>;
  const out: Record<string, unknown> = {};

  if (isSet(src.date)) out.date = excelDate(data.date) || excelDate(new Date());
  for (const key of STRING_FIELDS) {
    if (isSet(src[key])) out[key] = String(data[key as keyof ReferralInput] ?? '').trim();
  }
  // Normalise the date-shaped columns so filtering/sorting stays consistent.
  for (const key of ['birthDate', 'bhytExpiry', 'callDate'] as const) {
    if (isSet(src[key]) && out[key]) out[key] = excelDate(out[key]);
  }
  if (isSet(src.bhyt)) out.bhyt = normalizeBhyt(data.bhyt, data.bhytNo);

  return out;
}

function buildQuery(filters: ReferralListFilters): Record<string, unknown> {
  const and: Record<string, unknown>[] = [];
  if (filters.q) {
    const regex = createUnaccentRegex(filters.q.trim());
    and.push({
      $or: [
        { name: regex }, { phone: regex }, { destinationHospital: regex },
        { diagnosis: regex }, { patientCode: regex }, { admissionNo: regex }, { doctor: regex },
      ],
    });
  }
  if (filters.from) and.push({ date: { $gte: filters.from } });
  if (filters.to) and.push({ date: { $lte: filters.to } });
  if (filters.status) and.push({ status: filters.status });
  if (filters.callResult) and.push({ callResult: filters.callResult });

  if (and.length === 0) return {};
  return and.length === 1 ? and[0] : { $and: and };
}

function groupBy(rows: ReferralRecord[], key: keyof ReferralRecord): ReferralGroup[] {
  const map = new Map<string, number>();
  for (const r of rows) {
    const k = String(r[key] ?? '').trim() || 'Chưa có';
    map.set(k, (map.get(k) ?? 0) + 1);
  }
  const total = rows.length || 1;
  return [...map.entries()]
    .map(([k, count]) => ({ key: k, count, pct: Math.round((count * 100) / total) }))
    .sort((a, b) => b.count - a.count);
}

export class ReferralService {
  static async getAll(
    filters: ReferralListFilters
  ): Promise<{ items: ReferralRecord[]; pagination: Pagination }> {
    await connectToDatabase();
    const query = buildQuery(filters);
    const { page, pageSize } = filters;

    const sortField = SORT_FIELDS[filters.sortKey || ''] ?? 'date';
    const sort: Record<string, 1 | -1> = { [sortField]: filters.sortDir === 'asc' ? 1 : -1 };

    const [totalFiltered, items] = await Promise.all([
      CskhReferral.countDocuments(query),
      CskhReferral.find(query).sort(sort).skip((page - 1) * pageSize).limit(pageSize).lean(),
    ]);

    return {
      items: items as unknown as ReferralRecord[],
      pagination: buildPagination(page, pageSize, totalFiltered),
    };
  }

  static async upsert(data: ReferralInput): Promise<{ item: ReferralRecord | null; created: boolean }> {
    await connectToDatabase();
    const payload = normalizeRecord(data);

    if (data._id) {
      const item = await CskhReferral.findByIdAndUpdate(data._id, { $set: payload }, { new: true }).lean();
      return { item: item as unknown as ReferralRecord | null, created: false };
    }
    const item = await CskhReferral.create({
      callResult: 'Chưa gọi',
      status: 'Mới',
      vip: 'Không',
      bhyt: 'Không',
      ...payload,
      date: (payload.date as string) || todayReferralISO(),
      name: String(data.name ?? '').trim(),
    });
    return { item: item.toObject() as unknown as ReferralRecord, created: true };
  }

  static async importMany(
    items: ReferralInput[]
  ): Promise<{ received: number; inserted: number; skipped: number }> {
    await connectToDatabase();
    const docs = items
      .filter((r) => r.name || r.patientCode || r.admissionNo || r.phone)
      .map((r) => ({
        callResult: 'Chưa gọi',
        status: 'Mới',
        vip: 'Không',
        bhyt: 'Không',
        ...normalizeRecord(r),
      }));

    if (docs.length === 0) return { received: items.length, inserted: 0, skipped: items.length };

    await CskhReferral.insertMany(docs, { ordered: false });
    return { received: items.length, inserted: docs.length, skipped: items.length - docs.length };
  }

  static async delete(id: string): Promise<{ success: boolean; message: string }> {
    await connectToDatabase();
    await CskhReferral.findByIdAndDelete(id);
    return { success: true, message: 'Đã xóa hồ sơ.' };
  }

  static async bulkDelete(ids: string[]): Promise<{ success: boolean; message: string }> {
    await connectToDatabase();
    await CskhReferral.deleteMany({ _id: { $in: ids } });
    return { success: true, message: `Đã xóa ${ids.length} hồ sơ.` };
  }

  static async getReport(
    month: string,
    compareMonth: string,
    doctor?: string,
    hospital?: string
  ): Promise<ReferralReport> {
    await connectToDatabase();
    const matchBase: Record<string, unknown> = {};
    if (doctor) matchBase.doctor = doctor;
    if (hospital) matchBase.destinationHospital = hospital;

    const [all, compare] = await Promise.all([
      CskhReferral.find({ ...matchBase, date: { $regex: `^${month}` } }).lean(),
      CskhReferral.find({ ...matchBase, date: { $regex: `^${compareMonth}` } }).lean(),
    ]);

    const rows = all as unknown as ReferralRecord[];
    return {
      month,
      compareMonth,
      total: rows.length,
      called: rows.filter((r) => r.callResult && r.callResult !== 'Chưa gọi').length,
      needCall: rows.filter(needsCall).length,
      done: rows.filter((r) => r.status === 'Hoàn tất').length,
      vip: rows.filter((r) => r.vip === 'Có').length,
      diff: rows.length - (compare as unknown[]).length,
      byHospital: groupBy(rows, 'destinationHospital'),
      byDoctor: groupBy(rows, 'doctor'),
      byCallResult: groupBy(rows, 'callResult'),
      needList: rows.filter(needsCall).slice(0, 80),
    };
  }

  static async periods(): Promise<{ months: string[]; doctors: string[]; hospitals: string[] }> {
    await connectToDatabase();
    const rows = (await CskhReferral.find({}, 'date doctor destinationHospital').lean()) as unknown as ReferralRecord[];
    const months = [...new Set(rows.map((r) => String(r.date ?? '').slice(0, 7)).filter(Boolean))].sort().reverse();
    const doctors = [...new Set(rows.map((r) => String(r.doctor ?? '').trim()).filter(Boolean))].sort();
    const hospitals = [...new Set(rows.map((r) => String(r.destinationHospital ?? '').trim()).filter(Boolean))].sort();
    return { months, doctors, hospitals };
  }
}
