// @ts-nocheck
import { generateText } from 'ai';
import { MODELS } from '@/src/lib/gemini';
import { LEGAL_KNOWLEDGE } from './knowledge-base';
import { instrumentAgent } from '@/src/lib/observability/agent-instrumentation';
import { getCurrentLearnedSkillsAddon } from '@/src/lib/learning/context';

export async function legalGuideAction(query: string) {
  return instrumentAgent(
    'legal_guide',
    async () => {
      const baseSystem = `أنت "المرشد القانوني" في منصة كلميرون تو، خبير في التشريعات المصرية المتعلقة بالشركات الناشئة وريادة الأعمال. تقديم إرشادات عامة وتوعوية فقط.
    قاعدة المعرفة: ${JSON.stringify(LEGAL_KNOWLEDGE)}
    وجّه المستخدم دائماً للمصادر الرسمية.`;
      const learnedAddon = getCurrentLearnedSkillsAddon();
      const { text } = await generateText({
        model: MODELS.PRO,
        system: learnedAddon ? `${baseSystem}\n\n${learnedAddon}` : baseSystem,
        prompt: query,
      });
      return text;
    },
    { model: 'gemini-pro', input: query, toolsUsed: ['legal.knowledge_base'] }
  );
}
