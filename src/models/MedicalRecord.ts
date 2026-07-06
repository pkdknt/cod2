import { Schema, Document, model, models } from 'mongoose';

export interface IMedicalRecord extends Document {
  // Record Type
  recordType: 'ngoai-tru' | 'bia-rhm' | 'rhm' | 'yhct';

  // Administrative details
  soNgoaiTru?: string;
  soLuuTru?: string;
  maBenhNhan?: string;
  hoTen: string;
  namSinh?: string;
  tuoi?: string;
  gioiTinh?: string;
  diaChi?: string;
  bhytDen?: string;
  soTheBHYT?: string;
  dienThoai?: string;
  denKhamLuc?: string;
  cccd?: string;

  // Patient profile (for RHM/YHCT)
  ngheNghiep?: string;
  danToc?: string;
  ngoaiKieu?: string;
  noiLamViec?: string;
  doiTuong?: string;
  nguoiNha?: string;

  // Clinical history & findings
  lyDo?: string;
  quaTrinhBenhLy?: string;
  tienSuBanThan?: string;
  giaDinh?: string;
  chanDoanNoiGioiThieu?: string;
  toanThan?: string;

  // Vitals
  mach?: string;
  nhietDo?: string;
  huyetAp?: string;
  nhipTho?: string;
  canNang?: string;

  // Diagnoses and actions
  chanDoan?: string;
  xuTri?: string;

  // Other configurations
  namKy?: string;
  ghiChu?: string;

  createdAt: Date;
  updatedAt: Date;
}

const MedicalRecordSchema = new Schema<IMedicalRecord>(
  {
    recordType: { type: String, required: true, enum: ['ngoai-tru', 'bia-rhm', 'rhm', 'yhct'], index: true },
    soNgoaiTru: { type: String, index: true },
    soLuuTru: { type: String, index: true },
    maBenhNhan: { type: String, index: true },
    hoTen: { type: String, required: true, index: true },
    namSinh: { type: String },
    tuoi: { type: String },
    gioiTinh: { type: String },
    diaChi: { type: String },
    bhytDen: { type: String },
    soTheBHYT: { type: String, index: true },
    dienThoai: { type: String, index: true },
    denKhamLuc: { type: String },
    cccd: { type: String, index: true },
    ngheNghiep: { type: String },
    danToc: { type: String },
    ngoaiKieu: { type: String },
    noiLamViec: { type: String },
    doiTuong: { type: String },
    nguoiNha: { type: String },
    lyDo: { type: String },
    quaTrinhBenhLy: { type: String },
    tienSuBanThan: { type: String },
    giaDinh: { type: String },
    chanDoanNoiGioiThieu: { type: String },
    toanThan: { type: String },
    mach: { type: String },
    nhietDo: { type: String },
    huyetAp: { type: String },
    nhipTho: { type: String },
    canNang: { type: String },
    chanDoan: { type: String },
    xuTri: { type: String },
    namKy: { type: String },
    ghiChu: { type: String }
  },
  {
    timestamps: true,
  }
);

export default models.MedicalRecord || model<IMedicalRecord>('MedicalRecord', MedicalRecordSchema);
