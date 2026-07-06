import { fetchJson } from '@/lib/apiUtils';

export interface TheXanhCustomerData {
  _id?: string;
  code: string;
  name: string;
  birthYear?: string;
  gender?: string;
  address?: string;
  unit?: string;
  examDate?: string;
  signer?: string;
  signerTitle?: string;
  conclusion?: string;
  createdAt?: string;
  updatedAt?: string;
}

export class TheXanhService {
  /**
   * Fetches all Green Card records using filters
   */
  public static async getAll(filters: {
    q?: string;
    page?: number;
    pageSize?: number;
  }): Promise<{ items: TheXanhCustomerData[]; pagination: any }> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        params.append(key, String(val));
      }
    });

    return fetchJson(`/api/the-xanh?${params.toString()}`);
  }

  /**
   * Creates a new record
   */
  public static async create(data: TheXanhCustomerData): Promise<{ success: boolean; item: TheXanhCustomerData }> {
    return fetchJson('/api/the-xanh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  }

  /**
   * Updates an existing record
   */
  public static async update(id: string, data: Partial<TheXanhCustomerData>): Promise<{ success: boolean; item: TheXanhCustomerData }> {
    return fetchJson(`/api/the-xanh/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  }

  /**
   * Deletes a record
   */
  public static async delete(id: string): Promise<{ success: boolean; message: string }> {
    return fetchJson(`/api/the-xanh/${id}`, {
      method: 'DELETE'
    });
  }

  /**
   * Imports custom parsed items from SheetJS
   */
  public static async importExcel(items: any[]): Promise<{ success: boolean; message: string }> {
    return fetchJson('/api/the-xanh/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items })
    });
  }

  /**
   * Performs bulk delete
   */
  public static async bulkDelete(ids: string[]): Promise<{ success: boolean; message: string }> {
    return fetchJson('/api/the-xanh/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete', ids })
    });
  }
}
