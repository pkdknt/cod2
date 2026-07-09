import { Schema, Document, model, models } from 'mongoose';

export interface IVaccineSchedule extends Document {
  patientCode?: string;
  patientName: string;
  phone?: string;
  dob?: string;
  gender?: string;
  address?: string;
  vaccine: string;
  protocolId: string;
  dates: string[];           // Array of 6 dates: actual dose dates
  dueOverrides: string[];    // Array of 6 dates: overridden due dates
  notes: string[];           // Array of 6 notes
  createdAt: Date;
  updatedAt: Date;
}

const VaccineScheduleSchema = new Schema<IVaccineSchedule>(
  {
    patientCode: { type: String, index: true },
    patientName: { type: String, required: true, index: true },
    phone: { type: String, index: true },
    dob: { type: String },
    gender: { type: String },
    address: { type: String },
    vaccine: { type: String, required: true, index: true },
    protocolId: { type: String, required: true, index: true },
    dates: { type: [String], default: ['', '', '', '', '', ''] },
    dueOverrides: { type: [String], default: ['', '', '', '', '', ''] },
    notes: { type: [String], default: ['', '', '', '', '', ''] }
  },
  {
    timestamps: true,
  }
);

export default models.VaccineSchedule || model<IVaccineSchedule>('VaccineSchedule', VaccineScheduleSchema);
