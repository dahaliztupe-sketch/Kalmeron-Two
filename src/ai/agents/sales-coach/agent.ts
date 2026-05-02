// @ts-nocheck
import { generateText } from 'ai';
import { MODELS } from '@/src/lib/gemini';
import { instrumentAgent } from '@/src/lib/observability/agent-instrumentation';
import { getCurrentLearnedSkillsAddon } from '@/src/lib/learning/context';
import { SALES_COACH_PROMPT } from './prompt';

export async function salesCoachAction(product: string, target: string, challenge?: string) {
  return instrumentAgent(
    'sales_coach',
    async () => {
      const baseSystem = SALES_COACH_PROMPT;
      const learnedAddon = getCurrentLearnedSkillsAddon();
      const system = learnedAddon ? `${baseSystem}\n\n${learnedAddon}` : baseSystem;
      const prompt = challenge
        ? `أبيع "${product}" لـ "${target}". التحدي الحالي: "${challenge}". ساعدني بخطة مبيعات تتجاوز هذا التحدي.`
        : `ساعدني في بناء استراتيجية مبيعات لـ "${product}" موجّهة لـ "${target}" في السوق المصري.`;
      const { text } = await generateText({ model: MODELS.FLASH, system, prompt });
      return text;
    },
    { model: 'gemini-flash', input: { product, target, challenge }, toolsUsed: ['sales.strategy'] }
  );
}
