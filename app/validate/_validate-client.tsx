"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
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
    <div className="space-y-5" data-testid="plan-view">
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

export default function ValidateClient() {
  const { user } = useAuth();
  const [idea, setIdea] = useState("");
  const [industry, setIndustry] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [plan, setPlan] = useState<ValidatedPlan | null>(null);
  const [fallbackText, setFallbackText] = useState<string | null>(null);

  async function submit() {
    if (!idea.trim() || loading) return;
    setLoading(true);
    setError(null);
    setPlan(null);
    setFallbackText(null);
    try {
      const token = user ? await user.getIdToken().catch(() => null) : null;
      const res = await fetch("/api/ideas/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ ideaDesc: idea, industry, format: "plan" }),
      });
      if (res.status === 429) {
        setError("وصلت للحد المسموح مؤقتاً. انتظر دقيقة وحاول مرة أخرى، أو سجّل الدخول لحد أعلى.");
        return;
      }
      if (!res.ok) {
        setError("تعذّر التحليل الآن. حاول مرة أخرى بعد قليل.");
        return;
      }
      const data = await res.json();
      if (data.plan) setPlan(data.plan as ValidatedPlan);
      else setFallbackText(String(data.result ?? ""));
    } catch {
      setError("تعذّر الاتصال. تحقق من الإنترنت وحاول مرة أخرى.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div dir="rtl" className="max-w-3xl mx-auto px-4 md:px-8 py-12 md:py-20">
      <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">تحقق من فكرتك قبل ما تصرف جنيه</h1>
      <p className="text-neutral-400 leading-8 mb-8">
        اكتب فكرتك بالتفصيل. هتاخد تحليل نقدي منظّم، وكل نقطة فيه مكتوب جنبها هل هي افتراض أو معلومة منك أو تحتاج تحقق.
      </p>
      <div className="space-y-3 mb-8">
        <textarea
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          maxLength={5000}
          rows={6}
          placeholder="مثال: تطبيق يوصّل أدوية الأمراض المزمنة لكبار السن في القاهرة باشتراك شهري..."
          className="w-full rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-white placeholder:text-neutral-600 focus:outline-none focus:border-cyan-400/50"
          aria-label="وصف الفكرة"
        />
        <input
          value={industry}
          onChange={(e) => setIndustry(e.target.value)}
          maxLength={200}
          placeholder="المجال (اختياري)"
          className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-white placeholder:text-neutral-600 focus:outline-none focus:border-cyan-400/50"
          aria-label="المجال"
        />
        <button
          onClick={submit}
          disabled={loading || !idea.trim()}
          className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-l from-cyan-500 to-violet-500 px-8 py-3 font-bold text-white disabled:opacity-50"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? "جارٍ التحليل..." : "حلّل فكرتي"}
        </button>
      </div>
      {error && <div role="alert" className="mb-6 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-rose-200 text-sm">{error}</div>}
      {plan && <PlanView plan={plan} />}
      {fallbackText && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 text-sm text-neutral-300 whitespace-pre-wrap leading-7">
          {fallbackText}
        </div>
      )}
    </div>
  );
}
