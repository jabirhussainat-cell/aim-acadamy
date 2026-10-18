import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectToDatabase from '@/lib/mongodb';
import { getSessionUser, requireSuperAdmin, hashPassword, logAudit } from '@/lib/auth';
import { Unit } from '@/models/Unit';
import { User } from '@/models/User';
import { Student } from '@/models/Student';

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

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const searchParams = req.nextUrl.searchParams;
    const status = searchParams.get('status');
    const search = searchParams.get('search')?.trim();

    const filter: Record<string, unknown> = {};

    if (session.role === 'UNIT') {
      filter._id = new mongoose.Types.ObjectId(session.unitId!);
    } else {
      if (status && status !== 'all') {
        filter.status = status;
      }
      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: 'i' } },
          { unitCode: { $regex: search, $options: 'i' } },
          { headPerson: { $regex: search, $options: 'i' } },
          { city: { $regex: search, $options: 'i' } },
          { contactNumber: { $regex: search, $options: 'i' } },
        ];
      }
    }

    const units = await Unit.find(filter).sort({ name: 1 });

    // Aggregate real student counts per unit
    const studentCounts = await Student.aggregate([
      { $match: { status: { $ne: 'Archived' } } },
      {
        $group: {
          _id: '$unitId',
          total: { $sum: 1 },
          active: { $sum: { $cond: [{ $eq: ['$status', 'Active'] }, 1, 0] } },
        },
      },
    ]);

    const countMap: Record<string, { total: number; active: number }> = {};
    studentCounts.forEach((c) => {
      countMap[c._id.toString()] = { total: c.total, active: c.active };
    });

    const enrichedUnits = units.map((u) => {
      const stats = countMap[u._id.toString()] || { total: 0, active: 0 };
      return {
        ...u.toObject(),
        totalStudents: stats.total,
        activeStudents: stats.active,
      };
    });

    return NextResponse.json({ units: enrichedUnits });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch units';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireSuperAdmin(req);
    const body = await req.json();

    if (!body.name || !body.headPerson || !body.contactNumber || !body.email || !body.password) {
      return NextResponse.json(
        { error: 'Name, head person, contact number, email, and initial password are required' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const normalizedEmail = body.email.toLowerCase().trim();

    // Check if email already used in User
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email address already exists' },
        { status: 400 }
      );
    }

    const unitCode = body.unitCode ? body.unitCode.trim().toUpperCase() : await generateNextUnitCode();

    const existingUnitCode = await Unit.findOne({ unitCode });
    if (existingUnitCode) {
      return NextResponse.json(
        { error: `Unit code ${unitCode} is already assigned. Please choose another code.` },
        { status: 400 }
      );
    }

    const newUnit = new Unit({
      unitCode,
      name: body.name.trim(),
      headPerson: body.headPerson.trim(),
      contactNumber: body.contactNumber.trim(),
      email: normalizedEmail,
      address: body.address?.trim() || 'Address not provided',
      city: body.city?.trim() || 'City',
      district: body.district?.trim() || 'District',
      state: body.state?.trim() || 'State',
      pincode: body.pincode?.trim() || '000000',
      country: body.country?.trim() || 'India',
      associatedInstructor: body.associatedInstructor?.trim(),
      disciplinesOffered: Array.isArray(body.disciplinesOffered) ? body.disciplinesOffered : ['Karate-Do'],
      status: body.status || 'ACTIVE',
      registrationDate: body.registrationDate ? new Date(body.registrationDate) : new Date(),
    });

    await newUnit.save();

    // Create login account for Unit
    const passwordHash = await hashPassword(body.password);
    const unitUser = new User({
      name: `${body.name.trim()} (Unit Account)`,
      email: normalizedEmail,
      passwordHash,
      role: 'UNIT',
      unitId: newUnit._id,
      status: 'ACTIVE',
    });

    await unitUser.save();

    await logAudit({
      action: 'CREATE_UNIT',
      resourceType: 'Unit',
      resourceId: newUnit._id.toString(),
      details: { unitCode: newUnit.unitCode, name: newUnit.name, email: normalizedEmail },
      user: session,
    });

    return NextResponse.json({
      success: true,
      message: 'Unit and Unit login account created successfully',
      unit: newUnit,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create unit';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
