import { Schema, Document, model, models } from 'mongoose';
import { CALL_RESULTS, REFERRAL_STATUSES } from '@/lib/referral';

export { CALL_RESULTS, REFERRAL_STATUSES };

export interface ICskhReferral extends Document {
  date: string;
  admissionNo?: string;
  patientCode?: string;
  cccd?: string;
  birthDate?: string;
  name: string;
  gender?: string;
  age?: string;
  address?: string;
  phone?: string;
  bhyt?: string;
  bhytNo?: string;
  bhytExpiry?: string;
  destinationHospital?: string;
  diagnosis?: string;
  treatment?: string;
  clinic?: string;
  doctor?: string;
  callDate?: string;
  callResult?: string;
  status?: string;
  note?: string;
  vip?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CskhReferralSchema = new Schema<ICskhReferral>(
  {
    date: { type: String, required: true },
    admissionNo: { type: String },
    patientCode: { type: String },
    cccd: { type: String },
    birthDate: { type: String },
    name: { type: String, required: true },
    gender: { type: String, enum: ['Nam', 'Nữ', ''] },
    age: { type: String },
    address: { type: String },
    phone: { type: String },
    bhyt: { type: String, enum: ['Có', 'Không', ''] },
    bhytNo: { type: String },
    bhytExpiry: { type: String },
    destinationHospital: { type: String },
    diagnosis: { type: String },
    treatment: { type: String },
    clinic: { type: String },
    doctor: { type: String },
    callDate: { type: String },
    callResult: { type: String, enum: [...CALL_RESULTS, ''] },
    status: { type: String, enum: [...REFERRAL_STATUSES, ''] },
    note: { type: String },
    vip: { type: String, enum: ['Có', 'Không', ''] },
  },
  { timestamps: true }
);

// Filters/sorts used by the list and the monthly report.
CskhReferralSchema.index({ date: -1 });
CskhReferralSchema.index({ status: 1 });
CskhReferralSchema.index({ callResult: 1 });
CskhReferralSchema.index({ destinationHospital: 1 });
CskhReferralSchema.index({ doctor: 1 });
CskhReferralSchema.index({ name: 1 });

export default models.CskhReferral || model<ICskhReferral>('CskhReferral', CskhReferralSchema);
