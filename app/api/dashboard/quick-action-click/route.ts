/**
 * POST /api/dashboard/quick-action-click
 * Increments a per-user, per-action click counter in Firestore so that
 * quick actions can be reordered by real usage across devices.
 *
 * Body: { actionKey: string }
 * Stored at: users/{uid}/meta/quickActionUsage  (map: { [actionKey]: count })
 *
 * GET /api/dashboard/quick-action-click
 * Returns the current usage map for the authenticated user.
 */
import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/src/lib/firebase-admin";
import { rateLimit, rateLimitResponse } from "@/src/lib/security/rate-limit";
import { FieldValue } from "firebase-admin/firestore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function authedUid(req: NextRequest): Promise<string | null> {
  const auth = req.headers.get("Authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  try {
    const dec = await adminAuth.verifyIdToken(auth.slice(7).trim());
    return dec.uid || null;
  } catch { return null; }
}

export async function GET(req: NextRequest) {
  const rl = rateLimit(req, { limit: 60, windowMs: 60_000 });
  if (!rl.success) return rateLimitResponse();

  const uid = await authedUid(req);
  if (!uid) return NextResponse.json({ error: "auth_required" }, { status: 401 });

  if (!adminDb?.collection) return NextResponse.json({ counts: {} });

  try {
    const snap = await adminDb
      .collection("users")
      .doc(uid)
      .collection("meta")
      .doc("quickActionUsage")
      .get();

    const counts = snap.exists ? (snap.data() as Record<string, number>) : {};
    return NextResponse.json({ counts }, {
      headers: { "Cache-Control": "private, max-age=60" },
    });
  } catch {
    return NextResponse.json({ counts: {} });
  }
}

export async function POST(req: NextRequest) {
  const rl = rateLimit(req, { limit: 60, windowMs: 60_000 });
  if (!rl.success) return rateLimitResponse();

  const uid = await authedUid(req);
  if (!uid) return NextResponse.json({ error: "auth_required" }, { status: 401 });

  let actionKey: string | undefined;
  try {
    const body = await req.json() as { actionKey?: string };
    actionKey = body.actionKey;
  } catch { /* ignore parse error */ }

  if (!actionKey || typeof actionKey !== "string" || actionKey.length > 64) {
    return NextResponse.json({ error: "invalid_action_key" }, { status: 400 });
  }

  if (!adminDb?.collection) return NextResponse.json({ ok: true });

  try {
    await adminDb
      .collection("users")
      .doc(uid)
      .collection("meta")
      .doc("quickActionUsage")
      .set({ [actionKey]: FieldValue.increment(1) }, { merge: true });

    return NextResponse.json({ ok: true });
  } catch (err) {
    const { logger } = await import("@/src/lib/logger");
    logger.error({ event: "quick_action_click_write_failed", uid, actionKey, error: (err as Error).message });
    return NextResponse.json({ error: "write_failed" }, { status: 500 });
  }
}
