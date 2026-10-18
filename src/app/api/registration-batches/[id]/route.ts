import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectToDatabase from '@/lib/mongodb';
import { getSessionUser } from '@/lib/auth';
import { TestRegistrationBatch } from '@/models/TestRegistrationBatch';
import { TestRegistration } from '@/models/TestRegistration';
import { Payment } from '@/models/Payment';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionUser(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid Batch ID' }, { status: 400 });
    }

    await connectToDatabase();

    const batch = await TestRegistrationBatch.findById(id)
      .populate('testEventId')
      .populate('unitId');

    if (!batch) {
      return NextResponse.json({ error: 'Batch not found' }, { status: 404 });
    }

    // Role check: Unit can only view their own batch
    if (session.role === 'UNIT' && batch.unitId._id.toString() !== session.unitId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const [studentsInBatch, payment] = await Promise.all([
      TestRegistration.find({ batchId: batch._id })
        .populate('studentId', 'fullName registrationNumber currentBelt dateOfBirth gender contactNumber')
        .sort({ createdAt: 1 }),
      batch.paymentId ? Payment.findById(batch.paymentId) : null,
    ]);

    return NextResponse.json({
      batch,
      students: studentsInBatch,
      payment,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch batch';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
