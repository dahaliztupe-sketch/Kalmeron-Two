/**
 * Data Privacy Auditor — مدقّق حماية البيانات
 * Department: القانونية | Reports to: CLO
 */
import { generateText } from 'ai';
import { MODELS } from '@/src/lib/gemini';
import { instrumentAgent } from '@/src/lib/observability/agent-instrumentation';
import { getCurrentLearnedSkillsAddon } from '@/src/lib/learning/context';
import { DATA_PRIVACY_PROMPT } from './prompt';
const SYSTEM_PROMPT = DATA_PRIVACY_PROMPT;


export async function dataPrivacyAction(input: {
  task: 'privacy-audit' | 'draft-policy' | 'dpia' | 'breach-response' | 'consent-design' | 'compliance-checklist';
  productDescription?: string;
  dataTypes?: string[];
  userLocations?: string[];
  currentPolicies?: string;
}) {
  return instrumentAgent('data_privacy', async () => {
    const learnedAddon = getCurrentLearnedSkillsAddon();
    const systemPrompt = learnedAddon ? `${SYSTEM_PROMPT}\n\n${learnedAddon}` : SYSTEM_PROMPT;

    const { text } = await generateText({
      model: MODELS.FLASH,
      system: systemPrompt,
      prompt: `المهمة: ${input.task}
وصف المنتج: ${input.productDescription || 'غير محدد'}
أنواع البيانات المُعالَجة: ${input.dataTypes?.join('، ') || 'غير محددة'}
مواقع المستخدمين: ${input.userLocations?.join('، ') || 'مصر'}
السياسات الحالية: ${input.currentPolicies || 'لا توجد'}`,
    });

    return { output: text, agentId: 'data-privacy', task: input.task };
  }, { model: 'gemini-flash', input, toolsUsed: ['legal.privacy'] });
}
