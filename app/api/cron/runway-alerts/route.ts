/**
 * Cron: Cash Runway Alerts
 * Runs daily (recommended: 09:00 Africa/Cairo).
 * For each user with a saved runway snapshot whose runway has fallen below
 * their threshold and who hasn't dismissed the alarm, sends an Arabic email
 * with the months remaining + 3 prioritised recommendations.
 *
 * Trigger via: GET /api/cron/runway-alerts
 * Protect with: x-cron-secret header (CRON_SECRET env) in production.
 */
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/src/lib/firebase-admin";
import { sendEmail, isEmailEnabled } from "@/src/lib/notifications/email";
import { logger } from "@/src/lib/logger";
import {
  buildRecommendations,
  computeRunway,
  fmtMonths,
} from "@/src/lib/runway/calc";
import type { RunwayInputs } from "@/src/lib/runway/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const cronLogger = logger.child({ cron: "runway-alerts" });

function verifyCronSecret(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true;
  return req.headers.get("x-cron-secret") === secret;
}

function isStillDismissed(dismissedUntil?: string | null): boolean {
  if (!dismissedUntil) return false;
  const t = new Date(dismissedUntil).getTime();
  if (!Number.isFinite(t)) return false;
  return t > Date.now();
}

interface RunwayEmailPayload {
  email: string;
  name?: string;
  inputs: RunwayInputs;
}

export function formatRunwayEmail(p: RunwayEmailPayload): {
  subject: string;
  text: string;
  html: string;
} {
  const result = computeRunway(p.inputs);
  const recs = buildRecommendations(p.inputs, result).slice(0, 3);
  const monthsLabel = fmtMonths(result.months);
  const greeting = p.name ? `أهلاً ${p.name}،` : "أهلاً،";

  const subject = `تنبيه نفاد النقد — تبقّى ${monthsLabel} فقط`;

  const text = [
    "كلميرون — تنبيه نفاد النقد",
    "",
    greeting,
    "",
    `وصل رصيدك النقدي إلى مستوى يكفي لـ ${monthsLabel} فقط — تحت العتبة التي حدّدتها (${p.inputs.thresholdMonths} شهر).`,
    "",
    "إليك ٣ خطوات مقترحة:",
    ...recs.map((r, i) => `${i + 1}. ${r.title} — ${r.rationale}`),
    "",
    "افتح لوحة كلميرون لتعديل الأرقام أو إسكات التنبيه:",
    "https://kalmeron.app/cash-runway",
  ].join("\n");

  const html = [
    '<div dir="rtl" style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">',
    '<h2 style="color:#DC2626;margin:0 0 8px">تنبيه نفاد النقد — كلميرون</h2>',
    `<p style="margin:0 0 16px">${greeting}</p>`,
    `<p style="font-size:16px;line-height:1.6">وصل رصيدك النقدي إلى مستوى يكفي لـ <strong style="color:#DC2626">${monthsLabel}</strong> فقط — تحت العتبة التي حدّدتها (<strong>${p.inputs.thresholdMonths} شهر</strong>).</p>`,
    '<h3 style="color:#1F2937;margin:24px 0 8px">إليك ٣ خطوات مقترحة:</h3>',
    '<ol style="line-height:1.8;padding-right:20px">',
    ...recs.map(
      (r) =>
        `<li style="margin-bottom:8px"><strong>${r.title}</strong><br/><span style="color:#4B5563">${r.rationale}</span></li>`,
    ),
    "</ol>",
    '<div style="margin:24px 0">',
    '<a href="https://kalmeron.app/cash-runway" style="display:inline-block;background:#4F46E5;color:white;padding:12px 24px;text-decoration:none;border-radius:8px;font-weight:bold">افتح لوحة كلميرون</a>',
    "</div>",
    "<hr/>",
    '<p style="font-size:12px;color:#888">كلميرون · <a href="https://kalmeron.app/cash-runway" style="color:#4F46E5">إدارة التنبيه</a></p>',
    "</div>",
  ].join("\n");

  return { subject, text, html };
}

export async function GET(req: NextRequest) {
  if (!verifyCronSecret(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const emailEnabled = isEmailEnabled();
  const summary = {
    snapshotsChecked: 0,
    alertsSent: 0,
    alertsSkippedNotBelow: 0,
    alertsSkippedDismissed: 0,
    alertsSkippedNoEmail: 0,
    errors: 0,
  };

  try {
    const snap = await adminDb
      .collection("runway_snapshots")
      .limit(500)
      .get();

    for (const docSnap of snap.docs) {
      summary.snapshotsChecked++;
      const data = docSnap.data() as {
        cashEgp?: number;
        monthlyIncomeEgp?: number;
        monthlyBurnEgp?: number;
        thresholdMonths?: number;
        dismissedUntil?: string;
      };
      const uid = docSnap.id;

      const inputs: RunwayInputs = {
        cashEgp: Number(data.cashEgp ?? 0),
        monthlyIncomeEgp: Number(data.monthlyIncomeEgp ?? 0),
        monthlyBurnEgp: Number(data.monthlyBurnEgp ?? 0),
        thresholdMonths: Number(data.thresholdMonths ?? 6),
      };

      const result = computeRunway(inputs);
      if (!result.belowThreshold) {
        summary.alertsSkippedNotBelow++;
        continue;
      }
      if (isStillDismissed(data.dismissedUntil)) {
        summary.alertsSkippedDismissed++;
        continue;
      }

      // Look up the user's email + name from `users/{uid}`.
      try {
        const userDoc = await adminDb.collection("users").doc(uid).get();
        const user = userDoc.exists
          ? (userDoc.data() as { email?: string; name?: string })
          : null;
        const email = user?.email;
        if (!email) {
          summary.alertsSkippedNoEmail++;
          continue;
        }

        const { subject, text, html } = formatRunwayEmail({
          email,
          name: user?.name,
          inputs,
        });

        const nowIso = new Date().toISOString();
        const runwayResult = computeRunway(inputs);
        const monthsLabel = fmtMonths(runwayResult.months);

        // Write in-app notification to Firestore regardless of email
        try {
          await adminDb
            .collection("users")
            .doc(uid)
            .collection("notifications")
            .add({
              type: "runway_alert",
              title: `تنبيه: تبقّى ${monthsLabel} فقط من السيولة`,
              body: `رصيدك النقدي تحت عتبة ${inputs.thresholdMonths} أشهر — اتخذ إجراء الآن.`,
              href: "/cash-runway",
              read: false,
              severity: runwayResult.months <= 2 ? "critical" : "warning",
              metadata: {
                months: runwayResult.months,
                threshold: inputs.thresholdMonths,
                cashEgp: inputs.cashEgp,
                monthlyBurnEgp: inputs.monthlyBurnEgp,
              },
              createdAt: nowIso,
            });
        } catch (notifErr) {
          cronLogger.error(
            { uid, err: notifErr instanceof Error ? notifErr.message : String(notifErr) },
            "runway-alert-notification-error",
          );
        }

        if (emailEnabled) {
          const emailResult = await sendEmail({ to: email, subject, text, html });
          if (emailResult.delivered) {
            summary.alertsSent++;
            await adminDb
              .collection("runway_snapshots")
              .doc(uid)
              .update({ lastAlertAt: nowIso });
          } else {
            summary.alertsSkippedNoEmail++;
          }
        } else {
          cronLogger.info(
            { to: email, months: runwayResult.months, threshold: inputs.thresholdMonths },
            "runway-alert-dry-run",
          );
          summary.alertsSent++;
        }
      } catch (userErr) {
        summary.errors++;
        cronLogger.error(
          {
            uid,
            err: userErr instanceof Error ? userErr.message : String(userErr),
          },
          "runway-alert-user-error",
        );
      }
    }

    cronLogger.info(summary, "runway-alerts-complete");
    return NextResponse.json({ ok: true, ...summary });
  } catch (err) {
    cronLogger.error(
      { err: err instanceof Error ? err.message : String(err) },
      "runway-alerts-fatal",
    );
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
