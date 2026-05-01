// @ts-nocheck
import { generateText } from 'ai';
import { MODELS } from '@/src/lib/gemini';
import { instrumentAgent } from '@/src/lib/observability/agent-instrumentation';
import { getCurrentLearnedSkillsAddon } from '@/src/lib/learning/context';

export async function marketingStrategistAction(business: string, budget?: string, goals?: string) {
  return instrumentAgent(
    'marketing_strategist',
    async () => {
      const baseSystem = `أنت "استراتيجي التسويق" في منصة كلميرون، خبير في التسويق الرقمي والتقليدي للشركات الناشئة المصرية والعربية.
مهمتك: تصميم خطة تسويق شاملة وقابلة للتنفيذ ضمن الميزانية المتاحة.
تقدم:
1. استراتيجية التسويق الرئيسية (Positioning + Messaging)
2. المزيج التسويقي المناسب (قنوات عضوية ومدفوعة)
3. خطة محتوى عربي يناسب الجمهور المصري
4. توزيع الميزانية بشكل مثالي حسب القنوات
5. جدول زمني للتنفيذ (90 يوم أول)
6. مؤشرات النجاح القابلة للقياس (OKRs)
ركّز على منصات مناسبة للسوق المصري: Facebook, Instagram, TikTok, YouTube.`;
      const learnedAddon = getCurrentLearnedSkillsAddon();
      const system = learnedAddon ? `${baseSystem}\n\n${learnedAddon}` : baseSystem;
      const parts = [`صمّم خطة تسويق شاملة لـ "${business}"`];
      if (budget) parts.push(`بميزانية "${budget}"`);
      if (goals) parts.push(`الهدف: "${goals}"`);
      const { text } = await generateText({ model: MODELS.PRO, system, prompt: parts.join('. ') });
      return text;
    },
    { model: 'gemini-pro', input: { business, budget, goals }, toolsUsed: ['marketing.strategy'] }
  );
}
