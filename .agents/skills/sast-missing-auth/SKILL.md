---
name: sast-missing-auth
description: Detect Missing Authorization vulnerabilities — API endpoints accessible without authentication. Use when reviewing all API routes to ensure every endpoint that accesses user data validates the session. Critical for multi-tenant SaaS like Kalmeron.
---

# SAST: Missing Authorization Detection

Scan for unprotected endpoints — OWASP A01:2021 (Broken Access Control).

## What to Look For

### High Risk Patterns
```typescript
// ❌ VULNERABLE: API route with no auth check
export async function GET(req: NextRequest) {
  const users = await db.collection('users').get(); // no session check!
  return NextResponse.json(users.docs.map(d => d.data()));
}

// ❌ VULNERABLE: only checking presence, not validity
const token = req.headers.get('authorization');
if (!token) return 401; // but never verifies the token!

// ❌ VULNERABLE: role check missing for admin operation
export async function DELETE(req: NextRequest, { params }) {
  const session = await getServerSession(); // authenticated but...
  await db.collection('users').doc(params.id).delete(); // no admin check!
}
```

### Safe Patterns
```typescript
// ✅ SAFE: session verified at route start
export async function GET(req: NextRequest) {
  const session = await getServerSession();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // proceed with session.user.id
}

// ✅ SAFE: role-based check for admin operations
const session = await getServerSession();
if (!session?.user || session.user.role !== 'admin') {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}

// ✅ SAFE: middleware-level protection
// middleware.ts — protect all /api/* routes except auth endpoints
```

## Kalmeron Middleware Analysis
Check `middleware.ts` for route protection:
- `/api/auth/*` — public (login/register)
- `/api/billing/*` — authenticated
- `/api/user/*` — authenticated + self-only
- `/admin/*` — authenticated + admin role
- `/api/notifications/*` — authenticated

## Scan Checklist

- [ ] Every `app/api/` route that accesses user data calls `getServerSession()` first
- [ ] `getServerSession()` result checked for null before use
- [ ] Admin operations check `session.user.role === 'admin'`
- [ ] `middleware.ts` covers all sensitive route patterns
- [ ] Public routes (landing, auth) explicitly excluded from auth requirements
- [ ] Webhook endpoints verify HMAC signature instead of session

## Protected Route Audit Template
```typescript
// Pattern to verify in each API route:
export async function [METHOD](req: NextRequest) {
  // 1. Get session
  const session = await getServerSession();
  // 2. Verify authentication
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  // 3. (for admin routes) Verify authorization
  if (session.user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  // 4. Proceed with session.user.id for data scoping
}
```

## Severity Matrix
| Pattern | Severity |
|---|---|
| No auth on data-returning endpoint | Critical |
| No auth on data-modifying endpoint | Critical |
| Auth present but not verified | Critical |
| Admin endpoint lacks role check | High |
| Webhook without signature verification | High |

## Remediation
1. Add `getServerSession()` + null check at the top of every protected route
2. Use Next.js middleware to enforce auth at the infrastructure level
3. Create a helper `requireAuth(req)` that throws on missing/invalid session
4. Review all `app/api/` routes with a checklist — every endpoint must be classified
5. Add integration tests that verify 401 on unauthenticated requests
