import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const SESSION_COOKIE = 'kal_session';

// All routes that require authentication — includes every route under
// app/(dashboard)/ plus top-level protected pages. Unauthenticated requests
// are redirected to /auth/login with a `next` param so the user lands back
// here after signing in. This runs BEFORE Next.js renders the page, so the
// AuthGuard client component is never reached by unauthenticated SSR, which
// prevents the "dashboard route returns 404" problem.
const PROTECTED_PREFIXES = [
  // Top-level protected pages
  '/dashboard',
  '/profile',
  '/billing',
  '/admin',
  '/settings',
  '/inbox',
  '/operations',
  '/onboarding',
  // All (dashboard) group routes
  '/chat',
  '/company-builder',
  '/brand-voice',
  '/investor',
  '/lab',
  '/ideas',
  '/brain',
  '/cash-runway',
  '/daily-brief',
  '/departments',
  '/experts',
  '/hr',
  '/launchpad',
  '/learned-skills',
  '/meetings',
  '/notifications',
  '/okr',
  '/org-chart',
  '/real-estate',
  '/roadmap',
  '/sales',
  '/skills',
  '/supply-chain',
  '/system-health',
  '/trending-tools',
  '/usage',
  '/virtual-office',
  '/wellbeing',
  '/workflows-runner',
  '/competitor-watch',
  '/contract-review',
  '/customer-discovery',
  '/cofounder-health',
  '/pitch-practice',
  '/opportunities',
  '/setup-egypt',
  '/decision-journal',
  '/founder-agreement',
  '/plan',
  '/smart-pricing',
  '/financial-model',
  '/growth-lab',
  '/hr-ai',
  '/market-intelligence',
  '/market-lab',
  '/email-ai',
  '/sales-coach',
  '/profile',
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

  // 2.5 Locale detection from Accept-Language header (Stripe/Notion pattern).
  //     We parse the browser-preferred language list and surface the best
  //     match as `x-kalmeron-locale-detect` so the UI can offer a one-click
  //     "Switch to English" / "العربية" suggestion when it diverges from the
  //     default Arabic locale.
  const acceptLang = request.headers.get('Accept-Language') || '';
  const preferred = acceptLang
    .split(',')
    .map((tag) => {
      const [lang, qPart] = tag.trim().split(';');
      const q = qPart?.startsWith('q=') ? Number(qPart.slice(2)) : 1;
      return { lang: (lang || '').toLowerCase().split('-')[0], q: Number.isFinite(q) ? q : 1 };
    })
    .filter((t) => t.lang)
    .sort((a, b) => b.q - a.q)[0]?.lang;
  if (preferred) {
    response.headers.set(
      'x-kalmeron-locale-detect',
      preferred === 'ar' ? 'ar' : preferred === 'en' ? 'en' : preferred,
    );
  }

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
