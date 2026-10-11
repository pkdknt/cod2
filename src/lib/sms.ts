import { daysToExpiry, displayDate, cleanPhone, getWorkflow } from '@/lib/bhyt';
import { toUpperNoAccent } from '@/lib/format';
import { loadXLSX, type XLSXModule, type Worksheet } from '@/lib/excel';
import type { BhytCustomerRecord } from '@/lib/types';

export const DEFAULT_SMS_TEMPLATE =
  'The BHYT cua QK [Ho_Ten] het han ngay [Ngay_Het_Han]. QK den Phong 3 cua PK trong gio HC de duoc gia han. LH 0987519115.';

/** Default template for the vaccination-schedule SMS tool. */
export const DEFAULT_VACCINE_SMS_TEMPLATE =
  'QK [Ho_Ten] co lich tiem ngua [Vacxin] mui [Mui_Tiem] ngay [Ngay_Tiem]. Vui long bo qua tin neu da tiem. LH 0987519115';

/** Column order of the FPT SMS upload file (must stay exactly these 4). */
export const FPT_HEADERS = ['phone', 'Template', 'Ho_Ten', 'Ngay_Het_Han'] as const;

export interface FptSmsRow {
  phone: string;
  Template: string;
  Ho_Ten: string;
  Ngay_Het_Han: string;
}

/**
 * Build the FPT SMS rows. Placeholders are kept literal (FPT merges them at
 * send time); only rows within `thresholdDays` get a template, matching the
 * legacy tool.
 */
export function buildFptRows(
  customers: BhytCustomerRecord[],
  template: string,
  thresholdDays: number
): FptSmsRow[] {
  return customers.map((c) => {
    const days = daysToExpiry(c);
    const withinWindow = days !== null && days <= thresholdDays;
    return {
      phone: cleanPhone(c.dienThoai),
      Template: withinWindow ? template : '',
      Ho_Ten: toUpperNoAccent(c.hoTen || ''),
      Ngay_Het_Han: displayDate(c.hanTheISO || c.hanThe),
    };
  });
}

/** Write any FPT SMS workbook — one sheet `FPT_SMS`, every cell forced to text. */
export async function writeFptSmsSheet(
  headers: string[],
  rows: (string | number)[][],
  fileName: string,
  colWidths?: number[]
): Promise<void> {
  const XLSX: XLSXModule = await loadXLSX();
  const text = (v: string | number) => ({ v: String(v ?? ''), t: 's' as const, z: '@' });

  const aoa = [headers.map(text), ...rows.map((r) => r.map(text))];
  const ws: Worksheet = XLSX.utils.aoa_to_sheet(aoa);
  if (colWidths) ws['!cols'] = colWidths.map((wch) => ({ wch }));

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'FPT_SMS');
  XLSX.writeFile(wb, fileName);
}

/** BHYT renewal SMS export (4 columns). */
export async function exportFptSms(rows: FptSmsRow[], fileName: string): Promise<void> {
  await writeFptSmsSheet(
    [...FPT_HEADERS],
    rows.map((r) => [r.phone, r.Template, r.Ho_Ten, r.Ngay_Het_Han]),
    fileName,
    [16, 70, 30, 16]
  );
}

export function countPendingSms(customers: BhytCustomerRecord[]): number {
  return customers.filter((c) => getWorkflow(c) !== 'Đã gia hạn' && cleanPhone(c.dienThoai)).length;
}

/* ------------------- Vaccination-schedule SMS (6 columns) ------------------- */

/** Column order of the vaccination FPT SMS file. */
export const VACCINE_SMS_HEADERS = ['phone', 'Template', 'Ho_Ten', 'Vacxin', 'Mui_Tiem', 'Ngay_Tiem'] as const;

export interface VaccineSmsRow {
  STT: number;
  phone: string;
  Template: string;
  Ho_Ten: string;
  Vacxin: string;
  Mui_Tiem: string;
  Ngay_Tiem: string;
}

/** Fuzzy column mapping for the vaccination Excel import. */
export const VACCINE_SMS_COLUMN_RULES: [RegExp, string][] = [
  [/phone|sdt|so dien thoai|so dt|dien thoai|mobile|tel/, 'phone'],
  [/template|mau tin|mau sms|noi dung|tin nhan|sms|content/, 'Template'],
  [/ho ten|ho_ten|hoten|^ten$|ten khach hang|khach hang|hovaten/, 'Ho_Ten'],
  [/vacxin|vaccine|vac xin|ten vacxin|ten vac xin|ten vaccine|loai vacxin|loai vac xin/, 'Vacxin'],
  [/mui tiem|mui|mui thu|lan tiem|dose/, 'Mui_Tiem'],
  [/ngay tiem|ngay_tiem|ngay hen tiem|lich tiem|ngay nhac|^date$/, 'Ngay_Tiem'],
];

/** Build FPT rows, auto-filling the template for every row that has none. */
export function buildVaccineRows(
  rows: Record<string, unknown>[],
  defaultTemplate: string
): VaccineSmsRow[] {
  return rows.map((r, index) => ({
    STT: index + 1,
    phone: cleanPhone(r.phone),
    Template: String(r.Template ?? '').trim() || defaultTemplate,
    Ho_Ten: toUpperNoAccent(String(r.Ho_Ten ?? '')),
    Vacxin: String(r.Vacxin ?? '').trim(),
    Mui_Tiem: String(r.Mui_Tiem ?? '').trim(),
    Ngay_Tiem: String(r.Ngay_Tiem ?? '').trim(),
  }));
}

/** Export rows that have both a phone and a template (legacy export gate). */
export async function exportVaccineSms(rows: VaccineSmsRow[], fileName: string): Promise<number> {
  const exportable = rows.filter((r) => r.phone && r.Template);
  await writeFptSmsSheet(
    [...VACCINE_SMS_HEADERS],
    exportable.map((r) => [r.phone, r.Template, r.Ho_Ten, r.Vacxin, r.Mui_Tiem, r.Ngay_Tiem]),
    fileName,
    [16, 110, 28, 28, 14, 16]
  );
  return exportable.length;
}
