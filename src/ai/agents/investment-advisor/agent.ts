// @ts-nocheck
import { generateText } from 'ai';
import { MODELS } from '@/src/lib/gemini';
import { instrumentAgent } from '@/src/lib/observability/agent-instrumentation';
import { getCurrentLearnedSkillsAddon } from '@/src/lib/learning/context';

export async function investmentAdvisorAction(business: string, stage?: string, amount?: string) {
  return instrumentAgent(
    'investment_advisor',
    async () => {
      const baseSystem = `أنت "مستشار الاستثمار" في منصة كلميرون، خبير في جذب المستثمرين وتقييم الشركات في السوق المصري والعربي.
مهمتك: مساعدة رائد الأعمال على جذب التمويل المناسب وفهم عالم الاستثمار.
تقدم:
1. تقييم الشركة بطرق متعددة (DCF, Comparables, Berkus)
2. أنواع المستثمرين المناسبين للمرحلة (Angels, VCs, Strategic)
3. استراتيجية جذب المستثمرين والتحضير للـ Due Diligence
4. نصائح للتفاوض على التقييم والحصص
5. بنود Term Sheet الأساسية التي يجب مراعاتها
6. مصادر تمويل بديلة (Grants, Accelerators) في مصر
استند لواقع السوق المصري وآليات الاستثمار المتاحة محلياً.`;
      const learnedAddon = getCurrentLearnedSkillsAddon();
      const system = learnedAddon ? `${baseSystem}\n\n${learnedAddon}` : baseSystem;
      const parts = [`شركتي تعمل في "${business}"`];
      if (stage) parts.push(`وهي في مرحلة "${stage}"`);
      if (amount) parts.push(`أبحث عن تمويل "${amount}"`);
      parts.push(`ساعدني في استراتيجية جذب المستثمرين والتقييم المناسب.`);
      const { text } = await generateText({ model: MODELS.PRO, system, prompt: parts.join('. ') });
      return text;
    },
    { model: 'gemini-pro', input: { business, stage, amount }, toolsUsed: ['investment.advisory'] }
  );
}
