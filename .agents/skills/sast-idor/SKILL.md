---
name: sast-idor
description: Detect Insecure Direct Object Reference (IDOR) vulnerabilities in Next.js API routes and Firestore queries. Use when reviewing endpoints that retrieve, update, or delete resources by ID without verifying ownership. Critical for multi-tenant SaaS apps.
---

# SAST: Insecure Direct Object Reference (IDOR) Detection

Scan for IDOR vulnerabilities — OWASP A01:2021 (Broken Access Control).

## What to Look For

### High Risk Patterns
```typescript
// ❌ VULNERABLE: fetch resource by ID without ownership check
export async function GET(req: NextRequest, { params }) {
  const doc = await db.collection('invoices').doc(params.id).get();
  return NextResponse.json(doc.data()); // anyone can read any invoice!
}

// ❌ VULNERABLE: update without ownership check
await db.collection('profiles').doc(req.body.userId).update(data);

// ❌ VULNERABLE: using client-supplied userId
const userId = req.body.userId; // attacker can supply any userId
await db.collection('users').doc(userId).get();
```

### Safe Patterns
```typescript
// ✅ SAFE: always derive userId from session, never from request
const session = await getServerSession();
const userId = session.user.id; // from verified JWT/session

// ✅ SAFE: verify ownership before returning
const doc = await db.collection('invoices').doc(params.id).get();
if (doc.data()?.userId !== session.user.id) {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}

// ✅ SAFE: scope query to authenticated user (Kalmeron Firestore pattern)
const docs = await db
  .collection('invoices')
  .where('userId', '==', session.user.id)
  .limit(50)
  .get();
```

## Kalmeron-Specific Checks
- All Firestore reads in `app/api/` must use `session.user.id` for scoping
- Check `app/api/user/*` routes — never accept userId from body
- `app/api/billing/*` — verify billing records belong to authenticated user
- `app/api/notifications/*` — notifications must be scoped to userId

## Scan Checklist

- [ ] No endpoint accepts userId/resourceId from request body/query as authoritative
- [ ] Session userId used for all Firestore queries (not req.body.userId)
- [ ] Ownership verified before returning resource (doc.data().userId === session.userId)
- [ ] Admin endpoints protected by role check (`session.user.role === 'admin'`)
- [ ] Pagination cursors verified to belong to authenticated user

## Severity Matrix
| Pattern | Severity |
|---|---|
| GET resource by ID without ownership check | High |
| UPDATE/DELETE by ID without ownership check | Critical |
| Using req.body.userId as authoritative identity | Critical |
| Admin endpoint accessible to regular users | Critical |

## Remediation
1. Always derive user identity from verified session (JWT/cookie), never from request body
2. Add ownership check: `if (resource.userId !== session.userId) return 403`
3. Scope all Firestore queries with `.where('userId', '==', session.userId)`
4. Add `.limit()` to prevent bulk data exfiltration
5. Log access patterns — anomalous ID enumeration is a sign of IDOR exploitation
