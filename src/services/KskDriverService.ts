import { fetchJson } from '@/lib/apiUtils';

export interface KskDriverExamData {
  _id?: string;
  soPhieu: string;
  hoTen: string;
  gioiTinh?: string;
  ngaySinh?: string;
  tuoi?: string;
  cccd?: string;
  capNgay?: string;
  capTai?: string;
  hoKhau?: string;
  hangLaiXe?: string;
  ngayKham?: string;
  ngayKetLuan?: string;
  ketLuan?: string;
  nguoiKetLuan?: string;
  tienSuGiaDinh?: string;
  benhSuBanThan?: string;
  dangDieuTri?: string;

  // Clinical
  tamThan?: string;
  tamThanKL?: string;
  thanKinh?: string;
  thanKinhKL?: string;
  matKhongKinhP?: string;
  matKhongKinhT?: string;
  matCoKinhP?: string;
  matCoKinhT?: string;
  matHaiMatKhongKinh?: string;
  matHaiMatCoKinh?: string;
  sacGiac?: string;
  matBenh?: string;
  matKL?: string;
  tmh?: string;
  tmhKL?: string;
  mach?: string;
  huyetAp?: string;
  timMach?: string;
  timMachKL?: string;
  hoHap?: string;
  hoHapKL?: string;
  coXuongKhop?: string;
  coXuongKhopKL?: string;
  noiTiet?: string;
  noiTietKL?: string;
  maTuyKQ?: string;
  xetNghiemKhacKQ?: string;
  xetNghiemKhacKL?: string;

  bool: Record<string, string>;
  photo?: string;
  createdAt?: string;
  updatedAt?: string;
}

export class KskDriverService {
  /**
   * Fetches driver KSK records from the API using parameters
   */
  public static async getAll(filters: {
    q?: string;
    page?: number;
    pageSize?: number;
  }): Promise<{ items: KskDriverExamData[]; pagination: any }> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        params.append(key, String(val));
      }
    });

    return fetchJson(`/api/ksk-driver?${params.toString()}`);
  }

  /**
   * Creates a new driver health examination record
   */
  public static async create(data: KskDriverExamData): Promise<{ success: boolean; item: KskDriverExamData }> {
    return fetchJson('/api/ksk-driver', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  }

  /**
   * Updates an existing driver health exam record
   */
  public static async update(id: string, data: Partial<KskDriverExamData>): Promise<{ success: boolean; item: KskDriverExamData }> {
    return fetchJson(`/api/ksk-driver/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  }

  /**
   * Deletes a driver health exam record
   */
  public static async delete(id: string): Promise<{ success: boolean; message: string }> {
    return fetchJson(`/api/ksk-driver/${id}`, {
      method: 'DELETE'
    });
  }

  /**
   * Performs bulk Excel importing
   */
  public static async importExcel(items: any[]): Promise<{ success: boolean; message: string }> {
    return fetchJson('/api/ksk-driver/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items })
    });
  }
}
