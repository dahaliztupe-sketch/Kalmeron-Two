/**
 * Consolidated plan export (Markdown). Pure function: plan + intake + role states in,
 * text out. Every section carries its review status; nothing here is verified advice.
 */
import type { ValidatedPlan } from "@/src/lib/plan/validated-plan";
import { intakeLines, type Intake } from "@/src/lib/company/intake";
import { ROLE_LABELS_AR, type CompanyState } from "@/src/lib/company/orchestrator";

function render(v: unknown, depth = 0): string[] {
  const pad = "  ".repeat(depth);
  if (v === null || v === undefined) return [];
  if (Array.isArray(v)) return v.flatMap((x) => (typeof x === "object" && x !== null ? [`${pad}-`, ...render(x, depth + 1)] : [`${pad}- ${String(x)}`]));
  if (typeof v === "object") {
    return Object.entries(v as Record<string, unknown>).flatMap(([k, x]) =>
      typeof x === "object" && x !== null ? [`${pad}- ${k}:`, ...render(x, depth + 1)] : [`${pad}- ${k}: ${String(x)}`],
    );
  }
  return [`${pad}${String(v)}`];
}

const STATUS: Record<string, string> = {
  approved: "اعتمدها المؤسس (علامة مراجعة محلية، ليست تحققاً)",
  done: "مسودة آلية لم تُراجَع",
  idle: "لم تُشغَّل",
  running: "لم تكتمل",
  failed: "فشل توليدها",
};

export function consolidatedMarkdown(plan: ValidatedPlan, intake: Intake, state: CompanyState, order: string[], now = new Date()): string {
  const L: string[] = [];
  L.push(`# خطة تأسيس: ${plan.idea}`, "");
  L.push(`> أُعدّت بمساعدة الذكاء الاصطناعي بتاريخ ${now.toISOString().slice(0, 10)}. كل ما فيها مسودات وافتراضات غير موثقة بمصادر خارجية ما لم يُذكر مصدر. ليست استشارة قانونية أو ضريبية أو مالية. المحتوى القانوني والضريبي والمالي يراجعه محامٍ أو محاسب قبل الاعتماد عليه. لا شيء هنا نُفّذ أو أُرسل لأحد.`, "");
  L.push("## ملخص التحقق", "", `- الحكم: ${plan.verdict}`, `- السبب: ${plan.verdictReason}`, `- العميل المستهدف: ${plan.targetCustomer}`);
  if (plan.competitors.length) L.push(`- المنافسون: ${plan.competitors.map((c) => c.name).join("، ")}`);
  L.push("", "## إجابات المؤسس", "", ...intakeLines(intake).map((t) => `- ${t}`), "");
  const missing = order.filter((r) => state[r]?.status !== "approved" || state[r]?.stale);
  if (missing.length) L.push(`> تنبيه: أقسام غير معتمدة أو قديمة: ${missing.map((r) => ROLE_LABELS_AR[r] ?? r).join("، ")}.`, "");
  for (const r of order) {
    const st = state[r];
    L.push(`## ${ROLE_LABELS_AR[r] ?? r}`, "");
    const status = st ? STATUS[st.status] ?? st.status : STATUS.idle;
    L.push(`الحالة: ${status}${st?.stale ? " | قديمة: تغيّر دور سابق بعد إعدادها، أعد توليدها" : ""}`, "");
    if (st?.output != null && st.status !== "failed") {
      if (st.warnings.length) L.push("ملاحظات الفحص الآلي:", ...st.warnings.map((w) => `- ${w}`), "");
      L.push(...render(st.output), "");
    }
  }
  return L.join("\n");
}
