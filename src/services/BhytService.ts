import { fetchJson } from '@/lib/apiUtils';

export interface BhytCustomerData {
  _id?: string;
  name: string;
  bhxh: string; // Số thẻ BHYT / Mã BHXH
  cccd?: string;
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
  createdAt?: string;
  updatedAt?: string;
}

export class BhytService {
  /**
   * Fetches BHYT customers from the API using filter parameters
   */
  public static async getAll(filters: {
    q?: string;
    statusFilter?: string;
    callFilter?: string;
    renewFilter?: string;
    sortBy?: string;
    page?: number;
    pageSize?: number;
  }): Promise<{ items: BhytCustomerData[]; pagination: any; stats: any }> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        params.append(key, String(val));
      }
    });

    return fetchJson(`/api/bhyt?${params.toString()}`);
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
}
