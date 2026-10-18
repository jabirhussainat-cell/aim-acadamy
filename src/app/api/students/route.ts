import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectToDatabase from '@/lib/mongodb';
import { getSessionUser, logAudit } from '@/lib/auth';
import { Student } from '@/models/Student';
import { Unit } from '@/models/Unit';

async function generateNextRegistrationNumber(): Promise<string> {
  const currentYear = new Date().getFullYear();
  const prefix = `AIM-${currentYear}-`;

  // Find the highest registration number for this year
  const latestStudent = await Student.findOne(
    { registrationNumber: { $regex: `^${prefix}` } },
    { registrationNumber: 1 }
  ).sort({ registrationNumber: -1 });

  let nextSequence = 1;
  if (latestStudent && latestStudent.registrationNumber) {
    const parts = latestStudent.registrationNumber.split('-');
    if (parts.length === 3) {
      const num = parseInt(parts[2], 10);
      if (!isNaN(num)) {
        nextSequence = num + 1;
      }
    }
  }

  return `${prefix}${String(nextSequence).padStart(4, '0')}`;
}

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const searchParams = req.nextUrl.searchParams;
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
    const search = searchParams.get('search')?.trim();
    const discipline = searchParams.get('discipline');
    const belt = searchParams.get('belt');
    const status = searchParams.get('status');
    const requestedUnitId = searchParams.get('unitId');

    const filter: Record<string, unknown> = {};

    // Unit users can only see their own students
    if (session.role === 'UNIT') {
      filter.unitId = new mongoose.Types.ObjectId(session.unitId!);
    } else if (requestedUnitId && requestedUnitId !== 'all') {
      filter.unitId = new mongoose.Types.ObjectId(requestedUnitId);
    }

    if (status && status !== 'all') {
      filter.status = status;
    }

    if (discipline && discipline !== 'all') {
      filter.discipline = discipline;
    }

    if (belt && belt !== 'all') {
      filter.currentBelt = belt;
    }

    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { registrationNumber: { $regex: search, $options: 'i' } },
        { contactNumber: { $regex: search, $options: 'i' } },
        { parentName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;

    const [students, total] = await Promise.all([
      Student.find(filter)
        .populate('unitId', 'name unitCode city')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Student.countDocuments(filter),
    ]);

    return NextResponse.json({
      students,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch students';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    await connectToDatabase();

    // Determine and enforce unitId
    let targetUnitId: string;
    if (session.role === 'UNIT') {
      targetUnitId = session.unitId!;
    } else {
      if (!body.unitId) {
        return NextResponse.json({ error: 'Unit ID is required' }, { status: 400 });
      }
      targetUnitId = body.unitId;
    }

    // Verify unit exists and is active
    const unit = await Unit.findById(targetUnitId);
    if (!unit || unit.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Assigned unit does not exist or is inactive' },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!body.fullName || !body.dateOfBirth || !body.contactNumber || !body.discipline) {
      return NextResponse.json(
        { error: 'Full name, date of birth, contact number, and discipline are required' },
        { status: 400 }
      );
    }

    if (!body.parentName || !body.parentContact) {
      return NextResponse.json(
        { error: 'Parent/Guardian name and contact are required' },
        { status: 400 }
      );
    }

    // Generate unique registration number
    const registrationNumber = await generateNextRegistrationNumber();

    const parentAddress = body.useStudentAddress ? body.address : body.parentAddress || body.address;

    const currentBelt = body.currentBelt || 'White';

    const newStudent = new Student({
      registrationNumber,
      fullName: body.fullName.trim(),
      profilePhoto: body.profilePhoto,
      dateOfBirth: new Date(body.dateOfBirth),
      gender: body.gender || 'Male',
      height: body.height,
      weight: body.weight,
      bloodGroup: body.bloodGroup,
      contactNumber: body.contactNumber.trim(),
      email: body.email?.trim().toLowerCase(),
      address: body.address || 'Address not specified',
      city: body.city || unit.city,
      district: body.district || unit.district,
      state: body.state || unit.state,
      pincode: body.pincode || unit.pincode,
      country: body.country || 'India',

      parentName: body.parentName.trim(),
      relationship: body.relationship || 'Parent',
      parentContact: body.parentContact.trim(),
      parentAltContact: body.parentAltContact?.trim(),
      parentEmail: body.parentEmail?.trim().toLowerCase(),
      parentAddress,
      useStudentAddress: Boolean(body.useStudentAddress ?? true),

      schoolName: body.schoolName?.trim() || 'N/A',
      schoolClass: body.schoolClass?.trim(),
      educationalQualification: body.educationalQualification?.trim(),
      discipline: body.discipline.trim(),
      currentBelt,
      unitId: unit._id,
      instructor: body.instructor || unit.associatedInstructor || unit.headPerson,
      dateOfJoining: body.dateOfJoining ? new Date(body.dateOfJoining) : new Date(),
      status: body.status || 'Active',
      notes: body.notes,

      beltHistory: [
        {
          belt: currentBelt,
          awardedDate: body.dateOfJoining ? new Date(body.dateOfJoining) : new Date(),
          remarks: 'Initial belt at student registration',
        },
      ],
    });

    await newStudent.save();

    await logAudit({
      action: 'CREATE_STUDENT',
      resourceType: 'Student',
      resourceId: newStudent._id.toString(),
      details: {
        registrationNumber,
        studentName: newStudent.fullName,
        unitId: unit._id.toString(),
        unitName: unit.name,
      },
      user: session,
    });

    return NextResponse.json({
      success: true,
      message: 'Student registered successfully',
      student: newStudent,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create student';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
