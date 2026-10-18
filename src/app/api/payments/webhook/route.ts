import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { verifyWebhookSignature } from '@/lib/razorpay';
import { TestRegistrationBatch } from '@/models/TestRegistrationBatch';
import { TestRegistration } from '@/models/TestRegistration';
import { Payment } from '@/models/Payment';
import { CommissionLedger } from '@/models/CommissionLedger';
import { AuditLog } from '@/models/AuditLog';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-razorpay-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Missing webhook signature' }, { status: 400 });
    }

    const isValid = verifyWebhookSignature(rawBody, signature);
    if (!isValid) {
      console.warn('Invalid Razorpay webhook signature');
      return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;

    await connectToDatabase();

    if (event === 'payment.captured') {
      const paymentEntity = payload.payload?.payment?.entity;
      const orderId = paymentEntity?.order_id;
      const paymentId = paymentEntity?.id;

      if (orderId) {
        // Find batch by notes or orderId
        const batch = await TestRegistrationBatch.findOne({
          $or: [
            { batchNumber: paymentEntity.notes?.batchNumber },
            { _id: paymentEntity.notes?.batchId },
          ],
        });

        if (batch && batch.paymentStatus !== 'PAID') {
          const receiptNumber = `RCPT-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;

          const payment = new Payment({
            batchId: batch._id,
            unitId: batch.unitId,
            amount: batch.grossAmount,
            currency: 'INR',
            gateway: 'RAZORPAY',
            razorpayOrderId: orderId,
            razorpayPaymentId: paymentId,
            status: 'CAPTURED',
            receiptNumber,
            paidAt: new Date(),
          });
          await payment.save();

          batch.paymentStatus = 'PAID';
          batch.registrationStatus = 'CONFIRMED';
          batch.paymentId = payment._id;
          await batch.save();

          await TestRegistration.updateMany({ batchId: batch._id }, { $set: { status: 'CONFIRMED' } });

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
            date: new Date(),
            notes: `Webhook captured payment for Batch ${batch.batchNumber}`,
          });

          await AuditLog.create({
            action: 'WEBHOOK_PAYMENT_CAPTURED',
            resourceType: 'Payment',
            resourceId: paymentId,
            details: { batchNumber: batch.batchNumber, orderId },
          });
        }
      }
    }

    return NextResponse.json({ status: 'ok' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Webhook error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
