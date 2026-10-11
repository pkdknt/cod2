import { Schema, Document, model, models } from 'mongoose';

export interface IVaccineProtocolCustom extends Document {
  vaccine: string;
  disease?: string;
  object: string;
  schedule: string;
  route?: string;
  sourceRow?: string;
  createdAt: Date;
  updatedAt: Date;
}

const VaccineProtocolCustomSchema = new Schema<IVaccineProtocolCustom>(
  {
    vaccine: { type: String, required: true },
    disease: { type: String },
    object: { type: String, required: true },
    schedule: { type: String, required: true },
    route: { type: String },
    sourceRow: { type: String },
  },
  { timestamps: true }
);

VaccineProtocolCustomSchema.index({ vaccine: 1 });

export default models.VaccineProtocolCustom ||
  model<IVaccineProtocolCustom>('VaccineProtocolCustom', VaccineProtocolCustomSchema);
