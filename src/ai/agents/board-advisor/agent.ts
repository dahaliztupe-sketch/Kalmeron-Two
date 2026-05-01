// @ts-nocheck
import { generateText } from 'ai';
import { MODELS } from '@/src/lib/gemini';
import { instrumentAgent } from '@/src/lib/observability/agent-instrumentation';
import { getCurrentLearnedSkillsAddon } from '@/src/lib/learning/context';

export async function boardAdvisorAction(question: string, context?: string) {
  return instrumentAgent(
    'board_advisor',
    async () => {
      const baseSystem = `أنت "مستشار مجلس الإدارة" في منصة كلميرون، تتخذ دور مستشار استراتيجي رفيع المستوى للشركات المصرية والعربية في مرحلة التوسع.
مهمتك: تقديم توجيه استراتيجي عالي المستوى يساعد المؤسس على اتخاذ قرارات المصير.
تقدم:
1. تحليل القرار الاستراتيجي من عدة زوايا (مالية، تشغيلية، تنافسية)
2. الخيارات المتاحة مع إيجابيات وسلبيات كل منها
3. توصية واضحة مع مبرراتها
4. المخاطر والسيناريوهات البديلة
5. الخطوات التنفيذية الأولى
تحدّث بمنطق المستشار الاستراتيجي الخبير، ليس كمساعد بل كشريك في القرار.`;
      const learnedAddon = getCurrentLearnedSkillsAddon();
      const system = learnedAddon ? `${baseSystem}\n\n${learnedAddon}` : baseSystem;
      const prompt = context
        ? `السياق: "${context}". السؤال الاستراتيجي: "${question}"`
        : `السؤال الاستراتيجي: "${question}"`;
      const { text } = await generateText({ model: MODELS.PRO, system, prompt });
      return text;
    },
    { model: 'gemini-pro', input: { question, context }, toolsUsed: ['strategy.advisory'] }
  );
}
