import type { ValidatedPlan } from "@/src/lib/plan/validated-plan";

const VERDICT = {
  proceed: { label: "مضي", cls: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" },
  refine: { label: "تحسين قبل البدء", cls: "bg-amber-500/15 text-amber-300 border-amber-500/30" },
  stop: { label: "إيقاف", cls: "bg-rose-500/15 text-rose-300 border-rose-500/30" },
} as const;

const BASIS = { assumption: "افتراض", user_fact: "معلومة منك", needs_check: "يحتاج تحقق" } as const;

function Points({ title, items }: { title: string; items: ValidatedPlan["risks"] }) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
      <h3 className="font-bold text-white mb-3">{title}</h3>
      {items.length === 0 ? (
        <p className="text-sm text-neutral-500">لا يوجد</p>
      ) : (
        <ul className="space-y-2 text-sm text-neutral-300">
          {items.map((p, i) => (
            <li key={i} className="flex gap-2">
              <span>{p.text}</span>
              <span className="shrink-0 rounded-full border border-white/10 px-2 py-0.5 text-[11px] text-neutral-400">
                {BASIS[p.basis]}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function PlanView({ plan }: { plan: ValidatedPlan }) {
  const v = VERDICT[plan.verdict];
  return (
    <div className="space-y-5 plan-print" data-testid="plan-view">
      <style>{`@media print{body{background:#fff!important}header,footer,nav{display:none!important}.plan-print,.plan-print *{color:#111!important;background:transparent!important;border-color:#bbb!important}}`}</style>
      <div className={`rounded-2xl border p-5 ${v.cls}`}>
        <div className="text-sm opacity-80 mb-1">الحكم</div>
        <div className="text-2xl font-bold mb-2">{v.label}</div>
        <p className="text-sm leading-7">{plan.verdictReason}</p>
      </div>
      <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
        <h3 className="font-bold text-white mb-2">العميل المستهدف</h3>
        <p className="text-sm text-neutral-300 leading-7">{plan.targetCustomer}</p>
      </section>
      <div className="grid md:grid-cols-2 gap-5">
        <Points title="نقاط القوة" items={plan.swot.strengths} />
        <Points title="نقاط الضعف" items={plan.swot.weaknesses} />
        <Points title="الفرص" items={plan.swot.opportunities} />
        <Points title="التهديدات" items={plan.swot.threats} />
      </div>
      <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
        <h3 className="font-bold text-white mb-3">المنافسون</h3>
        {plan.competitors.length === 0 ? (
          <p className="text-sm text-neutral-500">لم يُحدَّد</p>
        ) : (
          <ul className="space-y-2 text-sm text-neutral-300">
            {plan.competitors.map((c, i) => (
              <li key={i}>
                <strong className="text-white">{c.name}</strong>: {c.note}
              </li>
            ))}
          </ul>
        )}
      </section>
      <Points title="المخاطر" items={plan.risks} />
      <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
        <h3 className="font-bold text-white mb-3">الخطوات التالية</h3>
        <ol className="space-y-2 text-sm text-neutral-300 list-decimal pr-5">
          {plan.nextSteps.map((s, i) => (
            <li key={i}>
              {s.action}{" "}
              <span className="text-neutral-500">
                ({s.days} يوم{s.costEgp === null ? "" : `، ${s.costEgp} جنيه`})
              </span>
            </li>
          ))}
        </ol>
      </section>
      <p className="text-xs text-neutral-500 leading-6">
        هذه نتيجة تحليل آلي مبني على وصفك وافتراضات النموذج، وليست دراسة سوق موثّقة. راجع كل بند مُعلَّم «يحتاج تحقق» قبل اتخاذ قرار.
      </p>
    </div>
  );
}
