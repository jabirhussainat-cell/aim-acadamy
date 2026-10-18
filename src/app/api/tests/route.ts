import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { getSessionUser, requireSuperAdmin, logAudit } from '@/lib/auth';
import { TestEvent } from '@/models/TestEvent';
import { OrganizationSettings } from '@/models/OrganizationSettings';
import { TestRegistration } from '@/models/TestRegistration';

async function generateNextTestCode(): Promise<string> {
  const currentYear = new Date().getFullYear();
  const prefix = `TEST-${currentYear}-`;
  const latest = await TestEvent.findOne({ code: { $regex: `^${prefix}` } }).sort({ code: -1 });

  let seq = 1;
  if (latest && latest.code) {
    const parts = latest.code.split('-');
    if (parts.length === 3) {
      const num = parseInt(parts[2], 10);
      if (!isNaN(num)) seq = num + 1;
    }
  }

  return `${prefix}${String(seq).padStart(2, '0')}`;
}

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const searchParams = req.nextUrl.searchParams;
    const status = searchParams.get('status');
    const discipline = searchParams.get('discipline');

    const filter: Record<string, unknown> = {};

    if (session.role === 'UNIT') {
      // Unit users can see Open, Upcoming, or Completed tests
      if (status && status !== 'all') {
        filter.status = status;
      } else {
        filter.status = { $in: ['Registration Open', 'Upcoming', 'Registration Closed', 'Completed'] };
      }
    } else {
      if (status && status !== 'all') {
        filter.status = status;
      }
    }

    if (discipline && discipline !== 'all') {
      filter.discipline = discipline;
    }

    const tests = await TestEvent.find(filter).sort({ testDate: 1 });

    // Aggregate registration counts for each test
    const testIds = tests.map((t) => t._id);
    const regCounts = await TestRegistration.aggregate([
      { $match: { testEventId: { $in: testIds }, status: { $ne: 'CANCELLED' } } },
      {
        $group: {
          _id: '$testEventId',
          totalStudents: { $sum: 1 },
          confirmedStudents: { $sum: { $cond: [{ $eq: ['$status', 'CONFIRMED'] }, 1, 0] } },
        },
      },
    ]);

    const countMap: Record<string, { total: number; confirmed: number }> = {};
    regCounts.forEach((rc) => {
      countMap[rc._id.toString()] = { total: rc.totalStudents, confirmed: rc.confirmedStudents };
    });

    const enrichedTests = tests.map((t) => {
      const counts = countMap[t._id.toString()] || { total: 0, confirmed: 0 };
      const now = new Date();
      const isRegistrationOpen =
        t.status === 'Registration Open' &&
        new Date(t.registrationOpenDate) <= now &&
        new Date(t.registrationCloseDate) >= now;

      return {
        ...t.toObject(),
        totalRegistered: counts.total,
        confirmedRegistered: counts.confirmed,
        isRegistrationWindowActive: isRegistrationOpen,
      };
    });

    return NextResponse.json({ tests: enrichedTests });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch test events';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireSuperAdmin(req);
    const body = await req.json();

    if (!body.name || !body.discipline || !body.testDate || !body.venue || !body.examinerMaster) {
      return NextResponse.json(
        { error: 'Name, discipline, test date, venue, and examiner master are required' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const code = body.code ? body.code.trim().toUpperCase() : await generateNextTestCode();

    const existingCode = await TestEvent.findOne({ code });
    if (existingCode) {
      return NextResponse.json({ error: `Test code ${code} is already in use` }, { status: 400 });
    }

    let feePerStudent = body.feePerStudent;
    if (feePerStudent === undefined || feePerStudent === null || feePerStudent === '') {
      const settings = await OrganizationSettings.findOne({});
      feePerStudent = settings?.defaultTestFee || 400;
    } else {
      feePerStudent = Number(feePerStudent);
    }

    const testEvent = new TestEvent({
      name: body.name.trim(),
      code,
      discipline: body.discipline.trim(),
      description: body.description?.trim() || 'Official Belt Grading Test',
      testDate: new Date(body.testDate),
      startTime: body.startTime,
      endTime: body.endTime,
      venue: body.venue.trim(),
      examinerMaster: body.examinerMaster.trim(),
      registrationOpenDate: body.registrationOpenDate ? new Date(body.registrationOpenDate) : new Date(),
      registrationCloseDate: body.registrationCloseDate
        ? new Date(body.registrationCloseDate)
        : new Date(new Date(body.testDate).getTime() - 24 * 60 * 60 * 1000), // 1 day before test
      eligibleCurrentBelts: Array.isArray(body.eligibleCurrentBelts) ? body.eligibleCurrentBelts : [],
      availableTargetBelts: Array.isArray(body.availableTargetBelts) ? body.availableTargetBelts : [],
      feePerStudent,
      status: body.status || 'Upcoming',
      instructions: body.instructions,
    });

    await testEvent.save();

    await logAudit({
      action: 'CREATE_TEST_EVENT',
      resourceType: 'TestEvent',
      resourceId: testEvent._id.toString(),
      details: { code: testEvent.code, name: testEvent.name, discipline: testEvent.discipline },
      user: session,
    });

    return NextResponse.json({
      success: true,
      message: 'Test event created successfully',
      testEvent,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create test event';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
