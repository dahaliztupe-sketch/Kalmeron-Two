import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

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

  // 3. Admin Authentication Guard
  if (url.pathname.startsWith('/admin')) {
    const session = request.cookies.get('session');
    if (!session) {
      return NextResponse.redirect(new URL('/chat', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'], // Match all paths for Geo IP
};
