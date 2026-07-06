import mongoose, { Schema, Document, model, models } from 'mongoose';

export interface IPatientTransfer extends Document {
  date?: string;               // yyyy-mm-dd
  transferDate?: Date;         // Date object for sorting/filtering
  admissionNo?: string;
  patientCode?: string;
  cccd?: string;
  name: string;
  birthDate?: string;          // dd/mm/yyyy or yyyy
  gender?: string;
  age?: number;
  phone?: string;
  bhyt?: string;               // 'Có' | 'Không'
  bhytNo?: string;
  bhytExpiry?: string;         // yyyy-mm-dd
  bhytExpiryDate?: Date;       // Date object
  destinationHospital?: string;
  clinic?: string;
  doctor?: string;
  address?: string;
  diagnosis?: string;
  treatment?: string;
  callDate?: string;           // yyyy-mm-dd
  callResult?: string;         // 'Chưa gọi' | 'Đã gọi' | 'Không nghe máy' | ...
  status?: string;             // 'Mới' | 'Đang theo dõi' | 'Cần gọi lại' | 'Hoàn tất'
  vip?: string;                // 'Có' | 'Không'
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PatientTransferSchema = new Schema<IPatientTransfer>(
  {
    date: { type: String, index: true },
    transferDate: { type: Date, index: true },
    admissionNo: { type: String, index: true },
    patientCode: { type: String, index: true },
    cccd: { type: String },
    name: { type: String, required: true, index: true },
    birthDate: { type: String },
    gender: { type: String },
    age: { type: Number },
    phone: { type: String, index: true },
    bhyt: { type: String, default: 'Có' },
    bhytNo: { type: String },
    bhytExpiry: { type: String },
    bhytExpiryDate: { type: Date },
    destinationHospital: { type: String, index: true },
    clinic: { type: String, index: true },
    doctor: { type: String, index: true },
    address: { type: String },
    diagnosis: { type: String },
    treatment: { type: String },
    callDate: { type: String },
    callResult: { type: String, default: 'Chưa gọi', index: true },
    status: { type: String, default: 'Mới', index: true },
    vip: { type: String, default: 'Không' },
    note: { type: String },
  },
  {
    timestamps: true,
  }
);

export default models.PatientTransfer || model<IPatientTransfer>('PatientTransfer', PatientTransferSchema);
