import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectToDatabase from '@/lib/mongodb';
import { getSessionUser, logAudit } from '@/lib/auth';
import { TestEvent } from '@/models/TestEvent';
import { Student } from '@/models/Student';
import { TestRegistrationBatch } from '@/models/TestRegistrationBatch';
import { TestRegistration } from '@/models/TestRegistration';
import { OrganizationSettings } from '@/models/OrganizationSettings';

async function generateNextBatchNumber(): Promise<string> {
  const currentYear = new Date().getFullYear();
  const prefix = `BATCH-${currentYear}-`;
  const latest = await TestRegistrationBatch.findOne({ batchNumber: { $regex: `^${prefix}` } }).sort({
    batchNumber: -1,
  });

  let seq = 1;
  if (latest && latest.batchNumber) {
    const parts = latest.batchNumber.split('-');
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

    const body = await req.json();
    const { testEventId, studentRegistrations } = body;

    if (!testEventId || !Array.isArray(studentRegistrations) || studentRegistrations.length === 0) {
      return NextResponse.json(
        { error: 'Test event ID and at least one student registration are required' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const testEvent = await TestEvent.findById(testEventId);
    if (!testEvent) {
      return NextResponse.json({ error: 'Test event not found' }, { status: 404 });
    }

    // Check event status and registration deadline
    const now = new Date();
    if (testEvent.status !== 'Registration Open') {
      return NextResponse.json(
        { error: `Registration is not open for this test (Status: ${testEvent.status})` },
        { status: 400 }
      );
    }

    if (new Date(testEvent.registrationCloseDate) < now) {
      return NextResponse.json(
        { error: 'Registration deadline for this test has passed' },
        { status: 400 }
      );
    }

    // Determine target Unit
    let unitIdStr = session.unitId;
    if (session.role === 'SUPER_ADMIN') {
      unitIdStr = body.unitId || session.unitId;
    }

    if (!unitIdStr) {
      return NextResponse.json({ error: 'Unit ID is required' }, { status: 400 });
    }

    const unitObjectId = new mongoose.Types.ObjectId(unitIdStr);
    const testObjectId = new mongoose.Types.ObjectId(testEventId);

    // Verify all students belong to this Unit and are not already registered
    const studentIds = studentRegistrations.map((sr: { studentId: string }) => sr.studentId);
    const validStudents = await Student.find({
      _id: { $in: studentIds },
      unitId: unitObjectId,
      status: 'Active',
    });

    if (validStudents.length !== studentRegistrations.length) {
      return NextResponse.json(
        { error: 'One or more selected students do not belong to this unit or are inactive' },
        { status: 400 }
      );
    }

    const alreadyRegistered = await TestRegistration.find({
      testEventId: testObjectId,
      studentId: { $in: studentIds },
      status: { $ne: 'CANCELLED' },
    });

    if (alreadyRegistered.length > 0) {
      return NextResponse.json(
        { error: 'One or more selected students are already enrolled in this test' },
        { status: 400 }
      );
    }

    // Server-side authoritative calculation
    const settings = await OrganizationSettings.findOne({});
    const commissionRate = settings?.defaultCommissionRate ?? 10;
    const feePerStudent = testEvent.feePerStudent ?? 400;
    const studentCount = studentRegistrations.length;
    const grossAmount = studentCount * feePerStudent;
    const commissionAmount = Math.round((grossAmount * commissionRate) / 100);
    const organizationShare = grossAmount - commissionAmount;

    const batchNumber = await generateNextBatchNumber();

    const batch = new TestRegistrationBatch({
      batchNumber,
      testEventId: testObjectId,
      unitId: unitObjectId,
      studentCount,
      feePerStudent,
      grossAmount,
      commissionRate,
      commissionAmount,
      organizationShare,
      currency: 'INR',
      paymentStatus: 'PENDING',
      registrationStatus: 'DRAFT',
    });

    await batch.save();

    // Create TestRegistration records
    const studentMap = new Map(validStudents.map((s) => [s._id.toString(), s]));
    const registrationDocs = studentRegistrations.map(
      (sr: { studentId: string; targetBelt: string }) => {
        const student = studentMap.get(sr.studentId)!;
        return {
          batchId: batch._id,
          testEventId: testObjectId,
          unitId: unitObjectId,
          studentId: student._id,
          currentBeltAtRegistration: student.currentBelt,
          targetBelt: sr.targetBelt || student.currentBelt,
          feePaid: feePerStudent,
          status: 'PENDING',
        };
      }
    );

    await TestRegistration.insertMany(registrationDocs);

    await logAudit({
      action: 'CREATE_REGISTRATION_BATCH',
      resourceType: 'TestRegistrationBatch',
      resourceId: batch._id.toString(),
      details: {
        batchNumber,
        studentCount,
        grossAmount,
        commissionAmount,
        organizationShare,
      },
      user: session,
    });

    return NextResponse.json({
      success: true,
      batch: {
        _id: batch._id.toString(),
        batchNumber: batch.batchNumber,
        studentCount: batch.studentCount,
        feePerStudent: batch.feePerStudent,
        grossAmount: batch.grossAmount,
        commissionRate: batch.commissionRate,
        commissionAmount: batch.commissionAmount,
        organizationShare: batch.organizationShare,
        currency: batch.currency,
        paymentStatus: batch.paymentStatus,
        registrationStatus: batch.registrationStatus,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create registration batch';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const filter: Record<string, unknown> = {};
    if (session.role === 'UNIT') {
      filter.unitId = new mongoose.Types.ObjectId(session.unitId!);
    }

    const batches = await TestRegistrationBatch.find(filter)
      .populate('testEventId', 'name code testDate venue discipline')
      .populate('unitId', 'name unitCode headPerson city')
      .populate('paymentId', 'receiptNumber razorpayPaymentId paidAt status')
      .sort({ createdAt: -1 });

    return NextResponse.json({ batches });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch batches';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
