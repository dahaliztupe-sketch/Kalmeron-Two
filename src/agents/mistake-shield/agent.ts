// @ts-nocheck
import { generateText } from 'ai';
import { MODELS } from '@/src/lib/gemini';
import { MISTAKE_SHIELD_SYSTEM_PROMPT } from './prompt';
import { searchKnowledge } from '@/src/lib/rag';

export const COMMON_MISTAKES = [
  { id: 'mixing-finances', title: 'خلط الحسابات الشخصية بحسابات الشركة', stage: 'launch', category: 'مالي' },
  { id: 'no-founders-agreement', title: 'عدم توثيق اتفاقية المؤسسين', stage: 'idea', category: 'قانوني' },
  { id: 'no-trademark', title: 'إهمال تسجيل العلامة التجارية', stage: 'launch', category: 'قانوني' },
  { id: 'premature-scaling', title: 'التوسع المبكر قبل إثبات نموذج العمل', stage: 'growth', category: 'استراتيجي' },
  { id: 'bad-cash-flow', title: 'سوء إدارة التدفق النقدي', stage: 'launch', category: 'مالي' },
  { id: 'neglecting-licenses', title: 'إهمال التراخيص الحكومية', stage: 'launch', category: 'قانوني' },
  { id: 'bad-cofounder-choice', title: 'اختيار شريك مؤسس غير مناسب', stage: 'idea', category: 'إداري' },
];

/**
 * Proactive Risk Mitigation Agent using Gemini 3 Flash & RAG.
 */
export async function getProactiveWarnings(userStage: string, recentActivity?: string) {
  // RAG: Search for relevant market failures or specific sector risks
  const marketKnowledge = await searchKnowledge(recentActivity || userStage, 'mistake');

  const prompt = `
المستخدم حاليًا في مرحلة: "${userStage}".
نشاطه الأخير: ${recentActivity || 'لا يوجد نشاط محدد'}.

المعلومات المتاحة من قاعدة المعرفة:
${marketKnowledge}

بناءً على هذه المعلومات، ولد تحذيراً استباقياً يمنع الكارثة قبل وقوعها.
`;

  const result = await generateText({
    model: MODELS.FLASH,
    system: MISTAKE_SHIELD_SYSTEM_PROMPT,
    prompt: prompt,
  });

  return result.text;
}

export async function getMistakeDetails(mistakeId: string) {
  const prompt = `
قدم شرحًا مفصلاً للخطأ التالي: "${mistakeId}".
استخدم أحدث البيانات (2026) حول التحديات القانونية والمالية في مصر.
`;

  const result = await generateText({
    model: MODELS.FLASH,
    system: MISTAKE_SHIELD_SYSTEM_PROMPT,
    prompt: prompt,
  });

  return result.text;
}
