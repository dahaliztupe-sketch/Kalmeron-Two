/**
 * PlanGuard — دفاع متعدّد الطبقات ضد حقن الأوامر غير المباشر.
 *
 * يطبّق مبدأ "عزل السياق" (Context Isolation):
 *  1. يستخرج نية المستخدم الأصلية فقط من الرسائل التي يكتبها هو.
 *  2. يبني قائمة بيضاء (allow-list) للأدوات المسموح بها لتلك النية.
 *  3. عند كل محاولة استدعاء أداة، يتحقّق أنها ضمن القائمة وأن وسائطها
 *     لا تُسرّب نصوصاً نشأت من مصادر غير موثوقة (RAG/PDFs/الويب).
 *  4. يدمج فحوصات `prompt-guard.ts` (تطهير، عزل، فحص النية) كطبقة
 *     سفلى ثم يضيف فحص "اتساق التخطيط".
 *
 * مرجع نظري: ClawGuard + PlanGuard (دفاع وقت التشغيل + عزل السياق).
 */
import { sanitizeInput, isolateUserInput, validatePromptIntegrity } from './prompt-guard';

export type IntentTag =
  | 'idea_validation'
  | 'business_plan'
  | 'mistake_shield'
  | 'success_research'
  | 'opportunity_search'
  | 'cfo_analysis'
  | 'legal_review'
  | 'real_estate'
  | 'admin_op'
  | 'general_chat';

/**
 * كل نيّة لها قائمة بيضاء صريحة من الأدوات. أي محاولة لاستدعاء أداة
 * خارج هذه القائمة تُرفَض حتى لو طلبها النموذج.
 */
const TOOL_ALLOWLIST: Record<IntentTag, string[]> = {
  idea_validation:    ['rag.search', 'web.fetch'],
  business_plan:      ['rag.search', 'doc.compose'],
  mistake_shield:     ['rag.search'],
  success_research:   ['rag.search', 'web.fetch'],
  opportunity_search: ['rag.search', 'web.fetch'],
  cfo_analysis:       ['rag.search', 'finance.calc'],
  legal_review:       ['rag.search', 'legal.template'],
  real_estate:        ['rag.search', 'maps.lookup'],
  admin_op:           ['admin.users.list', 'admin.users.delete', 'admin.fleet.read'],
  general_chat:       ['rag.search'],
};

export interface PlanGuardDecision {
  allow: boolean;
  reason?: string;
  sanitizedInput: string;
  allowedTools: string[];
}

export interface ToolCallCheck {
  allow: boolean;
  reason?: string;
}

export interface UntrustedSource {
  origin: 'rag' | 'pdf' | 'web' | 'user_attachment';
  text: string;
}

/**
 * الفحص الأولي: يُستدعى قبل تمرير الرسالة للوكيل.
 * يطبّق التطهير + العزل + التحقق من النية وينتج قائمة الأدوات المسموح بها.
 */
export function gatekeep(
  userInput: string,
  systemPrompt: string,
  intent: IntentTag
): PlanGuardDecision {
  const cleaned = sanitizeInput(userInput);
  const integrityOk = validatePromptIntegrity(systemPrompt, cleaned);
  const allowedTools = TOOL_ALLOWLIST[intent] || [];

  if (!integrityOk) {
    return {
      allow: false,
      reason: 'الرسالة تحتوي على نمط يحاول تجاوز تعليمات النظام.',
      sanitizedInput: cleaned,
      allowedTools,
    };
  }

  return {
    allow: true,
    sanitizedInput: isolateUserInput(cleaned),
    allowedTools,
  };
}

/**
 * فحص استدعاء أداة بعينها قبل تنفيذها.
 *  - يرفض الأدوات خارج القائمة البيضاء.
 *  - يرفض إذا كانت الوسائط مأخوذة حرفياً من نص غير موثوق
 *    (مثل تعليمات داخل مستند PDF أو نتيجة RAG).
 */
export function checkToolCall(
  toolName: string,
  toolArgs: Record<string, unknown>,
  decision: PlanGuardDecision,
  untrusted: UntrustedSource[] = []
): ToolCallCheck {
  if (!decision.allowedTools.includes(toolName)) {
    return {
      allow: false,
      reason: `الأداة "${toolName}" خارج القائمة البيضاء لهذه النية.`,
    };
  }

  // كشف "الأمر المُهرَّب": إذا كانت قيمة وسيطة نصية تطابق جزءاً
  // كبيراً من نص غير موثوق فهذا مؤشّر على حقن غير مباشر.
  for (const [key, value] of Object.entries(toolArgs)) {
    if (typeof value !== 'string' || value.length < 30) continue;
    for (const src of untrusted) {
      if (src.text && src.text.includes(value.slice(0, 60))) {
        return {
          allow: false,
          reason: `الوسيطة "${key}" نشأت من مصدر غير موثوق (${src.origin}).`,
        };
      }
    }
  }

  return { allow: true };
}

/**
 * فحص اتساق التخطيط: عند انتهاء الوكيل من رسم خطة (سلسلة استدعاءات
 * أدوات)، نتأكد أن مجمل الخطة ضمن القائمة البيضاء قبل بدء التنفيذ.
 */
export function verifyPlan(plannedTools: string[], decision: PlanGuardDecision): ToolCallCheck {
  const violations = plannedTools.filter((t) => !decision.allowedTools.includes(t));
  if (violations.length) {
    return {
      allow: false,
      reason: `الخطة تتضمن أدوات غير مسموح بها: ${violations.join(', ')}.`,
    };
  }
  return { allow: true };
}
