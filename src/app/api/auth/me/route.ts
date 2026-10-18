import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { getSessionUser } from '@/lib/auth';
import { User } from '@/models/User';
import { Unit } from '@/models/Unit';

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    if (!session) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
    }

    await connectToDatabase();
    const user = await User.findById(session.userId).select('-passwordHash');

    if (!user || user.status !== 'ACTIVE') {
      return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
    }

    let unit = null;
    if (user.role === 'UNIT' && user.unitId) {
      unit = await Unit.findById(user.unitId);
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        adminIndex: user.adminIndex,
        unit: unit
          ? {
              id: unit._id.toString(),
              name: unit.name,
              unitCode: unit.unitCode,
              city: unit.city,
            }
          : null,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Authentication check failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
