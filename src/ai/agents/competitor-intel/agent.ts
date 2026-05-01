// @ts-nocheck
import { generateText } from 'ai';
import { MODELS } from '@/src/lib/gemini';
import { instrumentAgent } from '@/src/lib/observability/agent-instrumentation';
import { getCurrentLearnedSkillsAddon } from '@/src/lib/learning/context';

export async function competitorIntelAction(industry: string, companyName?: string) {
  return instrumentAgent(
    'competitor_intel',
    async () => {
      const baseSystem = `أنت "محلل المنافسين" في منصة كلميرون، خبير في تحليل السوق والمنافسة للشركات الناشئة المصرية والعربية.
مهمتك: تحليل المنافسين في القطاع المحدد وإيجاد الفجوات التي يستطيع رائد الأعمال استغلالها.
قدّم تحليلاً منظماً يشمل:
1. أبرز المنافسين المباشرين وغير المباشرين
2. نقاط قوة وضعف كل منافس
3. الفجوات السوقية غير المستغلة
4. توصية واضحة بنقطة تميز (Unique Value Proposition)
استخدم أمثلة من السوق المصري والعربي حيثما أمكن.`;
      const learnedAddon = getCurrentLearnedSkillsAddon();
      const system = learnedAddon ? `${baseSystem}\n\n${learnedAddon}` : baseSystem;
      const prompt = companyName
        ? `حلل المنافسين في قطاع "${industry}" بالتفصيل، مع التركيز على كيفية تميز شركة "${companyName}" عنهم.`
        : `حلل المنافسين في قطاع "${industry}" وحدد أبرز الفجوات والفرص المتاحة لشركة ناشئة جديدة.`;
      const { text } = await generateText({ model: MODELS.PRO, system, prompt });
      return text;
    },
    { model: 'gemini-pro', input: { industry, companyName }, toolsUsed: ['competitor.analysis'] }
  );
}
