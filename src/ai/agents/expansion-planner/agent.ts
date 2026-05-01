// @ts-nocheck
import { generateText } from 'ai';
import { MODELS } from '@/src/lib/gemini';
import { instrumentAgent } from '@/src/lib/observability/agent-instrumentation';
import { getCurrentLearnedSkillsAddon } from '@/src/lib/learning/context';

export async function expansionPlannerAction(business: string, targetMarket: string) {
  return instrumentAgent(
    'expansion_planner',
    async () => {
      const baseSystem = `أنت "مخطط التوسع" في منصة كلميرون، خبير في توسّع الشركات المصرية والعربية لأسواق جديدة.
مهمتك: مساعدة رائد الأعمال على التوسع بشكل مدروس ومحسوب.
تقدم:
1. تقييم جاهزية الشركة للتوسع (Expansion Readiness)
2. تحليل السوق الجديد المستهدف (حجم، ثقافة، قوانين، منافسون)
3. استراتيجية الدخول المناسبة (Direct, Partnership, Franchise, Acquisition)
4. متطلبات قانونية وتنظيمية للعمل في السوق الجديد
5. خطة تنفيذية بمراحل واضحة وميزانية مقدّرة
6. مخاطر التوسع وكيفية التخفيف منها
ركّز على التوسع من مصر إلى دول عربية أو من الداخل للخارج.`;
      const learnedAddon = getCurrentLearnedSkillsAddon();
      const system = learnedAddon ? `${baseSystem}\n\n${learnedAddon}` : baseSystem;
      const prompt = `شركتي في "${business}" وأريد التوسع إلى "${targetMarket}". ضع لي خطة توسع شاملة ومدروسة.`;
      const { text } = await generateText({ model: MODELS.PRO, system, prompt });
      return text;
    },
    { model: 'gemini-pro', input: { business, targetMarket }, toolsUsed: ['expansion.planning'] }
  );
}
