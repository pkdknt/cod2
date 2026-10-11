import type { Pagination } from '@/lib/types';

/**
 * Segregated service contracts (ISP). Concrete services under `src/services`
 * follow these shapes; route handlers depend on the services, not on Mongoose.
 */
export interface ICrudService<T, F> {
  getAll(filters: F): Promise<{ items: T[]; pagination: Pagination; stats?: unknown }>;
  create(data: Partial<T>): Promise<{ success: boolean; item: T }>;
  update(id: string, data: Partial<T>): Promise<{ success: boolean; item: T }>;
  delete(id: string): Promise<{ success: boolean; message: string }>;
}

export interface IBulkOperationService {
  bulkDelete(ids: string[]): Promise<{ success: boolean; message: string }>;
}

export interface IImportExportService<T> {
  importExcel(items: T[]): Promise<{ success: boolean; message: string }>;
}
