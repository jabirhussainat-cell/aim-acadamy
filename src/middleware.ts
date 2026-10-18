import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'aim_academy_secure_jwt_secret_key_minimum_32_characters_long'
);

const SESSION_COOKIE_NAME = 'aim_session';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const cookie = req.cookies.get(SESSION_COOKIE_NAME);
  let session = null;

  if (cookie?.value) {
    try {
      const { payload } = await jwtVerify(cookie.value, JWT_SECRET);
      session = payload;
    } catch {
      session = null;
    }
  }

  // If user is already logged in and visits /login, redirect to their panel
  if (pathname === '/login') {
    if (session) {
      if (session.role === 'SUPER_ADMIN') {
        return NextResponse.redirect(new URL('/admin', req.url));
      } else if (session.role === 'UNIT') {
        return NextResponse.redirect(new URL('/unit', req.url));
      }
    }
    return NextResponse.next();
  }

  // Protect /admin routes
  if (pathname.startsWith('/admin')) {
    if (!session) {
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (session.role !== 'SUPER_ADMIN') {
      return NextResponse.redirect(new URL('/unit', req.url));
    }
    return NextResponse.next();
  }

  // Protect /unit routes
  if (pathname.startsWith('/unit')) {
    if (!session) {
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (session.role !== 'UNIT') {
      return NextResponse.redirect(new URL('/admin', req.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/unit/:path*', '/login'],
};
