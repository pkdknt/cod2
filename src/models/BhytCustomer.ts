import { Schema, Document, model, models } from 'mongoose';

export interface IBhytCustomer extends Document {
  name: string;
  bhxh: string;
  cccd?: string;
  dob?: string;          // Original text display: dd/mm/yyyy
  dobDate?: Date;        // standard Date for query/sort
  gender?: string;
  birthPlace?: string;
  kcb?: string;
  receiptDate?: string;
  receiptNo?: string;
  amount?: string;
  support?: string;
  months?: string;
  staffCode?: string;
  phone?: string;
  expiry?: string;       // Original text display: dd/mm/yyyy
  expiryDate?: Date;     // standard Date for query/sort
  needCall?: string;     // 'Có' | 'Không'
  renewType?: string;    // 'Chưa gia hạn' | 'Đang chờ' | 'Đã gia hạn' | 'Tăng mới' | ''
  callDate?: string;
  relation?: string;
  note?: string;
  contactStatus?: string;// 'Chưa liên hệ' | 'Đã gọi' | 'Zalo' | 'Hẹn lại'
  workflowStatus?: string; // 'Chưa liên hệ' | 'Đã gửi tin' | 'Đã gọi' | 'Hẹn liên hệ lại' | 'Đã gia hạn' | 'Không liên lạc được' | 'Không có nhu cầu'
  createdAt: Date;
  updatedAt: Date;
}

const BhytCustomerSchema = new Schema<IBhytCustomer>(
  {
    name: { type: String, required: true, index: true },
    bhxh: { type: String, required: true, index: true, unique: true },
    cccd: { type: String },
    dob: { type: String },
    dobDate: { type: Date, index: true },
    gender: { type: String },
    birthPlace: { type: String },
    kcb: { type: String },
    receiptDate: { type: String },
    receiptNo: { type: String },
    amount: { type: String },
    support: { type: String },
    months: { type: String },
    staffCode: { type: String },
    phone: { type: String, index: true },
    expiry: { type: String, index: true },
    expiryDate: { type: Date, index: true },
    needCall: { type: String, default: 'Không' },
    renewType: { type: String, default: '' },
    callDate: { type: String },
    relation: { type: String },
    note: { type: String },
    contactStatus: { type: String, default: 'Chưa liên hệ' },
    workflowStatus: { type: String, default: 'Chưa liên hệ', index: true },
  },
  {
    timestamps: true,
  }
);

// Prevent compiling model multiple times
export default models.BhytCustomer || model<IBhytCustomer>('BhytCustomer', BhytCustomerSchema);
