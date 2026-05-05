/**
 * GET /api/dashboard/health-score
 *
 * Computes a real Company Health Score (0-100) for the authenticated user
 * based on five weighted dimensions:
 *   1. Profile completeness      (20 pts)
 *   2. Conversation activity / 7 days (20 pts)
 *   3. Business Plan document exists (20 pts)
 *   4. Financial model exists   (20 pts)
 *   5. OKRs exist               (20 pts)
 *
 * The score is cached in Firestore under `users/{uid}/healthScore` with a
 * 7-day TTL — re-computes at most once per week per user.
 */
import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/src/lib/firebase-admin";
import { rateLimit, rateLimitResponse } from "@/src/lib/security/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface HealthDimension {
  id: string;
  label: string;
  score: number;
  max: number;
  tip: string;
}

interface HealthScoreResult {
  overall: number;
  dimensions: HealthDimension[];
  computedAt: string;
  cached: boolean;
}

async function computeHealthScore(uid: string): Promise<HealthScoreResult> {
  const dimensions: HealthDimension[] = [];

  if (!adminDb?.collection) {
    return {
      overall: 0,
      dimensions: [],
      computedAt: new Date().toISOString(),
      cached: false,
    };
  }

  // Use usage_daily (same canonical store as /api/weekly-report) to avoid
  // createdAt ISO-string vs Firestore Timestamp mismatch that silently zeros scores.
  const sevenDaysAgo = new Date(Date.now() - 7 * 86400_000).toISOString().slice(0, 10);
  const [userSnap, usageSnap, okrSnap] = await Promise.allSettled([
    adminDb.collection("users").doc(uid).get(),
    adminDb
      .collection("usage_daily")
      .where("userId", "==", uid)
      .where("date", ">=", sevenDaysAgo)
      .limit(1)
      .get(),
    adminDb
      .collection("okrs")
      .where("userId", "==", uid)
      .limit(1)
      .get(),
  ]);

  const userData =
    userSnap.status === "fulfilled" && userSnap.value.exists
      ? (userSnap.value.data() as Record<string, unknown>)
      : {};

  // ── 1. Profile completeness (20 pts) ─────────────────────────────────────
  const profileFields = ["name", "company_name", "startup_stage", "industry", "governorate"];
  const filledFields = profileFields.filter((f) => !!userData[f]).length;
  const profileScore = Math.round((filledFields / profileFields.length) * 20);
  dimensions.push({
    id: "profile",
    label: "ملف الشركة",
    score: profileScore,
    max: 20,
    tip:
      profileScore < 20
        ? `أكمل حقول الملف الشخصي (${filledFields}/${profileFields.length} مكتملة)`
        : "ملفك الشركاتي مكتمل",
  });

  // ── 2. AI activity last 7 days (20 pts) ─────────────────────────────────
  // Reads from usage_daily (same canonical store as /api/weekly-report) to
  // avoid ISO-string vs Timestamp mismatch that collapses the score to zero.
  let activityScore = 0;
  if (usageSnap.status === "fulfilled" && !usageSnap.value.empty) {
    try {
      const recentSnap = await adminDb
        .collection("usage_daily")
        .where("userId", "==", uid)
        .where("date", ">=", sevenDaysAgo)
        .limit(7)
        .get();
      // Sum up weekly requests across all days returned
      let weeklyRequests = 0;
      recentSnap.forEach((d) => {
        weeklyRequests += Number(d.data()?.["requests"] ?? 0);
      });
      activityScore = Math.min(20, Math.round((weeklyRequests / 10) * 20));
    } catch { activityScore = 10; }
  }
  dimensions.push({
    id: "activity",
    label: "نشاط المحادثات",
    score: activityScore,
    max: 20,
    tip: activityScore < 10 ? "افتح محادثات مع المساعدين لزيادة درجتك" : "نشاط جيد في الأسبوع الأخير",
  });

  // ── 3. Business plan / roadmap docs (20 pts) ────────────────────────────
  let bpScore = 0;
  try {
    const bpSnap = await adminDb
      .collection("businessPlans")
      .where("userId", "==", uid)
      .limit(1)
      .get();
    if (!bpSnap.empty) bpScore = 20;
    else {
      const roadmapSnap = await adminDb
        .collection("roadmaps")
        .where("userId", "==", uid)
        .limit(1)
        .get();
      if (!roadmapSnap.empty) bpScore = 12;
    }
  } catch { bpScore = 0; }
  dimensions.push({
    id: "businessPlan",
    label: "خطة العمل",
    score: bpScore,
    max: 20,
    tip: bpScore === 0 ? "أنشئ خطة عمل مع المدير المالي الذكي" : bpScore < 20 ? "أكمل خطة عملك" : "خطة العمل موثّقة",
  });

  // ── 4. Financial model (20 pts) ──────────────────────────────────────────
  let finScore = 0;
  try {
    const finSnap = await adminDb
      .collection("financialModels")
      .where("userId", "==", uid)
      .limit(1)
      .get();
    if (!finSnap.empty) finScore = 20;
    else {
      const runwaySnap = await adminDb
        .collection("runwayCalcs")
        .where("userId", "==", uid)
        .limit(1)
        .get();
      if (!runwaySnap.empty) finScore = 10;
    }
  } catch { finScore = 0; }
  dimensions.push({
    id: "finance",
    label: "النموذج المالي",
    score: finScore,
    max: 20,
    tip: finScore === 0 ? "أضف بيانات مالية في حاسبة Runway" : finScore < 20 ? "أكمل نموذجك المالي" : "النموذج المالي موثّق",
  });

  // ── 5. OKRs (20 pts) ────────────────────────────────────────────────────
  let okrScore = 0;
  if (okrSnap.status === "fulfilled" && !okrSnap.value.empty) {
    okrScore = 20;
  }
  dimensions.push({
    id: "okrs",
    label: "أهداف OKR",
    score: okrScore,
    max: 20,
    tip: okrScore === 0 ? "حدّد أهدافك الفصلية في صفحة OKR" : "أهدافك الاستراتيجية محددة",
  });

  const overall = dimensions.reduce((sum, d) => sum + d.score, 0);

  return {
    overall,
    dimensions,
    computedAt: new Date().toISOString(),
    cached: false,
  };
}

export async function GET(req: NextRequest) {
  const rl = rateLimit(req, { limit: 20, windowMs: 60_000 });
  if (!rl.success) return rateLimitResponse();

  const auth = req.headers.get("Authorization");
  if (!auth?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  let uid: string;
  try {
    const dec = await adminAuth.verifyIdToken(auth.slice(7).trim());
    uid = dec.uid;
  } catch {
    return NextResponse.json({ error: "invalid_token" }, { status: 401 });
  }

  // Check cache in Firestore
  if (adminDb?.collection) {
    try {
      const cached = await adminDb
        .collection("users")
        .doc(uid)
        .collection("meta")
        .doc("healthScore")
        .get();
      if (cached.exists) {
        const data = cached.data() as Record<string, unknown>;
        const computedAt = data["computedAt"] as string | undefined;
        if (computedAt) {
          const age = Date.now() - new Date(computedAt).getTime();
          const TTL_7_DAYS = 7 * 24 * 3600 * 1000;
          if (age < TTL_7_DAYS) {
            return NextResponse.json({ ...data, cached: true }, {
              headers: { "Cache-Control": "private, max-age=86400" },
            });
          }
        }
      }
    } catch { /* proceed to compute */ }
  }

  const result = await computeHealthScore(uid);

  // Persist to Firestore cache
  if (adminDb?.collection) {
    adminDb
      .collection("users")
      .doc(uid)
      .collection("meta")
      .doc("healthScore")
      .set(result)
      .catch(() => {});
  }

  return NextResponse.json(result, {
    headers: { "Cache-Control": "private, max-age=3600" },
  });
}
