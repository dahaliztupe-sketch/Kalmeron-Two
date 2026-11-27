"use client";
import type { ReactNode } from "react";

const BASIS_AR: Record<string, string> = { assumption: "افتراض", user_fact: "من المستخدم", needs_check: "يحتاج تحقق" };

const KEY_AR: Record<string, string> = {
  answer: "الرد", basis: "الأساس", consentBasis: "أساس الموافقة", discoveryQuestions: "أسئلة الاكتشاف", exitCriteria: "معيار الخروج",
  followUp: "المتابعة", group: "المجموعة", handoff: "يُحال إلى دور آخر", howToReach: "طريقة الوصول", idealCustomer: "العميل المثالي",
  metrics: "المقاييس", name: "الاسم", objection: "الاعتراض", objections: "الاعتراضات", outreachDrafts: "مسودات الرسائل",
  prospectGroups: "مجموعات الوصول", reason: "السبب", role: "الدور", stages: "مراحل الصفقة", target: "الهدف", text: "النص",
  assumptionsSummary: "ملخص الافتراضات", breakEven: "نقطة التعادل", collectionNote: "ملاحظة التحصيل", endingCashEgp: "النقد في النهاية (جنيه)",
  fixedCosts: "التكاليف الثابتة", fixedCostsEgp: "التكاليف الثابتة (جنيه)", month: "الشهر", monthlyEgp: "شهرياً (جنيه)", months: "الأشهر",
  netCashEgp: "صافي النقد (جنيه)", note: "ملاحظة", openingCash: "النقد الافتتاحي", pricePerUnit: "سعر الوحدة", revenueEgp: "الإيراد (جنيه)",
  revenuePerMonthEgp: "الإيراد الشهري (جنيه)", risks: "المخاطر", taxNotes: "ملاحظات ضريبية", units: "الوحدات", unitsPerMonth: "وحدات شهرياً",
  variableCostPerUnit: "التكلفة المتغيرة للوحدة", variableCostsEgp: "التكاليف المتغيرة (جنيه)",
  buildChecklist: "قائمة البناء", coreProblem: "المشكلة الأساسية", costTiers: "مستويات التكلفة", doneWhen: "يكتمل عندما", layer: "الطبقة",
  learningGoal: "هدف التعلم", monthlyUsd: "شهرياً (دولار)", must: "ضروري", mvpScope: "نطاق المنتج الأولي", should: "مستحسن", suggestion: "الاقتراح",
  tasks: "المهام", techStack: "التقنيات", tier: "المستوى", tool: "الأداة", week: "الأسبوع", wont: "خارج النطاق الآن",
  authority: "الجهة", consultProfessional: "استشر مختصاً", disclaimer: "تنبيه", documents: "المستندات", entityOptions: "أشكال الشركة",
  feeEgp: "الرسوم (جنيه)", fitReason: "سبب الملاءمة", needsLicenceCheck: "يحتاج تحقق من الترخيص", order: "الترتيب", sourceNote: "ملاحظة المصدر",
  sourceStatus: "حالة المصدر", steps: "الخطوات", title: "العنوان", type: "النوع",
  complianceNote: "ملاحظة الامتثال", engagement: "نوع التعاقد", hiringSteps: "خطوات التوظيف", monthlyCostEgp: "التكلفة الشهرية (جنيه)",
  onboardingChecklist: "قائمة الاستقبال", roles: "الأدوار", startWeek: "أسبوع البدء", step: "الخطوة", teamPlanned: "الفريق المخطط", value: "القيمة", why: "السبب",
};

function Val({ v }: { v: unknown }): ReactNode {
  if (v === null || v === undefined || v === "") return <span className="text-neutral-400">-</span>;
  if (typeof v === "string") return <span>{BASIS_AR[v] ?? v}</span>;
  if (typeof v === "number" || typeof v === "boolean") return <span>{String(v)}</span>;
  if (Array.isArray(v)) {
    if (v.length === 0) return <span className="text-neutral-400">-</span>;
    return (
      <ul className="list-disc ps-5 space-y-1">
        {v.map((x, i) => (
          <li key={i}>
            <Val v={x} />
          </li>
        ))}
      </ul>
    );
  }
  if (typeof v === "object") {
    return (
      <dl className="space-y-1">
        {Object.entries(v as Record<string, unknown>).map(([k, x]) => (
          <div key={k}>
            <dt className="inline text-xs text-neutral-400">{KEY_AR[k] ?? k}: </dt>
            <dd className="inline"><Val v={x} /></dd>
          </div>
        ))}
      </dl>
    );
  }
  return null;
}

/** Generic read-only view of any role output. Unknown keys fall back to the schema key. */
export function RoleOutputView({ output }: { output: unknown }) {
  if (!output || typeof output !== "object") return null;
  return (
    <div className="space-y-3 text-sm text-neutral-200">
      {Object.entries(output as Record<string, unknown>).map(([k, v]) => (
        <section key={k} className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
          <h4 className="text-xs font-semibold text-cyan-300 mb-1">{KEY_AR[k] ?? k}</h4>
          <Val v={v} />
        </section>
      ))}
    </div>
  );
}
