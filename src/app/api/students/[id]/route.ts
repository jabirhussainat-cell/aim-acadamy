import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectToDatabase from '@/lib/mongodb';
import { getSessionUser, logAudit } from '@/lib/auth';
import { Student } from '@/models/Student';
import { TestRegistration } from '@/models/TestRegistration';
import { TestResult } from '@/models/TestResult';

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
      return NextResponse.json({ error: 'Invalid student ID' }, { status: 400 });
    }

    await connectToDatabase();

    const student = await Student.findById(id).populate('unitId', 'name unitCode headPerson contactNumber city state');
    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // Role check: Unit users can only view their own unit's students
    if (session.role === 'UNIT' && student.unitId._id.toString() !== session.unitId) {
      return NextResponse.json({ error: 'Forbidden: Access denied to this student profile' }, { status: 403 });
    }

    // Fetch test participation & results
    const [testRegistrations, testResults] = await Promise.all([
      TestRegistration.find({ studentId: student._id })
        .populate('testEventId', 'name code testDate discipline status venue')
        .populate('batchId', 'batchNumber paymentStatus')
        .sort({ createdAt: -1 }),
      TestResult.find({
        studentId: student._id,
        ...(session.role === 'UNIT' ? { isPublished: true } : {}),
      })
        .populate('testEventId', 'name code testDate')
        .sort({ createdAt: -1 }),
    ]);

    return NextResponse.json({
      student,
      testRegistrations,
      testResults,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch student details';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(
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
      return NextResponse.json({ error: 'Invalid student ID' }, { status: 400 });
    }

    const body = await req.json();
    await connectToDatabase();

    const student = await Student.findById(id);
    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // Unit users can only edit their own students
    if (session.role === 'UNIT' && student.unitId.toString() !== session.unitId) {
      return NextResponse.json({ error: 'Forbidden: Access denied' }, { status: 403 });
    }

    // Only Super Admin can reassign unit
    if (body.unitId && body.unitId !== student.unitId.toString()) {
      if (session.role !== 'SUPER_ADMIN') {
        return NextResponse.json(
          { error: 'Only Super Admin can reassign a student to a different unit' },
          { status: 403 }
        );
      }
      student.unitId = new mongoose.Types.ObjectId(body.unitId);
    }

    // Update allowable fields
    if (body.fullName) student.fullName = body.fullName.trim();
    if (body.profilePhoto !== undefined) student.profilePhoto = body.profilePhoto;
    if (body.dateOfBirth) student.dateOfBirth = new Date(body.dateOfBirth);
    if (body.gender) student.gender = body.gender;
    if (body.height !== undefined) student.height = body.height;
    if (body.weight !== undefined) student.weight = body.weight;
    if (body.bloodGroup !== undefined) student.bloodGroup = body.bloodGroup;
    if (body.contactNumber) student.contactNumber = body.contactNumber.trim();
    if (body.email !== undefined) student.email = body.email?.trim().toLowerCase();
    if (body.address) student.address = body.address;
    if (body.city) student.city = body.city;
    if (body.district) student.district = body.district;
    if (body.state) student.state = body.state;
    if (body.pincode) student.pincode = body.pincode;
    if (body.country) student.country = body.country;

    // Parent details
    if (body.parentName) student.parentName = body.parentName.trim();
    if (body.relationship) student.relationship = body.relationship;
    if (body.parentContact) student.parentContact = body.parentContact.trim();
    if (body.parentAltContact !== undefined) student.parentAltContact = body.parentAltContact;
    if (body.parentEmail !== undefined) student.parentEmail = body.parentEmail?.trim().toLowerCase();
    if (body.useStudentAddress !== undefined) student.useStudentAddress = Boolean(body.useStudentAddress);
    if (body.parentAddress) student.parentAddress = body.parentAddress;

    // Academic & martial arts
    if (body.schoolName) student.schoolName = body.schoolName.trim();
    if (body.schoolClass !== undefined) student.schoolClass = body.schoolClass;
    if (body.educationalQualification !== undefined) student.educationalQualification = body.educationalQualification;
    if (body.discipline) student.discipline = body.discipline.trim();
    if (body.instructor !== undefined) student.instructor = body.instructor;
    if (body.status) student.status = body.status;
    if (body.notes !== undefined) student.notes = body.notes;

    // Belt change: if super admin manually updates belt
    if (body.currentBelt && body.currentBelt !== student.currentBelt) {
      if (session.role !== 'SUPER_ADMIN') {
        return NextResponse.json({ error: 'Only Super Admin can directly alter belt rank' }, { status: 403 });
      }
      student.currentBelt = body.currentBelt;
      student.beltHistory.push({
        belt: body.currentBelt,
        awardedDate: new Date(),
        remarks: body.beltChangeRemarks || 'Direct belt update by Super Admin',
      });
    }

    await student.save();

    await logAudit({
      action: 'UPDATE_STUDENT',
      resourceType: 'Student',
      resourceId: student._id.toString(),
      details: { registrationNumber: student.registrationNumber, name: student.fullName },
      user: session,
    });

    return NextResponse.json({
      success: true,
      message: 'Student updated successfully',
      student,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update student';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
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
      return NextResponse.json({ error: 'Invalid student ID' }, { status: 400 });
    }

    await connectToDatabase();
    const student = await Student.findById(id);
    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    if (session.role === 'UNIT' && student.unitId.toString() !== session.unitId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Soft delete / archive
    student.status = 'Archived';
    await student.save();

    await logAudit({
      action: 'ARCHIVE_STUDENT',
      resourceType: 'Student',
      resourceId: student._id.toString(),
      details: { registrationNumber: student.registrationNumber },
      user: session,
    });

    return NextResponse.json({ success: true, message: 'Student archived successfully' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to delete student';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
