/**
 * POST /api/runway/check
 *
 * Server-side evaluation of the user's latest runway snapshot. Returns the
 * computed result + recommendation list. Used by the daily cron and by the
 * client when it wants a server-validated answer (no trust in local input).
 *
 * Body (optional):
 *   { cashEgp, monthlyIncomeEgp, monthlyBurnEgp, thresholdMonths }
 *
 * If body is omitted the server reads the snapshot from Firestore using the
 * caller's uid.
 */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { adminAuth, adminDb } from "@/src/lib/firebase-admin";
import { rateLimit, rateLimitResponse } from "@/src/lib/security/rate-limit";
import { buildRecommendations, computeRunway, DEFAULT_THRESHOLD_MONTHS } from "@/src/lib/runway/calc";
import type { RunwayInputs } from "@/src/lib/runway/types";

export const runtime = "nodejs";

const InputsSchema = z
  .object({
    cashEgp: z.number().nonnegative().finite().optional(),
    monthlyIncomeEgp: z.number().nonnegative().finite().optional(),
    monthlyBurnEgp: z.number().nonnegative().finite().optional(),
    thresholdMonths: z.number().int().min(1).max(60).optional(),
  })
  .strict();

export async function POST(req: NextRequest) {
  const limited = rateLimit(req, { scope: "runway-check", limit: 60, windowMs: 60_000 });
  if (!limited.success) return rateLimitResponse();

  // Auth — required so we can read the user's snapshot from Firestore.
  const authHeader = req.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let uid: string;
  try {
    const decoded = await adminAuth.verifyIdToken(token);
    uid = decoded.uid;
  } catch {
    return NextResponse.json({ error: "invalid_token" }, { status: 401 });
  }

  // Optional override from body — useful for "what-if" previews.
  let override: z.infer<typeof InputsSchema> = {};
  try {
    const raw = await req.text();
    if (raw.trim()) {
      const parsed = InputsSchema.safeParse(JSON.parse(raw));
      if (!parsed.success) {
        return NextResponse.json(
          { error: "invalid_body", details: parsed.error.flatten() },
          { status: 400 },
        );
      }
      override = parsed.data;
    }
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  // Load the persisted snapshot.
  let stored: Partial<RunwayInputs> = {};
  try {
    const snap = await adminDb.collection("runway_snapshots").doc(uid).get();
    if (snap.exists) {
      const data = snap.data() ?? {};
      stored = {
        cashEgp: Number(data.cashEgp ?? 0),
        monthlyIncomeEgp: Number(data.monthlyIncomeEgp ?? 0),
        monthlyBurnEgp: Number(data.monthlyBurnEgp ?? 0),
        thresholdMonths: Number(data.thresholdMonths ?? DEFAULT_THRESHOLD_MONTHS),
      };
    }
  } catch (err) {
    console.warn("[runway/check] failed to load snapshot", err);
  }

  const inputs: RunwayInputs = {
    cashEgp: override.cashEgp ?? stored.cashEgp ?? 0,
    monthlyIncomeEgp: override.monthlyIncomeEgp ?? stored.monthlyIncomeEgp ?? 0,
    monthlyBurnEgp: override.monthlyBurnEgp ?? stored.monthlyBurnEgp ?? 0,
    thresholdMonths:
      override.thresholdMonths ?? stored.thresholdMonths ?? DEFAULT_THRESHOLD_MONTHS,
  };

  const result = computeRunway(inputs);
  const recommendations = buildRecommendations(inputs, result);

  // Stamp lastCheckedAt so the daily cron has a paper trail.
  try {
    await adminDb
      .collection("runway_snapshots")
      .doc(uid)
      .set({ lastCheckedAt: new Date().toISOString() }, { merge: true });
  } catch {
    /* non-fatal */
  }

  return NextResponse.json({
    inputs,
    result: {
      ...result,
      months: Number.isFinite(result.months) ? result.months : null,
    },
    recommendations,
  });
}
