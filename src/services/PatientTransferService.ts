import { fetchJson } from '@/lib/apiUtils';

export interface PatientTransferData {
  _id?: string;
  date?: string;
  admissionNo?: string;
  patientCode?: string;
  cccd?: string;
  name: string;
  birthDate?: string;
  gender?: string;
  age?: number;
  phone?: string;
  bhyt?: string;
  bhytNo?: string;
  bhytExpiry?: string;
  destinationHospital?: string;
  clinic?: string;
  doctor?: string;
  address?: string;
  diagnosis?: string;
  treatment?: string;
  callDate?: string;
  callResult?: string;
  status?: string;
  vip?: string;
  note?: string;
  createdAt?: string;
  updatedAt?: string;
}

export class PatientTransferService {
  /**
   * Fetch all patient transfers matching query filters and pagination
   */
  public static async getAll(filters: {
    q?: string;
    fromDate?: string;
    toDate?: string;
    statusFilter?: string;
    callFilter?: string;
    sortBy?: string;
    sortDir?: string;
    page?: number;
    pageSize?: number;
  }): Promise<{ items: PatientTransferData[]; pagination: any }> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        params.append(key, String(val));
      }
    });

    return fetchJson(`/api/chuyen-vien?${params.toString()}`);
  }

  /**
   * Create a new patient transfer record
   */
  public static async create(data: PatientTransferData): Promise<{ success: boolean; item: PatientTransferData }> {
    return fetchJson('/api/chuyen-vien', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  }

  /**
   * Update an existing patient transfer record by ID
   */
  public static async update(id: string, data: Partial<PatientTransferData>): Promise<{ success: boolean; item: PatientTransferData }> {
    return fetchJson(`/api/chuyen-vien/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  }

  /**
   * Delete a patient transfer record by ID
   */
  public static async delete(id: string): Promise<{ success: boolean; message: string }> {
    return fetchJson(`/api/chuyen-vien/${id}`, {
      method: 'DELETE'
    });
  }

  /**
   * Bulk deletes transfer records by IDs
   */
  public static async bulkDelete(ids: string[]): Promise<{ success: boolean; message: string }> {
    return fetchJson('/api/chuyen-vien/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete', ids })
    });
  }

  /**
   * Bulk updates call status for selected transfer records
   */
  public static async bulkUpdateCall(ids: string[], callResult: string): Promise<{ success: boolean; message: string }> {
    return fetchJson('/api/chuyen-vien/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'updateCall', ids, callResult })
    });
  }

  /**
   * Imports Excel parsed transfer records
   */
  public static async importExcel(items: any[]): Promise<{ success: boolean; message: string }> {
    return fetchJson('/api/chuyen-vien/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items })
    });
  }
}
