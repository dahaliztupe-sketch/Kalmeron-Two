/**
 * CSRF / Origin protection — حماية Server Actions و POST routes.
 *
 * Next.js 16 يحقق Origin افتراضياً على Server Actions، لكن نُضيف طبقة
 * صريحة هنا لـ:
 * - تطبيق fetch عميل خارجي (يجب أن يحمل origin مطابق)
 * - Server Actions القديمة التي قد تخسر هذا التحقق
 * - Webhooks موقّعة (HMAC) كبديل عن origin check
 *
 * مثال:
 *   import { assertSameOrigin } from "@/src/lib/security/csrf";
 *   export async function POST(req: NextRequest) {
 *     assertSameOrigin(req);
 *     // …
 *   }
 */

import { headers } from "next/headers";
import type { NextRequest } from "next/server";

const ALLOWED_ORIGINS = [
  process.env.NEXT_PUBLIC_APP_URL,
  process.env.NEXT_PUBLIC_SITE_URL,
  "https://kalmeron.ai",
  "https://www.kalmeron.ai",
].filter(Boolean) as string[];

export class CsrfError extends Error {
  status = 403;
  constructor(msg = "CSRF / Origin check failed") {
    super(msg);
    this.name = "CsrfError";
  }
}

/**
 * تحقق أن origin الطلب من نطاق موثوق. يرمي CsrfError إن لم يكن.
 * يُستخدم في POST/PUT/PATCH/DELETE handlers.
 */
export function assertSameOrigin(req: NextRequest | Request): void {
  const method = req.method.toUpperCase();
  if (method === "GET" || method === "HEAD" || method === "OPTIONS") return;

  const origin = req.headers.get("origin");
  const referer = req.headers.get("referer");
  const host = req.headers.get("host") || req.headers.get("x-forwarded-host");

  // لو المستخدم نفس الـ origin (نفس الموقع)، اقبل.
  if (origin && host) {
    try {
      const o = new URL(origin);
      if (o.host === host) return;
    } catch { /* fallthrough */ }
  }

  // قائمة بيضاء صريحة لـ origins موثوقة.
  if (origin && ALLOWED_ORIGINS.some((allowed) => origin === allowed || origin.startsWith(allowed + "/"))) {
    return;
  }

  // كحل احتياطي: تحقق من Referer إن كان origin مفقوداً (طلب من نفس الموقع).
  if (!origin && referer && host) {
    try {
      const r = new URL(referer);
      if (r.host === host) return;
    } catch { /* fallthrough */ }
  }

  throw new CsrfError(`Origin "${origin || referer || "missing"}" not allowed`);
}

/**
 * يستخدم في Server Actions (لا تملك Request مباشرةً).
 * يقرأ headers من next/headers ويتحقق منها.
 */
export async function assertServerActionOrigin(): Promise<void> {
  const h = await headers();
  const origin = h.get("origin");
  const host = h.get("host") || h.get("x-forwarded-host");

  if (origin && host) {
    try {
      const o = new URL(origin);
      if (o.host === host) return;
    } catch { /* fallthrough */ }
  }

  if (origin && ALLOWED_ORIGINS.some((allowed) => origin === allowed)) return;

  throw new CsrfError(`Server Action origin "${origin || "missing"}" not allowed`);
}

/**
 * تغليف Server Action بحماية CSRF تلقائياً.
 *
 * مثال:
 *   export const updateProfile = withCsrfProtection(async (data) => { ... });
 */
export function withCsrfProtection<TArgs extends unknown[], TReturn>(
  action: (...args: TArgs) => Promise<TReturn>,
): (...args: TArgs) => Promise<TReturn> {
  return async (...args: TArgs) => {
    await assertServerActionOrigin();
    return action(...args);
  };
}

export const CSRF = { assertSameOrigin, assertServerActionOrigin, withCsrfProtection };
export default CSRF;
