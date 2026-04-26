"use client";

/**
 * Workflows Runner — interactive surface for the seed library.
 * ------------------------------------------------------------
 * Picks one of the WORKFLOW_LIBRARY specs, renders its inputs, posts to
 * /api/workflows/run, and streams the per-step results into a readable
 * timeline. Falls back to deterministic stubs if no model API key is
 * configured (the runner handles that internally).
 */

import * as React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Loader2, Play, ChevronDown, CheckCircle2, AlertTriangle, Workflow as WorkflowIcon } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { WORKFLOW_LIBRARY, findWorkflow } from "@/src/lib/workflows/library";
import type { WorkflowRunResult } from "@/src/lib/workflows/runner";
import { useAuth } from "@/contexts/AuthContext";

export default function WorkflowsRunnerPage() {
  const { user } = useAuth();
  const [selectedId, setSelectedId] = React.useState<string>(WORKFLOW_LIBRARY[0]?.id ?? "");
  const [inputs, setInputs] = React.useState<Record<string, string>>({});
  const [running, setRunning] = React.useState(false);
  const [result, setResult] = React.useState<WorkflowRunResult | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const wf = findWorkflow(selectedId);

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setInputs({});
    setResult(null);
    setError(null);
  }, [selectedId]);

  async function run() {
    if (!wf) return;
    if (!user) { setError("الجلسة غير صالحة. الرجاء تسجيل الدخول."); return; }
    setRunning(true);
    setResult(null);
    setError(null);
    try {
      const idToken = await user.getIdToken();
      const res = await fetch("/api/workflows/run", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ workflowId: wf.id, inputs }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "request_failed");
      setResult(data);
    } catch (e: unknown) {
      setError(e?.message ?? "unknown");
    } finally {
      setRunning(false);
    }
  }

  const canRun = wf?.inputs.every((f) => !f.required || (inputs[f.name] ?? "").trim().length > 0) ?? false;

  return (
    <AppShell>
      <main id="kalmeron-main" dir="rtl" className="max-w-5xl mx-auto px-5 md:px-8 py-8 md:py-12">
        <header className="mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-500/[0.06] px-3 py-1 text-[11px] text-cyan-200 mb-3">
            <WorkflowIcon className="w-3.5 h-3.5" aria-hidden /> مسارات العمل · تشغيل تجريبي
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold mb-2">شغّل مساراً جاهزاً بنقرة واحدة</h1>
          <p className="text-sm text-neutral-400 leading-relaxed max-w-2xl">
            كل مسار يربط 2-3 مساعدين بسلسلة محدّدة. أدخل سياقك، ثم تابع نتيجة كل خطوة بشكل منفصل.
          </p>
        </header>

        {/* Workflow selector */}
        <section className="mb-6">
          <label htmlFor="wf-select" className="block text-xs text-neutral-400 mb-2">المسار</label>
          <div className="relative">
            <select
              id="wf-select"
              className="w-full appearance-none bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 pe-10 text-sm text-white outline-none focus:border-cyan-400/40"
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
            >
              {WORKFLOW_LIBRARY.map((w) => (
                <option key={w.id} value={w.id}>{w.title}</option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-neutral-500 absolute end-3 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden />
          </div>
          {wf?.description && (
            <p className="text-xs text-neutral-500 mt-2 leading-relaxed">{wf.description}</p>
          )}
        </section>

        {/* Inputs */}
        {wf && (
          <section className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5 mb-6 space-y-4">
            {wf.inputs.length === 0 && (
              <p className="text-sm text-neutral-400">هذا المسار لا يطلب مدخلات.</p>
            )}
            {wf.inputs.map((f) => (
              <div key={f.name} className="space-y-1.5">
                <label htmlFor={`wfi-${f.name}`} className="block text-xs text-neutral-300">
                  {f.label}{f.required && <span className="text-rose-300"> *</span>}
                </label>
                <input
                  id={`wfi-${f.name}`}
                  type="text"
                  required={f.required}
                  placeholder={f.placeholder}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/40"
                  value={inputs[f.name] ?? ""}
                  onChange={(e) => setInputs((s) => ({ ...s, [f.name]: e.target.value }))}
                />
              </div>
            ))}

            <div className="pt-2">
              <Button
                onClick={run}
                disabled={!canRun || running}
                className="bg-gradient-to-r from-cyan-500 to-indigo-500 hover:brightness-110 text-white"
              >
                {running ? (
                  <><Loader2 className="w-4 h-4 me-2 animate-spin" aria-hidden /> جارٍ التشغيل…</>
                ) : (
                  <><Play className="w-4 h-4 me-2" aria-hidden /> شغّل المسار</>
                )}
              </Button>
              <p className="text-[11px] text-neutral-500 mt-2">
                تُمرّر مدخلاتك عبر منقّح PII تلقائياً قبل الوصول لأيّ نموذج.
              </p>
            </div>
          </section>
        )}

        {/* Steps preview (before/after run) */}
        {wf && (
          <section className="mb-6">
            <h2 className="text-xs uppercase tracking-wider text-neutral-500 mb-3">خطوات المسار</h2>
            <ol className="space-y-2 text-sm">
              {wf.steps.map((s, i) => {
                const stepResult = result?.steps.find((r) => r.id === s.id);
                const status = stepResult?.status;
                const dot =
                  status === "ok" ? "bg-emerald-400" :
                  status === "error" ? "bg-rose-400" :
                  running ? "bg-cyan-400 animate-pulse" : "bg-white/15";
                return (
                  <li key={s.id} className="flex items-start gap-3 rounded-xl border border-white/[0.07] bg-white/[0.02] p-3">
                    <span className={cn("w-2 h-2 rounded-full mt-1.5 shrink-0", dot)} aria-hidden />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-3">
                        <span className="text-neutral-200">
                          <span className="text-neutral-500 me-2">#{i + 1}</span>
                          {s.id} · <span className="text-neutral-400">{s.agent}</span>
                        </span>
                        {stepResult && (
                          <span className="text-[11px] text-neutral-500 tabular shrink-0">
                            {stepResult.durationMs} ms
                          </span>
                        )}
                      </div>
                      {stepResult?.outputs?.text && (
                        <p className="text-xs text-neutral-300 mt-2 leading-relaxed line-clamp-6 whitespace-pre-wrap">
                          {stepResult.outputs.text}
                        </p>
                      )}
                      {stepResult?.error && (
                        <p className="text-xs text-rose-300 mt-2">{stepResult.error}</p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>
        )}

        {/* Result summary */}
        {result && (
          <section
            className={cn(
              "rounded-2xl border p-4 flex items-start gap-3",
              result.status === "ok"
                ? "border-emerald-400/30 bg-emerald-500/[0.06]"
                : "border-rose-400/30 bg-rose-500/[0.06]",
            )}
          >
            {result.status === "ok" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0 mt-0.5" aria-hidden />
            ) : (
              <AlertTriangle className="w-5 h-5 text-rose-300 shrink-0 mt-0.5" aria-hidden />
            )}
            <div className="text-sm">
              <p className="text-white font-medium">
                {result.status === "ok" ? "اكتمل المسار بنجاح" : "تعطّل المسار"}
              </p>
              <p className="text-xs text-neutral-300 mt-0.5 tabular">
                المدّة الإجمالية: {result.totalMs} ms · {result.steps.length} خطوة
              </p>
              {result.error && <p className="text-xs text-rose-200 mt-1">{result.error}</p>}
            </div>
          </section>
        )}

        {error && (
          <p className="mt-4 text-xs text-rose-300">{error}</p>
        )}
      </main>
    </AppShell>
  );
}
