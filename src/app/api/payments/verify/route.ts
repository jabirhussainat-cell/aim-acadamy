import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectToDatabase from '@/lib/mongodb';
import { getSessionUser, logAudit } from '@/lib/auth';
import { TestRegistrationBatch } from '@/models/TestRegistrationBatch';
import { TestRegistration } from '@/models/TestRegistration';
import { Payment } from '@/models/Payment';
import { CommissionLedger } from '@/models/CommissionLedger';
import {
  isRazorpayConfigured,
  verifyRazorpaySignature,
} from '@/lib/razorpay';

async function generateNextReceiptNumber(): Promise<string> {
  const currentYear = new Date().getFullYear();
  const prefix = `RCPT-${currentYear}-`;
  const latest = await Payment.findOne({ receiptNumber: { $regex: `^${prefix}` } }).sort({
    receiptNumber: -1,
  });

  let seq = 1;
  if (latest && latest.receiptNumber) {
    const parts = latest.receiptNumber.split('-');
    if (parts.length === 3) {
      const num = parseInt(parts[2], 10);
      if (!isNaN(num)) seq = num + 1;
    }
  }

  return `${prefix}${String(seq).padStart(4, '0')}`;
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      batchId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      paymentMethod,
    } = await req.json();

    if (!batchId || !mongoose.Types.ObjectId.isValid(batchId)) {
      return NextResponse.json({ error: 'Valid batch ID is required' }, { status: 400 });
    }

    await connectToDatabase();

    const batch = await TestRegistrationBatch.findById(batchId);
    if (!batch) {
      return NextResponse.json({ error: 'Batch not found' }, { status: 404 });
    }

    // Role check: Unit can only verify payment for their own batch
    if (session.role === 'UNIT' && batch.unitId.toString() !== session.unitId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Idempotency: prevent double verification
    if (batch.paymentStatus === 'PAID') {
      const existingPayment = await Payment.findOne({ batchId: batch._id });
      return NextResponse.json({
        success: true,
        message: 'This batch has already been verified and paid',
        receiptNumber: existingPayment?.receiptNumber,
        payment: existingPayment,
      });
    }

    const configured = isRazorpayConfigured();

    if (configured) {
      if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
        return NextResponse.json(
          { error: 'Razorpay order ID, payment ID, and signature are required for verification' },
          { status: 400 }
        );
      }

      const isValidSignature = verifyRazorpaySignature({
        orderId: razorpayOrderId,
        paymentId: razorpayPaymentId,
        signature: razorpaySignature,
      });

      if (!isValidSignature) {
        // Record failed attempt
        const receiptNumber = await generateNextReceiptNumber();
        await Payment.create({
          batchId: batch._id,
          unitId: batch.unitId,
          amount: batch.grossAmount,
          gateway: 'RAZORPAY',
          razorpayOrderId,
          razorpayPaymentId,
          razorpaySignature,
          status: 'FAILED',
          errorDetails: 'Invalid HMAC signature provided in payment verification callback',
          receiptNumber,
        });

        await logAudit({
          action: 'PAYMENT_SIGNATURE_FAILED',
          resourceType: 'Payment',
          resourceId: razorpayOrderId,
          details: { batchId: batch._id.toString(), orderId: razorpayOrderId },
          user: session,
        });

        return NextResponse.json(
          { error: 'Payment verification failed: Invalid payment signature' },
          { status: 400 }
        );
      }
    } else {
      // Razorpay is in unconfigured placeholder mode.
      // Refuse verification and instruct how to configure live credentials.
      return NextResponse.json(
        {
          error:
            'Razorpay credentials are not configured in .env. Live payment cannot be verified without valid RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.',
          configured: false,
        },
        { status: 400 }
      );
    }

    // Verified successfully: Record Payment and confirm batch
    const receiptNumber = await generateNextReceiptNumber();
    const paidAt = new Date();

    const payment = new Payment({
      batchId: batch._id,
      unitId: batch.unitId,
      amount: batch.grossAmount,
      currency: 'INR',
      gateway: 'RAZORPAY',
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      status: 'CAPTURED',
      paymentMethod: paymentMethod || 'ONLINE',
      receiptNumber,
      paidAt,
    });

    await payment.save();

    // Update batch status
    batch.paymentStatus = 'PAID';
    batch.registrationStatus = 'CONFIRMED';
    batch.paymentId = payment._id;
    await batch.save();

    // Confirm all individual student registrations in this batch
    await TestRegistration.updateMany(
      { batchId: batch._id },
      { $set: { status: 'CONFIRMED' } }
    );

    // Record Commission Ledger entry
    await CommissionLedger.create({
      unitId: batch.unitId,
      batchId: batch._id,
      paymentId: payment._id,
      testEventId: batch.testEventId,
      grossAmount: batch.grossAmount,
      commissionRate: batch.commissionRate,
      commissionEarned: batch.commissionAmount,
      organizationShare: batch.organizationShare,
      type: 'EARNED',
      status: 'ACCRUED',
      date: paidAt,
      notes: `Earned ${batch.commissionRate}% commission on Batch ${batch.batchNumber} (${batch.studentCount} students)`,
    });

    await logAudit({
      action: 'PAYMENT_VERIFIED_SUCCESS',
      resourceType: 'Payment',
      resourceId: payment._id.toString(),
      details: {
        receiptNumber,
        batchNumber: batch.batchNumber,
        grossAmount: batch.grossAmount,
        commissionEarned: batch.commissionAmount,
        organizationShare: batch.organizationShare,
      },
      user: session,
    });

    return NextResponse.json({
      success: true,
      message: 'Payment verified and batch registration confirmed successfully',
      receiptNumber,
      payment,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to verify payment';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
