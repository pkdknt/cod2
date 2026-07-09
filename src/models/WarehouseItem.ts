import { Schema, Document, model, models } from 'mongoose';

export interface IWarehouseItem extends Document {
  warehouseType: 'vtyt' | 'ho-ly' | 'vpp';
  name: string;
  unit: string;
  group?: string;
  createdAt: Date;
  updatedAt: Date;
}

const WarehouseItemSchema = new Schema<IWarehouseItem>(
  {
    warehouseType: { type: String, required: true, enum: ['vtyt', 'ho-ly', 'vpp'], index: true },
    name: { type: String, required: true, index: true },
    unit: { type: String, required: true },
    group: { type: String },
  },
  {
    timestamps: true,
  }
);

// Unique item per warehouse type
WarehouseItemSchema.index({ warehouseType: 1, name: 1 }, { unique: true });

export default models.WarehouseItem || model<IWarehouseItem>('WarehouseItem', WarehouseItemSchema);
