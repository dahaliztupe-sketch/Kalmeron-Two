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

/**
 * Generates the email body for a user's Daily Brief using the shared
 * LLM-backed generator (`generateDailyBrief`). Falls back to a profile-aware
 * static template when the generator is unavailable (e.g., no API key).
 */
async function buildBrief(doc: BriefDoc): Promise<{ subject: string; text: string }> {
  const subject = "موجز اليوم من كلميرون 📋";

  // Try the real LLM generator first (same one as the /api/daily-brief GET route)
  try {
    const { generateDailyBrief } = await import('@/src/lib/daily-brief/generator');
    const brief = await generateDailyBrief(doc.uid);
    const greeting = doc.nameAr ? `صباح الخير يا ${doc.nameAr}،` : brief.greeting;
    const lines: string[] = [greeting, ""];
    for (const block of brief.blocks) {
      const emoji = block.type === 'anomaly' ? '⚠️' : block.type === 'decision' ? '✅' : '✉️';
      lines.push(`${emoji} ${block.title}`, block.body, "");
    }
    lines.push("— كلميرون");
    return { subject, text: lines.join("\n") };
  } catch { /* fall through to static template */ }

  // Static profile-aware fallback (never hardcodes fake numbers)
  const greeting = doc.nameAr ? `صباح الخير يا ${doc.nameAr}،` : "صباح الخير،";
  const contextLines = [
    doc.stageAr    ? `مرحلتك الحاليّة: ${doc.stageAr}.`  : "",
    doc.industryAr ? `قطاعك: ${doc.industryAr}.`          : "",
  ].filter(Boolean);

  const text =
    `${greeting}\n\n` +
    (contextLines.length ? contextLines.join(" ") + "\n\n" : "") +
    `⚠️ انتبه للتغيّرات\n` +
    `راجع مؤشرات أمس مقارنةً بمتوسط الأسبوع وحدّد أيّها يحتاج تدخّلاً سريعاً.\n\n` +
    `✅ قرار اليوم\n` +
    `اختر مهمة واحدة عالية الأثر وأنهِها قبل نهاية يوم العمل.\n\n` +
    `✉️ رسالة جاهزة\n` +
    `افتح كلميرون وأخبر المساعد بتفاصيل قرارك — سيكتب الرسالة المناسبة لك في ثوانٍ.\n\n` +
    `— كلميرون`;

  return { subject, text };
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
      const brief = await buildBrief(u);
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

  const brief = await buildBrief(userDoc);
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
