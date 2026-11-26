"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import type { ValidatedPlan } from "@/src/lib/plan/validated-plan";
import { PlanView } from "@/components/plan/PlanView";
import { CompanyDashboard } from "@/components/company/CompanyDashboard";

export default function ValidateClient({ initialIdea = "" }: { initialIdea?: string }) {
  const { user } = useAuth();
  const [idea, setIdea] = useState(initialIdea);
  const [industry, setIndustry] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [plan, setPlan] = useState<ValidatedPlan | null>(null);
  const [fallbackText, setFallbackText] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [fb, setFb] = useState<"up" | "down" | null>(null);
  const [budget, setBudget] = useState("");
  async function sendFeedback(rating: "up" | "down") {
    if (!plan || fb) return;
    setFb(rating);
    try {
      const token = user ? await user.getIdToken().catch(() => null) : null;
      await fetch("/api/plans/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ rating, verdict: plan.verdict }),
      });
    } catch {
      /* feedback is best-effort */
    }
  }

  async function revoke() {
    if (!user || !savedId) return;
    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/plans/${savedId}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        setShareUrl(null);
        setSavedId(null);
        setSaveMsg("تم حذف الخطة وإلغاء الرابط.");
      } else setSaveMsg("تعذّر الحذف. حاول مرة أخرى.");
    } catch {
      setSaveMsg("تعذّر الحذف. حاول مرة أخرى.");
    }
  }

  async function save() {
    if (!plan || !user || saving) return;
    setSaving(true);
    setSaveMsg(null);
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ plan }),
      });
      if (res.status === 409) setSaveMsg("وصلت للحد الأقصى من الخطط المحفوظة.");
      else if (!res.ok) setSaveMsg("تعذّر الحفظ. حاول مرة أخرى.");
      else {
        const d = await res.json();
        setShareUrl(d.url as string);
        setSavedId(d.id as string);
      }
    } catch {
      setSaveMsg("تعذّر الحفظ. حاول مرة أخرى.");
    } finally {
      setSaving(false);
    }
  }

  async function submit() {
    if (!idea.trim() || loading) return;
    setLoading(true);
    setError(null);
    setPlan(null);
    setFallbackText(null);
    setShareUrl(null);
    setSavedId(null);
    setFb(null);
    setSaveMsg(null);
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
      {plan && (
        <>
          <div className="flex flex-wrap items-center gap-3 mb-5 print:hidden">
            {user ? (
              <button
                onClick={save}
                disabled={saving || !!shareUrl}
                className="rounded-xl bg-white text-black px-4 py-2 text-sm font-semibold disabled:opacity-50"
              >
                {saving ? "جارٍ الحفظ..." : shareUrl ? "تم الحفظ" : "احفظ وشارك"}
              </button>
            ) : (
              <Link href="/auth/login?next=/validate" className="rounded-xl border border-white/15 px-4 py-2 text-sm text-white">
                سجّل الدخول لحفظ الخطة ومشاركتها
              </Link>
            )}
            <button onClick={() => window.print()} className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white">
              طباعة / حفظ PDF
            </button>
            {saveMsg && <span className="text-sm text-rose-300">{saveMsg}</span>}
          </div>
          {shareUrl && (
            <div className="mb-5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-200 print:hidden">
              رابط المشاركة (أي شخص معه الرابط يقدر يشوف الخطة):{" "}
              <a href={shareUrl} className="underline break-all" dir="ltr">{shareUrl}</a>
              <button onClick={revoke} className="ms-3 underline text-rose-200">حذف الخطة وإلغاء الرابط</button>
            </div>
          )}
          <PlanView plan={plan} />
          {user ? (
            <>
              <div className="mt-8 flex flex-wrap items-center gap-3 print:hidden">
                <input
                  value={budget}
                  onChange={(e) => setBudget(e.target.value.replace(/[^0-9]/g, ""))}
                  inputMode="numeric"
                  placeholder="الميزانية بالجنيه (اختياري)"
                  className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white placeholder:text-neutral-600"
                  aria-label="الميزانية بالجنيه"
                />
              </div>
              <CompanyDashboard plan={plan} getToken={() => user.getIdToken()} budgetEgp={budget.trim() !== "" && Number.isFinite(Number(budget)) ? Number(budget) : null} />
            </>
          ) : (
            <p className="mt-8 print:hidden">
              <Link href="/auth/login?next=/validate" className="text-sm text-cyan-300 underline">سجّل الدخول لتشغيل فريق الأدوار (التسويق والمبيعات والمالية وغيرها)</Link>
            </p>
          )}
          <div className="mt-6 flex items-center gap-3 text-sm text-neutral-400 print:hidden">
            {fb ? (
              <span>شكراً على رأيك.</span>
            ) : (
              <>
                <span>هل كان التحليل مفيداً؟</span>
                <button onClick={() => sendFeedback("up")} className="rounded-lg border border-white/15 px-3 py-1 hover:bg-white/5" aria-label="مفيد">👍</button>
                <button onClick={() => sendFeedback("down")} className="rounded-lg border border-white/15 px-3 py-1 hover:bg-white/5" aria-label="غير مفيد">👎</button>
              </>
            )}
          </div>
        </>
      )}
      {fallbackText && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 text-sm text-neutral-300 whitespace-pre-wrap leading-7">
          {fallbackText}
        </div>
      )}
    </div>
  );
}
