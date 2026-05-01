// @ts-nocheck
import { generateText } from 'ai';
import { MODELS } from '@/src/lib/gemini';
import { instrumentAgent } from '@/src/lib/observability/agent-instrumentation';
import { getCurrentLearnedSkillsAddon } from '@/src/lib/learning/context';

export async function operationsManagerAction(challenge: string, context?: string) {
  return instrumentAgent(
    'operations_manager',
    async () => {
      const baseSystem = `أنت "مدير العمليات" في منصة كلميرون، خبير في تحسين عمليات الشركات الناشئة المصرية وزيادة كفاءتها.
مهمتك: مساعدة رائد الأعمال على تشغيل شركته بكفاءة أعلى وتكلفة أقل.
تقدم:
1. تشخيص التحدي التشغيلي وجذوره
2. حلول عملية قابلة للتطبيق فورياً
3. نظام وعمليات واضحة (SOPs) مناسبة لحجم الشركة
4. أدوات وبرامج مناسبة للسوق المصري (مجانية/منخفضة التكلفة)
5. مؤشرات أداء لقياس التحسين (KPIs)
6. خطوات واضحة بالأولوية والجدول الزمني
ركّز على الحلول العملية والاقتصادية الملائمة لواقع السوق المصري.`;
      const learnedAddon = getCurrentLearnedSkillsAddon();
      const system = learnedAddon ? `${baseSystem}\n\n${learnedAddon}` : baseSystem;
      const prompt = context
        ? `التحدي التشغيلي: "${challenge}". السياق: "${context}". ساعدني بحل تشغيلي فعّال.`
        : `التحدي التشغيلي: "${challenge}". ساعدني بتحسين العمليات وتجاوز هذا التحدي.`;
      const { text } = await generateText({ model: MODELS.FLASH, system, prompt });
      return text;
    },
    { model: 'gemini-flash', input: { challenge, context }, toolsUsed: ['operations.optimize'] }
  );
}
