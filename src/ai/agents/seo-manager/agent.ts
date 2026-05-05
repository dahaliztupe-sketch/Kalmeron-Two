/**
 * SEO Manager — مدير تحسين محركات البحث
 * Department: التسويق | Reports to: CMO
 */
import { generateText } from 'ai';
import { MODELS } from '@/src/lib/gemini';
import { instrumentAgent } from '@/src/lib/observability/agent-instrumentation';
import { getCurrentLearnedSkillsAddon } from '@/src/lib/learning/context';
import { SEO_MANAGER_PROMPT } from './prompt';
const SYSTEM_PROMPT = SEO_MANAGER_PROMPT;


export async function seoManagerAction(input: {
  task: 'keyword-research' | 'on-page-audit' | 'content-brief' | 'competitor-analysis' | 'strategy';
  target?: string;
  currentMetrics?: Record<string, unknown>;
  industry?: string;
  keywords?: string[];
}) {
  return instrumentAgent('seo_manager', async () => {
    const learnedAddon = getCurrentLearnedSkillsAddon();
    const systemPrompt = learnedAddon ? `${SYSTEM_PROMPT}\n\n${learnedAddon}` : SYSTEM_PROMPT;

    const taskMap: Record<string, string> = {
      'keyword-research': 'ابحث عن كلمات مفتاحية قيّمة وقليلة المنافسة',
      'on-page-audit': 'حلّل SEO الصفحة وقدّم توصيات تحسين محددة',
      'content-brief': 'اكتب موجزًا تفصيليًا لمحتوى محسّن لـ SEO',
      'competitor-analysis': 'حلّل منافسين SEO واكتشف الفجوات',
      'strategy': 'ضع استراتيجية SEO شاملة لـ 6-12 شهرًا',
    };

    const { text } = await generateText({
      model: MODELS.FLASH,
      system: systemPrompt,
      prompt: `${taskMap[input.task]}
الهدف: ${input.target || 'غير محدد'}
القطاع: ${input.industry || 'غير محدد'}
الكلمات الحالية: ${input.keywords?.join('، ') || 'غير محددة'}
البيانات الحالية: ${JSON.stringify(input.currentMetrics || {}, null, 2)}`,
    });

    return { analysis: text, agentId: 'seo-manager', task: input.task };
  }, { model: 'gemini-flash', input, toolsUsed: ['marketing.seo'] });
}
