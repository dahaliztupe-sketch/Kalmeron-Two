import { generateText } from 'ai';
import { MODELS } from '@/src/lib/gemini';
import { CEO_SYSTEM_PROMPT } from './prompt';
import { instrumentAgent } from '@/src/lib/observability/agent-instrumentation';
import { getCurrentLearnedSkillsAddon } from '@/src/lib/learning/context';
import { ENTERPRISE_EXECUTIVES } from '@/src/ai/organization/enterprise/hierarchy';

import { z } from 'zod';

export const CEOInputSchema = z.object({
  message: z.string().min(1).max(8000),
  context: z.string().max(2000).optional(),
  urgency: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  domain: z.enum(['finance', 'marketing', 'operations', 'technology', 'legal', 'hr', 'strategy', 'general']).optional(),
});

export type CEOInput = z.infer<typeof CEOInputSchema>;

export interface CEOOutput {
  assessment: string;
  recommendation: string;
  delegatedTo?: string;
  nextAction: string;
  riskFlags?: string[];
  executiveSummary: string;
}

const EXECUTIVE_ROSTER = Object.values(ENTERPRISE_EXECUTIVES)
  .filter(e => e.role !== 'CEO')
  .map(e => `- ${e.role} (${e.nameAr}): ${e.mandate}`)
  .join('\n');

export async function ceoAgentAction(input: CEOInput): Promise<CEOOutput> {
  CEOInputSchema.parse(input);
  return instrumentAgent(
    'ceo_agent',
    async () => {
      const learnedAddon = getCurrentLearnedSkillsAddon();
      const systemPrompt = learnedAddon
        ? `${CEO_SYSTEM_PROMPT}\n\n${learnedAddon}`
        : CEO_SYSTEM_PROMPT;

      const urgencyNote = input.urgency === 'critical'
        ? '\n⚠️ طارئ: يتطلب قراراً فورياً.'
        : input.urgency === 'high' ? '\n🔴 أولوية عالية.' : '';

      const executiveContext = `
فريق القيادة المتاح للتفويض:
${EXECUTIVE_ROSTER}
`;

      const { text } = await generateText({
        model: MODELS.PRO,
        system: systemPrompt + executiveContext,
        prompt: `${urgencyNote}
السياق: ${input.context || 'غير محدد'}
القضية المطروحة: ${input.message}

أجب وفق إطار CEO Framework الخمسي. حدّد إذا كانت المسألة تحتاج تفويضاً لمدير متخصص.
أجب بصيغة JSON: {
  "assessment": "تقييم الموقف",
  "recommendation": "التوصية الاستراتيجية",
  "delegatedTo": "اسم المدير إن وجد أو null",
  "nextAction": "الخطوة التالية الأوحد",
  "riskFlags": ["مخاطر إن وجدت"],
  "executiveSummary": "ملخص تنفيذي موجز لا يتجاوز 3 أسطر"
}`,
      });

      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]) as CEOOutput;
        }
      } catch {}

      return {
        assessment: text,
        recommendation: '',
        nextAction: 'مراجعة التقييم واتخاذ الإجراء المناسب',
        executiveSummary: text.slice(0, 300),
      };
    },
    { model: 'gemini-pro', input, toolsUsed: ['ceo.assess', 'ceo.delegate'] }
  );
}
