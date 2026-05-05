import { generateText } from 'ai';
import { MODELS } from '@/src/lib/gemini';
import { instrumentAgent } from '@/src/lib/observability/agent-instrumentation';
import { getCurrentLearnedSkillsAddon } from '@/src/lib/learning/context';
import { CUSTOMER_DISCOVERY_PROMPT } from './prompt';
import { z } from 'zod';

export const CustomerDiscoveryInputSchema = z.object({
  businessIdea: z.string().min(5).max(2000),
  targetSegment: z.string().min(2).max(500),
  hypotheses: z.array(z.string().max(500)).max(20),
  interviewAnswers: z.array(z.object({ question: z.string(), answer: z.string() })).optional(),
});

export type CustomerDiscoveryInput = z.infer<typeof CustomerDiscoveryInputSchema>;

export interface PersonaCard {
  name: string;
  age: string;
  occupation: string;
  location: string;
  mainPain: string;
  goals: string[];
  behaviors: string[];
  payingWillingness: string;
  quote: string;
  interviewSignals: string[];
}

export interface CustomerDiscoveryResult {
  analysisText: string;
  persona: PersonaCard | null;
}

function extractPersonaCard(text: string): PersonaCard | null {
  const start = text.indexOf('[PERSONA_JSON_START]');
  const end = text.indexOf('[PERSONA_JSON_END]');
  if (start === -1 || end === -1) return null;
  try {
    const json = text.slice(start + '[PERSONA_JSON_START]'.length, end).trim();
    return JSON.parse(json) as PersonaCard;
  } catch {
    return null;
  }
}

export async function customerDiscoveryAction(input: CustomerDiscoveryInput): Promise<CustomerDiscoveryResult> {
  CustomerDiscoveryInputSchema.parse(input);
  const analysisText = await instrumentAgent(
    'customer_discovery',
    async () => {
      const baseSystem = CUSTOMER_DISCOVERY_PROMPT;
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

${answersText ? `## 📝 تحليل مقابلاتك الحالية\nماذا تقول هذه الإجابات؟ ما الأنماط؟ ما الخطوة التالية؟` : '## 🎯 خطة الـ١٠ مقابلات الأولى\nكيف تجد ومن أين تبدأ المقابلات في مصر؟'}

---

بعد التحليل أعلاه، أنشئ بطاقة Persona JSON للشريحة المستهدفة بالتنسيق التالي بالضبط:

[PERSONA_JSON_START]
{
  "name": "اسم وهمي للشخصية",
  "age": "العمر أو النطاق",
  "occupation": "المهنة",
  "location": "موقع نموذجي في مصر",
  "mainPain": "الألم الرئيسي في جملة واحدة",
  "goals": ["هدف 1", "هدف 2", "هدف 3"],
  "behaviors": ["سلوك 1", "سلوك 2", "سلوك 3"],
  "payingWillingness": "هل سيدفع؟ كم؟ لماذا؟",
  "quote": "جملة نموذجية يقولها هذا الشخص",
  "interviewSignals": ["إشارة خطر 1", "إشارة إيجابية 1", "إشارة إيجابية 2"]
}
[PERSONA_JSON_END]`;

      const { text } = await generateText({ model: MODELS.PRO, system, prompt });
      return text;
    },
    { model: 'gemini-pro', input: { businessIdea: input.businessIdea, segment: input.targetSegment }, toolsUsed: ['discovery.mom_test', 'discovery.hypothesis'] }
  );

  const cleanText = analysisText.replace(/\[PERSONA_JSON_START\][\s\S]*?\[PERSONA_JSON_END\]/g, '').trim();
  const persona = extractPersonaCard(analysisText);
  return { analysisText: cleanText, persona };
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
