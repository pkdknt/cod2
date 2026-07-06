import mongoose, { Schema, Document, model, models } from 'mongoose';

export interface IKskDriverExam extends Document {
  soPhieu: string;
  hoTen: string;
  gioiTinh?: string;
  ngaySinh?: string;
  tuoi?: string;
  cccd?: string;
  capNgay?: string;
  capTai?: string;
  hoKhau?: string;
  hangLaiXe?: string;
  ngayKham?: string;
  ngayKetLuan?: string;
  ketLuan?: string;
  nguoiKetLuan?: string;
  tienSuGiaDinh?: string;
  benhSuBanThan?: string;
  dangDieuTri?: string;
  
  // Clinical exam fields
  tamThan?: string;
  tamThanKL?: string;
  thanKinh?: string;
  thanKinhKL?: string;
  matKhongKinhP?: string;
  matKhongKinhT?: string;
  matCoKinhP?: string;
  matCoKinhT?: string;
  matHaiMatKhongKinh?: string;
  matHaiMatCoKinh?: string;
  sacGiac?: string;
  matBenh?: string;
  matKL?: string;
  tmh?: string;
  tmhKL?: string;
  mach?: string;
  huyetAp?: string;
  timMach?: string;
  timMachKL?: string;
  hoHap?: string;
  hoHapKL?: string;
  coXuongKhop?: string;
  coXuongKhopKL?: string;
  noiTiet?: string;
  noiTietKL?: string;
  maTuyKQ?: string;
  xetNghiemKhacKQ?: string;
  xetNghiemKhacKL?: string;

  // Questionnaires (19 BOOLS)
  bool: Record<string, string>;

  // Base64 Photo
  photo?: string;

  createdAt: Date;
  updatedAt: Date;
}

const KskDriverExamSchema = new Schema<IKskDriverExam>(
  {
    soPhieu: { type: String, required: true, unique: true, index: true },
    hoTen: { type: String, required: true, index: true },
    gioiTinh: { type: String },
    ngaySinh: { type: String },
    tuoi: { type: String },
    cccd: { type: String, index: true },
    capNgay: { type: String },
    capTai: { type: String },
    hoKhau: { type: String },
    hangLaiXe: { type: String },
    ngayKham: { type: String },
    ngayKetLuan: { type: String },
    ketLuan: { type: String },
    nguoiKetLuan: { type: String },
    tienSuGiaDinh: { type: String },
    benhSuBanThan: { type: String },
    dangDieuTri: { type: String },

    // Clinical exam fields
    tamThan: { type: String },
    tamThanKL: { type: String },
    thanKinh: { type: String },
    thanKinhKL: { type: String },
    matKhongKinhP: { type: String },
    matKhongKinhT: { type: String },
    matCoKinhP: { type: String },
    matCoKinhT: { type: String },
    matHaiMatKhongKinh: { type: String },
    matHaiMatCoKinh: { type: String },
    sacGiac: { type: String },
    matBenh: { type: String },
    matKL: { type: String },
    tmh: { type: String },
    tmhKL: { type: String },
    mach: { type: String },
    huyetAp: { type: String },
    timMach: { type: String },
    timMachKL: { type: String },
    hoHap: { type: String },
    hoHapKL: { type: String },
    coXuongKhop: { type: String },
    coXuongKhopKL: { type: String },
    noiTiet: { type: String },
    noiTietKL: { type: String },
    maTuyKQ: { type: String },
    xetNghiemKhacKQ: { type: String },
    xetNghiemKhacKL: { type: String },

    bool: { type: Schema.Types.Mixed, default: {} },
    photo: { type: String }
  },
  {
    timestamps: true,
  }
);

export default models.KskDriverExam || model<IKskDriverExam>('KskDriverExam', KskDriverExamSchema);
