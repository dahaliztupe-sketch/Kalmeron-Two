"use client";
import { INTAKE_QUESTIONS, type Intake } from "@/src/lib/company/intake";

/** Clarifying questions asked before any role runs. Stage and team are required; the rest are optional. */
export function IntakeForm({ value, onChange }: { value: Intake; onChange: (v: Intake) => void }) {
  const set = (k: string, v: string) => onChange({ ...value, [k]: v === "" ? undefined : v } as Intake);
  return (
    <fieldset className="mb-4 rounded-xl border border-white/10 p-3">
      <legend className="px-1 text-sm font-semibold text-white">أسئلة قبل البدء</legend>
      <p className="mb-3 text-xs text-neutral-400">إجاباتك تدخل في تعليمات كل الأدوار. المطلوب: المرحلة وعدد الفريق. غير المُجاب يُعامَل كافتراض.</p>
      <div className="space-y-3">
        {INTAKE_QUESTIONS.map((q) => {
          const v = (value[q.key as keyof Intake] as string | undefined) ?? "";
          return (
            <label key={q.key} className="block text-sm text-neutral-200">
              <span className="mb-1 block">{q.labelAr}{q.required ? " *" : ""}</span>
              {q.kind === "choice" ? (
                <select value={v} onChange={(e) => set(q.key, e.target.value)} className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white">
                  <option value="">اختر</option>
                  {q.options.map(([val, label]) => (
                    <option key={val} value={val}>{label}</option>
                  ))}
                </select>
              ) : (
                <input value={v} maxLength={q.key === "market" ? 200 : 300} onChange={(e) => set(q.key, e.target.value)} className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white" />
              )}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
