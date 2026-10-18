import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectToDatabase from '@/lib/mongodb';
import { getSessionUser, requireSuperAdmin, logAudit } from '@/lib/auth';
import { TestEvent } from '@/models/TestEvent';
import { TestResult, ResultStatus } from '@/models/TestResult';
import { TestRegistration } from '@/models/TestRegistration';
import { Student } from '@/models/Student';

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

    // Build filter
    const filter: Record<string, unknown> = { testEventId: testObjectId };

    if (session.role === 'UNIT') {
      filter.unitId = new mongoose.Types.ObjectId(session.unitId!);
      filter.isPublished = true; // Units can only see published results!
    }

    // First ensure every confirmed TestRegistration has a corresponding TestResult document
    if (session.role === 'SUPER_ADMIN') {
      const confirmedRegistrations = await TestRegistration.find({
        testEventId: testObjectId,
        status: 'CONFIRMED',
      });

      for (const reg of confirmedRegistrations) {
        await TestResult.findOneAndUpdate(
          { testEventId: testObjectId, studentId: reg.studentId },
          {
            $setOnInsert: {
              testEventId: testObjectId,
              registrationId: reg._id,
              studentId: reg.studentId,
              unitId: reg.unitId,
              currentBelt: reg.currentBeltAtRegistration,
              targetBelt: reg.targetBelt,
              resultStatus: 'Pending',
              isPublished: false,
              beltUpdatedInProfile: false,
            },
          },
          { upsert: true, new: true }
        );
      }
    }

    const results = await TestResult.find(filter)
      .populate('studentId', 'fullName registrationNumber profilePhoto dateOfBirth gender')
      .populate('unitId', 'name unitCode headPerson city')
      .sort({ 'studentId.fullName': 1 });

    return NextResponse.json({
      testEvent: {
        _id: testEvent._id.toString(),
        name: testEvent.name,
        code: testEvent.code,
        discipline: testEvent.discipline,
        testDate: testEvent.testDate,
        venue: testEvent.venue,
        examinerMaster: testEvent.examinerMaster,
        resultsPublished: testEvent.resultsPublished,
        resultsPublishedAt: testEvent.resultsPublishedAt,
      },
      results,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch test results';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(
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

    // Action can be: 'SAVE_RESULTS', 'PUBLISH_RESULTS', 'UNPUBLISH_RESULTS', 'UPDATE_BELT_PROGRESSION'
    const action = body.action || 'SAVE_RESULTS';

    if (action === 'PUBLISH_RESULTS') {
      const publishDate = new Date();
      await TestResult.updateMany(
        { testEventId: testEvent._id },
        { $set: { isPublished: true, publishedAt: publishDate } }
      );
      testEvent.resultsPublished = true;
      testEvent.resultsPublishedAt = publishDate;
      await testEvent.save();

      await logAudit({
        action: 'PUBLISH_TEST_RESULTS',
        resourceType: 'TestEvent',
        resourceId: testEvent._id.toString(),
        details: { code: testEvent.code, testName: testEvent.name },
        user: session,
      });

      return NextResponse.json({ success: true, message: 'All results published successfully' });
    }

    if (action === 'UNPUBLISH_RESULTS') {
      await TestResult.updateMany(
        { testEventId: testEvent._id },
        { $set: { isPublished: false } }
      );
      testEvent.resultsPublished = false;
      await testEvent.save();

      return NextResponse.json({ success: true, message: 'Results unpublished successfully' });
    }

    if (action === 'UPDATE_BELT_PROGRESSION') {
      // Bulk or individual belt progression for passing students
      const { resultIds } = body;
      const queryFilter: Record<string, unknown> = resultIds
        ? { _id: { $in: resultIds.map((rid: string) => new mongoose.Types.ObjectId(rid)) } }
        : { testEventId: testEvent._id, resultStatus: 'Pass', beltUpdatedInProfile: false };

      const passResults = await TestResult.find(queryFilter).exec();
      let updatedCount = 0;

      for (const res of passResults) {
        if (res.resultStatus === 'Pass' && !res.beltUpdatedInProfile) {
          const awardedBelt = res.beltAwarded || res.targetBelt;
          const student = await Student.findById(res.studentId);
          if (student) {
            student.currentBelt = awardedBelt;
            student.beltHistory.push({
              belt: awardedBelt,
              awardedDate: new Date(),
              testEventId: testEvent._id,
              testName: testEvent.name,
              remarks: res.examinerComments || `Promoted in ${testEvent.name}`,
            });
            await student.save();
            res.beltUpdatedInProfile = true;
            await res.save();
            updatedCount++;
          }
        }
      }

      await logAudit({
        action: 'APPLY_BELT_PROGRESSION',
        resourceType: 'TestEvent',
        resourceId: testEvent._id.toString(),
        details: { promotedCount: updatedCount },
        user: session,
      });

      return NextResponse.json({
        success: true,
        message: `Belt progression applied to ${updatedCount} passing student(s)`,
        updatedCount,
      });
    }

    // Default: SAVE_RESULTS (Array of { resultId, resultStatus, marks, examinerComments, beltAwarded, examinerMaster })
    if (Array.isArray(body.results)) {
      for (const item of body.results) {
        if (!item.resultId) continue;
        const updateData: Record<string, unknown> = {};
        if (item.resultStatus) updateData.resultStatus = item.resultStatus;
        if (item.marks !== undefined) updateData.marks = Number(item.marks);
        if (item.examinerComments !== undefined) updateData.examinerComments = item.examinerComments;
        if (item.examinerMaster !== undefined) updateData.examinerMaster = item.examinerMaster;
        if (item.beltAwarded !== undefined) updateData.beltAwarded = item.beltAwarded;

        await TestResult.findByIdAndUpdate(item.resultId, { $set: updateData });
      }

      await logAudit({
        action: 'UPDATE_TEST_RESULTS',
        resourceType: 'TestEvent',
        resourceId: testEvent._id.toString(),
        details: { count: body.results.length },
        user: session,
      });

      return NextResponse.json({ success: true, message: 'Test results saved successfully' });
    }

    return NextResponse.json({ error: 'Invalid action or payload' }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to save test results';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
