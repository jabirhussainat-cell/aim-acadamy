import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { User } from '@/models/User';
import { Unit } from '@/models/Unit';
import {
  verifyPassword,
  createSessionToken,
  SESSION_COOKIE_NAME,
  logAudit,
} from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    if (user.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Your account has been deactivated. Please contact administration.' },
        { status: 403 }
      );
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // If unit account, verify unit is active
    let unitDetails = null;
    if (user.role === 'UNIT' && user.unitId) {
      const unit = await Unit.findById(user.unitId);
      if (!unit || unit.status !== 'ACTIVE') {
        return NextResponse.json(
          { error: 'Associated Unit is currently inactive or not found.' },
          { status: 403 }
        );
      }
      unitDetails = {
        id: unit._id.toString(),
        name: unit.name,
        unitCode: unit.unitCode,
      };
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    const token = await createSessionToken({
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      unitId: user.unitId ? user.unitId.toString() : null,
      adminIndex: user.adminIndex,
    });

    await logAudit({
      action: 'USER_LOGIN',
      resourceType: 'User',
      resourceId: user._id.toString(),
      details: { role: user.role, email: user.email },
      user: {
        userId: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
        unitId: user.unitId ? user.unitId.toString() : null,
      },
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        adminIndex: user.adminIndex,
        unit: unitDetails,
      },
    });

    // Set secure HTTP-only cookie
    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Login failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
