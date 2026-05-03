/**
 * GET /api/weekly-report
 * Aggregates data from OKRs, usage, dashboard, alerts, and opportunities
 * to produce a comprehensive weekly report for the current user.
 */
import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/src/lib/firebase-admin";
import { listCurrentWeekOKRs } from "@/src/lib/okr/okr-store";
import { getAlerts, getMetricsSnapshot } from "@/src/ai/organization/compliance/monitor";
import { listTasksForUser } from "@/src/ai/organization/tasks/task-manager";
import { getTwin } from "@/src/lib/memory/shared-memory";
import { rateLimit, rateLimitResponse } from "@/src/lib/security/rate-limit";
import type { DocumentSnapshot } from "firebase-admin/firestore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function authedUid(req: NextRequest): Promise<string | null> {
  const auth = req.headers.get("Authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  try {
    const dec = await adminAuth.verifyIdToken(auth.slice(7).trim());
    return dec.uid || null;
  } catch {
    return null;
  }
}

function buildDateKeys(days: number): string[] {
  const keys: string[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - i);
    keys.push(d.toISOString().slice(0, 10));
  }
  return keys;
}

export async function GET(req: NextRequest) {
  const rl = rateLimit(req, { limit: 20, windowMs: 60_000 });
  if (!rl.success) return rateLimitResponse();

  const uid = await authedUid(req);
  if (!uid) return NextResponse.json({ error: "auth_required" }, { status: 401 });

  const dateKeys = buildDateKeys(7);
  const startDate = dateKeys[0]!;

  const [twin, okrData, tasks, alertsList, metrics] = await Promise.all([
    getTwin(uid).catch(() => ({ stage: "idea", companyName: null, industry: null })),
    listCurrentWeekOKRs(uid).catch(() => []),
    listTasksForUser(uid, 30).catch(() => []),
    Promise.resolve(getAlerts(10)),
    Promise.resolve(getMetricsSnapshot()),
  ]);

  // ── Daily usage (7 days) ────────────────────────────────────────────────
  type DayData = { requests: number; credits: number; costUsd: number; tokens: number };
  const costByDate: Record<string, DayData> = {};
  for (const k of dateKeys) costByDate[k] = { requests: 0, credits: 0, costUsd: 0, tokens: 0 };

  if (adminDb?.collection) {
    try {
      const snap = await adminDb
        .collection("usage_daily")
        .where("userId", "==", uid)
        .where("date", ">=", startDate)
        .orderBy("date", "asc")
        .limit(10)
        .get();

      snap.forEach((doc: DocumentSnapshot) => {
        const d = doc.data();
        if (!d) return;
        const date = d["date"] as string | undefined;
        if (!date || !(date in costByDate)) return;
        costByDate[date] = {
          requests: Number(d["requests"] ?? 0),
          credits: Number(d["credits"] ?? 0),
          costUsd: Number(d["costUsd"] ?? 0),
          tokens: Number(d["tokens"] ?? 0),
        };
      });
    } catch { /* zeros */ }
  }

  // ── Agent breakdown (30 days) ────────────────────────────────────────────
  const agentMap: Record<string, { requests: number; costUsd: number }> = {};
  if (adminDb?.collection) {
    try {
      const since = new Date(Date.now() - 7 * 86400_000).toISOString();
      const snap = await adminDb
        .collection("usageEvents")
        .where("userId", "==", uid)
        .where("createdAt", ">=", since)
        .orderBy("createdAt", "desc")
        .limit(500)
        .get();
      snap.forEach((doc: DocumentSnapshot) => {
        const d = doc.data();
        if (!d) return;
        const agent = String(d["agent"] || "general");
        const cost = Number(d["costUsd"] || 0);
        const cur = agentMap[agent] || { requests: 0, costUsd: 0 };
        cur.requests += 1;
        cur.costUsd += cost;
        agentMap[agent] = cur;
      });
    } catch { /* ignore */ }
  }

  // ── Opportunities ────────────────────────────────────────────────────────
  let opportunities: Array<{
    id: string;
    title: string;
    type: string;
    organizer: string;
    amount: string;
    deadline: string;
    link: string;
  }> = [];
  if (adminDb?.collection) {
    try {
      const snap = await adminDb
        .collection("opportunities")
        .orderBy("deadline", "asc")
        .limit(3)
        .get();
      if (!snap.empty) {
        opportunities = snap.docs.map((doc: DocumentSnapshot) => {
          const d = doc.data() as Record<string, unknown> | undefined;
          return {
            id: doc.id,
            title: String(d?.["title"] || "فرصة"),
            type: String(d?.["type"] || "opportunity"),
            organizer: String(d?.["organizer"] || ""),
            amount: String(d?.["amount"] || ""),
            deadline: String(d?.["deadline"] || ""),
            link: String(d?.["link"] || ""),
          };
        });
      }
    } catch { /* ignore */ }
  }

  // ── Compute weekly summary ────────────────────────────────────────────────
  const totalRequests = Object.values(costByDate).reduce((s, d) => s + d.requests, 0);
  const totalCredits = Object.values(costByDate).reduce((s, d) => s + d.credits, 0);
  const totalCostUsd = Object.values(costByDate).reduce((s, d) => s + d.costUsd, 0);
  const totalTokens = Object.values(costByDate).reduce((s, d) => s + d.tokens, 0);

  const topAgent = Object.entries(agentMap).sort(([, a], [, b]) => b.requests - a.requests)[0];

  const okrList = Array.isArray(okrData) ? okrData : [];
  type OKRItem = { status?: string; title?: string; targetValue?: number; currentValue?: number };
  const doneOkrs = (okrList as OKRItem[]).filter((o) => o.status === "done" || o.status === "completed").length;
  const okrCompletionRate = okrList.length > 0 ? Math.round((doneOkrs / okrList.length) * 100) : 0;

  const pendingTasks = tasks.filter(
    (t) => t.status === "awaiting_human" || t.status === "pending"
  );
  const criticalAlerts = alertsList.filter(
    (a: { severity?: string }) => a.severity === "critical" || a.severity === "error"
  );

  const chartData = dateKeys.map((date) => {
    const day = new Date(date + "T00:00:00Z");
    const dayLabel = day.toLocaleDateString("ar-EG", { weekday: "short" });
    return {
      day: dayLabel,
      date,
      requests: costByDate[date]?.requests ?? 0,
      costUsd: +(costByDate[date]?.costUsd ?? 0).toFixed(4),
      tokens: costByDate[date]?.tokens ?? 0,
    };
  });

  // ── Build next-step recommendations based on data ────────────────────────
  const recommendations: Array<{ icon: string; title: string; detail: string; href: string; priority: "high" | "medium" | "low" }> = [];

  if (pendingTasks.length > 0) {
    recommendations.push({
      icon: "⚡",
      title: `لديك ${pendingTasks.length} مهمة تحتاج موافقتك`,
      detail: "راجع المهام المعلّقة وحدّد الأولويات للأسبوع القادم",
      href: "/inbox",
      priority: "high",
    });
  }
  if (criticalAlerts.length > 0) {
    recommendations.push({
      icon: "🚨",
      title: `${criticalAlerts.length} تنبيه حرج يحتاج اهتمامك`,
      detail: "اطّلع على التنبيهات الحرجة قبل بدء الأسبوع الجديد",
      href: "/system-health",
      priority: "high",
    });
  }
  if (okrCompletionRate < 50 && okrList.length > 0) {
    recommendations.push({
      icon: "🎯",
      title: "أهدافك OKR تحتاج دفعة",
      detail: `أكملت ${okrCompletionRate}% فقط من أهداف الأسبوع — راجع الخطة`,
      href: "/okr",
      priority: "medium",
    });
  }
  if (totalRequests < 10) {
    recommendations.push({
      icon: "🤖",
      title: "استخدم وكلاء الذكاء الاصطناعي أكثر",
      detail: "استكشف المساعدين المتخصصين في chat لتسريع عملك",
      href: "/chat",
      priority: "low",
    });
  }
  if (opportunities.length > 0) {
    recommendations.push({
      icon: "💡",
      title: "لا تفوّت الفرص المتاحة",
      detail: `${opportunities.length} فرص تمويل ومسابقات مفتوحة الآن`,
      href: "/opportunities",
      priority: "medium",
    });
  }

  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    weekStart: startDate,
    company: {
      stage: (twin as { stage?: string }).stage || "idea",
      name: (twin as { companyName?: string | null }).companyName || null,
      industry: (twin as { industry?: string | null }).industry || null,
    },
    summary: {
      totalRequests,
      totalCredits: Math.round(totalCredits),
      totalCostUsd: +totalCostUsd.toFixed(4),
      totalTokens,
      topAgent: topAgent ? { name: topAgent[0], requests: topAgent[1].requests } : null,
      okrTotal: okrList.length,
      okrDone: doneOkrs,
      okrCompletionRate,
      pendingTasksCount: pendingTasks.length,
      criticalAlertsCount: criticalAlerts.length,
      agentCount: Object.keys(metrics.agents || {}).length,
      dailyCostUsd: metrics.dailyCostUsd,
    },
    chartData,
    okrs: (okrList as OKRItem[]).slice(0, 6).map((o) => ({
      title: o.title || "هدف",
      status: o.status || "pending",
      targetValue: o.targetValue ?? null,
      currentValue: o.currentValue ?? null,
    })),
    pendingTasks: pendingTasks.slice(0, 5).map((t) => ({
      taskId: t.taskId,
      description: t.description,
      status: t.status,
    })),
    alerts: alertsList.slice(0, 6).map((a: { severity?: string; source?: string; message?: string; timestamp?: Date | string }) => ({
      severity: a.severity || "info",
      source: a.source || "system",
      message: a.message || "",
      timestamp: a.timestamp instanceof Date ? a.timestamp.toISOString() : a.timestamp,
    })),
    opportunities: opportunities.slice(0, 3),
    opportunitiesStatus: opportunities.length > 0 ? "available" : "unavailable",
    opportunitiesMessage: opportunities.length > 0 ? null : "لا توجد فرص منشورة حالياً في قاعدة البيانات.",
    recommendations,
    agentBreakdown: Object.entries(agentMap)
      .sort(([, a], [, b]) => b.requests - a.requests)
      .slice(0, 5)
      .map(([name, data]) => ({ name, ...data })),
  });
}
