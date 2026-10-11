import { Schema, Document, model, models } from 'mongoose';

export interface IVaccinePrice extends Document {
  name: string;
  unit: string;
  price: number;
  checkupPrice: number;
  createdAt: Date;
  updatedAt: Date;
}

const VaccinePriceSchema = new Schema<IVaccinePrice>(
  {
    name: { type: String, required: true },
    unit: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    checkupPrice: { type: Number, required: true, default: 0, min: 0 }
  },
  {
    timestamps: true,
  }
);

VaccinePriceSchema.index({ name: 1 });
VaccinePriceSchema.index({ createdAt: -1 });

export default models.VaccinePrice || model<IVaccinePrice>('VaccinePrice', VaccinePriceSchema);
