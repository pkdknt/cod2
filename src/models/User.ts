import mongoose, { Schema, Document, model, models } from 'mongoose';

export interface IUser extends Document {
  username: string;
  passwordHash: string;
  fullName: string;
  role: 'admin' | 'manager' | 'staff';
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    username: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    fullName: { type: String, required: true },
    role: { type: String, enum: ['admin', 'manager', 'staff'], default: 'staff' },
  },
  {
    timestamps: true,
  }
);

export default models.User || model<IUser>('User', UserSchema);
