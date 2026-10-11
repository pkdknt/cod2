/** Bìa bệnh án (medical-record covers) — shared types, presets and column map. */

export interface CoverRecord {
  soLuuTru?: string;
  maVaoVien?: string;
  maBenhNhan?: string;
  hoTen?: string;
  gioiTinh?: string;
  namSinh?: string;
  cccd?: string;
  diaChi?: string;
  maBHYT?: string;
  ngayVaoVien?: string;
  dienThoai?: string;
}

export interface CoverHeader {
  tenApp: string;
  tenBenhAn: string;
  soLuuTru: string;
  dongPK1: string;
  dongPK2: string;
  dongPK3: string;
}

export type CoverType = 'ngoaitru' | 'rhm' | 'yhct';

/** Clinic header lines are locked to the saved template (never overwritten by Excel). */
export const COVER_LOCKED_FIELDS: (keyof CoverHeader)[] = ['dongPK1', 'dongPK2', 'dongPK3'];

export const COVER_PRESETS: Record<CoverType, string> = {
  ngoaitru: 'BỆNH ÁN NGOẠI TRÚ',
  rhm: 'BỆNH ÁN RĂNG HÀM MẶT',
  yhct: 'BỆNH ÁN Y HỌC CỔ TRUYỀN',
};

export const CLINIC_LINES = {
  dongPK1: 'PHÒNG KHÁM ĐA KHOA NHƠN TÂM',
  dongPK2: 'Địa chỉ: 469 Nguyễn Văn Tạo, xã Hiệp Phước, TP. HCM',
  dongPK3: 'ĐT: 028 3780 1479 – Hotline: 0987 519 115',
};

export function defaultCoverHeader(type: CoverType): CoverHeader {
  return {
    tenApp: `Bìa bệnh án ${type === 'ngoaitru' ? 'Ngoại Trú' : type === 'rhm' ? 'RHM' : 'YHCT'}`,
    tenBenhAn: COVER_PRESETS[type],
    soLuuTru: '',
    ...CLINIC_LINES,
  };
}

export const COVER_FIELDS: { key: keyof CoverRecord | 'tenBenhAn'; label: string }[] = [
  { key: 'soLuuTru', label: 'Số lưu trữ' },
  { key: 'maVaoVien', label: 'Mã số vào viện' },
  { key: 'maBenhNhan', label: 'Mã bệnh nhân' },
  { key: 'hoTen', label: 'Họ và tên bệnh nhân' },
  { key: 'gioiTinh', label: 'Giới tính' },
  { key: 'namSinh', label: 'Năm sinh' },
  { key: 'cccd', label: 'Mã định danh cá nhân/CCCD' },
  { key: 'diaChi', label: 'Địa chỉ' },
  { key: 'maBHYT', label: 'Mã BHYT' },
  { key: 'ngayVaoVien', label: 'Ngày giờ vào viện' },
  { key: 'dienThoai', label: 'Số điện thoại' },
];

/** Fuzzy column mapping for the cover Excel import. */
export const COVER_COLUMN_RULES: [RegExp, string][] = [
  [/so luu tru|so hs|ho so|ma ho so/, 'soLuuTru'],
  [/ma vao vien|so vao vien|ma vv/, 'maVaoVien'],
  [/ma benh nhan|ma bn|ma nguoi benh/, 'maBenhNhan'],
  [/ho va ten|ho ten|^ten$|ten benh nhan/, 'hoTen'],
  [/gioi tinh|^phai$|^sex$/, 'gioiTinh'],
  [/nam sinh|ngay sinh/, 'namSinh'],
  [/cccd|cmnd|dinh danh|can cuoc/, 'cccd'],
  [/dia chi|^address$/, 'diaChi'],
  [/ma bhyt|ma the|so the|^bhyt$/, 'maBHYT'],
  [/ngay vao vien|ngay gio vao vien|ngay vv|^ngay$/, 'ngayVaoVien'],
  [/dien thoai|^sdt$|^phone$|so dt/, 'dienThoai'],
];

export const COVER_LABELS: { key: keyof CoverRecord; label: string }[] = [
  { key: 'hoTen', label: 'Họ và tên bệnh nhân:' },
  { key: 'gioiTinh', label: 'Giới tính:' },
  { key: 'namSinh', label: 'Năm sinh:' },
  { key: 'cccd', label: 'Mã định danh cá nhân/CCCD:' },
  { key: 'diaChi', label: 'Địa chỉ:' },
  { key: 'maBHYT', label: 'Mã BHYT:' },
  { key: 'ngayVaoVien', label: 'Ngày giờ vào viện:' },
  { key: 'dienThoai', label: 'Số điện thoại:' },
];
