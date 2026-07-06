import { Schema, Document, model, models } from 'mongoose';

export interface ITheXanhCustomer extends Document {
  code: string;
  name: string;
  birthYear?: string;
  gender?: string;
  address?: string;
  unit?: string;
  examDate?: string;
  examDateParsed?: Date;
  signer?: string;
  signerTitle?: string;
  conclusion?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TheXanhCustomerSchema = new Schema<ITheXanhCustomer>(
  {
    code: { type: String, required: true, index: true, unique: true },
    name: { type: String, required: true, index: true },
    birthYear: { type: String },
    gender: { type: String },
    address: { type: String },
    unit: { type: String },
    examDate: { type: String },
    examDateParsed: { type: Date, index: true },
    signer: { type: String },
    signerTitle: { type: String },
    conclusion: { type: String, default: 'ĐỦ SỨC KHỎE' }
  },
  {
    timestamps: true,
  }
);

export default models.TheXanhCustomer || model<ITheXanhCustomer>('TheXanhCustomer', TheXanhCustomerSchema);
