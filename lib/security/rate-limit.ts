import { NextRequest, NextResponse } from 'next/server';

interface RateLimitStore {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitStore>();

function cleanExpired() {
  const now = Date.now();
  for (const [key, value] of store.entries()) {
    if (value.resetAt < now) store.delete(key);
  }
}

export function rateLimit(
  req: NextRequest,
  options: { limit: number; windowMs: number }
): { success: boolean; remaining: number } {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown';

  const key = `${req.nextUrl.pathname}:${ip}`;
  const now = Date.now();

  cleanExpired();

  const entry = store.get(key);

  if (!entry || entry.resetAt < now) {
    store.set(key, { count: 1, resetAt: now + options.windowMs });
    return { success: true, remaining: options.limit - 1 };
  }

  if (entry.count >= options.limit) {
    return { success: false, remaining: 0 };
  }

  entry.count += 1;
  return { success: true, remaining: options.limit - entry.count };
}

export function rateLimitResponse(): NextResponse {
  return NextResponse.json(
    { error: 'طلبات كثيرة جداً. يرجى الانتظار قليلاً والمحاولة مجدداً.' },
    {
      status: 429,
      headers: { 'Retry-After': '60' },
    }
  );
}
