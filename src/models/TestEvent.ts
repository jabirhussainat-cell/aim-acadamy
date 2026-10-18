import mongoose, { Schema, Document, Model } from 'mongoose';

export type TestEventStatus =
  | 'Draft'
  | 'Upcoming'
  | 'Registration Open'
  | 'Registration Closed'
  | 'Completed'
  | 'Cancelled';

export interface ITestEvent extends Document {
  name: string;
  code: string;
  discipline: string;
  description: string;
  testDate: Date;
  startTime?: string;
  endTime?: string;
  venue: string;
  examinerMaster: string;
  registrationOpenDate: Date;
  registrationCloseDate: Date;
  eligibleCurrentBelts: string[];
  availableTargetBelts: string[];
  feePerStudent: number;
  status: TestEventStatus;
  instructions?: string;
  resultsPublished: boolean;
  resultsPublishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TestEventSchema = new Schema<ITestEvent>(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    discipline: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    testDate: { type: Date, required: true },
    startTime: { type: String, trim: true },
    endTime: { type: String, trim: true },
    venue: { type: String, required: true, trim: true },
    examinerMaster: { type: String, required: true, trim: true },
    registrationOpenDate: { type: Date, required: true },
    registrationCloseDate: { type: Date, required: true },
    eligibleCurrentBelts: { type: [String], default: [] },
    availableTargetBelts: { type: [String], default: [] },
    feePerStudent: { type: Number, required: true, min: 0, default: 400 },
    status: {
      type: String,
      enum: ['Draft', 'Upcoming', 'Registration Open', 'Registration Closed', 'Completed', 'Cancelled'],
      default: 'Draft',
      index: true,
    },
    instructions: { type: String },
    resultsPublished: { type: Boolean, default: false },
    resultsPublishedAt: { type: Date },
  },
  { timestamps: true }
);

TestEventSchema.index({ code: 1 });
TestEventSchema.index({ status: 1, testDate: 1 });

export const TestEvent: Model<ITestEvent> =
  mongoose.models.TestEvent || mongoose.model<ITestEvent>('TestEvent', TestEventSchema);

export default TestEvent;
