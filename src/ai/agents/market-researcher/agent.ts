// @ts-nocheck
import { generateText } from 'ai';
import { MODELS } from '@/src/lib/gemini';
import { instrumentAgent } from '@/src/lib/observability/agent-instrumentation';
import { getCurrentLearnedSkillsAddon } from '@/src/lib/learning/context';

export async function marketResearcherAction(industry: string, targetSegment?: string) {
  return instrumentAgent(
    'market_researcher',
    async () => {
      const baseSystem = `أنت "باحث السوق" في منصة كلميرون، متخصص في تحليل الأسواق المصرية والعربية للشركات الناشئة.
مهمتك: تقديم بحث سوق شامل وعملي يساعد رائد الأعمال على اتخاذ قرارات مدروسة.
يشمل تقريرك:
1. حجم السوق الإجمالي (TAM) والمخدوم (SAM) والمستهدف (SOM)
2. أبرز الاتجاهات والتغيرات في السوق
3. الشرائح الأكثر نمواً والأعلى قيمة
4. العوامل الاقتصادية والاجتماعية المؤثرة في مصر
5. توصيات عملية للدخول للسوق
ركّز على البيانات الواقعية والأرقام القابلة للتطبيق.`;
      const learnedAddon = getCurrentLearnedSkillsAddon();
      const system = learnedAddon ? `${baseSystem}\n\n${learnedAddon}` : baseSystem;
      const prompt = targetSegment
        ? `أجرِ بحث سوق تفصيلياً لقطاع "${industry}" مع التركيز على شريحة "${targetSegment}" في السوق المصري.`
        : `أجرِ بحث سوق شامل لقطاع "${industry}" في السوق المصري والعربي مع أرقام وتوقعات النمو.`;
      const { text } = await generateText({ model: MODELS.PRO, system, prompt });
      return text;
    },
    { model: 'gemini-pro', input: { industry, targetSegment }, toolsUsed: ['market.research'] }
  );
}
