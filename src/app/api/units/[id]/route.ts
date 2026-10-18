import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectToDatabase from '@/lib/mongodb';
import { getSessionUser, hashPassword, logAudit } from '@/lib/auth';
import { Unit } from '@/models/Unit';
import { User } from '@/models/User';
import { Student } from '@/models/Student';
import { TestRegistrationBatch } from '@/models/TestRegistrationBatch';
import { CommissionLedger } from '@/models/CommissionLedger';

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
      return NextResponse.json({ error: 'Invalid Unit ID' }, { status: 400 });
    }

    // Role check: Unit users can only view their own unit
    if (session.role === 'UNIT' && session.unitId !== id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await connectToDatabase();

    const unit = await Unit.findById(id);
    if (!unit) {
      return NextResponse.json({ error: 'Unit not found' }, { status: 404 });
    }

    const unitObjectId = new mongoose.Types.ObjectId(id);

    // Fetch real metrics from MongoDB collections
    const [totalStudents, activeStudents, batches, commissionAgg] = await Promise.all([
      Student.countDocuments({ unitId: unitObjectId, status: { $ne: 'Archived' } }),
      Student.countDocuments({ unitId: unitObjectId, status: 'Active' }),
      TestRegistrationBatch.find({ unitId: unitObjectId }).populate('testEventId', 'name code testDate status').sort({ createdAt: -1 }),
      CommissionLedger.aggregate([
        { $match: { unitId: unitObjectId } },
        {
          $group: {
            _id: null,
            totalEarned: { $sum: '$commissionEarned' },
            totalGross: { $sum: '$grossAmount' },
          },
        },
      ]),
    ]);

    const totalCommission = commissionAgg[0]?.totalEarned || 0;
    const totalGrossPaid = commissionAgg[0]?.totalGross || 0;

    return NextResponse.json({
      unit,
      metrics: {
        totalStudents,
        activeStudents,
        totalBatches: batches.length,
        totalGrossPaid,
        totalCommission,
      },
      recentBatches: batches.slice(0, 10),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch unit details';
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
      return NextResponse.json({ error: 'Invalid Unit ID' }, { status: 400 });
    }

    // Unit users can only edit their own unit
    if (session.role === 'UNIT' && session.unitId !== id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    await connectToDatabase();

    const unit = await Unit.findById(id);
    if (!unit) {
      return NextResponse.json({ error: 'Unit not found' }, { status: 404 });
    }

    // Fields that Unit users can update
    if (body.name) unit.name = body.name.trim();
    if (body.headPerson) unit.headPerson = body.headPerson.trim();
    if (body.contactNumber) unit.contactNumber = body.contactNumber.trim();
    if (body.address) unit.address = body.address.trim();
    if (body.city) unit.city = body.city.trim();
    if (body.district) unit.district = body.district.trim();
    if (body.state) unit.state = body.state.trim();
    if (body.pincode) unit.pincode = body.pincode.trim();
    if (body.associatedInstructor !== undefined) unit.associatedInstructor = body.associatedInstructor.trim();
    if (Array.isArray(body.disciplinesOffered)) unit.disciplinesOffered = body.disciplinesOffered;

    // Fields that ONLY Super Admin can update
    if (session.role === 'SUPER_ADMIN') {
      if (body.unitCode && body.unitCode !== unit.unitCode) {
        unit.unitCode = body.unitCode.trim().toUpperCase();
      }
      if (body.status && ['ACTIVE', 'INACTIVE'].includes(body.status)) {
        unit.status = body.status;
        // Sync user account status
        await User.updateMany({ unitId: unit._id }, { status: body.status });
      }
      if (body.newPassword) {
        const passwordHash = await hashPassword(body.newPassword);
        await User.updateMany({ unitId: unit._id }, { passwordHash });
      }
    }

    await unit.save();

    await logAudit({
      action: 'UPDATE_UNIT',
      resourceType: 'Unit',
      resourceId: unit._id.toString(),
      details: { unitCode: unit.unitCode, name: unit.name },
      user: session,
    });

    return NextResponse.json({
      success: true,
      message: 'Unit updated successfully',
      unit,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update unit';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionUser(req);
    if (!session || session.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Super Admin required' }, { status: 403 });
    }

    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid Unit ID' }, { status: 400 });
    }

    await connectToDatabase();
    const unit = await Unit.findById(id);
    if (!unit) {
      return NextResponse.json({ error: 'Unit not found' }, { status: 404 });
    }

    unit.status = 'INACTIVE';
    await unit.save();

    // Also deactivate associated User login
    await User.updateMany({ unitId: unit._id }, { status: 'INACTIVE' });

    await logAudit({
      action: 'DEACTIVATE_UNIT',
      resourceType: 'Unit',
      resourceId: unit._id.toString(),
      details: { unitCode: unit.unitCode, name: unit.name },
      user: session,
    });

    return NextResponse.json({ success: true, message: 'Unit deactivated successfully' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to deactivate unit';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
