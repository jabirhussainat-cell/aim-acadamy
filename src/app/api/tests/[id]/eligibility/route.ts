import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectToDatabase from '@/lib/mongodb';
import { getSessionUser } from '@/lib/auth';
import { TestEvent } from '@/models/TestEvent';
import { Student } from '@/models/Student';
import { TestRegistration } from '@/models/TestRegistration';
import { MartialArtDiscipline } from '@/models/MartialArtDiscipline';

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

    // Determine target unit
    let unitIdStr = session.unitId;
    if (session.role === 'SUPER_ADMIN') {
      const qUnit = req.nextUrl.searchParams.get('unitId');
      if (qUnit) unitIdStr = qUnit;
    }

    if (!unitIdStr) {
      return NextResponse.json({ error: 'Unit ID is required' }, { status: 400 });
    }

    const unitObjectId = new mongoose.Types.ObjectId(unitIdStr);
    const testObjectId = new mongoose.Types.ObjectId(id);

    // Fetch unit's active students (filter by discipline if matching)
    const students = await Student.find({
      unitId: unitObjectId,
      status: 'Active',
      discipline: testEvent.discipline,
    }).sort({ fullName: 1 });

    // Fetch existing registrations for this test
    const existingRegistrations = await TestRegistration.find({
      testEventId: testObjectId,
      unitId: unitObjectId,
      status: { $ne: 'CANCELLED' },
    });

    const registeredStudentIds = new Set(
      existingRegistrations.map((r) => r.studentId.toString())
    );

    // Fetch discipline belt hierarchy to suggest next target belt
    const discipline = await MartialArtDiscipline.findOne({ name: testEvent.discipline });
    const beltHierarchy = discipline?.beltHierarchy || [
      'White Belt',
      'Yellow Belt',
      'Orange Belt',
      'Green Belt',
      'Blue Belt',
      'Purple Belt',
      'Brown Belt',
      'Black Belt 1st Dan',
    ];

    const eligibleStudents = students.map((student) => {
      const isAlreadyRegistered = registeredStudentIds.has(student._id.toString());

      // Check belt eligibility
      let beltMatches = true;
      if (testEvent.eligibleCurrentBelts && testEvent.eligibleCurrentBelts.length > 0) {
        beltMatches = testEvent.eligibleCurrentBelts.includes(student.currentBelt);
      }

      // Determine default next target belt
      const currentBeltIndex = beltHierarchy.findIndex(
        (b) => b.toLowerCase().trim() === student.currentBelt.toLowerCase().trim()
      );
      let defaultTargetBelt = '';
      if (currentBeltIndex >= 0 && currentBeltIndex < beltHierarchy.length - 1) {
        defaultTargetBelt = beltHierarchy[currentBeltIndex + 1];
      } else if (testEvent.availableTargetBelts.length > 0) {
        defaultTargetBelt = testEvent.availableTargetBelts[0];
      }

      // If test defines availableTargetBelts, restrict options to that, else full hierarchy after current
      let targetBeltOptions = testEvent.availableTargetBelts;
      if (!targetBeltOptions || targetBeltOptions.length === 0) {
        targetBeltOptions = currentBeltIndex >= 0 ? beltHierarchy.slice(currentBeltIndex + 1) : beltHierarchy;
      }

      return {
        _id: student._id.toString(),
        registrationNumber: student.registrationNumber,
        fullName: student.fullName,
        age: student.dateOfBirth
          ? Math.max(
              0,
              Math.floor(
                (new Date().getTime() - new Date(student.dateOfBirth).getTime()) /
                  (365.25 * 24 * 60 * 60 * 1000)
              )
            )
          : 0,
        gender: student.gender,
        status: student.status,
        isEligible: beltMatches && !isAlreadyRegistered,
        alreadyRegistered: isAlreadyRegistered,
        defaultTargetBelt,
        targetBeltOptions,
      };
    });

    return NextResponse.json({
      testEvent: {
        _id: testEvent._id.toString(),
        name: testEvent.name,
        code: testEvent.code,
        discipline: testEvent.discipline,
        feePerStudent: testEvent.feePerStudent,
        status: testEvent.status,
        testDate: testEvent.testDate,
        registrationCloseDate: testEvent.registrationCloseDate,
      },
      students: eligibleStudents,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to check eligibility';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
