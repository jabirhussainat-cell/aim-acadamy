import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPayment extends Document {
  batchId: mongoose.Types.ObjectId;
  unitId: mongoose.Types.ObjectId;
  amount: number;
  currency: string;
  gateway: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  status: 'CREATED' | 'AUTHORIZED' | 'CAPTURED' | 'FAILED' | 'REFUNDED';
  paymentMethod?: string;
  receiptNumber: string;
  errorDetails?: string;
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    batchId: { type: Schema.Types.ObjectId, ref: 'TestRegistrationBatch', required: true, index: true },
    unitId: { type: Schema.Types.ObjectId, ref: 'Unit', required: true, index: true },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'INR' },
    gateway: { type: String, default: 'RAZORPAY' },
    razorpayOrderId: { type: String, index: true },
    razorpayPaymentId: { type: String, index: true },
    razorpaySignature: { type: String },
    status: {
      type: String,
      enum: ['CREATED', 'AUTHORIZED', 'CAPTURED', 'FAILED', 'REFUNDED'],
      default: 'CREATED',
      index: true,
    },
    paymentMethod: { type: String },
    receiptNumber: { type: String, required: true, unique: true, index: true },
    errorDetails: { type: String },
    paidAt: { type: Date },
  },
  { timestamps: true }
);

export const Payment: Model<IPayment> =
  mongoose.models.Payment || mongoose.model<IPayment>('Payment', PaymentSchema);

export default Payment;
