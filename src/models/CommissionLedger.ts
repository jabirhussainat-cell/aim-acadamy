import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICommissionLedger extends Document {
  unitId: mongoose.Types.ObjectId;
  batchId?: mongoose.Types.ObjectId;
  paymentId?: mongoose.Types.ObjectId;
  testEventId?: mongoose.Types.ObjectId;
  grossAmount: number;
  commissionRate: number;
  commissionEarned: number;
  organizationShare: number;
  type: 'EARNED' | 'PAYOUT';
  status: 'ACCRUED' | 'PAID_OUT';
  notes?: string;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

const CommissionLedgerSchema = new Schema<ICommissionLedger>(
  {
    unitId: { type: Schema.Types.ObjectId, ref: 'Unit', required: true, index: true },
    batchId: { type: Schema.Types.ObjectId, ref: 'TestRegistrationBatch', index: true },
    paymentId: { type: Schema.Types.ObjectId, ref: 'Payment' },
    testEventId: { type: Schema.Types.ObjectId, ref: 'TestEvent', index: true },
    grossAmount: { type: Number, required: true, min: 0 },
    commissionRate: { type: Number, required: true, min: 0, max: 100 },
    commissionEarned: { type: Number, required: true, min: 0 },
    organizationShare: { type: Number, required: true, min: 0 },
    type: { type: String, enum: ['EARNED', 'PAYOUT'], default: 'EARNED' },
    status: { type: String, enum: ['ACCRUED', 'PAID_OUT'], default: 'ACCRUED', index: true },
    notes: { type: String },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

CommissionLedgerSchema.index({ unitId: 1, date: -1 });

export const CommissionLedger: Model<ICommissionLedger> =
  mongoose.models.CommissionLedger ||
  mongoose.model<ICommissionLedger>('CommissionLedger', CommissionLedgerSchema);

export default CommissionLedger;
