// @ts-nocheck
/**
 * Weekly Planning Loop — لكل قسم: استدعاء وكيله ليصوغ خطة أسبوعية لتحقيق هدفه،
 * ثم يبحث "المنسق العام" عن فرص تعاون ويسجل الخطة في Firestore.
 */
import { generateText } from 'ai';
import { google } from '@ai-sdk/google';
import { adminDb } from '@/src/lib/firebase-admin';
import { listCurrentWeekOKRs } from '@/src/lib/okr/okr-store';
import { instrumentAgent } from '@/src/lib/observability/agent-instrumentation';
import { publishEvent } from './event-mesh';

const MODEL = google('gemini-2.5-flash');

export async function runWeeklyPlanning(userId: string) {
  return instrumentAgent('weekly_planner', async () => {
    const okrs = await listCurrentWeekOKRs(userId);
    if (!okrs.length) return { plans: [], collaborations: [], message: 'no_weekly_okrs' };

    const plans: unknown[] = [];
    for (const okr of okrs) {
      const krList = okr.keyResults.map((k: unknown) => `- ${k.description} (target: ${k.target} ${k.unit})`).join('\n');
      const { text } = await generateText({
        model: MODEL,
        prompt: `أنت قائد قسم ${okr.department}. هدف الأسبوع: "${okr.objective}".\nالنتائج الرئيسية:\n${krList}\n
ضع خطة عمل أسبوعية مختصرة (5 خطوات بحد أقصى)، يشمل كل خطوة: نشاط، اليوم المتوقع، أداة/قسم آخر يلزم.
أعد JSON فقط: {"steps": [{"day":"الإثنين","activity":"...","needs":"..."}]}`,
      });
      let parsed: unknown = { steps: [] };
      try { parsed = JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] || '{"steps":[]}'); } catch {}
      plans.push({ okrId: okr.id, department: okr.department, objective: okr.objective, plan: parsed });
    }

    // Coordinator pass: look for collaboration opportunities across plans
    const summary = plans.map((p) => `قسم ${p.department}: ${JSON.stringify(p.plan.steps)}`).join('\n');
    const { text: coordText } = await generateText({
      model: MODEL,
      prompt: `أنت المنسق العام. خطط الأسبوع للأقسام:\n${summary}\n
حدد فرص التعاون بين الأقسام (مثال: التسويق يحتاج قائمة من المبيعات).
أعد JSON: {"collaborations": [{"from":"...","to":"...","handoff":"..."}]}`,
    });
    let coordinator: unknown = { collaborations: [] };
    try { coordinator = JSON.parse(coordText.match(/\{[\s\S]*\}/)?.[0] || '{"collaborations":[]}'); } catch {}

    const planDoc = {
      userId, plans, collaborations: coordinator.collaborations || [],
      createdAt: new Date(), period: weekKey(),
    };
    const ref = await adminDb.collection('weekly_plans').add(planDoc);
    await publishEvent({ topic: 'weekly_plan.created', userId, source: 'weekly_planner', payload: { planId: ref.id } });

    return { planId: ref.id, ...planDoc };
  }, { model: 'gemini-2.5-flash', input: { userId }, toolsUsed: ['planner.coordinate'] });
}

function weekKey() {
  const d = new Date();
  const day = d.getDay();
  const start = new Date(d); start.setHours(0, 0, 0, 0); start.setDate(start.getDate() - day);
  return start.toISOString().slice(0, 10);
}
