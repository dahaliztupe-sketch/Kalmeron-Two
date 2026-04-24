/**
 * Unified route guard: authentication + rate-limiting + zod validation + RBAC + audit.
 * Supports Firebase ID tokens and Kalmeron API keys (kal_live_…).
 */
import { NextRequest, NextResponse } from 'next/server';
import { z, ZodType } from 'zod';
import { adminAuth } from '@/src/lib/firebase-admin';
import { rateLimit, rateLimitResponse } from '@/src/lib/security/rate-limit';
import { createRequestLogger } from '@/src/lib/logger';
import { verifyApiKey } from '@/src/lib/security/api-keys';
import { requirePermission, isPlatformAdmin, type Permission } from '@/src/lib/security/rbac';
import { writeAudit, extractClientInfo, type AuditAction } from '@/src/lib/audit/log';
import { checkQuota } from '@/src/lib/billing/metering';

export type ActorType = 'user' | 'api_key' | 'admin';

export interface AuthedRequest<T = unknown> {
  req: NextRequest;
  userId: string | null;
  actorType: ActorType | null;
  apiKeyScopes?: string[];
  workspaceId?: string | null;
  body: T;
  log: ReturnType<typeof createRequestLogger>;
  requestId: string;
}

export interface GuardOptions<T extends ZodType> {
  requireAuth?: boolean;
  schema?: T;
  rateLimit?: { limit: number; windowMs: number; scope?: string };
  /** Require specific workspace permission (needs workspaceId in body or query). */
  requirePermission?: Permission;
  /** Require platform-admin privilege. */
  requirePlatformAdmin?: boolean;
  /** Enforce workspace quota before running the handler. */
  checkQuota?: boolean;
  /** Audit entry to write on success; `false` disables auditing. */
  audit?: { action: AuditAction; resource: string } | false;
}

async function verifyAuth(req: NextRequest): Promise<{
  userId: string | null;
  actorType: ActorType | null;
  apiKeyScopes?: string[];
  workspaceIdFromKey?: string | null;
}> {
  const header = req.headers.get('authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return { userId: null, actorType: null };
  // API key path
  if (token.startsWith('kal_live_')) {
    const res = await verifyApiKey(token);
    if (!res.ok) return { userId: null, actorType: null };
    return {
      userId: res.ownerId!,
      actorType: 'api_key',
      apiKeyScopes: res.scopes,
      workspaceIdFromKey: res.workspaceId ?? null,
    };
  }
  // Firebase ID token path
  try {
    const decoded = await adminAuth.verifyIdToken(token);
    return {
      userId: decoded.uid,
      actorType: isPlatformAdmin(decoded.uid) ? 'admin' : 'user',
    };
  } catch {
    return { userId: null, actorType: null };
  }
}

function extractWorkspaceId(req: NextRequest, body: unknown): string | null {
  if (body && typeof body === 'object' && 'workspaceId' in body) {
    const wid = (body as { workspaceId?: unknown }).workspaceId;
    if (typeof wid === 'string' && wid.length > 0) return wid;
  }
  const q = req.nextUrl.searchParams.get('workspaceId');
  return q || null;
}

function toAuditActorType(t: ActorType | null): 'user' | 'api_key' | 'system' | 'admin' {
  return t ?? 'system';
}

export function guardedRoute<T extends ZodType>(
  handler: (ctx: AuthedRequest<z.infer<T>>) => Promise<NextResponse> | Promise<Response>,
  opts: GuardOptions<T> = {}
) {
  return async (req: NextRequest): Promise<NextResponse | Response> => {
    const requestId = req.headers.get('X-Request-ID') || crypto.randomUUID();
    const log = createRequestLogger(requestId);
    const client = extractClientInfo(req);

    // 1) Rate limit
    const rl = rateLimit(req, opts.rateLimit ?? { limit: 30, windowMs: 60_000 });
    if (!rl.success) {
      log.warn?.({ path: req.nextUrl.pathname }, 'rate_limited');
      return rateLimitResponse();
    }

    // 2) Auth
    const auth = await verifyAuth(req);
    if (opts.requireAuth && !auth.userId) {
      return NextResponse.json({ error: 'unauthorized', message: 'غير مصرح' }, { status: 401 });
    }
    if (opts.requirePlatformAdmin) {
      if (!isPlatformAdmin(auth.userId)) {
        return NextResponse.json({ error: 'forbidden', message: 'ممنوع — صلاحية مسؤول المنصة مطلوبة' }, { status: 403 });
      }
    }

    // 3) Validate body (POST/PUT/PATCH only)
    let body: unknown = {};
    const method = req.method.toUpperCase();
    if (opts.schema && ['POST', 'PUT', 'PATCH'].includes(method)) {
      try {
        const raw = await req.json();
        const parsed = opts.schema.safeParse(raw);
        if (!parsed.success) {
          return NextResponse.json(
            { error: 'invalid_body', message: 'البيانات المرسلة غير صحيحة', details: parsed.error.flatten() },
            { status: 400 }
          );
        }
        body = parsed.data;
      } catch {
        return NextResponse.json({ error: 'invalid_json', message: 'JSON غير صالح' }, { status: 400 });
      }
    }

    // 4) Workspace permission check
    const workspaceId = extractWorkspaceId(req, body) || auth.workspaceIdFromKey || null;
    if (opts.requirePermission) {
      if (!auth.userId || !workspaceId) {
        return NextResponse.json(
          { error: 'workspace_required', message: 'معرّف مساحة العمل مطلوب' },
          { status: 400 }
        );
      }
      // API keys must carry the corresponding scope
      if (auth.actorType === 'api_key') {
        if (!(auth.apiKeyScopes || []).includes(opts.requirePermission)) {
          return NextResponse.json(
            { error: 'forbidden', message: 'مفتاح API لا يملك الصلاحية المطلوبة' },
            { status: 403 }
          );
        }
      } else if (auth.actorType !== 'admin') {
        const check = await requirePermission(auth.userId, workspaceId, opts.requirePermission);
        if (!check.allowed) {
          return NextResponse.json(
            { error: 'forbidden', message: 'صلاحيتك لا تسمح بهذا الإجراء', reason: check.reason },
            { status: 403 }
          );
        }
      }
    }

    // 5) Quota check (workspace-scoped operations)
    if (opts.checkQuota && workspaceId) {
      const q = await checkQuota(workspaceId);
      if (!q.ok) {
        await writeAudit({
          actorId: auth.userId,
          actorType: toAuditActorType(auth.actorType),
          action: 'quota_exceeded',
          resource: opts.audit ? opts.audit.resource : 'quota',
          workspaceId,
          requestId,
          success: false,
          errorMessage: q.reason,
          metadata: { usage: q.usage, limits: q.limits, tier: q.tier },
          ...client,
        });
        return NextResponse.json(
          {
            error: 'quota_exceeded',
            message: 'تم تجاوز الحصة المسموح بها، يرجى الترقية',
            reason: q.reason,
            usage: q.usage,
            limits: q.limits,
          },
          { status: 429 }
        );
      }
    }

    // 6) Execute handler + audit
    try {
      const res = await handler({
        req,
        userId: auth.userId,
        actorType: auth.actorType,
        apiKeyScopes: auth.apiKeyScopes,
        workspaceId,
        body: body as never,
        log,
        requestId,
      });
      if (opts.audit && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
        writeAudit({
          actorId: auth.userId,
          actorType: toAuditActorType(auth.actorType),
          action: opts.audit.action,
          resource: opts.audit.resource,
          workspaceId: workspaceId || undefined,
          requestId,
          success: true,
          ...client,
        }).catch(() => {});
      }
      if (res instanceof NextResponse) {
        res.headers.set('X-Request-ID', requestId);
      }
      return res;
    } catch (err: unknown) {
      const errMessage = err instanceof Error ? err.message : String(err);
      log.error?.({ err: errMessage, path: req.nextUrl.pathname }, 'route_error');
      if (opts.audit) {
        writeAudit({
          actorId: auth.userId,
          actorType: toAuditActorType(auth.actorType),
          action: opts.audit.action,
          resource: opts.audit.resource,
          workspaceId: workspaceId || undefined,
          requestId,
          success: false,
          errorMessage: errMessage,
          ...client,
        }).catch(() => {});
      }
      return NextResponse.json(
        { error: 'internal_error', message: errMessage || 'خطأ غير متوقع' },
        { status: 500, headers: { 'X-Request-ID': requestId } }
      );
    }
  };
}
