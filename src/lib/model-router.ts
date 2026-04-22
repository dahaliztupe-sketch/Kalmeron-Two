// @ts-nocheck
/**
 * Hybrid Model Router — Kalmeron Two
 * --------------------------------------------------------------
 * يطبّق استراتيجية النماذج الهجينة الموثّقة في خطة الإصلاح.
 * نقاط التبديل المستقبلية موثّقة في `MODEL_ALIASES`؛ بمجرّد توفر
 * النماذج المنخفضة التكلفة (Gemma 4 / DeepSeek V4 / GLM-5.1) كنقاط
 * نهاية، يكفي تغيير القيمة هنا دون لمس باقي الكود.
 */
import { google } from '@ai-sdk/google';

export type TaskTier =
  | 'trivial'   // تصنيف، تحيّات، استخراج كلمات مفتاحية
  | 'simple'    // تلخيص قصير، إعادة صياغة
  | 'medium'    // محادثة، تحليل عام
  | 'complex'   // تحليل فكرة، خطة عمل، تقرير سوق
  | 'critical'; // تحليل مالي/قانوني، قرارات استراتيجية

export interface RoutedModel {
  id: string;
  tier: TaskTier;
  approxCostPerMTokens: { input: number; output: number };
  model: ReturnType<typeof google>;
  rationale: string;
}

// أسماء نقاط النهاية الفعلية في @ai-sdk/google.
// نسمّي كل مستوى بشكل مستقل حتى نستبدله بسهولة لاحقاً.
const MODEL_ALIASES: Record<TaskTier, string> = {
  trivial:  'gemini-2.5-flash-lite',
  simple:   'gemini-2.5-flash-lite',
  medium:   'gemini-2.5-flash',
  complex:  'gemini-2.5-flash',
  critical: 'gemini-2.5-pro',
};

const COST_TABLE: Record<TaskTier, { input: number; output: number }> = {
  trivial:  { input: 0.10, output: 0.40 },
  simple:   { input: 0.10, output: 0.40 },
  medium:   { input: 0.30, output: 2.50 },
  complex:  { input: 0.30, output: 2.50 },
  critical: { input: 1.25, output: 10.00 },
};

const RATIONALE: Record<TaskTier, string> = {
  trivial:  'الأرخص والأسرع، مناسب للتصنيف والمهام الذرّية.',
  simple:   'تلخيص وإعادة صياغة بأقل تكلفة ممكنة.',
  medium:   'توازن بين الجودة والسعر للمحادثة العامة.',
  complex:  'سياق طويل وقدرات تحليلية كافية لخطط العمل.',
  critical: 'أعلى أداء للتحليلات القانونية/المالية والقرارات المصيرية.',
};

/**
 * توجيه ضمني للمهمة بحسب محتوى السؤال وطوله.
 * مستوحى من إطار SAGE (Service Agent Graph-guided Evaluation).
 */
export function classifyTaskTier(task: string): TaskTier {
  const t = (task || '').toLowerCase();
  const len = t.length;

  // إشارات حرجة (مالي/قانوني/استراتيجي)
  if (/قانون|عقد|تأسيس|ضرائب|تقييم|investor|valuation|legal|tax|funding round|due diligence/.test(t)) {
    return 'critical';
  }
  // إشارات معقدة (تحليل/خطة)
  if (/خطة عمل|business plan|تحليل سوق|market analysis|نموذج مالي|financial model|architecture|روادمب/.test(t) || len > 800) {
    return 'complex';
  }
  // إشارات بسيطة (تلخيص/إعادة صياغة)
  if (/لخص|تلخيص|أعد صياغة|paraphrase|summari[sz]e|rewrite/.test(t)) {
    return 'simple';
  }
  // إشارات تافهة (تصنيف/تحية)
  if (len < 40 || /^(hi|hello|مرحبا|اهلا|السلام عليكم)/.test(t)) {
    return 'trivial';
  }
  return 'medium';
}

/**
 * يُرجِع نموذج AI-SDK جاهز للاستخدام مع بيانات وصفية للتوجيه والتسعير.
 */
export function routeModel(task: string, override?: TaskTier): RoutedModel {
  const tier = override ?? classifyTaskTier(task);
  const id = MODEL_ALIASES[tier];
  return {
    id,
    tier,
    approxCostPerMTokens: COST_TABLE[tier],
    model: google(id),
    rationale: RATIONALE[tier],
  };
}

/**
 * تقدير التكلفة بالدولار لاستدعاء معيّن (مفيد لميزانية يومية).
 */
export function estimateCostUsd(tier: TaskTier, inputTokens: number, outputTokens: number): number {
  const c = COST_TABLE[tier];
  return (inputTokens / 1_000_000) * c.input + (outputTokens / 1_000_000) * c.output;
}

// إبقاء التوافق مع الواجهة القديمة المستخدمة في ملفات أخرى من القاعدة
export type TaskComplexity = 'simple' | 'medium' | 'complex';
export function classifyTaskComplexity(task: string): TaskComplexity {
  const tier = classifyTaskTier(task);
  if (tier === 'trivial' || tier === 'simple') return 'simple';
  if (tier === 'medium') return 'medium';
  return 'complex';
}
export function selectModel(complexity: TaskComplexity) {
  const map: Record<TaskComplexity, TaskTier> = { simple: 'simple', medium: 'medium', complex: 'complex' };
  return routeModel('', map[complexity]).model;
}
