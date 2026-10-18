import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IOrganizationSettings extends Document {
  organizationName: string;
  tagline: string;
  contactPhone: string;
  contactEmail: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  defaultTestFee: number;
  defaultCommissionRate: number;
  currency: string;
  updatedAt: Date;
}

const OrganizationSettingsSchema = new Schema<IOrganizationSettings>(
  {
    organizationName: { type: String, default: 'AIM Martial Arts Academy', trim: true },
    tagline: { type: String, default: 'Excellence, Discipline, Mastery', trim: true },
    contactPhone: { type: String, default: '8943839386', trim: true },
    contactEmail: { type: String, default: 'info@aimacademy.org', trim: true },
    address: { type: String, default: 'Central Dojo Headquarters', trim: true },
    city: { type: String, default: 'Kochi', trim: true },
    state: { type: String, default: 'Kerala', trim: true },
    pincode: { type: String, default: '682001', trim: true },
    country: { type: String, default: 'India', trim: true },
    defaultTestFee: { type: Number, default: 400, min: 0 },
    defaultCommissionRate: { type: Number, default: 10, min: 0, max: 100 },
    currency: { type: String, default: 'INR', trim: true },
  },
  { timestamps: true }
);

export const OrganizationSettings: Model<IOrganizationSettings> =
  mongoose.models.OrganizationSettings ||
  mongoose.model<IOrganizationSettings>('OrganizationSettings', OrganizationSettingsSchema);

export default OrganizationSettings;
