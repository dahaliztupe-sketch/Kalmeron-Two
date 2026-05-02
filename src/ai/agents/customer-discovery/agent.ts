import { generateText } from 'ai';
import { MODELS } from '@/src/lib/gemini';
import { instrumentAgent } from '@/src/lib/observability/agent-instrumentation';
import { getCurrentLearnedSkillsAddon } from '@/src/lib/learning/context';

export interface CustomerDiscoveryInput {
  businessIdea: string;
  targetSegment: string;
  hypotheses: string[];
  interviewAnswers?: Array<{ question: string; answer: string }>;
}

export async function customerDiscoveryAction(input: CustomerDiscoveryInput): Promise<string> {
  return instrumentAgent(
    'customer_discovery',
    async () => {
      const baseSystem = `أنت "خبير اكتشاف العملاء" في منصة كلميرون، متخصص في Mom Test methodology وCustomer Discovery للسوق المصري والعربي.

**فلسفتك:** ٩٠٪ من الستارت أبس تفشل لأنها بنت ما لا يريده العملاء فعلاً.
**أسلوبك:** اسأل عن الواقع، لا عن الرأي. ابحث عن الألم، لا عن الإعجاب.

**Mom Test Principles:**
١. اسأل عن حياة العميل، لا عن فكرتك
٢. اسأل عن الماضي المحدد، لا عن المستقبل الافتراضي
٣. تحدث أقل، استمع أكثر — ٧٠٪ يتحدث العميل`;

      const learnedAddon = getCurrentLearnedSkillsAddon();
      const system = learnedAddon ? `${baseSystem}\n\n${learnedAddon}` : baseSystem;

      const hypothesesText = input.hypotheses.map((h, i) => `${i + 1}. ${h}`).join('\n');
      const answersText = input.interviewAnswers?.length
        ? input.interviewAnswers.map(qa => `س: ${qa.question}\nج: ${qa.answer}`).join('\n\n')
        : '';

      const prompt = `الفكرة: ${input.businessIdea}
الشريحة المستهدفة: ${input.targetSegment}

الفرضيات التي أريد اختبارها:
${hypothesesText}

${answersText ? `نتائج المقابلات حتى الآن:\n${answersText}\n\n` : ''}

قدّم:

## 🔍 تحليل الفرضيات
لكل فرضية: هل هي قابلة للاختبار؟ كيف؟ ما الدليل الذي سيثبتها أو يدحضها؟

## 🎯 أسئلة المقابلة (Mom Test)
١٠ أسئلة قوية بأسلوب Mom Test للسوق المصري تحديداً:
- ٣ أسئلة عن الألم الحالي
- ٣ أسئلة عن السلوك الفعلي
- ٢ أسئلة عن المحاولات السابقة لحل المشكلة
- ٢ أسئلة عن الاستعداد للدفع

## 🚩 الأسئلة التي يجب تجنبها
(أسئلة تحصل على إجابات مضللة)

## 📊 كيف تحلل الإجابات؟
إطار تحليل بسيط للاجتهادات الستارت أب العربية

${answersText ? `## 📝 تحليل مقابلاتك الحالية\nماذا تقول هذه الإجابات؟ ما الأنماط؟ ما الخطوة التالية؟` : '## 🎯 خطة الـ١٠ مقابلات الأولى\nكيف تجد ومن أين تبدأ المقابلات في مصر؟'}`;

      const { text } = await generateText({ model: MODELS.PRO, system, prompt });
      return text;
    },
    { model: 'gemini-pro', input: { businessIdea: input.businessIdea, segment: input.targetSegment }, toolsUsed: ['discovery.mom_test', 'discovery.hypothesis'] }
  );
}

export async function generateInterviewScriptAction(businessIdea: string, targetSegment: string): Promise<string> {
  return instrumentAgent(
    'customer_discovery_script',
    async () => {
      const system = `أنت خبير Mom Test. اكتب سكريبت مقابلة عميل عربي قصير وفعّال.`;
      const { text } = await generateText({
        model: MODELS.FLASH,
        system,
        prompt: `اكتب سكريبت مقابلة (١٥-٢٠ دقيقة) لاكتشاف عملاء "${businessIdea}" من شريحة "${targetSegment}" في مصر. اجعله طبيعياً وودوداً.`,
      });
      return text;
    },
    { model: 'gemini-flash', input: { businessIdea, targetSegment }, toolsUsed: ['discovery.script'] }
  );
}
