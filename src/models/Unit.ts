import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUnit extends Document {
  unitCode: string;
  name: string;
  headPerson: string;
  contactNumber: string;
  email: string;
  address: string;
  city: string;
  district: string;
  state: string;
  pincode: string;
  country: string;
  associatedInstructor?: string;
  disciplinesOffered: string[];
  registrationDate: Date;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: Date;
  updatedAt: Date;
}

const UnitSchema = new Schema<IUnit>(
  {
    unitCode: { type: String, required: true, unique: true, uppercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    headPerson: { type: String, required: true, trim: true },
    contactNumber: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    address: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    district: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    pincode: { type: String, required: true, trim: true },
    country: { type: String, default: 'India', trim: true },
    associatedInstructor: { type: String, trim: true },
    disciplinesOffered: { type: [String], default: [] },
    registrationDate: { type: Date, default: Date.now },
    status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
  },
  { timestamps: true }
);

UnitSchema.index({ unitCode: 1 });
UnitSchema.index({ email: 1 });
UnitSchema.index({ status: 1 });

export const Unit: Model<IUnit> =
  mongoose.models.Unit || mongoose.model<IUnit>('Unit', UnitSchema);

export default Unit;
