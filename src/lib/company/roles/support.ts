import { z } from "zod";
import { Basis } from "@/src/lib/plan/validated-plan";
import { COMMON_RULES, type Issue, type RoleSpec } from "./spec";
import { knowledgePrompt } from "../knowledge/types";
import { SUPPORT_KNOWLEDGE } from "../knowledge/support";
import { proseGuards } from "./guards";

const S = (n: number) => z.string().min(1).max(n);

export const SupportPlanSchema = z.object({
  channels: z.array(z.object({ name: S(40), why: S(200) })).min(1).max(4),
  knowledgeBaseTopics: z.array(S(100)).min(1).max(8),
  faq: z.array(z.object({ question: S(200), answerDraft: S(500), basis: Basis })).min(1).max(8),
  replyDrafts: z.array(z.object({ situation: S(150), draft: S(600) })).max(5),
  escalation: z.array(z.object({ trigger: S(150), to: z.enum(["founder", "legal", "engineering", "none"]) })).min(1).max(6),
  metrics: z.array(z.object({ name: S(60), definition: S(200) })).max(4),
  feedbackToProduct: z.array(S(200)).max(4),
  policyGaps: z.array(S(200)).max(6),
  privacyNote: S(300),
  handoff: z.array(z.object({ role: S(40), reason: S(200) })).max(4).default([]),
});
export type SupportPlan = z.infer<typeof SupportPlanSchema>;

const ACTS = /(سأرسل الرد|سنرسل|تم الرد|سأرد على العميل|سأرسل رسالة|سأعيد المبلغ|سأحوّل)/;
const CARD = /(رقم البطاقة|رقم بطاقتك|CVV|كلمة المرور|كلمة السر|الرقم السري|\bPIN\b)/i;
const REFUND = /(استرداد|رد المبلغ|refund|ضمان)/i;
const SLA = /(خلال\s*\d+\s*(دقيقة|دقائق|ساعة|ساعات|يوم|أيام)|\d+\s*(دقيقة|دقائق|ساعة)\s*فقط|فوراً|على مدار الساعة|24\/7)/;

export function supportChecks(out: SupportPlan, _brief: unknown): Issue[] {
  const texts = [...out.faq.map((f) => f.answerDraft), ...out.replyDrafts.map((r) => r.draft)];
  const prose = [...texts, ...out.knowledgeBaseTopics, ...out.feedbackToProduct, out.privacyNote, ...out.channels.map((c) => c.why)];
  const issues = proseGuards(prose, ACTS, "الدور يعدّ مسودات فقط: لا يرسل ولا يرد ولا يرد مبالغ. أعد الصياغة كمسودة للمؤسس.");
  if (texts.some((t) => CARD.test(t))) issues.push({ level: "error", code: "asks_sensitive_credentials", message: "مسودة ترد تطلب من العميل بيانات بطاقة أو كلمة مرور." });
  if (texts.some((t) => REFUND.test(t)) && out.policyGaps.length === 0) issues.push({ level: "error", code: "refund_without_policy_gap", message: "مسودة تذكر الاسترداد أو الضمان، وسياسة الاسترداد لم يقرّها المؤسس. أدرجها في policyGaps ولا تعد بها." });
  if (texts.some((t) => SLA.test(t))) issues.push({ level: "warn", code: "response_time_promise", message: "مسودة تعد بزمن رد. لا تعد بمدة لم يقرّها المؤسس." });
  if (out.faq.some((f) => f.basis === "needs_check") && out.policyGaps.length === 0) issues.push({ level: "warn", code: "needs_check_without_gap", message: "إجابات تحتاج تحققاً بلا بند في policyGaps." });
  if (!/(محامي|مستشار|مختص)/.test(out.privacyNote)) issues.push({ level: "warn", code: "missing_consult_line", message: "أضف سطر مراجعة قانونية لتخزين بيانات العملاء ومراسلاتهم." });
  return issues;
}

export const SUPPORT_ROLE: RoleSpec<SupportPlan> = {
  id: "support",
  titleAr: "مسؤول دعم العملاء",
  mission: "قاعدة معرفة صغيرة ومسودات ردود وقواعد تصعيد. مسودات فقط ولا إرسال.",
  outOfScope: ["الرد على عملاء فعليين أو إرسال رسائل", "إعادة أموال أو تعديل اشتراكات", "اختراع سياسات استرداد أو ضمان أو أزمنة رد", "طلب بيانات بطاقة أو كلمات مرور"],
  systemPrompt: `أنت مسؤول دعم عملاء لشركة ناشئة صغيرة. تعدّ مسودات يقرؤها المؤسس قبل أي استخدام. لا ترسل ولا ترد.
${COMMON_RULES}
${knowledgePrompt(SUPPORT_KNOWLEDGE, new Date())}
تفاصيل الدور:
- قنوات قليلة تناسب حجم الفريق.
- أسئلة شائعة ومسودات ردود بلهجة محترمة وبلا وعود ولا أزمنة رد ولا استرداد ولا ضمان؛ ما لم يقرّه المؤسس ضعه في policyGaps.
- لا تطلب بيانات بطاقة أو كلمة مرور من العميل.
- قواعد تصعيد واضحة: founder أو legal أو engineering.
- privacyNote: تخزين مراسلات العملاء وبياناتهم يحتاج مراجعة محامٍ.`,
  outputShape: `{"channels":[{"name":string,"why":string}],"knowledgeBaseTopics":[string],"faq":[{"question":string,"answerDraft":string,"basis":"assumption"|"user_fact"|"needs_check"}],"replyDrafts":[{"situation":string,"draft":string}],"escalation":[{"trigger":string,"to":"founder"|"legal"|"engineering"|"none"}],"metrics":[{"name":string,"definition":string}],"feedbackToProduct":[string],"policyGaps":[string],"privacyNote":string,"handoff":[{"role":string,"reason":string}]}`,
  outputSchema: SupportPlanSchema,
  checks: (out, brief) => supportChecks(out, brief),
};
