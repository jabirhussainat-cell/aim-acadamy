import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { IUser, UserRole } from '@/models/User';
import connectToDatabase from '@/lib/mongodb';
import { AuditLog } from '@/models/AuditLog';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'aim_academy_secure_jwt_secret_key_minimum_32_characters_long'
);

const SESSION_COOKIE_NAME = 'aim_session';

export interface TokenPayload {
  userId: string;
  email: string;
  name: string;
  role: UserRole;
  unitId?: string | null;
  adminIndex?: number;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createSessionToken(payload: TokenPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);
}

export async function verifySessionToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as TokenPayload;
  } catch (err) {
    return null;
  }
}

export async function getSessionUser(req?: NextRequest): Promise<TokenPayload | null> {
  let token: string | undefined;

  if (req) {
    // Check Authorization Bearer header first, then cookie
    const authHeader = req.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else {
      const cookie = req.cookies.get(SESSION_COOKIE_NAME);
      token = cookie?.value;
    }
  } else {
    // Next.js Server Components / Server Actions
    const cookieStore = await cookies();
    const cookie = cookieStore.get(SESSION_COOKIE_NAME);
    token = cookie?.value;
  }

  if (!token) return null;
  return verifySessionToken(token);
}

export async function requireSuperAdmin(req?: NextRequest): Promise<TokenPayload> {
  const user = await getSessionUser(req);
  if (!user || user.role !== 'SUPER_ADMIN') {
    throw new Error('Unauthorized: Super Admin access required');
  }
  return user;
}

export async function requireUnitUser(req?: NextRequest): Promise<TokenPayload> {
  const user = await getSessionUser(req);
  if (!user || user.role !== 'UNIT' || !user.unitId) {
    throw new Error('Unauthorized: Unit access required');
  }
  return user;
}

export async function requireAuth(req?: NextRequest): Promise<TokenPayload> {
  const user = await getSessionUser(req);
  if (!user) {
    throw new Error('Unauthorized: Authentication required');
  }
  return user;
}

export async function logAudit({
  action,
  resourceType,
  resourceId,
  details,
  user,
  ipAddress,
}: {
  action: string;
  resourceType: string;
  resourceId?: string;
  details?: Record<string, unknown>;
  user?: TokenPayload | null;
  ipAddress?: string;
}) {
  try {
    await connectToDatabase();
    await AuditLog.create({
      userId: user?.userId,
      userName: user?.name,
      userRole: user?.role,
      action,
      resourceType,
      resourceId,
      details,
      ipAddress,
    });
  } catch (err) {
    console.error('Failed to write audit log:', err);
  }
}

export { SESSION_COOKIE_NAME };
