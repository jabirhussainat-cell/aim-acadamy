import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAffiliationRequest extends Document {
  applicationNumber: string;
  unitName: string;
  headPerson: string;
  contactNumber: string;
  email: string;
  district: string;
  city: string;
  address: string;
  pincode: string;
  country: string;
  disciplinesOffered: string[];
  instructorQualifications: string;
  activeStudentsCount: number;
  additionalNotes?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedByName?: string;
  reviewedAt?: Date;
  rejectionReason?: string;
  createdUnitId?: mongoose.Types.ObjectId;
  createdUnitCode?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AffiliationRequestSchema = new Schema<IAffiliationRequest>(
  {
    applicationNumber: { type: String, required: true, unique: true, uppercase: true, trim: true },
    unitName: { type: String, required: true, trim: true },
    headPerson: { type: String, required: true, trim: true },
    contactNumber: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    district: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    pincode: { type: String, required: true, trim: true },
    country: { type: String, default: 'India', trim: true },
    disciplinesOffered: { type: [String], default: [] },
    instructorQualifications: { type: String, required: true, trim: true },
    activeStudentsCount: { type: Number, required: true, min: 0 },
    additionalNotes: { type: String, trim: true },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED'],
      default: 'PENDING',
    },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    reviewedByName: { type: String },
    reviewedAt: { type: Date },
    rejectionReason: { type: String, trim: true },
    createdUnitId: { type: Schema.Types.ObjectId, ref: 'Unit' },
    createdUnitCode: { type: String, trim: true },
  },
  { timestamps: true }
);

AffiliationRequestSchema.index({ applicationNumber: 1 });
AffiliationRequestSchema.index({ status: 1 });
AffiliationRequestSchema.index({ district: 1 });
AffiliationRequestSchema.index({ email: 1 });
AffiliationRequestSchema.index({ createdAt: -1 });

export const AffiliationRequest: Model<IAffiliationRequest> =
  mongoose.models.AffiliationRequest ||
  mongoose.model<IAffiliationRequest>('AffiliationRequest', AffiliationRequestSchema);

export default AffiliationRequest;
