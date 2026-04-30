import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/src/lib/firebase-admin";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let uid: string;
  try {
    const decoded = await adminAuth.verifyIdToken(token);
    uid = decoded.uid;
  } catch {
    return NextResponse.json({ error: "invalid_token" }, { status: 401 });
  }

  const url = new URL(req.url);
  const limit = Math.min(50, Math.max(1, Number(url.searchParams.get("limit") || "20")));
  const cursor = url.searchParams.get("cursor");

  let query = adminDb
    .collection("usageEvents")
    .where("userId", "==", uid)
    .orderBy("createdAt", "desc")
    .limit(limit + 1);

  if (cursor) {
    query = query.startAfter(cursor);
  }

  const snap = await query.get().catch(() => null);
  const docs = snap?.docs ?? [];
  const hasMore = docs.length > limit;
  const events = docs.slice(0, limit).map((d) => {
    const data = d.data();
    return {
      id: d.id,
      agent: String(data.agent || "general"),
      model: String(data.model || ""),
      inputTokens: Number(data.inputTokens || 0),
      outputTokens: Number(data.outputTokens || 0),
      costUsd: Number(data.costUsd || 0),
      createdAt: String(data.createdAt || ""),
    };
  });

  const nextCursor = hasMore ? events[events.length - 1].createdAt : null;

  return NextResponse.json({ events, nextCursor });
}
