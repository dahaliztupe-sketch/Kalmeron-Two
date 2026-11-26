/**
 * Brief intake: a fixed set of clarifying questions asked before any role runs.
 * Deterministic on purpose (no model call, no cost). Answers are founder-provided
 * facts and enter every role prompt as data, never as instructions.
 */
import { z } from "zod";

export const INTAKE_QUESTIONS = [
  { key: "stage", required: true, kind: "choice", labelAr: "أين وصلت الآن؟", options: [["idea", "فكرة فقط"], ["prototype", "نموذج أولي أو تجربة"], ["customers", "عندي عملاء أو مبيعات أولى"]] },
  { key: "team", required: true, kind: "choice", labelAr: "كم شخصاً يعمل على المشروع؟", options: [["solo", "أنا وحدي"], ["small", "٢ إلى ٣"], ["team", "٤ أو أكثر"]] },
  { key: "hoursPerWeek", required: false, kind: "choice", labelAr: "كم ساعة أسبوعياً تستطيع تخصيصها؟", options: [["<10", "أقل من ١٠"], ["10-25", "١٠ إلى ٢٥"], [">25", "أكثر من ٢٥"]] },
  { key: "market", required: false, kind: "text", labelAr: "أين سيكون عملاؤك الأوائل؟ (مدينة أو منطقة)" },
  { key: "audience", required: false, kind: "text", labelAr: "هل لديك جمهور أو معارف من العملاء المحتملين؟ صفهم باختصار." },
  { key: "limits", required: false, kind: "text", labelAr: "أي شيء لن تفعله أو لا تستطيعه؟ (مثل: لا إعلانات مدفوعة، لا ظهور بالوجه)" },
] as const;

export const IntakeSchema = z
  .object({
    stage: z.enum(["idea", "prototype", "customers"]).optional(),
    team: z.enum(["solo", "small", "team"]).optional(),
    hoursPerWeek: z.enum(["<10", "10-25", ">25"]).optional(),
    market: z.string().trim().max(200).optional(),
    audience: z.string().trim().max(300).optional(),
    limits: z.string().trim().max(300).optional(),
  })
  .strict();
export type Intake = z.infer<typeof IntakeSchema>;

export function missingRequired(i: Intake): string[] {
  return INTAKE_QUESTIONS.filter((q) => q.required && !i[q.key as keyof Intake]).map((q) => q.key);
}
export const intakeComplete = (i: Intake) => missingRequired(i).length === 0;

const LABEL: Record<string, Record<string, string>> = Object.fromEntries(
  INTAKE_QUESTIONS.filter((q) => q.kind === "choice").map((q) => [q.key, Object.fromEntries((q as { options: readonly (readonly [string, string])[] }).options.map(([v, l]) => [v, l]))]),
);

/** Lines for the prompt and the export. Unanswered optional questions say so, so roles label guesses as assumptions. */
export function intakeLines(i: Intake): string[] {
  return INTAKE_QUESTIONS.map((q) => {
    const v = i[q.key as keyof Intake];
    const shown = v ? (LABEL[q.key]?.[v] ?? v) : "لم يُجب (لا تخمّن؛ اكتب افتراضاً بوسم assumption)";
    return `${q.labelAr} ${shown}`;
  });
}
