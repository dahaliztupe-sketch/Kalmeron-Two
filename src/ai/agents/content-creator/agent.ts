// @ts-nocheck
/**
 * Content Creator — منشئ المحتوى الرقمي
 * Department: التسويق | Reports to: CMO
 */
import { generateText } from 'ai';
import { MODELS } from '@/src/lib/gemini';
import { instrumentAgent } from '@/src/lib/observability/agent-instrumentation';
import { getCurrentLearnedSkillsAddon } from '@/src/lib/learning/context';
import { CONTENT_CREATOR_PROMPT } from './prompt';
const SYSTEM_PROMPT = CONTENT_CREATOR_PROMPT;


export async function contentCreatorAction(input: {
  contentType: 'social-post' | 'blog-article' | 'video-script' | 'email' | 'ad-copy' | 'case-study' | 'thread';
  topic: string;
  brand?: string;
  tone?: 'formal' | 'casual' | 'inspiring' | 'educational' | 'promotional';
  platform?: string;
  wordCount?: number;
  keyPoints?: string[];
}) {
  return instrumentAgent('content_creator', async () => {
    const learnedAddon = getCurrentLearnedSkillsAddon();
    const systemPrompt = learnedAddon ? `${SYSTEM_PROMPT}\n\n${learnedAddon}` : SYSTEM_PROMPT;

    const { text } = await generateText({
      model: MODELS.FLASH,
      system: systemPrompt,
      prompt: `اكتب ${input.contentType} عن: ${input.topic}
العلامة التجارية: ${input.brand || 'كلميرون'}
المنصة: ${input.platform || 'عامة'}
النبرة: ${input.tone || 'inspiring'}
الطول المطلوب: ${input.wordCount ? input.wordCount + ' كلمة' : 'مناسب للمنصة'}
النقاط الرئيسية: ${input.keyPoints?.join('، ') || 'اختار ما يناسب'}

قدّم المحتوى جاهزًا للنشر مع أي hashtags أو CTAs مناسبة.`,
    });

    return { content: text, agentId: 'content-creator', type: input.contentType };
  }, { model: 'gemini-flash', input, toolsUsed: ['marketing.content'] });
}
