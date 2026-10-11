import type { BhytCustomerRecord, ExpiryBucket, WorkflowStatus } from '@/lib/types';

/** Strip Vietnamese diacritics and lowercase — identity/search normalisation. */
export function normalizeText(v: unknown): string {
  return String(v ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim();
}

/** Digits only, and `84…` (country code) → `0…`. */
export function cleanPhone(v: unknown): string {
  return String(v ?? '')
    .replace(/[^\d]/g, '')
    .replace(/^84(?=\d{9}$)/, '0');
}

/**
 * Parse the many date shapes found in the source spreadsheets:
 * `Date`, ISO `yyyy-mm-dd`, `dd/mm/yyyy` (also `-` or `.`), Excel serial numbers.
 */
export function parseBhytDate(v: unknown): Date | null {
  if (!v && v !== 0) return null;
  if (v instanceof Date && !isNaN(v.getTime())) {
    return new Date(v.getFullYear(), v.getMonth(), v.getDate());
  }
  const s = String(v).trim();
  if (!s) return null;

  const m = s.match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{2,4})$/);
  if (m) {
    let year = +m[3];
    if (year < 100) year += year < 70 ? 2000 : 1900;
    const d = new Date(year, +m[2] - 1, +m[1]);
    return isNaN(d.getTime()) ? null : d;
  }

  const iso = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (iso) {
    const d = new Date(+iso[1], +iso[2] - 1, +iso[3]);
    return isNaN(d.getTime()) ? null : d;
  }

  if (/^\d{5}(\.\d+)?$/.test(s)) {
    const serial = Math.floor(Number(s));
    const d = new Date(Date.UTC(1899, 11, 30) + serial * 86400000);
    return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
  }

  return null;
}

/** `yyyy-mm-dd` (the shape stored in the DB) or `''`. */
export function isoDate(v: unknown): string {
  const d = parseBhytDate(v);
  if (!d) return '';
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** `dd/mm/yyyy` for display/printing, or `''`. */
export function displayDate(v: unknown): string {
  const d = parseBhytDate(v);
  if (!d) return '';
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
}

function todayStart(): Date {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

type ExpirySource = Pick<BhytCustomerRecord, 'hanThe' | 'hanTheISO'>;

export function daysToExpiry(r: ExpirySource): number | null {
  const d = parseBhytDate(r.hanTheISO || r.hanThe);
  if (!d) return null;
  return Math.round((d.getTime() - todayStart().getTime()) / 86400000);
}

export function expiryStatus(r: ExpirySource): ExpiryBucket {
  const n = daysToExpiry(r);
  if (n === null) return 'unknown';
  if (n < 0) return 'expired';
  if (n <= 15) return 'due15';
  if (n <= 30) return 'due30';
  return 'active';
}

export const EXPIRY_STATUS_META: Record<ExpiryBucket, string> = {
  expired: 'Đã hết hạn',
  due15: 'Còn ≤ 15 ngày',
  due30: 'Còn 16–30 ngày',
  active: 'Còn hiệu lực',
  unknown: 'Chưa có hạn thẻ',
};

export function dayText(r: ExpirySource): string {
  const n = daysToExpiry(r);
  if (n === null) return 'Chưa xác định';
  if (n < 0) return `Quá ${Math.abs(n)} ngày`;
  if (n === 0) return 'Hết hạn hôm nay';
  return `Còn ${n} ngày`;
}

type WorkflowSource = Pick<BhytCustomerRecord, 'ghiChu' | 'loaiHoSo' | 'ngayGoi' | 'ngayGoiISO' | 'workflowStatus'>;

/** Infer the contact workflow from free-text notes (kept identical to the legacy app,
 *  minus the substring-shadowing that mis-filed "không gọi được" / "đã gọi lại"). */
export function deriveWorkflow(r: WorkflowSource): WorkflowStatus {
  const note = normalizeText(r.ghiChu);
  const raw = normalizeText(r.loaiHoSo);
  const call = isoDate(r.ngayGoiISO || r.ngayGoi);

  if (/da gia han|da gh|da len|da mua|khong goi$/.test(note) || /gia han/.test(raw)) return 'Đã gia hạn';
  if (/khong co nhu cau|khong mua/.test(note)) return 'Không có nhu cầu';
  if (/khong goi duoc|khong bat may|thue bao|so khong|nham so|khong ton tai|loi/.test(note)) return 'Không liên lạc được';
  if (/gui tin|tntd|tin nhan/.test(note)) return 'Đã gửi tin';
  if (call || /da goi|da bao/.test(note)) return 'Đã gọi';
  if (/hen|goi lai/.test(note)) return 'Hẹn liên hệ lại';
  return 'Chưa liên hệ';
}

const WORKFLOW_RANK: Record<string, number> = {
  'Chưa liên hệ': 0,
  'Không liên lạc được': 1,
  'Hẹn liên hệ lại': 1,
  'Không có nhu cầu': 2,
  'Đã gửi tin': 3,
  'Đã gọi': 4,
  'Đã gia hạn': 5,
};

/** Keep the most progressed of the two statuses so a merge never downgrades. */
function pickWorkflow(a: string, b: string): string {
  return (WORKFLOW_RANK[a] ?? 0) >= (WORKFLOW_RANK[b] ?? 0) ? a : b;
}

export function getWorkflow(r: WorkflowSource): string {
  return r.workflowStatus || deriveWorkflow(r);
}

/* ----------------------------- Dedupe / merge ---------------------------- */

function identityCode(v: unknown): string {
  return String(v ?? '').toUpperCase().replace(/[^0-9A-Z]/g, '');
}

function birthYear(r: { ngaySinhISO?: string; ngaySinh?: string }): string {
  const raw = r?.ngaySinhISO || r?.ngaySinh || '';
  const text = String(raw).trim();
  const direct = text.match(/(?:^|\D)((?:19|20)\d{2})(?:\D|$)/);
  if (direct) return direct[1];
  const d = parseBhytDate(raw);
  return d ? String(d.getFullYear()) : '';
}

export function customerIdentity(r: Partial<BhytCustomerRecord>) {
  return {
    name: normalizeText(r?.hoTen).replace(/\s+/g, ' '),
    year: birthYear(r ?? {}),
    bhyt: identityCode(r?.maBHXH),
    cccd: identityCode(r?.cccd),
  };
}

/** Same person = same normalised name + birth year, and no conflicting card/ID. */
export function isSameCustomer(a: Partial<BhytCustomerRecord>, b: Partial<BhytCustomerRecord>): boolean {
  const x = customerIdentity(a);
  const y = customerIdentity(b);
  if (!x.name || !x.year || x.name !== y.name || x.year !== y.year) return false;

  const bhytConflict = x.bhyt && y.bhyt && x.bhyt !== y.bhyt;
  const cccdConflict = x.cccd && y.cccd && x.cccd !== y.cccd;
  if (bhytConflict || cccdConflict) return false;

  const bhytMatch = x.bhyt && y.bhyt && x.bhyt === y.bhyt;
  const cccdMatch = x.cccd && y.cccd && x.cccd === y.cccd;
  return Boolean(bhytMatch || cccdMatch);
}

function expiryTime(r?: Partial<BhytCustomerRecord>): number {
  const d = parseBhytDate(r?.hanTheISO || r?.hanThe);
  return d ? d.getTime() : Number.NEGATIVE_INFINITY;
}

function isBlank(v: unknown): boolean {
  return v === null || v === undefined || String(v).trim() === '';
}

/** Keep the newer expiry, never drop a field the older record had filled in. */
export function mergeDuplicateRecords(
  saved: Partial<BhytCustomerRecord>,
  incoming: Partial<BhytCustomerRecord>
): Partial<BhytCustomerRecord> {
  const incomingIsNewer = expiryTime(incoming) >= expiryTime(saved);
  const primary = incomingIsNewer ? incoming : saved;
  const secondary = incomingIsNewer ? saved : incoming;

  const merged: Record<string, unknown> = { ...secondary, ...primary };

  // Never let DB-managed keys reach a `$set` payload — `saved` is a lean DB
  // document, so `_id`/`__v`/timestamps would otherwise be copied in and make
  // MongoDB reject the update as "modify the immutable field '_id'".
  delete merged._id;
  delete merged.__v;
  delete merged.createdAt;
  delete merged.updatedAt;

  Object.keys(secondary).forEach((k) => {
    if (isBlank(merged[k]) && !isBlank((secondary as Record<string, unknown>)[k])) {
      merged[k] = (secondary as Record<string, unknown>)[k];
    }
  });

  // NOTE: `_id` is deliberately NOT copied — it must never land in a `$set` payload.
  const savedWorkflow = getWorkflow(saved);
  const incomingWorkflow = getWorkflow(incoming);
  merged.workflowStatus = pickWorkflow(savedWorkflow, incomingWorkflow);
  ['ngayGoi', 'ngayGoiISO', 'ghiChu', 'nguoiGioiThieu'].forEach((k) => {
    const sv = (saved as Record<string, unknown>)[k];
    const iv = (incoming as Record<string, unknown>)[k];
    if (!isBlank(sv) && isBlank(iv)) merged[k] = sv;
  });

  merged.ngaySinhISO = isoDate(merged.ngaySinhISO || merged.ngaySinh);
  merged.hanTheISO = isoDate(primary.hanTheISO || primary.hanThe);
  merged.hanThe = primary.hanThe || primary.hanTheISO || merged.hanThe;

  return merged as Partial<BhytCustomerRecord>;
}

export interface DedupeResult<T> {
  records: T[];
  removed: number;
  replacedByNewer: number;
}

/** Collapse duplicate customers inside one import batch (same name+year, matching card/ID). */
export function deduplicateCustomers<T extends Partial<BhytCustomerRecord>>(items: T[]): DedupeResult<T> {
  const unique: T[] = [];
  const indexes = new Map<string, Set<number>>();
  let removed = 0;
  let replacedByNewer = 0;

  const addIndex = (r: T, index: number) => {
    const id = customerIdentity(r);
    if (id.bhyt) {
      const key = `B:${id.bhyt}`;
      if (!indexes.has(key)) indexes.set(key, new Set());
      indexes.get(key)!.add(index);
    }
    if (id.cccd) {
      const key = `C:${id.cccd}`;
      if (!indexes.has(key)) indexes.set(key, new Set());
      indexes.get(key)!.add(index);
    }
  };

  for (const item of items) {
    const incoming = { ...item };
    const id = customerIdentity(incoming);
    const candidates = new Set<number>();
    if (id.bhyt && indexes.has(`B:${id.bhyt}`)) indexes.get(`B:${id.bhyt}`)!.forEach((i) => candidates.add(i));
    if (id.cccd && indexes.has(`C:${id.cccd}`)) indexes.get(`C:${id.cccd}`)!.forEach((i) => candidates.add(i));

    const duplicateIndex = [...candidates].find((i) => isSameCustomer(unique[i], incoming));
    if (duplicateIndex === undefined) {
      unique.push(incoming);
      addIndex(incoming, unique.length - 1);
      continue;
    }
    const oldExpiry = expiryTime(unique[duplicateIndex]);
    const newExpiry = expiryTime(incoming);
    unique[duplicateIndex] = mergeDuplicateRecords(unique[duplicateIndex], incoming) as T;
    if (newExpiry > oldExpiry) replacedByNewer++;
    removed++;
    addIndex(unique[duplicateIndex], duplicateIndex);
  }

  return { records: unique, removed, replacedByNewer };
}

/* -------------------------------- SMS ---------------------------------- */

/** Legacy placeholders kept for backwards compatibility with stored templates. */
export function renderSmsTemplate(
  template: string,
  row: Partial<BhytCustomerRecord>,
  extras: { hotline?: string; diaChi?: string } = {}
): string {
  const day = daysToExpiry(row);
  return template
    .replace(/\[Ho_Ten\]|\{ten\}/gi, row.hoTen || '')
    .replace(/\[Ngay_Het_Han\]|\{han_the\}/gi, displayDate(row.hanTheISO || row.hanThe))
    .replace(/\[So_Ngay_Con_Lai\]|\{so_ngay\}/gi, day === null ? '' : String(day))
    .replace(/\{hotline\}/gi, extras.hotline ?? '')
    .replace(/\{dia_chi\}/gi, extras.diaChi ?? '');
}
