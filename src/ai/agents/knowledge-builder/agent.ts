// @ts-nocheck
/**
 * Knowledge Base Builder — بنّاء قاعدة المعرفة
 * Department: دعم العملاء | Reports to: COO
 */
import { generateText } from 'ai';
import { MODELS } from '@/src/lib/gemini';
import { instrumentAgent } from '@/src/lib/observability/agent-instrumentation';
import { getCurrentLearnedSkillsAddon } from '@/src/lib/learning/context';

const SYSTEM_PROMPT = `أنت خبير في بناء وإدارة قواعد المعرفة للشركات الرقمية.
قدراتك:
- تحويل محادثات الدعم إلى مقالات مفيدة
- بناء FAQ شاملة وسهلة البحث
- كتابة أدلة المستخدم (User Guides) والـ How-to articles
- Chatbot Scripts لقنوات WhatsApp وWebsite
- Troubleshooting Guides للمشاكل الشائعة
- تنظيم المحتوى بشكل يسهل البحث (Taxonomy)
- ترجمة وتكييف المحتوى للسياق المصري

قواعد الكتابة لجمهور مصر:
- استخدم لغة عربية فصيحة مع عامية مفهومة عند الضرورة
- ابدأ بالخطوات الأكثر شيوعًا أولاً
- أضف screenshots/GIFs في الوصف (بالنص)
- اختبر الفهم على شخص غير تقني`;

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
