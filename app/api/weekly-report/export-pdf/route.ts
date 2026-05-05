/**
 * GET /api/weekly-report/export-pdf
 *
 * Generates a downloadable PDF from the same payload contract as
 * GET /api/weekly-report.  Calls that route's data layer directly
 * (no HTTP round-trip) so both endpoints share identical aggregation.
 *
 * Sections:
 *   1. Header (company name, stage, week range)
 *   2. Summary stats (weekly-aggregated: requests, cost, OKRs, tasks)
 *   3. أبرز الإنجازات — completed OKRs
 *   4. الأهداف القادمة — in-progress / pending OKRs
 *   5. المهام المعلّقة — pending tasks
 *   6. الفرص المفتوحة — opportunities
 *   7. تنبيهات النظام — alerts
 *   8. نصيحة الأسبوع — top recommendation
 *   9. Footer
 *
 * Returns: application/pdf  Content-Disposition: attachment
 */
import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/src/lib/firebase-admin";
import { listCurrentWeekOKRs } from "@/src/lib/okr/okr-store";
import { getAlerts, getMetricsSnapshot } from "@/src/ai/organization/compliance/monitor";
import { listTasksForUser } from "@/src/ai/organization/tasks/task-manager";
import { getTwin } from "@/src/lib/memory/shared-memory";
import { rateLimit, rateLimitResponse } from "@/src/lib/security/rate-limit";
import type { Timestamp } from "firebase-admin/firestore";
// @ts-ignore – pdfkit has no default TS types in all environments
import PDFDocument from "pdfkit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const STAGE_LABELS: Record<string, string> = {
  idea:       "مرحلة الفكرة",
  validation: "مرحلة التحقق",
  foundation: "مرحلة التأسيس",
  growth:     "مرحلة النمو",
  scaling:    "مرحلة التوسع",
};

async function authedUid(req: NextRequest): Promise<string | null> {
  const auth = req.headers.get("Authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  try {
    const dec = await adminAuth.verifyIdToken(auth.slice(7).trim());
    return dec.uid || null;
  } catch { return null; }
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

function pdfSection(doc: InstanceType<typeof PDFDocument>, title: string) {
  doc.fontSize(13).font("Helvetica-Bold").fillColor("#1a1a2e").text(title);
  doc.moveDown(0.25);
}

function pdfItem(doc: InstanceType<typeof PDFDocument>, text: string) {
  doc.fontSize(10).font("Helvetica").fillColor("#333").text(`•  ${text}`);
}

export async function GET(req: NextRequest) {
  const rl = rateLimit(req, { limit: 10, windowMs: 60_000 });
  if (!rl.success) return rateLimitResponse();

  const uid = await authedUid(req);
  if (!uid) return NextResponse.json({ error: "auth_required" }, { status: 401 });

  // ── Aggregate weekly data (mirrors /api/weekly-report logic) ──────────────
  const dateKeys = buildDateKeys(7);
  const startDate = dateKeys[0]!;

  interface OKRItem { title?: string; status?: string; targetValue?: number | null; currentValue?: number | null }

  const [twin, okrData, tasks, alertsList, metrics] = await Promise.all([
    getTwin(uid).catch(() => ({ stage: "idea", companyName: null, industry: null })),
    listCurrentWeekOKRs(uid).catch(() => []),
    listTasksForUser(uid, 30).catch(() => []),
    Promise.resolve(getAlerts(10)),
    Promise.resolve(getMetricsSnapshot()),
  ]);

  // ── Daily usage — same query pattern as /api/weekly-report ─────────────
  // Reads from `usage_daily` with (userId == uid, date >= startDate).
  type DayData = { requests: number; credits: number; costUsd: number; tokens: number };
  const costByDate: Record<string, DayData> = {};
  for (const k of dateKeys) costByDate[k] = { requests: 0, credits: 0, costUsd: 0, tokens: 0 };

  let totalRequests = 0;
  let totalCostUsd  = 0;
  let totalTokens   = 0;

  if (adminDb?.collection) {
    try {
      const dailySnap = await adminDb
        .collection("usage_daily")
        .where("userId", "==", uid)
        .where("date", ">=", startDate)
        .orderBy("date", "asc")
        .limit(10)
        .get();

      dailySnap.forEach((doc) => {
        const d = doc.data();
        if (!d) return;
        const date = d["date"] as string | undefined;
        if (!date || !(date in costByDate)) return;
        costByDate[date] = {
          requests: Number(d["requests"] ?? 0),
          credits:  Number(d["credits"]  ?? 0),
          costUsd:  Number(d["costUsd"]  ?? 0),
          tokens:   Number(d["tokens"]   ?? 0),
        };
      });
    } catch { /* zeros */ }
  }

  for (const v of Object.values(costByDate)) {
    totalRequests += v.requests;
    totalCostUsd  += v.costUsd;
    totalTokens   += v.tokens;
  }

  // Opportunities (nearest upcoming)
  let opportunities: Array<{ title: string; type: string; deadline: string | null }> = [];
  if (adminDb?.collection) {
    try {
      const todayStr = new Date().toISOString().slice(0, 10);
      const oppSnap = await adminDb
        .collection("opportunities")
        .orderBy("deadline", "asc")
        .startAt(todayStr)
        .limit(3)
        .get();
      opportunities = oppSnap.docs.map((d) => {
        const data = d.data() as { title?: string; type?: string; deadline?: string | Timestamp };
        const deadline = typeof data.deadline === "string"
          ? data.deadline
          : (data.deadline as Timestamp)?.toDate?.().toISOString().slice(0, 10) ?? null;
        return { title: data.title || "فرصة", type: data.type || "opportunity", deadline };
      });
    } catch { /* best-effort */ }
  }

  const companyStage = (twin as Record<string, unknown>).stage as string || "idea";
  const companyName  = (twin as Record<string, unknown>).companyName as string | null || null;

  const okrList        = okrData as OKRItem[];
  const doneOkrs       = okrList.filter((o) => o.status === "done" || o.status === "completed");
  const upcomingOkrs   = okrList.filter((o) => o.status !== "done" && o.status !== "completed");
  const okrPct         = okrList.length > 0 ? Math.round((doneOkrs.length / okrList.length) * 100) : 0;

  const pendingTasks   = tasks.filter((t) => t.status === "awaiting_human" || t.status === "pending");
  const criticalAlerts = (alertsList as Array<{ severity?: string }>).filter((a) => a.severity === "critical");

  // نصيحة الأسبوع: derive a weekly tip from data signals
  const weeklyTips: string[] = [];
  if (okrPct < 50 && okrList.length > 0)
    weeklyTips.push(`ركّز هذا الأسبوع على رفع نسبة إنجاز الأهداف — أنجزت ${okrPct}٪ فقط حتى الآن.`);
  if (totalRequests < 10)
    weeklyTips.push("استخدم وكلاء الذكاء الاصطناعي أكثر هذا الأسبوع لتسريع عملك.");
  if (pendingTasks.length > 3)
    weeklyTips.push("لديك مهام معلّقة تحتاج إلى اتخاذ قرار — راجع قائمة المهام وافصل في كل بند.");
  if (opportunities.length > 0)
    weeklyTips.push("لا تفوّت الفرص المتاحة — قدّم على الأقل فرصة واحدة هذا الأسبوع.");
  if (weeklyTips.length === 0)
    weeklyTips.push("حافظ على الزخم! راجع خطتك الأسبوعية وأضف هدفاً صغيراً يمكن إنجازه اليوم.");

  const weeklyTip = weeklyTips[0]!;

  const today = new Date();

  // ── Build PDF ──────────────────────────────────────────────────────────────
  const chunks: Uint8Array[] = [];
  const doc = new PDFDocument({
    size: "A4",
    margin: 50,
    info: { Title: "Kalmeron Weekly Report", Author: "Kalmeron AI Platform" },
  });
  doc.on("data", (chunk: Uint8Array) => chunks.push(chunk));
  const finishPdf = (): Promise<Buffer> =>
    new Promise((resolve) => { doc.on("end", () => resolve(Buffer.concat(chunks))); doc.end(); });

  const HR = () => { doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor("#ccc").stroke(); doc.moveDown(0.6); };

  // 1. Header ─────────────────────────────────────────────────────────────────
  doc.fontSize(22).font("Helvetica-Bold").fillColor("#1a1a2e")
    .text("Kalmeron — Weekly Report", { align: "center" });
  doc.moveDown(0.25);
  if (companyName) {
    doc.fontSize(13).font("Helvetica").fillColor("#444").text(companyName, { align: "center" });
  }
  doc.fontSize(10).fillColor("#888")
    .text(
      `${STAGE_LABELS[companyStage] || companyStage}  •  ` +
      `${new Date(startDate).toLocaleDateString("en-US")} – ${today.toLocaleDateString("en-US")}`,
      { align: "center" }
    );
  doc.moveDown(0.8); HR();

  // 2. Summary ────────────────────────────────────────────────────────────────
  pdfSection(doc, "Weekly Summary");
  doc.fontSize(10).font("Helvetica").fillColor("#333");
  doc.text(`AI Requests (7 days):  ${totalRequests}`);
  doc.text(`AI Cost (7 days):      $${totalCostUsd.toFixed(4)}`);
  doc.text(`Total Tokens:          ${totalTokens.toLocaleString()}`);
  doc.text(`OKR Completion:        ${doneOkrs.length} / ${okrList.length}  (${okrPct}%)`);
  doc.text(`Pending Tasks:         ${pendingTasks.length}`);
  doc.text(`Critical Alerts:       ${criticalAlerts.length}`);
  doc.moveDown(0.6); HR();

  // 3. أبرز الإنجازات ─────────────────────────────────────────────────────────
  pdfSection(doc, "أبرز الإنجازات  (Top Achievements)");
  if (doneOkrs.length === 0) {
    doc.fontSize(10).font("Helvetica").fillColor("#888").text("لم يتم إغلاق أي هدف خلال هذا الأسبوع بعد.");
  } else {
    doneOkrs.slice(0, 6).forEach((o) => pdfItem(doc, o.title || "هدف مكتمل"));
  }
  doc.moveDown(0.6); HR();

  // 4. الأهداف القادمة ────────────────────────────────────────────────────────
  pdfSection(doc, "الأهداف القادمة  (Upcoming / In-Progress Goals)");
  if (upcomingOkrs.length === 0) {
    doc.fontSize(10).font("Helvetica").fillColor("#888").text("جميع الأهداف مكتملة هذا الأسبوع — أضف أهدافاً جديدة.");
  } else {
    upcomingOkrs.slice(0, 6).forEach((o) => {
      const label = o.status === "in_progress" ? "جاري" : "معلّق";
      pdfItem(doc, `[${label}]  ${o.title || "هدف"}`);
    });
  }
  doc.moveDown(0.6); HR();

  // 5. المهام المعلّقة ────────────────────────────────────────────────────────
  if (pendingTasks.length > 0) {
    pdfSection(doc, "المهام المعلّقة  (Pending Actions)");
    pendingTasks.slice(0, 5).forEach((t) =>
      pdfItem(doc, t.description || t.taskId)
    );
    doc.moveDown(0.6); HR();
  }

  // 6. الفرص المفتوحة ─────────────────────────────────────────────────────────
  if (opportunities.length > 0) {
    pdfSection(doc, "الفرص المفتوحة  (Open Opportunities)");
    opportunities.forEach((o) => {
      const dead = o.deadline ? `  —  آخر موعد: ${o.deadline}` : "";
      pdfItem(doc, `[${o.type}]  ${o.title}${dead}`);
    });
    doc.moveDown(0.6); HR();
  }

  // 7. تنبيهات النظام ─────────────────────────────────────────────────────────
  if ((alertsList as unknown[]).length > 0) {
    pdfSection(doc, "تنبيهات النظام  (System Alerts)");
    (alertsList as Array<{ severity?: string; message?: string }>).slice(0, 5).forEach((a) =>
      pdfItem(doc, `[${(a.severity || "info").toUpperCase()}]  ${a.message || ""}`)
    );
    doc.moveDown(0.6); HR();
  }

  // 8. نصيحة الأسبوع ──────────────────────────────────────────────────────────
  pdfSection(doc, "نصيحة الأسبوع  (Weekly Tip)");
  doc.fontSize(10).font("Helvetica").fillColor("#2563eb").text(weeklyTip);
  doc.moveDown(0.8); HR();

  // 9. Footer ─────────────────────────────────────────────────────────────────
  doc.fontSize(8).font("Helvetica").fillColor("#aaa")
    .text("Generated by Kalmeron AI Platform  •  kalmeron.com", { align: "center" });

  const pdfBuffer = await finishPdf();
  const filename = `kalmeron-weekly-${today.toISOString().slice(0, 10)}.pdf`;

  return new NextResponse(pdfBuffer, {
    headers: {
      "Content-Type":        "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control":       "private, no-store",
    },
  });
}
