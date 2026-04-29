/**
 * Cron: Opportunity Radar Alerts
 * Runs on a schedule (e.g. daily at 8 AM Cairo time).
 * For each subscribed user, runs the opportunity radar and sends an
 * email digest via the existing Resend infrastructure.
 *
 * Trigger via: GET /api/cron/opportunity-alerts
 * Protect with: CRON_SECRET header in production.
 */
import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/src/lib/firebase-admin';
import { sendEmail, isEmailEnabled } from '@/src/lib/notifications/email';
import { getPersonalizedOpportunities } from '@/src/agents/opportunity-radar/agent';
import { logger } from '@/src/lib/logger';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const cronLogger = logger.child({ cron: 'opportunity-alerts' });

function verifyCronSecret(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true; // dev: skip
  return req.headers.get('x-cron-secret') === secret;
}

function formatOpportunitiesEmail(
  opportunities: Awaited<ReturnType<typeof getPersonalizedOpportunities>>,
): { text: string; html: string } {
  const lines = opportunities.map((o) => {
    const deadline = o.deadline !== 'غير محدد' ? `⏰ الموعد: ${o.deadline}` : '';
    return `▪ **${o.title}** (${o.organizer})\n${o.description}\n${deadline}\n🔗 ${o.link}`.trim();
  });

  const text = [
    '🚀 كلميرون — تنبيه فرص جديدة',
    '',
    'اكتشفنا فرصاً جديدة مناسبة لمشروعك:',
    '',
    ...lines.map((l, i) => `${i + 1}. ${l}`),
    '',
    'اطّلع على التفاصيل الكاملة من لوحة كلميرون → https://kalmeron.app/opportunities',
  ].join('\n');

  const html = [
    '<div dir="rtl" style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">',
    '<h2 style="color:#4F46E5">🚀 كلميرون — فرص جديدة لمشروعك</h2>',
    '<p>اكتشفنا الفرص التالية المناسبة لك:</p>',
    '<ul>',
    ...opportunities.map(
      (o) =>
        `<li style="margin-bottom:16px">
          <strong>${o.title}</strong> — ${o.organizer}<br/>
          ${o.description}<br/>
          ${o.deadline !== 'غير محدد' ? `<em>⏰ الموعد: ${o.deadline}</em><br/>` : ''}
          <a href="${o.link}" style="color:#4F46E5">اطّلع على التفاصيل →</a>
        </li>`,
    ),
    '</ul>',
    '<hr/>',
    '<p style="font-size:12px;color:#888">كلميرون · <a href="https://kalmeron.app/opportunities">فرصك كلها هنا</a></p>',
    '</div>',
  ].join('\n');

  return { text, html };
}

export async function GET(req: NextRequest) {
  if (!verifyCronSecret(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const emailEnabled = isEmailEnabled();
  const summary = {
    usersProcessed: 0,
    emailsSent: 0,
    emailsSkipped: 0,
    errors: 0,
  };

  try {
    // Fetch users who opted into opportunity alerts.
    const snap = await adminDb
      .collection('users')
      .where('notifications.opportunityAlerts', '==', true)
      .limit(200)
      .get();

    for (const doc of snap.docs) {
      summary.usersProcessed++;
      const user = doc.data() as {
        email?: string;
        profile?: { industry?: string; stage?: string; governorate?: string };
      };

      if (!user.email) continue;

      try {
        const industry = user.profile?.industry ?? 'تقنية';
        const stage = user.profile?.stage ?? 'فكرة';
        const governorate = user.profile?.governorate ?? 'القاهرة';

        const opportunities = await getPersonalizedOpportunities(industry, stage, governorate);
        if (opportunities.length === 0) {
          summary.emailsSkipped++;
          continue;
        }

        const { text, html } = formatOpportunitiesEmail(opportunities);

        if (emailEnabled) {
          const result = await sendEmail({
            to: user.email,
            subject: `🚀 ${opportunities.length} فرصة جديدة مناسبة لمشروعك — كلميرون`,
            text,
            html,
          });
          if (result.delivered) {
            summary.emailsSent++;
          } else {
            summary.emailsSkipped++;
          }
        } else {
          cronLogger.info({ to: user.email, count: opportunities.length }, 'opportunity-alert-dry-run');
          summary.emailsSkipped++;
        }
      } catch (userErr) {
        summary.errors++;
        cronLogger.error(
          { userId: doc.id, err: userErr instanceof Error ? userErr.message : String(userErr) },
          'opportunity-alert-user-error',
        );
      }
    }

    cronLogger.info(summary, 'opportunity-alerts-complete');
    return NextResponse.json({ ok: true, ...summary });
  } catch (err) {
    cronLogger.error({ err: err instanceof Error ? err.message : String(err) }, 'opportunity-alerts-fatal');
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
