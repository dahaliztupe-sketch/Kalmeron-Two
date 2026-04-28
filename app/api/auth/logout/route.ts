/**
 * /api/auth/logout — clear the session cookie and any auxiliary auth state.
 *
 * The actual Firebase sign-out happens client-side (via `signOut(auth)`),
 * but we still expose a server endpoint that:
 *   1. Clears the `__session` cookie used by middleware/RSC for SSR auth.
 *   2. Returns 204 No Content so the client can simply `await fetch(...)`.
 *
 * Idempotent — safe to call when no session exists.
 */
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SESSION_COOKIES = ['__session', 'session', 'firebase-auth-token'];

function buildResponse(): NextResponse {
  const res = new NextResponse(null, { status: 204 });
  for (const name of SESSION_COOKIES) {
    res.cookies.set({
      name,
      value: '',
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      expires: new Date(0),
    });
  }
  res.headers.set('Cache-Control', 'no-store');
  return res;
}

export async function POST(_req: NextRequest) {
  return buildResponse();
}

// Some clients prefer GET for logout via a link click — accept it too.
export async function GET(_req: NextRequest) {
  return buildResponse();
}
