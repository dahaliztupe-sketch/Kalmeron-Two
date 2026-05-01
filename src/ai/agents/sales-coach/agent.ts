// @ts-nocheck
import { generateText } from 'ai';
import { MODELS } from '@/src/lib/gemini';
import { instrumentAgent } from '@/src/lib/observability/agent-instrumentation';
import { getCurrentLearnedSkillsAddon } from '@/src/lib/learning/context';

export async function salesCoachAction(product: string, target: string, challenge?: string) {
  return instrumentAgent(
    'sales_coach',
    async () => {
      const baseSystem = `أنت "مدرب المبيعات" في منصة كلميرون، خبير في استراتيجيات البيع للشركات الناشئة في السوق المصري والعربي.
مهمتك: مساعدة رائد الأعمال على بناء استراتيجية مبيعات فعّالة وإغلاق الصفقات.
تقدم:
1. استراتيجية مبيعات مناسبة للمرحلة (B2B/B2C/Direct)
2. قناة البيع الأنسب للمنتج والسوق المصري
3. سكريبت مبيعات فعّال يناسب الثقافة العربية
4. تقنيات إغلاق الصفقة وبناء الثقة مع العميل المصري
5. مؤشرات الأداء الأساسية (KPIs) للمبيعات
6. حلول للتحديات الشائعة في المبيعات المحلية
استند لأساليب مجربة في السوق المصري والعربي.`;
      const learnedAddon = getCurrentLearnedSkillsAddon();
      const system = learnedAddon ? `${baseSystem}\n\n${learnedAddon}` : baseSystem;
      const prompt = challenge
        ? `أبيع "${product}" لـ "${target}". التحدي الحالي: "${challenge}". ساعدني بخطة مبيعات تتجاوز هذا التحدي.`
        : `ساعدني في بناء استراتيجية مبيعات لـ "${product}" موجّهة لـ "${target}" في السوق المصري.`;
      const { text } = await generateText({ model: MODELS.FLASH, system, prompt });
      return text;
    },
    { model: 'gemini-flash', input: { product, target, challenge }, toolsUsed: ['sales.strategy'] }
  );
}
