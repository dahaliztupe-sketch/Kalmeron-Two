/**
 * IP Protection Expert — خبير حماية الملكية الفكرية
 * Department: القانونية | Reports to: CLO
 */
import { generateText } from 'ai';
import { MODELS } from '@/src/lib/gemini';
import { instrumentAgent } from '@/src/lib/observability/agent-instrumentation';
import { getCurrentLearnedSkillsAddon } from '@/src/lib/learning/context';
import { IP_PROTECTOR_PROMPT } from './prompt';
const SYSTEM_PROMPT = IP_PROTECTOR_PROMPT;


export async function ipProtectorAction(input: {
  task: 'trademark-search' | 'ip-strategy' | 'due-diligence' | 'licensing-advice' | 'trade-secret-protection';
  assetDescription: string;
  sector?: string;
  currentProtections?: string[];
  investmentStage?: string;
}) {
  return instrumentAgent('ip_protector', async () => {
    const learnedAddon = getCurrentLearnedSkillsAddon();
    const systemPrompt = learnedAddon ? `${SYSTEM_PROMPT}\n\n${learnedAddon}` : SYSTEM_PROMPT;

    const { text } = await generateText({
      model: MODELS.PRO,
      system: systemPrompt,
      prompt: `المهمة: ${input.task}
الأصل المراد حمايته: ${input.assetDescription}
القطاع: ${input.sector || 'غير محدد'}
الحمايات الحالية: ${input.currentProtections?.join('، ') || 'لا توجد'}
مرحلة الاستثمار: ${input.investmentStage || 'غير محددة'}

قدّم استراتيجية حماية عملية مع الخطوات والتكاليف التقريبية.`,
    });

    return { strategy: text, agentId: 'ip-protector', task: input.task };
  }, { model: 'gemini-pro', input, toolsUsed: ['legal.ip'] });
}
