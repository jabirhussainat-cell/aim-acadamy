import mongoose, { Schema, Document, Model } from 'mongoose';

export type ResultStatus = 'Pass' | 'Fail' | 'Absent' | 'Pending';

export interface ITestResult extends Document {
  testEventId: mongoose.Types.ObjectId;
  registrationId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  unitId: mongoose.Types.ObjectId;
  currentBelt: string;
  targetBelt: string;
  resultStatus: ResultStatus;
  marks?: number;
  examinerComments?: string;
  examinerMaster?: string;
  beltAwarded?: string;
  isPublished: boolean;
  publishedAt?: Date;
  beltUpdatedInProfile: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TestResultSchema = new Schema<ITestResult>(
  {
    testEventId: { type: Schema.Types.ObjectId, ref: 'TestEvent', required: true, index: true },
    registrationId: { type: Schema.Types.ObjectId, ref: 'TestRegistration', required: true, index: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
    unitId: { type: Schema.Types.ObjectId, ref: 'Unit', required: true, index: true },
    currentBelt: { type: String, required: true },
    targetBelt: { type: String, required: true },
    resultStatus: {
      type: String,
      enum: ['Pass', 'Fail', 'Absent', 'Pending'],
      default: 'Pending',
      index: true,
    },
    marks: { type: Number },
    examinerComments: { type: String },
    examinerMaster: { type: String },
    beltAwarded: { type: String },
    isPublished: { type: Boolean, default: false, index: true },
    publishedAt: { type: Date },
    beltUpdatedInProfile: { type: Boolean, default: false },
  },
  { timestamps: true }
);

TestResultSchema.index({ testEventId: 1, studentId: 1 }, { unique: true });
TestResultSchema.index({ unitId: 1, isPublished: 1 });

export const TestResult: Model<ITestResult> =
  mongoose.models.TestResult || mongoose.model<ITestResult>('TestResult', TestResultSchema);

export default TestResult;
