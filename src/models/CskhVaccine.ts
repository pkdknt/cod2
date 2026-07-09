import { Schema, Document, model, models } from 'mongoose';

export interface ICskhVaccine extends Document {
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
  called?: boolean[];        // Array of 6 booleans: called status
  messaged?: boolean[];      // Array of 6 booleans: messaged status
  createdAt: Date;
  updatedAt: Date;
}

const CskhVaccineSchema = new Schema<ICskhVaccine>(
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
    notes: { type: [String], default: ['', '', '', '', '', ''] },
    called: { type: [Boolean], default: [false, false, false, false, false, false] },
    messaged: { type: [Boolean], default: [false, false, false, false, false, false] }
  },
  {
    timestamps: true,
  }
);

export default models.CskhVaccine || model<ICskhVaccine>('CskhVaccine', CskhVaccineSchema);
