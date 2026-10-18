import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectToDatabase from '@/lib/mongodb';
import { getSessionUser, requireSuperAdmin, logAudit } from '@/lib/auth';
import { TestEvent } from '@/models/TestEvent';
import { TestRegistrationBatch } from '@/models/TestRegistrationBatch';
import { TestRegistration } from '@/models/TestRegistration';

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
      return NextResponse.json({ error: 'Invalid Test ID' }, { status: 400 });
    }

    await connectToDatabase();

    const testEvent = await TestEvent.findById(id);
    if (!testEvent) {
      return NextResponse.json({ error: 'Test event not found' }, { status: 404 });
    }

    const testObjectId = new mongoose.Types.ObjectId(id);

    // If unit user, filter batches to their own
    const batchFilter: Record<string, unknown> = { testEventId: testObjectId };
    if (session.role === 'UNIT') {
      batchFilter.unitId = new mongoose.Types.ObjectId(session.unitId!);
    }

    const batches = await TestRegistrationBatch.find(batchFilter)
      .populate('unitId', 'name unitCode headPerson contactNumber')
      .sort({ createdAt: -1 });

    const totalStudents = batches.reduce((sum, b) => sum + (b.paymentStatus === 'PAID' ? b.studentCount : 0), 0);
    const totalCollected = batches.reduce((sum, b) => sum + (b.paymentStatus === 'PAID' ? b.grossAmount : 0), 0);

    return NextResponse.json({
      testEvent,
      batches,
      summary: {
        totalBatches: batches.length,
        totalPaidStudents: totalStudents,
        totalGrossCollections: totalCollected,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch test details';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireSuperAdmin(req);
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid Test ID' }, { status: 400 });
    }

    const body = await req.json();
    await connectToDatabase();

    const testEvent = await TestEvent.findById(id);
    if (!testEvent) {
      return NextResponse.json({ error: 'Test event not found' }, { status: 404 });
    }

    if (body.name) testEvent.name = body.name.trim();
    if (body.discipline) testEvent.discipline = body.discipline.trim();
    if (body.description) testEvent.description = body.description.trim();
    if (body.testDate) testEvent.testDate = new Date(body.testDate);
    if (body.startTime !== undefined) testEvent.startTime = body.startTime;
    if (body.endTime !== undefined) testEvent.endTime = body.endTime;
    if (body.venue) testEvent.venue = body.venue.trim();
    if (body.examinerMaster) testEvent.examinerMaster = body.examinerMaster.trim();
    if (body.registrationOpenDate) testEvent.registrationOpenDate = new Date(body.registrationOpenDate);
    if (body.registrationCloseDate) testEvent.registrationCloseDate = new Date(body.registrationCloseDate);
    if (Array.isArray(body.eligibleCurrentBelts)) testEvent.eligibleCurrentBelts = body.eligibleCurrentBelts;
    if (Array.isArray(body.availableTargetBelts)) testEvent.availableTargetBelts = body.availableTargetBelts;
    if (body.feePerStudent !== undefined) testEvent.feePerStudent = Number(body.feePerStudent);
    if (body.status) testEvent.status = body.status;
    if (body.instructions !== undefined) testEvent.instructions = body.instructions;

    await testEvent.save();

    await logAudit({
      action: 'UPDATE_TEST_EVENT',
      resourceType: 'TestEvent',
      resourceId: testEvent._id.toString(),
      details: { code: testEvent.code, status: testEvent.status },
      user: session,
    });

    return NextResponse.json({
      success: true,
      message: 'Test event updated successfully',
      testEvent,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update test event';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
