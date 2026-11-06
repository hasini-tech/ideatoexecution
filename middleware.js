import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { COOKIE, jwtSecret, signGuestToken } from './lib/session-token';

export async function middleware(req) {
  const { pathname } = req.nextUrl;
  if (pathname === '/login' || pathname === '/register') {
    return NextResponse.redirect(new URL('/', req.url));
  }

  const token = req.cookies.get(COOKIE)?.value;
  let payload;
  if (token) {
    try {
      ({ payload } = await jwtVerify(token, jwtSecret()));
    } catch {}
  }
  if (payload) return NextResponse.next();

  const id = Array.from(crypto.getRandomValues(new Uint8Array(12)), (byte) => byte.toString(16).padStart(2, '0')).join('');
  const guestToken = await signGuestToken({ id, name: 'Guest', timezone: 'Asia/Kolkata' });
  const response = NextResponse.next();
  response.cookies.set(COOKIE, guestToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  });
  return response;
}

export const config = {
  matcher: ['/((?!api|_next|icons|sw.js|manifest.json|offline.html|favicon.ico).*)'],
};
