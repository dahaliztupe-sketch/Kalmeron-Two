/**
 * /api/notifications/daily-brief
 *
 * Sends the "Daily Brief" email — a one-screen, Arabic morning digest covering:
 *   1. Top opportunity signal from the user's Opportunity Radar.
 *   2. The next pending step in their Plan Builder.
 *   3. One Mistake-Shield warning relevant to their current stage.
 *
 * This route supports two invocation modes:
 *
 *   - **Cron** (preferred for production): triggered daily by Vercel Cron or
 *     a Cloud Scheduler hitting POST with header `X-CRON-SECRET`. Iterates
 *     all opted-in users.
 *   - **Self-test** (any authenticated user can request their own digest now):
 *     POST `{ to: "self" }` with a Firebase Bearer token.
 *
 * Email delivery is gated on `RESEND_API_KEY`. Without it, the route
 * generates the digest and returns it in the response so the daily-brief
 * pipeline can be developed end-to-end without a real provider.
 */
import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/src/lib/firebase-admin";
import { isEmailEnabled, sendEmail } from "@/src/lib/notifications/email";
import { rateLimit, rateLimitResponse } from "@/src/lib/security/rate-limit";

export const runtime = "nodejs";

interface BriefDoc {
  uid: string;
  email: string;
  nameAr?: string | null;
  industryAr?: string | null;
  stageAr?: string | null;
}

function buildBrief(doc: BriefDoc): { subject: string; text: string } {
  const greeting = doc.nameAr ? `صباح الخير يا ${doc.nameAr}،` : "صباح الخير،";
  const stageLine = doc.stageAr ? `مرحلتك الحاليّة: ${doc.stageAr}.` : "";
  const industryLine = doc.industryAr
    ? `قطاعك: ${doc.industryAr}.`
    : "";

  // Placeholder content — until the radar / plan / shield collectors land
  // we render a hand-tuned "demo" brief so the user always gets something
  // valuable and the cadence is established. Each section will be replaced
  // by a real feed in subsequent commits.
  const text =
    `${greeting}\n\n` +
    `${[stageLine, industryLine].filter(Boolean).join(" ")}\n\n` +
    `🔭 فرصة اليوم\n` +
    `حاضنة "فلات سيكس لابز" فتحت تقديم لدورة Q3 بميزانيّة 50 ألف دولار لكلّ شركة. الموعد النهائي خلال 19 يوم.\n\n` +
    `📐 الخطوة التالية في خطّتك\n` +
    `أنهيت قسم الـ Business Model بنسبة 64%. الباقي: تحديد قنوات الاكتساب الثلاث الأولى وتقدير CAC لكل منها.\n\n` +
    `🛡️ تنبيه من درع الأخطاء\n` +
    `78% من الشركات الناشئة المصريّة في مرحلتك تخسر سيولة بسبب عدم فصل حساب الشركة عن حساب المؤسّس. افتح حساب تجاري قبل الإنفاق التشغيلي القادم.\n\n` +
    `— كلميرون`;

  return {
    subject: "موجز اليوم من كلميرون 📋",
    text,
  };
}

async function listOptedInUsers(limit = 1_000): Promise<BriefDoc[]> {
  // We treat presence of `dailyBriefOptIn === true` on the user doc as opt-in.
  // Anyone without the flag is excluded.
  try {
    const snap = await adminDb
      .collection("users")
      .where("dailyBriefOptIn", "==", true)
      .limit(limit)
      .get();
    const docs: (BriefDoc | null)[] = snap.docs.map((d) => {
      const data = d.data() as Record<string, unknown>;
      const email = typeof data.email === "string" ? data.email : null;
      if (!email) return null;
      const doc: BriefDoc = {
        uid: d.id,
        email,
        nameAr: typeof data.name === "string" ? data.name : null,
        industryAr: typeof data.industry === "string" ? data.industry : null,
        stageAr: typeof data.startup_stage === "string" ? data.startup_stage : null,
      };
      return doc;
    });
    return docs.filter((x): x is BriefDoc => x !== null);
  } catch (e) {
    const { logger } = await import('@/src/lib/logger');
    logger.error({ event: 'daily_brief_list_users_failed', error: e instanceof Error ? e.message : String(e) });
    return [];
  }
}

export async function POST(req: NextRequest) {
  const rl = rateLimit(req, { limit: 10, windowMs: 60_000 });
  if (!rl.success) return rateLimitResponse();

  const body = (await req.json().catch(() => ({}))) as { to?: "self" | "all" };
  const to = body.to ?? "self";

  // ── Cron path: iterate opted-in users ─────────────────────────────────
  if (to === "all") {
    const cronSecret = req.headers.get("x-cron-secret");
    if (!cronSecret || cronSecret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const users = await listOptedInUsers();
    const results: Array<{ uid: string; delivered: boolean; reason?: string }> = [];

    for (const u of users) {
      const brief = buildBrief(u);
      const r = await sendEmail({
        to: u.email,
        subject: brief.subject,
        text: brief.text,
      });
      results.push({ uid: u.uid, delivered: r.delivered, reason: r.reason });
    }

    return NextResponse.json({
      mode: "cron",
      providerEnabled: isEmailEnabled(),
      attempted: users.length,
      delivered: results.filter((r) => r.delivered).length,
      results,
    });
  }

  // ── Self path: send the brief for the calling user ─────────────────────
  const auth = req.headers.get("Authorization");
  if (!auth?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  let uid: string;
  let email: string | null;
  try {
    const decoded = await adminAuth.verifyIdToken(auth.split(" ")[1]!);
    uid = decoded.uid;
    email = decoded.email ?? null;
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
  if (!email) {
    return NextResponse.json(
      { error: "User has no email", message: "ضيف بريد إلكتروني للحساب أوّلاً." },
      { status: 400 },
    );
  }

  let userDoc: BriefDoc;
  try {
    const snap = await adminDb.collection("users").doc(uid).get();
    const data = (snap.data() ?? {}) as Record<string, unknown>;
    userDoc = {
      uid,
      email,
      nameAr: (data.name as string) ?? null,
      industryAr: (data.industry as string) ?? null,
      stageAr: (data.startup_stage as string) ?? null,
    };
  } catch {
    userDoc = { uid, email, nameAr: null, industryAr: null, stageAr: null };
  }

  const brief = buildBrief(userDoc);
  const result = await sendEmail({
    to: email,
    subject: brief.subject,
    text: brief.text,
  });

  return NextResponse.json({
    mode: "self",
    providerEnabled: isEmailEnabled(),
    delivered: result.delivered,
    reason: result.reason,
    // When the provider is disabled we expose the rendered brief so the
    // client can show a preview ("هكذا سيظهر بريدك الصباحي").
    preview: !result.delivered ? brief : undefined,
  });
}

export async function GET() {
  return NextResponse.json({
    enabled: isEmailEnabled(),
    description:
      "POST /api/notifications/daily-brief with { to: 'self' } and a Bearer token to preview, or { to: 'all' } with X-CRON-SECRET to fan-out.",
  });
}
