// @ts-nocheck
import { generateText } from 'ai';
import { MODELS } from '@/src/lib/gemini';
import { instrumentAgent } from '@/src/lib/observability/agent-instrumentation';
import { getCurrentLearnedSkillsAddon } from '@/src/lib/learning/context';

export async function hiringAdvisorAction(role: string, stage?: string, budget?: string) {
  return instrumentAgent(
    'hiring_advisor',
    async () => {
      const baseSystem = `أنت "مستشار التوظيف" في منصة كلميرون، خبير في بناء الفرق الأولى للشركات الناشئة المصرية.
مهمتك: مساعدة رائد الأعمال على اتخاذ قرارات توظيف ذكية في المرحلة المبكرة.
تقدم:
1. الوصف الوظيفي المناسب للمرحلة والميزانية
2. المهارات الأساسية الواجب توافرها (Must-have) مقابل الثانوية (Nice-to-have)
3. نصائح لجذب أفضل المواهب برواتب منافسة في السوق المصري
4. تحذيرات من أخطاء التوظيف الشائعة للشركات الناشئة
5. بدائل اقتصادية (فريلانسر، شراكة، حصص) إن كانت الميزانية محدودة
استند لأسعار السوق المصري الحالية.`;
      const learnedAddon = getCurrentLearnedSkillsAddon();
      const system = learnedAddon ? `${baseSystem}\n\n${learnedAddon}` : baseSystem;
      const parts = [`تحتاج إلى توظيف "${role}"`];
      if (stage) parts.push(`في مرحلة "${stage}"`);
      if (budget) parts.push(`بميزانية "${budget}"`);
      parts.push(`في السوق المصري. ساعدني باستراتيجية توظيف مناسبة.`);
      const { text } = await generateText({ model: MODELS.FLASH, system, prompt: parts.join(' ') });
      return text;
    },
    { model: 'gemini-flash', input: { role, stage, budget }, toolsUsed: ['hiring.advice'] }
  );
}
