import VaccineProtocolCustom from '@/models/VaccineProtocolCustom';
import { connectToDatabase } from '@/lib/mongodb';
import type { VaccineProtocol } from '@/lib/vaccineData';

export interface VaccineProtocolInput {
  id?: string | null;
  vaccine: string;
  disease?: string;
  object: string;
  schedule: string;
  route?: string;
}

function toProtocol(doc: {
  _id: unknown;
  vaccine: string;
  disease?: string;
  object: string;
  schedule: string;
  route?: string;
  sourceRow?: string;
}): VaccineProtocol {
  return {
    id: String(doc._id),
    vaccine: doc.vaccine,
    disease: doc.disease || '',
    object: doc.object,
    schedule: doc.schedule,
    route: doc.route || '',
    sourceRow: doc.sourceRow || 'Tuỳ chỉnh',
  };
}

export class VaccineProtocolService {
  /** All custom protocols, shaped like the built-in `DATA.protocols`. */
  static async list(): Promise<VaccineProtocol[]> {
    await connectToDatabase();
    const docs = await VaccineProtocolCustom.find().sort({ vaccine: 1 }).lean();
    return docs.map((d) => toProtocol(d as unknown as Parameters<typeof toProtocol>[0]));
  }

  static async upsert(data: VaccineProtocolInput): Promise<VaccineProtocol> {
    await connectToDatabase();
    const payload = {
      vaccine: String(data.vaccine).trim(),
      disease: data.disease ? String(data.disease).trim() : '',
      object: String(data.object).trim(),
      schedule: String(data.schedule).trim(),
      route: data.route ? String(data.route).trim() : '',
      sourceRow: 'Tuỳ chỉnh',
    };

    if (data.id) {
      const doc = await VaccineProtocolCustom.findByIdAndUpdate(data.id, { $set: payload }, { new: true }).lean();
      if (!doc) throw new Error('Không tìm thấy phác đồ tùy chỉnh.');
      return toProtocol(doc as unknown as Parameters<typeof toProtocol>[0]);
    }

    const doc = await VaccineProtocolCustom.create(payload);
    return toProtocol(doc.toObject() as unknown as Parameters<typeof toProtocol>[0]);
  }

  static async delete(id: string): Promise<{ success: boolean; message: string }> {
    await connectToDatabase();
    await VaccineProtocolCustom.findByIdAndDelete(id);
    return { success: true, message: 'Đã xóa phác đồ tùy chỉnh.' };
  }
}
