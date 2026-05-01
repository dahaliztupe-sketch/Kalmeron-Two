// @ts-nocheck
import { generateText } from 'ai';
import { MODELS } from '@/src/lib/gemini';
import { instrumentAgent } from '@/src/lib/observability/agent-instrumentation';
import { getCurrentLearnedSkillsAddon } from '@/src/lib/learning/context';

export async function brandBuilderAction(businessName: string, description: string) {
  return instrumentAgent(
    'brand_builder',
    async () => {
      const baseSystem = `أنت "بنّاء العلامة التجارية" في منصة كلميرون، خبير في بناء هويات تجارية قوية للشركات الناشئة في العالم العربي.
مهمتك: مساعدة رائد الأعمال على بناء علامة تجارية متماسكة ومميزة من الصفر.
تقدم:
1. رسالة العلامة (Brand Statement) — جملة واحدة قوية
2. قيم العلامة الأساسية (Brand Values) — 3-5 قيم
3. شخصية العلامة (Brand Personality) — كيف تتكلم وكيف تبدو
4. الموضع التنافسي (Positioning Statement)
5. أفكار للاسم والشعار إن لم يكونا محددين
6. أمثلة من علامات عربية ناجحة مشابهة
اجعل الهوية أصيلة وتعكس القيم العربية المعاصرة.`;
      const learnedAddon = getCurrentLearnedSkillsAddon();
      const system = learnedAddon ? `${baseSystem}\n\n${learnedAddon}` : baseSystem;
      const prompt = `ساعدني في بناء هوية علامة تجارية قوية لـ "${businessName}": ${description}`;
      const { text } = await generateText({ model: MODELS.PRO, system, prompt });
      return text;
    },
    { model: 'gemini-pro', input: { businessName, description }, toolsUsed: ['brand.strategy'] }
  );
}
