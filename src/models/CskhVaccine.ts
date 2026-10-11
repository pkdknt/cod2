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
    patientCode: { type: String },
    patientName: { type: String, required: true },
    phone: { type: String },
    dob: { type: String },
    gender: { type: String },
    address: { type: String },
    vaccine: { type: String, required: true },
    protocolId: { type: String, required: true },
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

// Indexes tuned for the actual query patterns:
// - dedup lookup during Excel/bulk import (dob + vaccine + code/name)
// - exact vaccine filter + newest-first listing
CskhVaccineSchema.index({ patientCode: 1, dob: 1, vaccine: 1 });
CskhVaccineSchema.index({ patientName: 1, dob: 1, vaccine: 1 });
CskhVaccineSchema.index({ vaccine: 1 });
CskhVaccineSchema.index({ updatedAt: -1 });

export default models.CskhVaccine || model<ICskhVaccine>('CskhVaccine', CskhVaccineSchema);
