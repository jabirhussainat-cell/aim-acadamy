import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITestRegistrationBatch extends Document {
  batchNumber: string;
  testEventId: mongoose.Types.ObjectId;
  unitId: mongoose.Types.ObjectId;
  studentCount: number;
  feePerStudent: number;
  grossAmount: number;
  commissionRate: number;
  commissionAmount: number;
  organizationShare: number;
  currency: string;
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'CANCELLED';
  registrationStatus: 'DRAFT' | 'CONFIRMED' | 'CANCELLED';
  paymentId?: mongoose.Types.ObjectId;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TestRegistrationBatchSchema = new Schema<ITestRegistrationBatch>(
  {
    batchNumber: { type: String, required: true, unique: true, uppercase: true, trim: true },
    testEventId: { type: Schema.Types.ObjectId, ref: 'TestEvent', required: true, index: true },
    unitId: { type: Schema.Types.ObjectId, ref: 'Unit', required: true, index: true },
    studentCount: { type: Number, required: true, min: 1 },
    feePerStudent: { type: Number, required: true, min: 0 },
    grossAmount: { type: Number, required: true, min: 0 },
    commissionRate: { type: Number, required: true, min: 0, max: 100 },
    commissionAmount: { type: Number, required: true, min: 0 },
    organizationShare: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'INR' },
    paymentStatus: {
      type: String,
      enum: ['PENDING', 'PAID', 'FAILED', 'CANCELLED'],
      default: 'PENDING',
      index: true,
    },
    registrationStatus: {
      type: String,
      enum: ['DRAFT', 'CONFIRMED', 'CANCELLED'],
      default: 'DRAFT',
      index: true,
    },
    paymentId: { type: Schema.Types.ObjectId, ref: 'Payment' },
    notes: { type: String },
  },
  { timestamps: true }
);

TestRegistrationBatchSchema.index({ batchNumber: 1 });
TestRegistrationBatchSchema.index({ unitId: 1, testEventId: 1 });

export const TestRegistrationBatch: Model<ITestRegistrationBatch> =
  mongoose.models.TestRegistrationBatch ||
  mongoose.model<ITestRegistrationBatch>('TestRegistrationBatch', TestRegistrationBatchSchema);

export default TestRegistrationBatch;
