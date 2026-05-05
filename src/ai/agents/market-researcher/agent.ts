import { generateText } from 'ai';
import { MODELS } from '@/src/lib/gemini';
import { instrumentAgent } from '@/src/lib/observability/agent-instrumentation';
import { getCurrentLearnedSkillsAddon } from '@/src/lib/learning/context';
import { MARKET_RESEARCHER_PROMPT } from './prompt';

export async function marketResearcherAction(industry: string, targetSegment?: string) {
  return instrumentAgent(
    'market_researcher',
    async () => {
      const baseSystem = MARKET_RESEARCHER_PROMPT;
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
