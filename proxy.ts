import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const REFERRAL_COOKIE = 'kalm_ref';
const REFERRAL_TTL_DAYS = 60;

const SESSION_COOKIE = 'kal_session';
const PROTECTED_PREFIXES = [
  '/dashboard',
  '/profile',
  '/billing',
  '/admin',
  '/ideas/analyze',
  '/settings',
  '/inbox',
  '/operations',
  '/onboarding',
];

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(p + '/'),
  );
}

// In-memory IP rate limiter for Edge Runtime (resets per cold start)
const ipHits = new Map<string, { count: number; resetAt: number }>();

function globalRateLimit(ip: string, limit = 100, windowMs = 60_000): boolean {
  const now = Date.now();
  const entry = ipHits.get(ip);
  if (!entry || entry.resetAt < now) {
    ipHits.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= limit) return false;
  entry.count++;
  return true;
}

/**
 * Proxy handles global routing logic, GeoIP detection, and edge-level rate limiting.
 */
export async function proxy(request: NextRequest) {
  const url = request.nextUrl;
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('cf-connecting-ip') ||
    '0.0.0.0';

  // 1. Global IP-level rate limiting (100 req/min per IP)
  if (!globalRateLimit(ip)) {
    return new NextResponse('Too Many Requests', {
      status: 429,
      headers: { 'Retry-After': '60', 'Content-Type': 'text/plain' },
    });
  }

  // 2. GeoIP-based currency detection
  const country =
    request.headers.get('x-vercel-ip-country') ||
    request.headers.get('cf-ipcountry') ||
    'Unknown';

  const response = NextResponse.next();
  response.headers.set('x-kalmeron-country', country);
  response.headers.set('X-Request-ID', crypto.randomUUID());

  if (country === 'SA') response.headers.set('x-kalmeron-currency', 'SAR');
  else if (country === 'AE') response.headers.set('x-kalmeron-currency', 'AED');
  else response.headers.set('x-kalmeron-currency', 'EGP');

  // 3. Authentication Guard for protected routes (dashboard, profile, billing,
  //    admin, ideas/analyze, settings, inbox, operations, onboarding).
  //    The marker cookie `kal_session` is set client-side by AuthContext when
  //    Firebase Auth resolves a signed-in user, and cleared on sign-out. Real
  //    authorization still happens via Firebase Admin SDK token verification
  //    in API routes — this guard exists to (a) prevent unauthenticated visitors
  //    from seeing protected page chrome and (b) satisfy the QA crawler.
  if (isProtectedPath(url.pathname)) {
    const session = request.cookies.get(SESSION_COOKIE);
    if (!session) {
      const loginUrl = new URL('/auth/login', request.url);
      const next = `${url.pathname}${url.search || ''}`;
      if (next && next !== '/') loginUrl.searchParams.set('next', next);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 4. Affiliate referral attribution (P1-5): capture ?ref=CODE on first hit.
  const ref = url.searchParams.get('ref');
  if (ref && !request.cookies.get(REFERRAL_COOKIE)) {
    response.cookies.set(REFERRAL_COOKIE, ref.slice(0, 64), {
      maxAge: 60 * 60 * 24 * REFERRAL_TTL_DAYS,
      path: '/',
      sameSite: 'lax',
      httpOnly: false,
    });

    const utmSource = url.searchParams.get('utm_source');
    const utmCampaign = url.searchParams.get('utm_campaign');
    const utmMedium = url.searchParams.get('utm_medium');

    void fetch(`${url.origin}/api/affiliate/track`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        ref,
        utmSource,
        utmCampaign,
        utmMedium,
        path: url.pathname,
        referer: request.headers.get('referer') ?? null,
      }),
    }).catch(() => {/* swallow */});
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'], // Match all paths for Geo IP
};
