export type SortDirection = 'asc' | 'desc';

export type ReminderFilter = 'overdue' | 'today' | '7' | '30' | 'all';

export interface Pagination {
  page: number;
  pageSize: number;
  totalFiltered: number;
  totalPages: number;
}

export interface ApiListResponse<T> {
  success: boolean;
  items: T[];
  pagination: Pagination;
}

/** A stored customer vaccination schedule (as returned by the API). */
export interface PatientRecord {
  _id: string;
  patientCode?: string;
  patientName: string;
  phone?: string;
  dob?: string;
  gender?: string;
  address?: string;
  vaccine: string;
  protocolId: string;
  dates: string[];
  dueOverrides: string[];
  notes: string[];
  called?: boolean[];
  messaged?: boolean[];
  createdAt?: string;
  updatedAt?: string;
}

/** Payload accepted when creating/updating a schedule. */
export interface PatientInput {
  id?: string | null;
  patientCode?: string;
  patientName: string;
  phone?: string;
  dob?: string;
  gender?: string;
  address?: string;
  vaccine: string;
  protocolId: string;
  dates?: string[];
  dueOverrides?: string[];
  notes?: string[];
  called?: boolean[];
  messaged?: boolean[];
}

/** One upcoming dose row in the reminders view. */
export interface ReminderRow {
  _id: string;
  patientId: string;
  patientCode: string;
  patientName: string;
  phone: string;
  dob: string;
  gender: string;
  address: string;
  vaccineAndDose: string;
  doseLabel: string;
  actualDateStr: string;
  plannedDateStr: string;
  diff: number;
  doseIndex: number;
  patient: PatientRecord;
}

/** A stored vaccine price. */
export interface VaccinePriceRecord {
  _id: string;
  name: string;
  unit: string;
  price: number;
  checkupPrice: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface VaccinePriceInput {
  id?: string | null;
  name: string;
  unit: string;
  price: number | string;
  checkupPrice?: number | string;
}

// Factories (not shared constants) so callers can never mutate a shared default.
export const emptySix = (): string[] => ['', '', '', '', '', ''];
export const falseSix = (): boolean[] => [false, false, false, false, false, false];

/* ------------------------------- BHYT CRM ------------------------------- */

export type ExpiryBucket = 'expired' | 'due15' | 'due30' | 'active' | 'unknown';

export type WorkflowStatus =
  | 'Chưa liên hệ'
  | 'Đã gọi'
  | 'Đã gửi tin'
  | 'Hẹn liên hệ lại'
  | 'Không liên lạc được'
  | 'Không có nhu cầu'
  | 'Đã gia hạn';

/** A BHYT customer / renewal record (port of `Nhon_Tam_BHYT`). */
export interface BhytCustomerRecord {
  _id: string;
  hoTen: string;
  maBHXH?: string;
  cccd?: string;
  ngaySinh?: string;
  ngaySinhISO?: string;
  gioiTinh?: string;
  noiKhaiSinh?: string;
  noiKCB?: string;
  ngayBienLai?: string;
  ngayBienLaiISO?: string;
  soBienLai?: string;
  soTienDong?: string;
  hoTroThem?: string;
  thoiHanTheThang?: string;
  maNVThu?: string;
  dienThoai?: string;
  hanThe?: string;
  hanTheISO?: string;
  canLienHe?: string;
  loaiHoSo?: string;
  ngayGoi?: string;
  ngayGoiISO?: string;
  nguoiGioiThieu?: string;
  ghiChu?: string;
  workflowStatus?: WorkflowStatus | string;
  createdAt?: string;
  updatedAt?: string;
}

export type BhytCustomerInput = Partial<BhytCustomerRecord> & { _id?: string | null };
