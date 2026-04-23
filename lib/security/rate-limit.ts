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

export interface RateLimitOptions {
  limit: number;
  windowMs: number;
  /** مفتاح إضافي اختياري — مثل userId أو agentName — يُضاف للمسار وعنوان IP. */
  scope?: string;
  /** إذا كان لدى المستخدم معرف موثوق، يُستخدم بديلاً لـ IP. */
  userId?: string;
}

export function rateLimit(
  req: NextRequest,
  options: RateLimitOptions,
): { success: boolean; remaining: number } {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown';

  const principal = options.userId || ip;
  const scope = options.scope ? `:${options.scope}` : '';
  const key = `${req.nextUrl.pathname}${scope}:${principal}`;
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
    },
  );
}

/**
 * فحص حد per-user لإيجنت محدد. يُستخدم داخل /api/chat قبل تشغيل الـ Orchestrator
 * لتقييد الاستهلاك المُكلف لكل وكيل بدلاً من حد موحّد لكل المسار.
 */
export function rateLimitAgent(
  userId: string | undefined,
  agent: string,
  options: { limit: number; windowMs: number },
): { allowed: boolean; remaining: number; limit: number } {
  const key = `agent:${agent}:${userId || 'guest-system'}`;
  const now = Date.now();
  cleanExpired();
  const entry = store.get(key);
  if (!entry || entry.resetAt < now) {
    store.set(key, { count: 1, resetAt: now + options.windowMs });
    return { allowed: true, remaining: options.limit - 1, limit: options.limit };
  }
  if (entry.count >= options.limit) {
    return { allowed: false, remaining: 0, limit: options.limit };
  }
  entry.count += 1;
  return { allowed: true, remaining: options.limit - entry.count, limit: options.limit };
}
