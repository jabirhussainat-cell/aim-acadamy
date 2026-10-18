import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectToDatabase from '@/lib/mongodb';
import { getSessionUser, logAudit } from '@/lib/auth';
import { TestRegistrationBatch } from '@/models/TestRegistrationBatch';
import {
  isRazorpayConfigured,
  createRazorpayOrder,
  RAZORPAY_KEY_ID,
} from '@/lib/razorpay';

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { batchId } = await req.json();
    if (!batchId || !mongoose.Types.ObjectId.isValid(batchId)) {
      return NextResponse.json({ error: 'Valid batch ID is required' }, { status: 400 });
    }

    await connectToDatabase();

    const batch = await TestRegistrationBatch.findById(batchId)
      .populate('testEventId', 'name code')
      .populate('unitId', 'name unitCode');

    if (!batch) {
      return NextResponse.json({ error: 'Batch not found' }, { status: 404 });
    }

    // Role check: Unit can only pay for their own batch
    if (session.role === 'UNIT' && batch.unitId._id.toString() !== session.unitId) {
      return NextResponse.json({ error: 'Forbidden: Access denied to this batch' }, { status: 403 });
    }

    if (batch.paymentStatus === 'PAID') {
      return NextResponse.json(
        { error: 'This registration batch has already been paid and confirmed' },
        { status: 400 }
      );
    }

    const configured = isRazorpayConfigured();

    if (!configured) {
      // Gateway credentials are not set in environment or are placeholders
      return NextResponse.json({
        success: false,
        configured: false,
        orderId: `order_sandbox_${batch.batchNumber}_${Date.now()}`,
        amount: batch.grossAmount,
        currency: 'INR',
        batchNumber: batch.batchNumber,
        keyId: RAZORPAY_KEY_ID,
        message:
          'Razorpay credentials are currently set to placeholders in .env. To enable real gateway checkout, configure RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET with valid Razorpay credentials.',
        instructions:
          '1. Obtain Razorpay Key ID and Secret from https://dashboard.razorpay.com/#/accesskeys\n2. Add them to .env as RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET\n3. Restart dev server to process live/test gateway transactions.',
      });
    }

    // Real Razorpay order creation on the server
    const order = await createRazorpayOrder({
      amountInRupees: batch.grossAmount,
      receipt: batch.batchNumber,
      notes: {
        batchId: batch._id.toString(),
        unitCode: (batch.unitId as unknown as { unitCode: string }).unitCode,
        batchNumber: batch.batchNumber,
      },
    });

    await logAudit({
      action: 'CREATE_PAYMENT_ORDER',
      resourceType: 'Payment',
      resourceId: order.id,
      details: {
        batchId: batch._id.toString(),
        batchNumber: batch.batchNumber,
        amount: batch.grossAmount,
      },
      user: session,
    });

    return NextResponse.json({
      success: true,
      configured: true,
      orderId: order.id,
      amount: batch.grossAmount,
      amountInPaise: order.amount,
      currency: 'INR',
      keyId: RAZORPAY_KEY_ID,
      batchNumber: batch.batchNumber,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create payment order';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
