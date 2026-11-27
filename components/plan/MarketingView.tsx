import type { MarketingPlan } from "@/src/lib/company/roles/marketing";

const BASIS = { assumption: "افتراض", user_fact: "معلومة منك", needs_check: "يحتاج تحقق" } as const;

export function MarketingView({ plan, warnings = [] }: { plan: MarketingPlan; warnings?: string[] }) {
  return (
    <div className="space-y-5 plan-print" data-testid="marketing-view">
      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200">
        مسودة خطة تسويق أُعدّت آلياً. الجودة غير مُتحقَّق منها بعد: راجعها بنفسك قبل أي إنفاق أو نشر. المنصة لا تنشر ولا تُنفق نيابة عنك.
      </div>
      {warnings.length > 0 && (
        <ul className="rounded-xl border border-white/10 p-4 text-xs text-neutral-400 list-disc pr-8">
          {warnings.map((w, i) => (
            <li key={i}>{w}</li>
          ))}
        </ul>
      )}
      <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
        <h3 className="font-bold text-white mb-2">التموضع</h3>
        <p className="text-sm text-neutral-300 leading-7">{plan.positioning}</p>
      </section>
      <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
        <h3 className="font-bold text-white mb-3">القنوات (الإجمالي {plan.totalBudgetEgp} جنيه)</h3>
        <ul className="space-y-3 text-sm text-neutral-300">
          {plan.channels.map((c, i) => (
            <li key={i}>
              <strong className="text-white">{c.name}</strong> ({c.budgetEgp} جنيه، {BASIS[c.basis]}): {c.why}
              <ul className="list-disc pr-6 mt-1 text-neutral-400">
                {c.weeklyActions.map((a, j) => (
                  <li key={j}>{a}</li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </section>
      <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
        <h3 className="font-bold text-white mb-3">خطة 4 أسابيع</h3>
        <ol className="space-y-3 text-sm text-neutral-300">
          {[...plan.weeks].sort((a, b) => a.week - b.week).map((w) => (
            <li key={w.week}>
              <strong className="text-white">الأسبوع {w.week}: {w.goal}</strong>
              <ul className="list-disc pr-6 mt-1 text-neutral-400">
                {w.tasks.map((t, j) => (
                  <li key={j}>{t}</li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </section>
      <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
        <h3 className="font-bold text-white mb-2">الرسائل</h3>
        <p className="text-white font-semibold mb-2">{plan.messaging.headline}</p>
        <ul className="list-disc pr-6 text-sm text-neutral-300 space-y-1">
          {plan.messaging.valueProps.map((v, i) => (
            <li key={i}>{v}</li>
          ))}
        </ul>
        {plan.messaging.objections.length > 0 && (
          <div className="mt-3 text-sm text-neutral-300 space-y-1">
            {plan.messaging.objections.map((o, i) => (
              <p key={i}>
                <strong className="text-white">{o.objection}</strong>: {o.answer}
              </p>
            ))}
          </div>
        )}
      </section>
      <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
        <h3 className="font-bold text-white mb-3">المقاييس</h3>
        <ul className="text-sm text-neutral-300 space-y-1">
          {plan.metrics.map((m, i) => (
            <li key={i}>
              {m.name}: {m.target} ({BASIS[m.basis]})
            </li>
          ))}
        </ul>
      </section>
      {plan.draftPosts.length > 0 && (
        <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
          <h3 className="font-bold text-white mb-3">مسودات منشورات (للمراجعة فقط)</h3>
          <div className="space-y-3 text-sm text-neutral-300">
            {plan.draftPosts.map((d, i) => (
              <div key={i} className="rounded-xl border border-white/10 p-3">
                <div className="text-xs text-neutral-400 mb-1">{d.channel}</div>
                <p className="whitespace-pre-wrap leading-7">{d.text}</p>
              </div>
            ))}
          </div>
        </section>
      )}
      {plan.handoff.length > 0 && (
        <p className="text-xs text-neutral-400">يحتاج دوراً آخر: {plan.handoff.map((h) => `${h.role} (${h.reason})`).join("، ")}</p>
      )}
    </div>
  );
}
