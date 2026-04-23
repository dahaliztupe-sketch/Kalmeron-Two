// @ts-nocheck
/**
 * Weekly Review Loop — لكل قسم: تقرير الإنجاز مقابل الخطة،
 * ثم تحليل استراتيجي للدروس المستفادة، وتخزين التقرير + إرسال ملخص للمستخدم.
 */
import { generateText } from 'ai';
import { google } from '@ai-sdk/google';
import { adminDb } from '@/src/lib/firebase-admin';
import { listCurrentWeekOKRs } from '@/src/lib/okr/okr-store';
import { instrumentAgent } from '@/src/lib/observability/agent-instrumentation';
import { publishEvent } from './event-mesh';

const MODEL = google('gemini-2.5-flash');

export async function runWeeklyReview(userId: string) {
  return instrumentAgent('weekly_reviewer', async () => {
    const okrs = await listCurrentWeekOKRs(userId);
    if (!okrs.length) return { report: null, message: 'no_weekly_okrs' };

    const reports: any[] = [];
    for (const okr of okrs) {
      const progress = okr.keyResults.map((k: any) => {
        const pct = Math.round(((k.current || 0) / (k.target || 1)) * 100);
        return `- ${k.description}: ${k.current}/${k.target} ${k.unit} (${pct}%)`;
      }).join('\n');
      const { text } = await generateText({
        model: MODEL,
        prompt: `أنت قائد قسم ${okr.department}. هدف الأسبوع: "${okr.objective}".
التقدم الفعلي:
${progress}
اكتب تقرير إنجاز مختصر (3-4 جمل) يشمل: ما تم، ما لم يُنجز، السبب، توصية للأسبوع القادم.`,
      });
      reports.push({ okrId: okr.id, department: okr.department, summary: text });
    }

    const { text: lessons } = await generateText({
      model: MODEL,
      prompt: `أنت وكيل الاستراتيجية. تقارير الأقسام:\n${reports.map((r) => `[${r.department}] ${r.summary}`).join('\n\n')}\n
استخلص 3 دروس مستفادة و3 توصيات استراتيجية للأسبوع القادم. أجب بنقاط مرقمة بالعربية.`,
    });

    const reviewDoc = {
      userId, reports, lessons,
      createdAt: new Date(), period: weekKey(),
    };
    const ref = await adminDb.collection('weekly_reviews').add(reviewDoc);
    await publishEvent({ topic: 'weekly_review.created', userId, source: 'weekly_reviewer', payload: { reviewId: ref.id } });

    return { reviewId: ref.id, ...reviewDoc };
  }, { model: 'gemini-2.5-flash', input: { userId }, toolsUsed: ['reviewer.synthesize'] });
}

function weekKey() {
  const d = new Date();
  const day = d.getDay();
  const start = new Date(d); start.setHours(0, 0, 0, 0); start.setDate(start.getDate() - day);
  return start.toISOString().slice(0, 10);
}
