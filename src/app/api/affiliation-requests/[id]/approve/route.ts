import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectToDatabase from '@/lib/mongodb';
import { requireSuperAdmin, hashPassword, logAudit } from '@/lib/auth';
import { AffiliationRequest } from '@/models/AffiliationRequest';
import { Unit } from '@/models/Unit';
import { User } from '@/models/User';

async function generateNextUnitCode(): Promise<string> {
  const latestUnit = await Unit.findOne({}, { unitCode: 1 }).sort({ unitCode: -1 });
  let nextNum = 101;
  if (latestUnit && latestUnit.unitCode) {
    const match = latestUnit.unitCode.match(/\d+/);
    if (match) {
      nextNum = Math.max(nextNum, parseInt(match[0], 10) + 1);
    }
  }
  return `UNIT-${nextNum}`;
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireSuperAdmin(req);
    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid application ID' }, { status: 400 });
    }

    const body = await req.json().catch(() => ({}));
    const { customUnitCode, initialPassword, assignedInstructor, remarks } = body;

    await connectToDatabase();

    const request = await AffiliationRequest.findById(id);
    if (!request) {
      return NextResponse.json({ error: 'Affiliation request not found' }, { status: 404 });
    }

    if (request.status !== 'PENDING') {
      return NextResponse.json(
        { error: `This application has already been ${request.status.toLowerCase()}` },
        { status: 400 }
      );
    }

    // Determine unit code
    let unitCode = customUnitCode ? customUnitCode.trim().toUpperCase() : await generateNextUnitCode();

    // Check unit code uniqueness
    const existingUnit = await Unit.findOne({ unitCode });
    if (existingUnit) {
      unitCode = await generateNextUnitCode();
    }

    // Check email uniqueness for login account
    const existingUser = await User.findOne({ email: request.email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { error: `A user account with email "${request.email}" already exists. Please assign a different unit email.` },
        { status: 400 }
      );
    }

    // Temporary password generation if not provided
    const passwordToUse = initialPassword && String(initialPassword).length >= 6
      ? String(initialPassword)
      : `AimUnit#${Math.floor(1000 + Math.random() * 9000)}`;

    const hashedPassword = await hashPassword(passwordToUse);

    // 1. Create Unit in MongoDB
    const unit = await Unit.create({
      unitCode,
      name: request.unitName,
      headPerson: request.headPerson,
      contactNumber: request.contactNumber,
      email: request.email.toLowerCase(),
      address: request.address,
      city: request.city,
      district: request.district,
      state: 'Kerala',
      pincode: request.pincode,
      country: 'India',
      associatedInstructor: assignedInstructor || request.headPerson,
      disciplinesOffered: request.disciplinesOffered || [],
      registrationDate: new Date(),
      status: 'ACTIVE',
    });

    // 2. Create User account for Unit Login
    const user = await User.create({
      name: `${request.unitName} (${unitCode})`,
      email: request.email.toLowerCase(),
      passwordHash: hashedPassword,
      role: 'UNIT',
      unitId: unit._id,
      status: 'ACTIVE',
    });

    // 3. Update Affiliation Request as APPROVED
    request.status = 'APPROVED';
    request.createdUnitId = unit._id;
    request.createdUnitCode = unit.unitCode;
    request.reviewedBy = new mongoose.Types.ObjectId(session.userId);
    request.reviewedByName = session.name;
    request.reviewedAt = new Date();
    if (remarks) {
      request.additionalNotes = (request.additionalNotes ? request.additionalNotes + '\n' : '') + `[Admin Approval Note]: ${remarks}`;
    }
    await request.save();

    // 4. Log Audit
    await logAudit({
      action: 'APPROVE_UNIT_AFFILIATION',
      resourceType: 'Unit',
      resourceId: unit._id.toString(),
      details: {
        applicationNumber: request.applicationNumber,
        unitName: request.unitName,
        unitCode: unit.unitCode,
      },
      user: session,
    });

    return NextResponse.json({
      success: true,
      message: `Unit affiliation application ${request.applicationNumber} approved successfully. Official Unit ${unit.unitCode} created.`,
      unit: {
        id: unit._id,
        unitCode: unit.unitCode,
        name: unit.name,
        headPerson: unit.headPerson,
        email: unit.email,
        contactNumber: unit.contactNumber,
        district: unit.district,
      },
      credentials: {
        email: user.email,
        temporaryPassword: passwordToUse,
        loginUrl: '/login',
      },
    });
  } catch (err: unknown) {
    console.error('Approve affiliation error:', err);
    const message = err instanceof Error ? err.message : 'Failed to approve affiliation request';
    const status = message.includes('Unauthorized') ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
