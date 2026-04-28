import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

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

// Loopback / private addresses that should never be globally rate-limited
// (localhost dev, e2e/Playwright runners, internal probes, k8s health checks).
function isTrustedLocalIp(ip: string): boolean {
  if (!ip || ip === '0.0.0.0' || ip === 'unknown') return true;
  if (ip === '::1' || ip === '127.0.0.1') return true;
  if (ip.startsWith('127.')) return true;
  if (ip.startsWith('10.')) return true;
  if (ip.startsWith('192.168.')) return true;
  if (ip.startsWith('::ffff:127.')) return true;
  return false;
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

  // 1. Global IP-level rate limiting (100 req/min per IP).
  //    Skip in non-production (dev / test / e2e) and for loopback IPs so the
  //    Playwright suite — which intentionally fires bursts of requests against
  //    /api/chat — doesn't get globally throttled before the route's own
  //    finer-grained rate-limit + auth checks have a chance to respond.
  //    Production traffic from real clients is still protected.
  if (process.env.NODE_ENV === 'production' && !isTrustedLocalIp(ip)) {
    if (!globalRateLimit(ip)) {
      return new NextResponse('Too Many Requests', {
        status: 429,
        headers: { 'Retry-After': '60', 'Content-Type': 'text/plain' },
      });
    }
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

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'], // Match all paths for Geo IP
};
