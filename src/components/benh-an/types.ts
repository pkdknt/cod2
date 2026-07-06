export interface BenhAnRow {
  tenApp?: string;
  tenBenhAn?: string;
  soLuuTru?: string;
  dongPK1?: string;
  dongPK2?: string;
  dongPK3?: string;
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
  [key: string]: any;
}

export interface BenhAnMapKeys {
  tenApp: string;
  tenBenhAn: string;
  soLuuTru: string;
  dongPK1: string;
  dongPK2: string;
  dongPK3: string;
  maVaoVien: string;
  maBenhNhan: string;
  hoTen: string;
  gioiTinh: string;
  namSinh: string;
  cccd: string;
  diaChi: string;
  maBHYT: string;
  ngayVaoVien: string;
  dienThoai: string;
}

export type BenhAnFormType = 'RHM' | 'BIA_NGOAI_TRU' | 'BIA_RHM' | 'BIA_YHCT';
