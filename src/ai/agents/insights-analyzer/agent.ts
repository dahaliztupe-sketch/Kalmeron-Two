// @ts-nocheck
import { generateText } from 'ai';
import { MODELS } from '@/src/lib/gemini';
import { instrumentAgent } from '@/src/lib/observability/agent-instrumentation';
import { getCurrentLearnedSkillsAddon } from '@/src/lib/learning/context';

export async function analyzeInterviewResults(ideaDescription: string, results: unknown[]) {
  return instrumentAgent(
    'insights_analyzer',
    async () => {
      const baseSystem = `أنت محلل أبحاث سوق. مهمتك هي تحليل ردود الشخصيات الافتراضية على فكرة منتج ما، واستخلاص رؤى قابلة للتنفيذ. ركز على: الاهتمامات المشتركة، الاعتراضات الرئيسية، الشرائح الأكثر تقبلاً، وتوصيات لتحسين الفكرة.`;
      const learnedAddon = getCurrentLearnedSkillsAddon();
      const { text } = await generateText({
        model: MODELS.PRO,
        system: learnedAddon ? `${baseSystem}\n\n${learnedAddon}` : baseSystem,
        prompt: `فكرة المنتج: "${ideaDescription}"
    ردود الشخصيات الافتراضية: ${JSON.stringify(results)}
    
    قم بتقديم تحليل مفصل يتضمن:
    1. ملخص الانطباعات العامة.
    2. قائمة الاعتراضات المتكررة.
    3. ما الذي أعجب الشخصيات أكثر.
    4. 3-5 توصيات ملموسة لتحسين الفكرة.`,
      });

      return text;
    },
    { model: 'gemini-pro', input: { ideaDescription, resultsCount: results?.length }, toolsUsed: ['generate.text'] }
  );
}
