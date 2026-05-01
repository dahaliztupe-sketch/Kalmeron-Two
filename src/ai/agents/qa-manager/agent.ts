// @ts-nocheck
/**
 * QA Manager — مدير ضبط الجودة
 * Department: التقنية | Reports to: CTO
 */
import { generateText } from 'ai';
import { MODELS } from '@/src/lib/gemini';
import { instrumentAgent } from '@/src/lib/observability/agent-instrumentation';
import { getCurrentLearnedSkillsAddon } from '@/src/lib/learning/context';

const SYSTEM_PROMPT = `أنت مدير ضبط جودة (QA) متخصص في المنتجات الرقمية العربية.
قدراتك:
- كتابة Test Plans وTest Cases الشاملة
- Acceptance Criteria واضحة لكل Feature
- Regression Testing Strategy
- Performance Testing: Load Tests، Stress Tests
- Accessibility Testing للجمهور العربي (RTL، Screen Readers)
- Bug Triage وPriority Matrix
- API Testing: Postman، REST Assured
- Automated Testing: Playwright، Cypress، Vitest

معايير جودة المنتج العربي:
- RTL Support: يجب يكون صحيحًا 100% قبل الإطلاق
- Arabic Text Rendering: Cairo Font، IBM Plex Arabic
- دعم الأرقام العربية والهندية
- اختبار على شاشات 5-6.7 بوصة (الشائعة في مصر)
- الأجهزة الشائعة: Samsung Galaxy A, Infinix, iPhone 13/14`;

export async function qaManagerAction(input: {
  task: 'write-test-plan' | 'create-test-cases' | 'bug-triage' | 'performance-test' | 'accessibility-check' | 'release-checklist';
  featureOrBug: string;
  acceptanceCriteria?: string[];
  bugDetails?: Record<string, unknown>;
  platform?: string;
}) {
  return instrumentAgent('qa_manager', async () => {
    const learnedAddon = getCurrentLearnedSkillsAddon();
    const systemPrompt = learnedAddon ? `${SYSTEM_PROMPT}\n\n${learnedAddon}` : SYSTEM_PROMPT;

    const { text } = await generateText({
      model: MODELS.FLASH,
      system: systemPrompt,
      prompt: `المهمة: ${input.task}
الميزة/البج: ${input.featureOrBug}
معايير القبول: ${input.acceptanceCriteria?.join('\n') || 'غير محددة'}
تفاصيل البج: ${JSON.stringify(input.bugDetails || {}, null, 2)}
المنصة: ${input.platform || 'Web + Mobile'}`,
    });

    return { output: text, agentId: 'qa-manager', task: input.task };
  }, { model: 'gemini-flash', input, toolsUsed: ['tech.qa'] });
}
