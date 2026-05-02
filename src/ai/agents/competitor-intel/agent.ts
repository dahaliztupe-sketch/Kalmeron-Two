// @ts-nocheck
import { generateText } from 'ai';
import { MODELS } from '@/src/lib/gemini';
import { instrumentAgent } from '@/src/lib/observability/agent-instrumentation';
import { getCurrentLearnedSkillsAddon } from '@/src/lib/learning/context';
import { COMPETITOR_INTEL_PROMPT } from './prompt';

export async function competitorIntelAction(industry: string, companyName?: string) {
  return instrumentAgent(
    'competitor_intel',
    async () => {
      c
      const baseSystem = COMPETITOR_INTEL_PROMPT;
      const learnedAddon = getCurrentLearnedSkillsAddon();
      const system = learnedAddon ? `${baseSystem}\n\n${learnedAddon}` : baseSystem;
      const prompt = companyName
        ? `حلل المنافسين في قطاع "${industry}" بالتفصيل، مع التركيز على كيفية تميز شركة "${companyName}" عنهم.`
        : `حلل المنافسين في قطاع "${industry}" وحدد أبرز الفجوات والفرص المتاحة لشركة ناشئة جديدة.`;
      const { text } = await generateText({ model: MODELS.PRO, system, prompt });
      return text;
    },
    { model: 'gemini-pro', input: { industry, companyName }, toolsUsed: ['competitor.analysis'] }
  );
}
