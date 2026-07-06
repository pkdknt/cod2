import { fetchJson } from '@/lib/apiUtils';

export interface BhytSoCaData {
  _id?: string;
  date: string;
  type: 'Mua mới' | 'Gia hạn';
  qty: number;
  note?: string;
  createdAt?: string;
  updatedAt?: string;
}

export class BhytSoCaService {
  /**
   * Fetches BHYT counter entries with pagination and queries
   */
  public static async getAll(filters: {
    q?: string;
    monthFilter?: string;
    typeFilter?: string;
    page?: number;
    pageSize?: number;
  }): Promise<{ items: BhytSoCaData[]; pagination: any; stats?: any }> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        params.append(key, String(val));
      }
    });

    return fetchJson(`/api/bhyt/so-ca?${params.toString()}`);
  }

  /**
   * Creates a new BHYT counter entry
   */
  public static async create(data: BhytSoCaData): Promise<{ success: boolean; item: BhytSoCaData }> {
    return fetchJson('/api/bhyt/so-ca', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  }

  /**
   * Updates an existing entry by ID
   */
  public static async update(id: string, data: Partial<BhytSoCaData>): Promise<{ success: boolean; item: BhytSoCaData }> {
    return fetchJson(`/api/bhyt/so-ca/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  }

  /**
   * Deletes an entry by ID
   */
  public static async delete(id: string): Promise<{ success: boolean; message: string }> {
    return fetchJson(`/api/bhyt/so-ca/${id}`, {
      method: 'DELETE'
    });
  }

  /**
   * Imports Excel parsed rows
   */
  public static async importExcel(items: any[]): Promise<{ success: boolean; message: string }> {
    return fetchJson('/api/bhyt/so-ca/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items })
    });
  }

  /**
   * Bulk actions
   */
  public static async bulkAction(action: 'delete' | 'clearAll', ids?: string[]): Promise<{ success: boolean; message: string }> {
    return fetchJson('/api/bhyt/so-ca/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, ids })
    });
  }
}
