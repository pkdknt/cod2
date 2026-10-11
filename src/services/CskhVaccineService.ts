import CskhVaccine from '@/models/CskhVaccine';
import { connectToDatabase } from '@/lib/mongodb';
import { createUnaccentRegex } from '@/lib/search';
import { buildPagination, type PageParams } from '@/lib/pagination';
import { buildReminderRows, filterReminderRows, sortReminderRows } from '@/lib/schedule';
import { emptySix, falseSix } from '@/lib/types';
import { norm } from '@/lib/vaccineData';
import type {
  Pagination,
  PatientInput,
  PatientRecord,
  ReminderFilter,
  ReminderRow,
  SortDirection,
} from '@/lib/types';

export interface CskhListFilters extends PageParams {
  q?: string;
  vaccine?: string;
  sortKey?: string;
  sortDir?: SortDirection;
}

export interface ReminderParams extends PageParams {
  filter: ReminderFilter;
  q?: string;
  sortKey?: string;
  sortDir?: SortDirection;
}

const SORT_FIELDS: Record<string, string> = {
  name: 'patientName',
  phone: 'phone',
  dob: 'dob',
  vaccine: 'vaccine',
  protocol: 'protocolId',
};

/** Every field the client needs — must stay in sync with `PatientRecord`. */
const PATIENT_FIELDS =
  'patientCode patientName phone dob gender address vaccine protocolId dates dueOverrides notes called messaged';

function buildSearchQuery(q?: string): Record<string, unknown> {
  const query: Record<string, unknown> = {};
  if (q) {
    const regex = createUnaccentRegex(q.trim());
    query.$or = [{ patientName: regex }, { phone: regex }, { vaccine: regex }];
  }
  return query;
}

function buildListQuery(q?: string, vaccine?: string): Record<string, unknown> {
  const query = buildSearchQuery(q);
  if (vaccine) {
    if (vaccine.includes(' - ')) {
      const brand = vaccine.split(' - ').slice(-1)[0];
      query.$and = [{ $or: [{ vaccine }, { vaccine: brand }] }];
    } else {
      query.vaccine = vaccine;
    }
  }
  return query;
}

function buildSort(sortKey?: string, sortDir?: SortDirection): Record<string, 1 | -1> {
  const field = SORT_FIELDS[sortKey || ''];
  if (!field) return { updatedAt: -1 };
  return { [field]: sortDir === 'desc' ? -1 : 1 };
}

/**
 * Build a `$set` containing only the fields the caller actually sent, so an
 * update never overwrites untouched fields with defaults (e.g. resetting the
 * "Đã gọi"/"Đã nhắn" flags when the planner saves).
 * Empty strings are treated as an explicit clear.
 */
function buildUpdatePayload(data: PatientInput): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  const set = (key: string, value: unknown) => {
    if (value !== undefined) payload[key] = value;
  };

  set('patientCode', data.patientCode !== undefined ? String(data.patientCode).trim() : undefined);
  set('patientName', data.patientName ? data.patientName.trim() : undefined);
  set('phone', data.phone !== undefined ? String(data.phone).trim() : undefined);
  set('dob', data.dob);
  set('gender', data.gender);
  set('address', data.address !== undefined ? String(data.address).trim() : undefined);
  set('vaccine', data.vaccine);
  set('protocolId', data.protocolId);
  set('dates', data.dates);
  set('dueOverrides', data.dueOverrides);
  set('notes', data.notes);
  set('called', data.called);
  set('messaged', data.messaged);

  return payload;
}

export class CskhVaccineService {
  static async getAll(filters: CskhListFilters): Promise<{ items: PatientRecord[]; pagination: Pagination }> {
    await connectToDatabase();
    const query = buildListQuery(filters.q, filters.vaccine);
    const { page, pageSize } = filters;

    const [totalFiltered, items] = await Promise.all([
      CskhVaccine.countDocuments(query),
      CskhVaccine.find(query)
        .select(PATIENT_FIELDS)
        .sort(buildSort(filters.sortKey, filters.sortDir))
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean(),
    ]);

    return {
      items: items as unknown as PatientRecord[],
      pagination: buildPagination(page, pageSize, totalFiltered),
    };
  }

  static async upsert(data: PatientInput): Promise<{ item: PatientRecord | null; created: boolean }> {
    await connectToDatabase();
    const payload = buildUpdatePayload(data);

    if (data.id) {
      const item = await CskhVaccine.findByIdAndUpdate(data.id, { $set: payload }, { new: true }).lean();
      return { item: item as unknown as PatientRecord | null, created: false };
    }

    const item = await CskhVaccine.create({
      ...payload,
      patientName: data.patientName.trim(),
      vaccine: data.vaccine,
      protocolId: data.protocolId,
      dates: data.dates ?? emptySix(),
      dueOverrides: data.dueOverrides ?? emptySix(),
      notes: data.notes ?? emptySix(),
      called: data.called ?? falseSix(),
      messaged: data.messaged ?? falseSix(),
    });
    return { item: item.toObject() as unknown as PatientRecord, created: true };
  }

  /** Bulk import: upsert-by-key in a single round-trip, skipping existing records. */
  static async importMany(
    items: PatientInput[]
  ): Promise<{ received: number; inserted: number; matched: number }> {
    await connectToDatabase();
    const seenCode = new Set<string>();
    const seenName = new Set<string>();
    const ops: Parameters<typeof CskhVaccine.bulkWrite>[0] = [];

    for (const item of items) {
      if (!item.patientName || !item.vaccine || !item.protocolId) continue;

      const pCode = item.patientCode ? String(item.patientCode).trim() : '';
      const pName = String(item.patientName).trim();
      const pDob = item.dob || '';
      const pVaccine = String(item.vaccine).trim();

      // Track both identities so a row with a code and one without can't
      // insert the same person twice within the same batch.
      const codeKey = `${pCode}|${pDob}|${pVaccine}`;
      const nameKey = `${norm(pName)}|${pDob}|${pVaccine}`;
      if (pCode && seenCode.has(codeKey)) continue;
      if (seenName.has(nameKey)) continue;
      if (pCode) seenCode.add(codeKey);
      seenName.add(nameKey);

      // Match existing records on either identity.
      const orConds: Record<string, unknown>[] = [{ patientName: pName }];
      if (pCode) orConds.unshift({ patientCode: pCode });
      const filter = { dob: pDob, vaccine: pVaccine, $or: orConds };

      ops.push({
        updateOne: {
          filter,
          update: {
            $setOnInsert: {
              patientCode: pCode || undefined,
              patientName: pName,
              phone: item.phone ? String(item.phone).trim() : undefined,
              dob: pDob,
              gender: item.gender || '',
              address: item.address ? String(item.address).trim() : undefined,
              vaccine: pVaccine,
              protocolId: String(item.protocolId).trim(),
              dates: item.dates || emptySix(),
              dueOverrides: item.dueOverrides || emptySix(),
              notes: item.notes || emptySix(),
              called: item.called || falseSix(),
              messaged: item.messaged || falseSix(),
            },
          },
          upsert: true,
        },
      });
    }

    if (ops.length === 0) {
      return { received: items.length, inserted: 0, matched: 0 };
    }

    const result = await CskhVaccine.bulkWrite(ops, { ordered: false });
    return {
      received: items.length,
      inserted: result.upsertedCount,
      matched: result.matchedCount,
    };
  }

  static async delete(id: string): Promise<{ success: boolean; message: string }> {
    await connectToDatabase();
    await CskhVaccine.findByIdAndDelete(id);
    return { success: true, message: 'Xóa thành công' };
  }

  static async bulkDelete(ids: string[]): Promise<{ success: boolean; message: string }> {
    await connectToDatabase();
    await CskhVaccine.deleteMany({ _id: { $in: ids } });
    return { success: true, message: 'Đã xóa các mục đã chọn' };
  }

  static async deleteAll(): Promise<{ success: boolean; message: string }> {
    await connectToDatabase();
    await CskhVaccine.deleteMany({});
    return { success: true, message: 'Đã xóa toàn bộ danh sách thành công!' };
  }

  /**
   * Compute upcoming-dose reminders on the server so the client never has to
   * download the entire patient collection.
   */
  static async getReminders(
    params: ReminderParams
  ): Promise<{ items: ReminderRow[]; pagination: Pagination }> {
    await connectToDatabase();

    const patients = await CskhVaccine.find(buildSearchQuery(params.q))
      .select(PATIENT_FIELDS)
      .lean();

    let rows = buildReminderRows(patients as unknown as PatientRecord[], params.filter);
    rows = filterReminderRows(rows, params.q || '');
    rows = sortReminderRows(rows, params.sortKey || 'due', params.sortDir || 'asc');

    const totalFiltered = rows.length;
    const start = (params.page - 1) * params.pageSize;
    const pageItems = rows.slice(start, start + params.pageSize);

    return {
      items: pageItems,
      pagination: buildPagination(params.page, params.pageSize, totalFiltered),
    };
  }
}
