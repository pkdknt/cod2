import { Schema, Document, model, models } from 'mongoose';

export type BhytCaseType = 'Mua mới' | 'Gia hạn';

export interface IBhytCase extends Document {
  date: string;
  type: BhytCaseType;
  qty: number;
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BhytCaseSchema = new Schema<IBhytCase>(
  {
    date: { type: String, required: true },
    type: { type: String, required: true, enum: ['Mua mới', 'Gia hạn'] },
    qty: { type: Number, required: true, min: 1 },
    note: { type: String },
  },
  { timestamps: true }
);

BhytCaseSchema.index({ date: -1 });
BhytCaseSchema.index({ type: 1 });

export default models.BhytCase || model<IBhytCase>('BhytCase', BhytCaseSchema);
