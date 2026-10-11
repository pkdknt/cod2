/** Pure helpers for the CSKH Chuyển viện module (ported from the legacy app). */

export const CALL_RESULTS = [
  'Chưa gọi',
  'Đã gọi',
  'Không nghe máy',
  'Sai số',
  'Đã tư vấn',
  'Đã nhập viện',
  'Không nhập viện',
  'Hẹn gọi lại',
] as const;

export const REFERRAL_STATUSES = ['Mới', 'Đang theo dõi', 'Cần gọi lại', 'Hoàn tất'] as const;

/** One row of a report group (by hospital / doctor / call result). */
export interface ReferralGroup {
  key: string;
  count: number;
  pct: number;
}

export interface ReferralRecord {
  _id: string;
  date: string;
  admissionNo?: string;
  patientCode?: string;
  cccd?: string;
  birthDate?: string;
  name: string;
  gender?: string;
  age?: string;
  address?: string;
  phone?: string;
  bhyt?: string;
  bhytNo?: string;
  bhytExpiry?: string;
  destinationHospital?: string;
  diagnosis?: string;
  treatment?: string;
  clinic?: string;
  doctor?: string;
  callDate?: string;
  callResult?: string;
  status?: string;
  note?: string;
  vip?: string;
}

export type ReferralInput = Partial<ReferralRecord> & { _id?: string | null };

/** Lowercase, strip diacritics, collapse whitespace — used for search/sort. */
export function norm(s: unknown): string {
  return String(s ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .trim();
}

export function nkey(s: unknown): string {
  return norm(s).replace(/[\n\r\t]+/g, ' ').replace(/[:：()[\]{}]+/g, ' ').replace(/\s+/g, ' ').trim();
}

function pad(n: number | string): string {
  return String(n).padStart(2, '0');
}

/**
 * Normalise a date cell to `YYYY-MM-DD`. Handles Date objects, Excel serial
 * numbers and `dd/mm/yyyy` (also `-` / `.`). NOTE: 2-digit years are always
 * `20xx` here (deliberately different from the Số ca module).
 */
export function excelDate(value: unknown): string {
  if (!value) return '';
  if (value instanceof Date && !isNaN(value.getTime())) {
    return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`;
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    // Excel serial → UTC date (avoids a one-day shift on negative-offset hosts).
    const d = new Date(Date.UTC(1899, 11, 30) + Math.round(value) * 86400000);
    return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
  }

  const s = String(value).trim();
  if (!s) return '';

  const m = s.match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{2,4})(?:\s+.*)?$/);
  if (m) {
    const y = m[3].length === 2 ? `20${m[3]}` : m[3];
    return `${y}-${pad(m[2])}-${pad(m[1])}`;
  }
  const iso = s.match(/^(\d{4})[/\-.](\d{1,2})[/\-.](\d{1,2})(?:\s+.*)?$/);
  if (iso) return `${iso[1]}-${pad(iso[2])}-${pad(iso[3])}`;

  return s;
}

export function fmtReferralDate(iso: string): string {
  const m = String(iso ?? '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : iso || '';
}

/** Today as a local `YYYY-MM-DD` string (used when a record omits its date). */
export function todayReferralISO(): string {
  return excelDate(new Date());
}

/** A row that still needs a CSKH call. */
export function needsCall(r: ReferralRecord): boolean {
  return r.callResult === 'Chưa gọi' || r.status === 'Cần gọi lại' || r.callResult === 'Hẹn gọi lại';
}

/** Normalise the "Có BHYT?" flag the way the legacy import did. */
export function normalizeBhyt(raw: unknown, bhytNo: unknown): string {
  const no = String(bhytNo ?? '').trim();
  if (no) return 'Có';
  const s = nkey(raw);
  if (/(^|\s)(co|yes|x|checked|1|true)(\s|$)/.test(s)) return 'Có';
  if (/(^|\s)(khong|no|0|false)(\s|$)/.test(s)) return 'Không';
  return String(raw ?? '').trim() || 'Không';
}

/** Alias map for fuzzy Excel column matching (first rule wins). */
export const REFERRAL_COLUMN_RULES: [RegExp, string][] = [
  [/ngay chuyen vien|ngay vao vien|ngay kham|^ngay$|^date$/, 'date'],
  [/so nhap vien|so vao vien|ma vao vien|so ho so|so benh an|stt nhap vien/, 'admissionNo'],
  [/^ma bn$|ma benh nhan|ma nguoi benh|patient code|^mabn$/, 'patientCode'],
  [/^cccd$|^cmnd$|can cuoc|so dinh danh/, 'cccd'],
  [/ngay sinh|nam sinh|birth date|birthday/, 'birthDate'],
  [/ho ten nguoi benh|ho va ten|ho ten|ten benh nhan|ten nguoi benh|^benh nhan$|patient name/, 'name'],
  [/gioi tinh|^phai$|^sex$|^gender$/, 'gender'],
  [/^tuoi$|^age$/, 'age'],
  [/dia chi|ho khau thuong tru|noi cu tru|^address$/, 'address'],
  [/dien thoai|^sdt$|^dt$|^phone$|^mobile$/, 'phone'],
  [/^bhyt$|bao hiem y te|^co bhyt$/, 'bhyt'],
  [/so bao hiem y te|so the bhyt|ma the bhyt|^the bhyt$|^ma bhyt$/, 'bhytNo'],
  [/^han the$|^han bhyt$|ngay het han|gia tri den|^den ngay$/, 'bhytExpiry'],
  [/benh vien chuyen den|bv chuyen den|noi chuyen den|^chuyen den$|benh vien den|tuyen tren/, 'destinationHospital'],
  [/^chan doan$|benh chinh|^ma benh$|^diagnosis$/, 'diagnosis'],
  [/chi dinh dieu tri|^chi dinh$|^dich vu$|noi dung dieu tri|^treatment$/, 'treatment'],
  [/ten phong kham|phong kham|khoa phong|^khoa$|^clinic$/, 'clinic'],
  [/bac sy kham benh|bac si kham benh|^bac sy$|^bac si$|^bs kham$|^doctor$/, 'doctor'],
  [/ngay goi|ngay cskh|ngay lien he/, 'callDate'],
  [/ket qua goi|ket qua cskh|ket qua lien he/, 'callResult'],
  [/^trang thai$|^tinh trang$/, 'status'],
  [/ghi chu|note/, 'note'],
  [/^vip$|khach vip/, 'vip'],
];

/** Used only when no column could be mapped at all. */
export const REFERRAL_FALLBACK_COLUMNS: Record<string, number> = {
  date: 0,
  admissionNo: 1,
  patientCode: 2,
  cccd: 3,
  birthDate: 4,
  name: 5,
  gender: 6,
  age: 7,
  address: 8,
  phone: 9,
  bhyt: 10,
  bhytNo: 11,
  bhytExpiry: 12,
  destinationHospital: 13,
  diagnosis: 14,
  treatment: 15,
  clinic: 16,
  doctor: 17,
  callDate: 18,
  callResult: 19,
  status: 20,
  note: 21,
  vip: 22,
};

export function defaultReferral(overrides: ReferralInput = {}): ReferralInput {
  return {
    callResult: 'Chưa gọi',
    status: 'Mới',
    vip: 'Không',
    bhyt: 'Không',
    ...overrides,
  };
}
