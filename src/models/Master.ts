import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMaster extends Document {
  name: string;
  title: string;
  discipline: string;
  experienceYears: number;
  bio: string;
  contactNumber?: string;
  email?: string;
  profilePhoto?: string;
  status: 'ACTIVE' | 'INACTIVE';
  displayOrder?: number;
  createdAt: Date;
  updatedAt: Date;
}

const MasterSchema = new Schema<IMaster>(
  {
    name: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    discipline: { type: String, required: true, trim: true },
    experienceYears: { type: Number, required: true, min: 0 },
    bio: { type: String, required: true, trim: true },
    contactNumber: { type: String, trim: true },
    email: { type: String, lowercase: true, trim: true },
    profilePhoto: { type: String },
    status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
    displayOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Master: Model<IMaster> =
  mongoose.models.Master || mongoose.model<IMaster>('Master', MasterSchema);

export default Master;
