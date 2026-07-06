import mongoose, { Schema, Document, model, models } from 'mongoose';

export interface IWarehouseMetadata extends Document {
  warehouseType: 'vtyt' | 'ho-ly' | 'vpp';
  employees: string[];
  departments: string[];
  createdAt: Date;
  updatedAt: Date;
}

const WarehouseMetadataSchema = new Schema<IWarehouseMetadata>(
  {
    warehouseType: { type: String, required: true, unique: true, enum: ['vtyt', 'ho-ly', 'vpp'], index: true },
    employees: { type: [String], default: [] },
    departments: { type: [String], default: [] },
  },
  {
    timestamps: true,
  }
);

export default models.WarehouseMetadata || model<IWarehouseMetadata>('WarehouseMetadata', WarehouseMetadataSchema);
