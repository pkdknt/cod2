import { Schema, Document, model, models } from 'mongoose';

export interface IBhytCustomer extends Document {
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
  workflowStatus?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BhytCustomerSchema = new Schema<IBhytCustomer>(
  {
    hoTen: { type: String, required: true },
    maBHXH: { type: String },
    cccd: { type: String },
    ngaySinh: { type: String },
    ngaySinhISO: { type: String },
    gioiTinh: { type: String },
    noiKhaiSinh: { type: String },
    noiKCB: { type: String },
    ngayBienLai: { type: String },
    ngayBienLaiISO: { type: String },
    soBienLai: { type: String },
    soTienDong: { type: String },
    hoTroThem: { type: String },
    thoiHanTheThang: { type: String },
    maNVThu: { type: String },
    dienThoai: { type: String },
    hanThe: { type: String },
    hanTheISO: { type: String },
    canLienHe: { type: String },
    loaiHoSo: { type: String },
    ngayGoi: { type: String },
    ngayGoiISO: { type: String },
    nguoiGioiThieu: { type: String },
    ghiChu: { type: String },
    workflowStatus: { type: String },
  },
  { timestamps: true }
);

// Query patterns: sort/scan by card expiry, look up by card/ID code, search by name/phone.
BhytCustomerSchema.index({ hanTheISO: 1 });
BhytCustomerSchema.index({ maBHXH: 1 });
BhytCustomerSchema.index({ cccd: 1 });
BhytCustomerSchema.index({ hoTen: 1 });
BhytCustomerSchema.index({ dienThoai: 1 });

export default models.BhytCustomer || model<IBhytCustomer>('BhytCustomer', BhytCustomerSchema);
