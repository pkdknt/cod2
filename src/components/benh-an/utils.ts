import * as XLSX from 'xlsx';

const htmlMap: Record<string, string> = {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"};
export const htmlSafe = (s: string) => String(s || "").replace(/[&<>"]/g, (m) => htmlMap[m] || m);

export function soLuuTruHtml(v: string) {
  v = String(v || '').trim();
  return `<span class="soLuuTruText" style="font-size:25pt">${htmlSafe(v)}</span>`;
}

export function parseDateParts(v: any) {
  if (v == null || v === '') return null;
  if (v instanceof Date && !isNaN(v.getTime())) return { d: v.getDate(), m: v.getMonth() + 1, y: v.getFullYear() };
  if (typeof v === 'number') {
    if (v > 20000 && v < 80000) {
      const d = XLSX.SSF.parse_date_code(v);
      if (d) return { d: d.d, m: d.m, y: d.y };
    }
    return null;
  }
  let s = String(v).trim();
  if (!s) return null;
  if (/^\d+(?:\.\d+)?$/.test(s)) {
    const num = Number(s);
    if (num > 20000 && num < 80000) {
      const d = XLSX.SSF.parse_date_code(num);
      if (d) return { d: d.d, m: d.m, y: d.y };
    }
  }
  s = s.replace(/\s+/g, ' ');
  let m = s.match(/(\d{4})[\/\-.](\d{1,2})[\/\-.](\d{1,2})/);
  if (m) return { d: Number(m[3]), m: Number(m[2]), y: Number(m[1]) };
  m = s.match(/(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})/);
  if (m) return { d: Number(m[1]), m: Number(m[2]), y: Number(m[3]) };
  return null;
}

export function parseTimeParts(v: any) {
  if (v == null || v === '') return null;
  if (v instanceof Date && !isNaN(v.getTime())) {
    if (v.getHours() !== 0 || v.getMinutes() !== 0 || v.getSeconds() !== 0) return { h: v.getHours(), mi: v.getMinutes(), s: v.getSeconds(), hasSecond: v.getSeconds() !== 0 };
    return null;
  }
  if (typeof v === 'number') {
    let fraction = null;
    if (v > 20000 && v < 80000) {
      const d = XLSX.SSF.parse_date_code(v);
      if (d && ((Number(d.H) || 0) !== 0 || (Number(d.M) || 0) !== 0 || (Number(d.S) || 0) !== 0 || Math.abs(v - Math.floor(v)) > 1e-9)) {
        const sec = Math.round(Number(d.S) || 0);
        return { h: Number(d.H) || 0, mi: Number(d.M) || 0, s: sec, hasSecond: sec !== 0 };
      }
    }
    if (v >= 0 && v < 1) fraction = v;
    if (fraction != null) {
      let total = Math.round(fraction * 24 * 60 * 60);
      total = ((total % (24 * 60 * 60)) + (24 * 60 * 60)) % (24 * 60 * 60);
      return { h: Math.floor(total / 3600), mi: Math.floor((total % 3600) / 60), s: total % 60, hasSecond: (total % 60) !== 0 };
    }
    if (Number.isInteger(v) && v >= 0 && v <= 23) return { h: v, mi: 0, s: 0, hasSecond: false };
    return null;
  }
  let s = String(v).trim();
  if (!s) return null;
  if (/^\d+(?:\.\d+)?$/.test(s)) {
    const num = Number(s);
    if (num >= 0 && num < 1) return parseTimeParts(num);
    if (Number.isInteger(num) && num >= 0 && num <= 23) return { h: num, mi: 0, s: 0, hasSecond: false };
  }
  s = s.replace(/\s+/g, ' ');
  let m = s.match(/(?:^|\D)(\d{1,2})\s*(?:giờ|gio|h)\s*(\d{1,2})?(?:\s*(?:phút|phut|p)\s*)?(\d{1,2})?(?:\s*(?:giây|giay|s))?/i);
  if (m && m[1] != null) { return { h: Number(m[1]), mi: Number(m[2] || 0), s: Number(m[3] || 0), hasSecond: m[3] != null }; }
  m = s.match(/(?:^|\D)(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?/);
  if (m) { return { h: Number(m[1]), mi: Number(m[2]), s: Number(m[3] || 0), hasSecond: m[3] != null }; }
  return null;
}

export function dateOnlyText(d: number, m: number, y: number) {
  const pad = (n: number | string) => String(Math.floor(Math.abs(Number(n) || 0))).padStart(2, '0');
  return pad(d) + '/' + pad(m) + '/' + String(y).padStart(4, '0');
}

export function dateWithWordText(d: number, m: number, y: number) {
  return 'ngày ' + dateOnlyText(d, m, y);
}

export function timePartsText(t: { h: number, mi: number, s: number, hasSecond: boolean }) {
  const pad = (n: number | string) => String(Math.floor(Math.abs(Number(n) || 0))).padStart(2, '0');
  return pad(t.h) + ' giờ ' + pad(t.mi) + ' phút' + (t.hasSecond ? ' ' + pad(t.s) + ' giây' : '');
}

export function formatNgayGioFromParts(dateParts: any, timeParts: any) {
  if (dateParts && timeParts) return timePartsText(timeParts) + ', ' + dateWithWordText(dateParts.d, dateParts.m, dateParts.y);
  if (dateParts) return dateOnlyText(dateParts.d, dateParts.m, dateParts.y);
  if (timeParts) return timePartsText(timeParts);
  return '';
}

export function formatNgayGioVaoVien(v: any) {
  if (v == null || v === '') return '';
  const d = parseDateParts(v);
  const t = parseTimeParts(v);
  if (d) return formatNgayGioFromParts(d, t);
  let s = String(v).trim();
  if (!s) return '';
  s = s.replace(/\s+/g, ' ');
  if (/ngày|ngay|giờ|gio/i.test(s)) return s;
  return s;
}

export function extractBirthDate(v: any) {
  if (v == null) return '';
  let s = String(v).trim();
  if (v instanceof Date && !isNaN(v.getTime())) {
    return String(v.getDate()).padStart(2, '0') + '/' + String(v.getMonth() + 1).padStart(2, '0') + '/' + v.getFullYear();
  }
  if (typeof v === 'number' && v > 20000 && v < 80000) {
    let d = XLSX.SSF.parse_date_code(v);
    if (d) return String(d.d).padStart(2, '0') + '/' + String(d.m).padStart(2, '0') + '/' + d.y;
  }
  
  if (!s) return '';
  let m = String(s).match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})$/);
  if (m) return String(m[1]).padStart(2, '0') + '/' + String(m[2]).padStart(2, '0') + '/' + m[3];
  m = String(s).match(/^(\d{4})[\/\-.](\d{1,2})[\/\-.](\d{1,2})$/);
  if (m) return String(m[3]).padStart(2, '0') + '/' + String(m[2]).padStart(2, '0') + '/' + m[1];
  if (/^\d{4}$/.test(s)) return s;
  return s;
}

export function fitCoverText(coverEl: HTMLElement | null) {
  if (!coverEl) return;
  const content = coverEl.querySelector('.coverContent') as HTMLElement;
  if (!content) return;
  coverEl.style.setProperty('--cover-scale', '1');
  content.style.width = '100%';
  const maxH = coverEl.clientHeight;
  const maxW = coverEl.clientWidth;
  const h = content.scrollHeight;
  const w = content.scrollWidth;
  let scale = Math.min(1, maxH / (h || maxH), maxW / (w || maxW));
  if (scale < 1) {
    scale = scale - 0.01;
    coverEl.style.setProperty('--cover-scale', String(scale));
  }
}
