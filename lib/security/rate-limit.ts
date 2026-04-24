/**
 * Rate limit with pluggable backend.
 *
 * Backend selection (in order):
 *   1. Upstash Redis REST (UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN)
 *   2. Vercel KV (KV_REST_API_URL + KV_REST_API_TOKEN)
 *   3. In-memory fallback (single-instance only — DO NOT rely on this in
 *      production behind multiple Vercel Edge instances).
 *
 * The async API (`rateLimitAsync`, `rateLimitAgentAsync`) is the recommended
 * one in new code. The sync API is kept for backwards compatibility with
 * existing call sites; it always uses the in-memory backend.
 */
import { NextRequest, NextResponse } from 'next/server';

interface RateLimitStore {
  count: number;
  resetAt: number;
}

const memoryStore = new Map<string, RateLimitStore>();

function cleanExpired() {
  const now = Date.now();
  for (const [key, value] of memoryStore.entries()) {
    if (value.resetAt < now) memoryStore.delete(key);
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

function buildKey(req: NextRequest, options: RateLimitOptions): string {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown';
  const principal = options.userId || ip;
  const scope = options.scope ? `:${options.scope}` : '';
  return `${req.nextUrl.pathname}${scope}:${principal}`;
}

// ---------- in-memory backend ----------

function memoryHit(
  key: string,
  limit: number,
  windowMs: number,
): { success: boolean; remaining: number } {
  const now = Date.now();
  cleanExpired();
  const entry = memoryStore.get(key);
  if (!entry || entry.resetAt < now) {
    memoryStore.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: limit - 1 };
  }
  if (entry.count >= limit) return { success: false, remaining: 0 };
  entry.count += 1;
  return { success: true, remaining: limit - entry.count };
}

// ---------- Upstash / Vercel KV (REST, no extra deps) ----------

interface RestBackend {
  url: string;
  token: string;
}

function getRestBackend(): RestBackend | null {
  const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
  const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (upstashUrl && upstashToken) return { url: upstashUrl, token: upstashToken };

  const kvUrl = process.env.KV_REST_API_URL;
  const kvToken = process.env.KV_REST_API_TOKEN;
  if (kvUrl && kvToken) return { url: kvUrl, token: kvToken };

  return null;
}

async function restCommand(backend: RestBackend, args: (string | number)[]): Promise<unknown> {
  const res = await fetch(`${backend.url}/${args.map(encodeURIComponent).join('/')}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${backend.token}` },
  });
  if (!res.ok) throw new Error(`rate-limit backend error: ${res.status}`);
  const json = (await res.json()) as { result?: unknown };
  return json.result;
}

async function restHit(
  backend: RestBackend,
  key: string,
  limit: number,
  windowMs: number,
): Promise<{ success: boolean; remaining: number }> {
  const ttlSeconds = Math.max(1, Math.ceil(windowMs / 1000));
  // INCR
  const countResult = await restCommand(backend, ['incr', key]);
  const count = typeof countResult === 'number' ? countResult : Number(countResult ?? 0);
  if (count === 1) {
    // Set TTL on first hit only.
    await restCommand(backend, ['expire', key, ttlSeconds]);
  }
  if (count > limit) return { success: false, remaining: 0 };
  return { success: true, remaining: Math.max(0, limit - count) };
}

// ---------- public sync API (legacy / compatibility) ----------

export function rateLimit(
  req: NextRequest,
  options: RateLimitOptions,
): { success: boolean; remaining: number } {
  return memoryHit(buildKey(req, options), options.limit, options.windowMs);
}

// ---------- public async API (recommended) ----------

export async function rateLimitAsync(
  req: NextRequest,
  options: RateLimitOptions,
): Promise<{ success: boolean; remaining: number; backend: 'redis' | 'memory' }> {
  const backend = getRestBackend();
  const key = buildKey(req, options);
  if (backend) {
    try {
      const r = await restHit(backend, key, options.limit, options.windowMs);
      return { ...r, backend: 'redis' };
    } catch {
      // fall through to memory if backend transient failure
    }
  }
  return { ...memoryHit(key, options.limit, options.windowMs), backend: 'memory' };
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
  const r = memoryHit(key, options.limit, options.windowMs);
  return { allowed: r.success, remaining: r.remaining, limit: options.limit };
}

export async function rateLimitAgentAsync(
  userId: string | undefined,
  agent: string,
  options: { limit: number; windowMs: number },
): Promise<{ allowed: boolean; remaining: number; limit: number; backend: 'redis' | 'memory' }> {
  const backend = getRestBackend();
  const key = `agent:${agent}:${userId || 'guest-system'}`;
  if (backend) {
    try {
      const r = await restHit(backend, key, options.limit, options.windowMs);
      return { allowed: r.success, remaining: r.remaining, limit: options.limit, backend: 'redis' };
    } catch {
      // fall through
    }
  }
  const r = memoryHit(key, options.limit, options.windowMs);
  return { allowed: r.success, remaining: r.remaining, limit: options.limit, backend: 'memory' };
}
