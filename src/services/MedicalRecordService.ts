import { fetchJson } from '@/lib/apiUtils';

export interface MedicalRecordData {
  _id?: string;
  recordType: 'ngoai-tru' | 'bia-rhm' | 'rhm' | 'yhct';
  soNgoaiTru?: string;
  soLuuTru?: string;
  maBenhNhan?: string;
  hoTen: string;
  namSinh?: string;
  tuoi?: string;
  gioiTinh?: string;
  diaChi?: string;
  bhytDen?: string;
  soTheBHYT?: string;
  dienThoai?: string;
  denKhamLuc?: string;
  cccd?: string;
  ngheNghiep?: string;
  danToc?: string;
  ngoaiKieu?: string;
  noiLamViec?: string;
  doiTuong?: string;
  nguoiNha?: string;
  lyDo?: string;
  quaTrinhBenhLy?: string;
  tienSuBanThan?: string;
  giaDinh?: string;
  chanDoanNoiGioiThieu?: string;
  toanThan?: string;
  mach?: string;
  nhietDo?: string;
  huyetAp?: string;
  nhipTho?: string;
  canNang?: string;
  chanDoan?: string;
  xuTri?: string;
  namKy?: string;
  ghiChu?: string;
  createdAt?: string;
  updatedAt?: string;
}

export class MedicalRecordService {
  /**
   * Fetches all medical records using optional search query, type, and pagination
   */
  public static async getAll(filters: {
    q?: string;
    recordType?: string;
    page?: number;
    pageSize?: number;
  }): Promise<{ items: MedicalRecordData[]; pagination: any }> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        params.append(key, String(val));
      }
    });

    return fetchJson(`/api/benh-an?${params.toString()}`);
  }

  /**
   * Creates a new medical record
   */
  public static async create(data: MedicalRecordData): Promise<{ success: boolean; item: MedicalRecordData }> {
    return fetchJson('/api/benh-an', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  }

  /**
   * Updates an existing medical record by ID
   */
  public static async update(id: string, data: Partial<MedicalRecordData>): Promise<{ success: boolean; item: MedicalRecordData }> {
    return fetchJson(`/api/benh-an/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  }

  /**
   * Deletes a medical record by ID
   */
  public static async delete(id: string): Promise<{ success: boolean; message: string }> {
    return fetchJson(`/api/benh-an/${id}`, {
      method: 'DELETE'
    });
  }

  /**
   * Imports Excel parsed medical records
   */
  public static async importExcel(items: any[]): Promise<{ success: boolean; message: string }> {
    return fetchJson('/api/benh-an/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items })
    });
  }

  /**
   * Bulk deletes records by IDs
   */
  public static async bulkDelete(ids: string[]): Promise<{ success: boolean; message: string }> {
    return fetchJson('/api/benh-an/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete', ids })
    });
  }
}
