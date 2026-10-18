import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITestRegistration extends Document {
  batchId: mongoose.Types.ObjectId;
  testEventId: mongoose.Types.ObjectId;
  unitId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  currentBeltAtRegistration: string;
  targetBelt: string;
  feePaid: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  createdAt: Date;
  updatedAt: Date;
}

const TestRegistrationSchema = new Schema<ITestRegistration>(
  {
    batchId: { type: Schema.Types.ObjectId, ref: 'TestRegistrationBatch', required: true, index: true },
    testEventId: { type: Schema.Types.ObjectId, ref: 'TestEvent', required: true, index: true },
    unitId: { type: Schema.Types.ObjectId, ref: 'Unit', required: true, index: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
    currentBeltAtRegistration: { type: String, required: true },
    targetBelt: { type: String, required: true },
    feePaid: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ['PENDING', 'CONFIRMED', 'CANCELLED'],
      default: 'PENDING',
      index: true,
    },
  },
  { timestamps: true }
);

// Compound index to help lookup and prevent duplicate active registrations
TestRegistrationSchema.index({ testEventId: 1, studentId: 1, status: 1 });

export const TestRegistration: Model<ITestRegistration> =
  mongoose.models.TestRegistration ||
  mongoose.model<ITestRegistration>('TestRegistration', TestRegistrationSchema);

export default TestRegistration;
