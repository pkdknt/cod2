import { Schema, Document, model, models } from 'mongoose';

export interface IWarehouseTransaction extends Document {
  warehouseType: 'vtyt' | 'ho-ly' | 'vpp';
  date: string;               // yyyy-mm-dd
  type: 'Tồn đầu' | 'Nhập' | 'Xuất';
  itemName: string;
  unit: string;
  quantity: number;
  price: number;
  department?: string;
  employee?: string;
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}

const WarehouseTransactionSchema = new Schema<IWarehouseTransaction>(
  {
    warehouseType: { type: String, required: true, enum: ['vtyt', 'ho-ly', 'vpp'], index: true },
    date: { type: String, required: true, index: true },
    type: { type: String, required: true, enum: ['Tồn đầu', 'Nhập', 'Xuất'], index: true },
    itemName: { type: String, required: true, index: true },
    unit: { type: String, required: true },
    quantity: { type: Number, required: true, default: 0 },
    price: { type: Number, required: true, default: 0 },
    department: { type: String, index: true },
    employee: { type: String, index: true },
    note: { type: String },
  },
  {
    timestamps: true,
  }
);

export default models.WarehouseTransaction || model<IWarehouseTransaction>('WarehouseTransaction', WarehouseTransactionSchema);
