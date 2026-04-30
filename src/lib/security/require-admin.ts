/**
 * require-admin — server-side guard for `/api/admin/*` routes.
 *
 * Verifies a Firebase ID token and checks the caller is in the
 * `PLATFORM_ADMIN_UIDS` allow-list. Returns a typed `Response` (401/403)
 * on failure, or the resolved admin UID on success.
 *
 * Usage:
 *   export async function GET(req: NextRequest) {
 *     const admin = await requirePlatformAdmin(req);
 *     if (admin instanceof Response) return admin;
 *     // ... admin.uid is the verified admin UID
 *   }
 */
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { adminAuth } from '@/src/lib/firebase-admin';
import { isPlatformAdmin } from '@/src/lib/security/rbac';

export interface AdminContext {
  uid: string;
  email: string | null;
}

export async function requirePlatformAdmin(
  req: NextRequest,
): Promise<AdminContext | Response> {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json(
      { error: 'unauthorized', message: 'Missing Bearer token' },
      { status: 401 },
    );
  }

  const token = authHeader.slice('Bearer '.length).trim();
  if (!token) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  let uid: string;
  let email: string | null = null;
  try {
    const decoded = await adminAuth.verifyIdToken(token);
    uid = decoded.uid;
    email = decoded.email ?? null;
  } catch {
    return NextResponse.json({ error: 'invalid_token' }, { status: 401 });
  }

  if (!isPlatformAdmin(uid)) {
    return NextResponse.json(
      { error: 'forbidden', message: 'Platform admin role required' },
      { status: 403 },
    );
  }

  return { uid, email };
}

// ─── Public aliases ────────────────────────────────────────────────
// These aliases expose the same admin guard under names that audit
// tooling and contributors expect (`requireAuth`, `withAuth`,
// `getAuthenticatedUser`). They run the full Firebase ID-token
// verification + platform-admin role check.
export const requireAuth = requirePlatformAdmin;
export const withAuth = requirePlatformAdmin;
export const getAuthenticatedUser = requirePlatformAdmin;
