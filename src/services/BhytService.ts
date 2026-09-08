import { fetchJson } from '@/lib/apiUtils';
import { ICrudService, IBulkOperationService, IImportExportService } from './interfaces/IBaseService';

export interface BhytCustomerData {
  _id?: string;
  name: string;
  bhxh: string; // Số thẻ BHYT / Mã BHXH
  cccd?: string;
  cccdImage?: string;     // (Legacy) single image
  cccdImages?: string[];  // Multi-image array
  dob?: string;
  gender?: string;
  birthPlace?: string;
  kcb?: string;
  receiptDate?: string;
  receiptNo?: string;
  amount?: string;
  support?: string;
  months?: string;
  staffCode?: string;
  phone?: string;
  expiry?: string;
  needCall?: string;
  renewType?: string;
  callDate?: string;
  relation?: string;
  note?: string;
  contactStatus?: string;
  workflowStatus?: string; // 'Chưa liên hệ' | 'Đã gửi tin' | 'Đã gọi' | 'Hẹn liên hệ lại' | 'Đã gia hạn' | 'Không liên lạc được' | 'Không có nhu cầu'
  createdAt?: string;
  updatedAt?: string;
}

export interface BhytFilters {
  q?: string;
  statusFilter?: string;
  callFilter?: string;
  renewFilter?: string;
  workflowFilter?: string;
  phoneFilter?: string;
  sortBy?: string;
  sortDir?: string;
  page?: number;
  pageSize?: number;
}

export class BhytService 
  implements 
    ICrudService<BhytCustomerData, BhytFilters>, 
    IBulkOperationService<BhytCustomerData>, 
    IImportExportService<BhytCustomerData> 
{
  /**
   * Fetches BHYT customers from the API using filter parameters
   */
  public static async getAll(filters: BhytFilters): Promise<{ items: BhytCustomerData[]; pagination: any; stats?: any }> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        params.append(key, String(val));
      }
    });

    return fetchJson(`/api/bhyt?${params.toString()}`);
  }

  /**
   * Fetches BHYT statistics for dashboard cards
   */
  public static async getStats(): Promise<any> {
    return fetchJson('/api/bhyt/stats');
  }

  /**
   * Creates a new BHYT customer record
   */
  public static async create(data: BhytCustomerData): Promise<{ success: boolean; item: BhytCustomerData }> {
    return fetchJson('/api/bhyt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  }

  /**
   * Updates an existing BHYT customer record
   */
  public static async update(id: string, data: Partial<BhytCustomerData>): Promise<{ success: boolean; item: BhytCustomerData }> {
    return fetchJson(`/api/bhyt/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  }

  /**
   * Deletes a BHYT customer record
   */
  public static async delete(id: string): Promise<{ success: boolean; message: string }> {
    return fetchJson(`/api/bhyt/${id}`, {
      method: 'DELETE'
    });
  }

  /**
   * Performs bulk operations (e.g. delete)
   */
  public static async bulkDelete(ids: string[]): Promise<{ success: boolean; message: string }> {
    return fetchJson('/api/bhyt/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete', ids })
    });
  }

  /**
   * Updates multiple customers with a given status or call result
   */
  public static async bulkUpdate(ids: string[], field: string, val: string): Promise<void> {
    await Promise.all(
      ids.map(id => this.update(id, { [field]: val }))
    );
  }

  /**
   * Imports custom parsed items from SheetJS
   */
  public static async importExcel(items: any[]): Promise<{ success: boolean; message: string }> {
    return fetchJson('/api/bhyt/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items })
    });
  }

  /**
   * Exports ALL customers (or filtered list) to Excel including embedded CCCD images.
   */
  public static async exportAllToExcel(
    filters: BhytFilters = {},
    onProgress?: (current: number, total: number) => void
  ): Promise<void> {
    const { exportBhytCustomersToExcel } = await import('@/lib/excelBhytExport');
    
    // Fetch all matching records without pagination limit (up to 10,000)
    const exportFilters = { ...filters, page: 1, pageSize: 10000 };
    const res = await this.getAll(exportFilters);
    const items = res.items || [];

    if (items.length === 0) {
      throw new Error('Không có dữ liệu khách hàng nào để xuất file Excel.');
    }

    await exportBhytCustomersToExcel(items, 'Danh_sach_BHYT', onProgress);
  }

  // Non-static implementations of interface if instantiation is required, but keeping static methods for standard use
  async getAll(filters: BhytFilters) { return BhytService.getAll(filters); }
  async create(data: BhytCustomerData) { return BhytService.create(data); }
  async update(id: string, data: Partial<BhytCustomerData>) { return BhytService.update(id, data); }
  async delete(id: string) { return BhytService.delete(id); }
  async bulkDelete(ids: string[]) { return BhytService.bulkDelete(ids); }
  async importExcel(items: any[]) { return BhytService.importExcel(items); }
}
