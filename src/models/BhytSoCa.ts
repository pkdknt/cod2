import { Schema, Document, model, models } from 'mongoose';

export interface IBhytSoCa extends Document {
  date: string; // YYYY-MM-DD
  type: 'Mua mới' | 'Gia hạn';
  qty: number;
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BhytSoCaSchema = new Schema<IBhytSoCa>(
  {
    date: { type: String, required: true, index: true },
    type: { type: String, required: true, enum: ['Mua mới', 'Gia hạn'], index: true },
    qty: { type: Number, required: true, min: 1 },
    note: { type: String }
  },
  {
    timestamps: true,
  }
);

export default models.BhytSoCa || model<IBhytSoCa>('BhytSoCa', BhytSoCaSchema);
