/**
 * Knowledge Base Builder — بنّاء قاعدة المعرفة
 * Department: دعم العملاء | Reports to: COO
 */
import { generateText } from 'ai';
import { MODELS } from '@/src/lib/gemini';
import { instrumentAgent } from '@/src/lib/observability/agent-instrumentation';
import { getCurrentLearnedSkillsAddon } from '@/src/lib/learning/context';
import { KNOWLEDGE_BUILDER_PROMPT } from './prompt';
const SYSTEM_PROMPT = KNOWLEDGE_BUILDER_PROMPT;


export async function knowledgeBuilderAction(input: {
  task: 'write-faq' | 'create-guide' | 'convert-ticket' | 'chatbot-script' | 'troubleshooting';
  topic: string;
  sourceContent?: string;
  audience?: 'beginner' | 'intermediate' | 'advanced';
  format?: 'article' | 'step-by-step' | 'faq' | 'video-script';
}) {
  return instrumentAgent('knowledge_builder', async () => {
    const learnedAddon = getCurrentLearnedSkillsAddon();
    const systemPrompt = learnedAddon ? `${SYSTEM_PROMPT}\n\n${learnedAddon}` : SYSTEM_PROMPT;

    const { text } = await generateText({
      model: MODELS.FLASH,
      system: systemPrompt,
      prompt: `المهمة: ${input.task}
الموضوع: ${input.topic}
المستوى: ${input.audience || 'beginner'}
التنسيق: ${input.format || 'article'}
المحتوى المصدر: ${input.sourceContent || 'اكتب من صفر'}`,
    });

    return { content: text, agentId: 'knowledge-builder', task: input.task };
  }, { model: 'gemini-flash', input, toolsUsed: ['support.knowledge'] });
}
