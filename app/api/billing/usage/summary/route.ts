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

  const since = new Date(Date.now() - 30 * 86400_000).toISOString();
  const snap = await adminDb
    .collection("usageEvents")
    .where("userId", "==", uid)
    .where("createdAt", ">=", since)
    .orderBy("createdAt", "desc")
    .limit(2000)
    .get()
    .catch(() => null);

  const events = snap?.docs.map((d) => d.data() as Record<string, unknown>) ?? [];

  const byAgent = new Map<string, { requests: number; cost: number }>();
  const dailyMap = new Map<string, { requests: number; credits: number }>();
  let creditsUsed = 0;
  let estimatedCostUsd = 0;

  for (const e of events) {
    const agent = String(e.agent || "general");
    const cost = Number(e.costUsd || 0);
    const credits = Number(e.credits || 0);
    const day = String(e.createdAt || "").slice(0, 10);
    creditsUsed += credits;
    estimatedCostUsd += cost;

    const a = byAgent.get(agent) || { requests: 0, cost: 0 };
    a.requests += 1;
    a.cost += cost;
    byAgent.set(agent, a);

    if (day) {
      const d = dailyMap.get(day) || { requests: 0, credits: 0 };
      d.requests += 1;
      d.credits += credits;
      dailyMap.set(day, d);
    }
  }

  let creditsRemaining = 0;
  try {
    const userDoc = await adminDb.collection("users").doc(uid).get();
    creditsRemaining = Number(userDoc.data()?.credits ?? 0);
  } catch { /* ignore */ }

  return NextResponse.json({
    creditsUsed,
    creditsRemaining,
    requestsThisMonth: events.length,
    estimatedCostUsd,
    byAgent: [...byAgent.entries()].map(([agent, v]) => ({ agent, ...v })),
    daily: [...dailyMap.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, v]) => ({ date, ...v })),
  });
}
