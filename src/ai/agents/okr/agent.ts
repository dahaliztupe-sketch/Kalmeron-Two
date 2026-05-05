/**
 * OKR Agent — توليد الأهداف الأسبوعية، تتبع التقدم، تقرير ذاتي.
 */
import { generateText } from 'ai';
import { google } from '@ai-sdk/google';
import { instrumentAgent } from '@/src/lib/observability/agent-instrumentation';
import { createOKR, listCurrentWeekOKRs, updateOKRProgress, getOKR } from '@/src/lib/okr/okr-store';
import { getProjectOverview, isKnowledgeGraphEnabled } from '@/src/lib/memory/knowledge-graph';
import { OKR_PROMPT } from './prompt';

const DEPARTMENTS = ['marketing', 'sales', 'product', 'finance', 'hr', 'legal', 'operations', 'strategy'];

const MODEL = google('gemini-2.5-flash');

export async function generateWeeklyGoals(userId: string) {
  return instrumentAgent('okr_agent', async () => {
    let context = 'لا توجد بيانات مشروع بعد.';
    if (await isKnowledgeGraphEnabled()) {
      const overview = await getProjectOverview(userId, 100);
      if (overview && overview.nodes.length > 0) {
        context = `العقد: ${overview.nodes.length}، العلاقات: ${overview.edges.length}\n` +
          overview.nodes.slice(0, 30).map((n: unknown) => `- ${n.id}: ${n.name || n.title || n.description || ''}`).join('\n');
      }
    }

    const start = startOfWeek(new Date());
    const end = new Date(start); end.setDate(end.getDate() + 7);

    const created: unknown[] = [];
    for (const dept of DEPARTMENTS) {
      const { text } = await generateText({
        model: MODEL,
        system: OKR_PROMPT,
        prompt: `أنت مدير قسم ${dept}. اقترح هدف أسبوعي واحد ذو ٢-٣ نتائج رئيسية قابلة للقياس بالأرقام.
سياق المشروع:
${context}

أعد JSON فقط بالشكل:
{"objective": "...", "keyResults": [{"description":"...","target":<number>,"current":0,"unit":"..."}]}`,
      });

      let parsed: unknown = null;
      try {
        const match = text.match(/\{[\s\S]*\}/);
        if (match) parsed = JSON.parse(match[0]);
      } catch { /* skip dept on parse fail */ }
      if (!parsed?.objective || !Array.isArray(parsed.keyResults)) continue;

      const okr = await createOKR({
        userId, period: 'weekly',
        startDate: start, endDate: end,
        department: dept,
        objective: parsed.objective,
        keyResults: parsed.keyResults,
        status: 'pending',
        agentId: `${dept}_orchestrator`,
      });
      created.push(okr);
    }
    return { count: created.length, okrs: created };
  }, { model: 'gemini-2.5-flash', input: { userId }, toolsUsed: ['okr.generate'] });
}

export async function trackOKRProgress(okrId: string, krIndex: number, current: number) {
  return instrumentAgent('okr_agent', async () => {
    return await updateOKRProgress(okrId, krIndex, current);
  }, { model: 'n/a', input: { okrId, krIndex, current }, toolsUsed: ['okr.track'] });
}

export async function selfReport(userId: string, agentId: string) {
  return instrumentAgent('okr_agent', async () => {
    const okrs = await listCurrentWeekOKRs(userId);
    const mine = okrs.filter((o: unknown) => o.agentId === agentId);
    if (mine.length === 0) {
      return { agentId, summary: 'لا توجد أهداف هذا الأسبوع.', okrs: [] };
    }
    const lines = mine.map((o: unknown) => {
      const krs = o.keyResults.map((k: unknown) =>
        `  • ${k.description}: ${k.current}/${k.target} ${k.unit}`).join('\n');
      return `الهدف: ${o.objective}\n${krs}`;
    }).join('\n\n');
    return { agentId, summary: lines, okrs: mine };
  }, { model: 'n/a', input: { userId, agentId }, toolsUsed: ['okr.self_report'] });
}

function startOfWeek(d: Date) {
  const x = new Date(d);
  const day = x.getDay();
  x.setHours(0, 0, 0, 0);
  x.setDate(x.getDate() - day);
  return x;
}
