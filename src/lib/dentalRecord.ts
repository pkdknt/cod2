/** Bệnh án Răng Hàm Mặt (A3, 2 mặt) — fields, header settings, column aliases. */

export interface DentalRecord {
  soNgoaiTru?: string;
  soLuuTru?: string;
  hoTen?: string;
  namSinh?: string;
  tuoi?: string;
  gioiTinh?: string;
  diaChi?: string;
  bhytDen?: string;
  soTheBHYT?: string;
  dienThoai?: string;
  denKhamLuc?: string;
  lyDo?: string;
  quaTrinhBenhLy?: string;
  tienSuBanThan?: string;
  chanDoan?: string;
  xuTri?: string;
  ngheNghiep?: string;
  danToc?: string;
  ngoaiKieu?: string;
  noiLamViec?: string;
  doiTuong?: string;
  nguoiNha?: string;
  chanDoanNoiGioiThieu?: string;
  toanThan?: string;
  giaDinh?: string;
  mach?: string;
  nhietDo?: string;
  huyetAp?: string;
  nhipTho?: string;
  canNang?: string;
  namKy?: string;
  ghiChu?: string;
}

export interface DentalHeader {
  soYTe: string;
  tenPhongKham: string;
  khoa: string;
  tieuDe1: string;
  tieuDe2: string;
  giamDocPhongKham: string;
  bacSyKhamBenh: string;
}

export const DEFAULT_DENTAL_HEADER: DentalHeader = {
  soYTe: 'Sở Y tế TP.Hồ Chí Minh',
  tenPhongKham: 'PKĐK Nhơn Tâm',
  khoa: 'Khoa: Răng Hàm Mặt',
  tieuDe1: 'BỆNH ÁN NGOẠI TRÚ',
  tieuDe2: 'CHUYÊN KHOA RĂNG HÀM MẶT',
  giamDocPhongKham: 'GIÁM ĐỐC PHÒNG KHÁM',
  bacSyKhamBenh: 'BÁC SỸ KHÁM BỆNH',
};

export const DENTAL_FIELDS: { key: keyof DentalRecord; label: string }[] = [
  { key: 'soNgoaiTru', label: 'Số ngoại trú' },
  { key: 'soLuuTru', label: 'Số lưu trữ' },
  { key: 'hoTen', label: 'Họ tên' },
  { key: 'namSinh', label: 'Năm sinh' },
  { key: 'tuoi', label: 'Tuổi' },
  { key: 'gioiTinh', label: 'Giới tính' },
  { key: 'diaChi', label: 'Địa chỉ' },
  { key: 'bhytDen', label: 'BHYT đến' },
  { key: 'soTheBHYT', label: 'Số thẻ BHYT' },
  { key: 'dienThoai', label: 'Điện thoại' },
  { key: 'denKhamLuc', label: 'Đến khám lúc' },
  { key: 'ngheNghiep', label: 'Nghề nghiệp' },
  { key: 'danToc', label: 'Dân tộc' },
  { key: 'ngoaiKieu', label: 'Ngoại kiều' },
  { key: 'noiLamViec', label: 'Nơi làm việc' },
  { key: 'nguoiNha', label: 'Người nhà (báo tin)' },
  { key: 'lyDo', label: 'Lý do vào viện' },
  { key: 'quaTrinhBenhLy', label: 'Quá trình bệnh lý' },
  { key: 'tienSuBanThan', label: 'Tiền sử bản thân' },
  { key: 'giaDinh', label: 'Tiền sử gia đình' },
  { key: 'chanDoanNoiGioiThieu', label: 'Chẩn đoán nơi giới thiệu' },
  { key: 'toanThan', label: 'Khám toàn thân' },
  { key: 'mach', label: 'Mạch' },
  { key: 'nhietDo', label: 'Nhiệt độ' },
  { key: 'huyetAp', label: 'Huyết áp' },
  { key: 'nhipTho', label: 'Nhịp thở' },
  { key: 'canNang', label: 'Cân nặng' },
  { key: 'chanDoan', label: 'Chẩn đoán' },
  { key: 'xuTri', label: 'Xử trí' },
  { key: 'namKy', label: 'Năm ký hồ sơ' },
  { key: 'ghiChu', label: 'Ghi chú' },
];

/** Fuzzy column mapping for the dental-record Excel import. */
export const DENTAL_COLUMN_RULES: [RegExp, string][] = [
  [/so ngoai tru|ma benh nhan|ma bn/, 'soNgoaiTru'],
  [/so luu tru|so ho so/, 'soLuuTru'],
  [/ho ten|ten benh nhan|benh nhan/, 'hoTen'],
  [/nam sinh|ngay sinh|date of birth/, 'namSinh'],
  [/^tuoi$/, 'tuoi'],
  [/gioi tinh|^phai$/, 'gioiTinh'],
  [/dia chi|^address$/, 'diaChi'],
  [/bhyt den|han the|gia tri den/, 'bhytDen'],
  [/so the bhyt|ma bhyt/, 'soTheBHYT'],
  [/dien thoai|^sdt$|^phone$/, 'dienThoai'],
  [/den kham luc|ngay kham|^ngay$/, 'denKhamLuc'],
  [/ly do vao vien/, 'lyDo'],
  [/qua trinh benh ly/, 'quaTrinhBenhLy'],
  [/tien su ban than/, 'tienSuBanThan'],
  [/chan doan noi gioi thieu/, 'chanDoanNoiGioiThieu'],
  [/^chan doan$/, 'chanDoan'],
  [/xu tri/, 'xuTri'],
  [/nghe nghiep/, 'ngheNghiep'],
  [/dan toc/, 'danToc'],
  [/ngoai kieu/, 'ngoaiKieu'],
  [/noi lam viec/, 'noiLamViec'],
  [/doi tuong/, 'doiTuong'],
  [/nguoi nha/, 'nguoiNha'],
  [/toan than/, 'toanThan'],
  [/gia dinh/, 'giaDinh'],
  [/^mach$/, 'mach'],
  [/nhiet do/, 'nhietDo'],
  [/huyet ap/, 'huyetAp'],
  [/nhip tho/, 'nhipTho'],
  [/can nang/, 'canNang'],
  [/nam ky|nam ho so/, 'namKy'],
  [/ghi chu/, 'ghiChu'],
];

/** The 6 lesion diagrams of the dental record (labels only; drawings optional). */
export const LESION_LABELS = ['Phải', 'Thẳng', 'Trái', 'Hàm trên và họng', 'Hàm dưới', 'Phân loại khe hở'];
