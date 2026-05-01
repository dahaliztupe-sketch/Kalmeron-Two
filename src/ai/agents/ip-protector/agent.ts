// @ts-nocheck
/**
 * IP Protection Expert — خبير حماية الملكية الفكرية
 * Department: القانونية | Reports to: CLO
 */
import { generateText } from 'ai';
import { MODELS } from '@/src/lib/gemini';
import { instrumentAgent } from '@/src/lib/observability/agent-instrumentation';
import { getCurrentLearnedSkillsAddon } from '@/src/lib/learning/context';

const SYSTEM_PROMPT = `أنت خبير حماية الملكية الفكرية للشركات الناشئة في مصر والمنطقة العربية.
تخصصاتك:
- تسجيل العلامات التجارية (مكتب تسجيل العلامات التجارية - مصر، WIPO دولياً)
- حماية الاختراعات وبراءات الاختراع (ITRADA مصر)
- حقوق المؤلف للبرامج والمحتوى الرقمي
- أسرار الأعمال التجارية (Trade Secrets) وكيفية حمايتها
- Domain Names وDigital IP
- IP Due Diligence لجولات الاستثمار
- تراخيص الاستخدام (IP Licensing)

البذرة المعرفية - IP في مصر:
- تسجيل العلامة التجارية: 6-18 شهرًا، رسوم 3,000-10,000 جنيه
- حقوق المؤلف: تنشأ تلقائيًا بالإنشاء، لكن التسجيل يحمي في النزاعات
- براءات الاختراع المصرية: تصدر من مكتب براءات الاختراع بالهيئة المصرية
- قانون حماية الملكية الفكرية: القانون 82 لسنة 2002

⚠️ تنبيه: هذا إرشاد وليس استشارة قانونية. استشر محاميًا لأي إجراءات رسمية.`;

export async function ipProtectorAction(input: {
  task: 'trademark-search' | 'ip-strategy' | 'due-diligence' | 'licensing-advice' | 'trade-secret-protection';
  assetDescription: string;
  sector?: string;
  currentProtections?: string[];
  investmentStage?: string;
}) {
  return instrumentAgent('ip_protector', async () => {
    const learnedAddon = getCurrentLearnedSkillsAddon();
    const systemPrompt = learnedAddon ? `${SYSTEM_PROMPT}\n\n${learnedAddon}` : SYSTEM_PROMPT;

    const { text } = await generateText({
      model: MODELS.PRO,
      system: systemPrompt,
      prompt: `المهمة: ${input.task}
الأصل المراد حمايته: ${input.assetDescription}
القطاع: ${input.sector || 'غير محدد'}
الحمايات الحالية: ${input.currentProtections?.join('، ') || 'لا توجد'}
مرحلة الاستثمار: ${input.investmentStage || 'غير محددة'}

قدّم استراتيجية حماية عملية مع الخطوات والتكاليف التقريبية.`,
    });

    return { strategy: text, agentId: 'ip-protector', task: input.task };
  }, { model: 'gemini-pro', input, toolsUsed: ['legal.ip'] });
}
