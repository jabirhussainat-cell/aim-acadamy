import mongoose, { Schema, Document, Model } from 'mongoose';

export type UserRole = 'SUPER_ADMIN' | 'UNIT';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  unitId?: mongoose.Types.ObjectId;
  adminIndex?: number; // 1, 2, 3, 4 for the 4 Super Admins
  status: 'ACTIVE' | 'INACTIVE';
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['SUPER_ADMIN', 'UNIT'], required: true },
    unitId: { type: Schema.Types.ObjectId, ref: 'Unit', default: null },
    adminIndex: { type: Number, min: 1, max: 4 },
    status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
    lastLogin: { type: Date },
  },
  { timestamps: true }
);

// Prevent re-compilation of model in hot reload
export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
