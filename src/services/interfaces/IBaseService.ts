export interface ICrudService<T, F> {
  getAll(filters: F): Promise<{ items: T[]; pagination: any; stats?: any }>;
  create(data: T): Promise<{ success: boolean; item: T }>;
  update(id: string, data: Partial<T>): Promise<{ success: boolean; item: T }>;
  delete(id: string): Promise<{ success: boolean; message: string }>;
}

export interface IBulkOperationService<T> {
  bulkDelete(ids: string[]): Promise<{ success: boolean; message: string }>;
}

export interface IImportExportService<T> {
  importExcel(items: any[]): Promise<{ success: boolean; message: string }>;
}
