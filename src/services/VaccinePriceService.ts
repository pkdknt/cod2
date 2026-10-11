import VaccinePrice from '@/models/VaccinePrice';
import { connectToDatabase } from '@/lib/mongodb';
import { createUnaccentRegex } from '@/lib/search';
import { buildPagination, type PageParams } from '@/lib/pagination';
import { DEFAULT_VACCINES } from '@/lib/defaultVaccinePrices';
import type { Pagination, VaccinePriceInput, VaccinePriceRecord } from '@/lib/types';

export interface VaccinePriceFilters extends PageParams {
  q?: string;
}

interface NormalizedPrice {
  name: string;
  unit: string;
  price: number;
  checkupPrice: number;
}

function normalize(data: VaccinePriceInput | NormalizedPrice): NormalizedPrice {
  return {
    name: String(data.name).trim(),
    unit: String(data.unit || 'Mũi').trim(),
    price: Number(data.price) || 0,
    checkupPrice: Number(data.checkupPrice) || 0,
  };
}

export class VaccinePriceService {
  static async getAll(
    filters: VaccinePriceFilters
  ): Promise<{ items: VaccinePriceRecord[]; pagination: Pagination }> {
    await connectToDatabase();
    const query = filters.q ? { name: createUnaccentRegex(filters.q.trim()) } : {};
    const { page, pageSize } = filters;

    const [totalFiltered, items] = await Promise.all([
      VaccinePrice.countDocuments(query),
      VaccinePrice.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean(),
    ]);

    return {
      items: items as unknown as VaccinePriceRecord[],
      pagination: buildPagination(page, pageSize, totalFiltered),
    };
  }

  static async upsert(
    data: VaccinePriceInput
  ): Promise<{ item: VaccinePriceRecord | null; created: boolean }> {
    await connectToDatabase();

    if (data.id) {
      // Only touch the fields the caller sent so a partial update can't reset the rest.
      const update: Record<string, unknown> = {};
      if (data.name !== undefined) update.name = String(data.name).trim();
      if (data.unit !== undefined) update.unit = String(data.unit).trim() || 'Mũi';
      if (data.price !== undefined) update.price = Number(data.price) || 0;
      if (data.checkupPrice !== undefined) update.checkupPrice = Number(data.checkupPrice) || 0;
      const item = await VaccinePrice.findByIdAndUpdate(data.id, { $set: update }, { new: true }).lean();
      return { item: item as unknown as VaccinePriceRecord | null, created: false };
    }

    const item = await VaccinePrice.create(normalize(data));
    return { item: item.toObject() as unknown as VaccinePriceRecord, created: true };
  }

  /** Upsert a list of prices by name in a single round-trip. */
  static async bulkUpsert(
    items: VaccinePriceInput[]
  ): Promise<{ created: number; updated: number }> {
    await connectToDatabase();
    const ops = items
      .filter((item) => item.name && String(item.name).trim())
      .map((item) => ({
        updateOne: {
          filter: { name: String(item.name).trim() },
          update: { $set: normalize(item) },
          upsert: true,
        },
      }));

    if (ops.length === 0) return { created: 0, updated: 0 };

    const result = await VaccinePrice.bulkWrite(ops, { ordered: false });
    return { created: result.upsertedCount, updated: result.matchedCount };
  }

  static async seed(): Promise<{ created: number; updated: number }> {
    return this.bulkUpsert(DEFAULT_VACCINES as VaccinePriceInput[]);
  }

  static async delete(id: string): Promise<{ success: boolean; message: string }> {
    await connectToDatabase();
    await VaccinePrice.findByIdAndDelete(id);
    return { success: true, message: 'Đã xóa vắc xin thành công' };
  }

  static async bulkDelete(ids: string[]): Promise<{ success: boolean; message: string }> {
    await connectToDatabase();
    await VaccinePrice.deleteMany({ _id: { $in: ids } });
    return { success: true, message: `Đã xóa ${ids.length} vắc xin thành công` };
  }

  static async deleteAll(): Promise<{ success: boolean; message: string }> {
    await connectToDatabase();
    await VaccinePrice.deleteMany({});
    return { success: true, message: 'Đã xóa toàn bộ bảng giá vắc xin.' };
  }
}
