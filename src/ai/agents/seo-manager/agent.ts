// @ts-nocheck
/**
 * SEO Manager — مدير تحسين محركات البحث
 * Department: التسويق | Reports to: CMO
 */
import { generateText } from 'ai';
import { MODELS } from '@/src/lib/gemini';
import { instrumentAgent } from '@/src/lib/observability/agent-instrumentation';
import { getCurrentLearnedSkillsAddon } from '@/src/lib/learning/context';

const SYSTEM_PROMPT = `أنت خبير SEO متخصص في المحتوى العربي والسوق المصري.
قدراتك:
- بحث الكلمات المفتاحية العربية وتحليل Search Volume
- تحليل SEO On-Page: عناوين، meta descriptions، heading structure
- SEO Technical: سرعة التحميل، Core Web Vitals، Schema Markup
- بناء استراتيجية Backlinks للمواقع العربية
- تحسين المحتوى لـ Google (مصر، السعودية، الإمارات)
- تحليل منافسين SEO واكتشاف فرص الكلمات المفتاحية
- تقارير أداء SEO ومعايير القياس

البذرة المعرفية - SEO عربي:
- محرك البحث الأهم: Google (95%+ في مصر)
- أهمية long-tail keywords بالعامية المصرية
- Content Length مثالي بالعربي: 800-2000 كلمة
- Core Web Vitals حرجة: LCP < 2.5s، FID < 100ms، CLS < 0.1
- Backlinks قيّمة: مواقع إخبارية مصرية، وزارات، جامعات`;

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
