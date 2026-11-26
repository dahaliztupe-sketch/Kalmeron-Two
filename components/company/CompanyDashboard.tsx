"use client";
import { useEffect, useReducer, useRef, useState } from "react";
import type { CompanyState } from "@/src/lib/company/orchestrator";
import type { ValidatedPlan } from "@/src/lib/plan/validated-plan";
import { MarketingView } from "@/components/plan/MarketingView";
import type { MarketingPlan } from "@/src/lib/company/roles/marketing";
import { RoleOutputView } from "./RoleOutputView";
import { IntakeForm } from "./IntakeForm";
import { intakeComplete, type Intake } from "@/src/lib/company/intake";
import { consolidatedMarkdown } from "@/src/lib/company/export";
import { ROLE_ORDER, DEPENDS_ON, GUEST_ROLES, blockedBy, currentStage, ROLE_LABELS_AR, initState, reduce, summary } from "@/src/lib/company/orchestrator";

const ALL_ROLES = [...ROLE_ORDER];
const STATUS_AR = { idle: "لم يبدأ", running: "جارٍ", done: "جاهز للمراجعة", failed: "فشل", approved: "اعتمدته (مراجعة محلية)" } as const;

type Result = { ok: true; output: unknown; warnings: string[] } | { ok: false; rate: boolean };

export function CompanyDashboard({ plan, getToken, budgetEgp, guest = false, restored }: { plan: ValidatedPlan; getToken: () => Promise<string>; budgetEgp: number | null; guest?: boolean; restored?: { intake: Intake; state: CompanyState } }) {
  const ROLES = guest ? ALL_ROLES.filter((r) => GUEST_ROLES.includes(r)) : ALL_ROLES;
  const [state, dispatch] = useReducer(reduce, ROLES, (r: string[]) => reduce(initState(r), { type: "load", state: restored?.state ?? {} }));
  const [open, setOpen] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [intake, setIntake] = useState<Intake>(restored?.intake ?? {});
  const [saveNote, setSaveNote] = useState<string | null>(null);
  const touched = useRef(false);
  const ready = intakeComplete(intake);
  const stop = useRef(false);
  const latest = useRef(state);
  useEffect(() => {
    latest.current = state;
  }, [state]);

  // Signed-in users: autosave (debounced) once there is something worth keeping.
  useEffect(() => {
    if (guest) return;
    const meaningful = Object.keys(intake).length > 0 || ROLES.some((r) => state[r]?.output !== undefined);
    if (!meaningful || ROLES.some((r) => state[r]?.status === "running")) return;
    if (!touched.current && restored) {
      touched.current = true; // first render after a restore: nothing new to save
      return;
    }
    touched.current = true;
    const t = setTimeout(async () => {
      try {
        const token = await getToken();
        const res = await fetch("/api/company/workspace", {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ plan, intake, state: Object.fromEntries(ROLES.map((r) => [r, { status: state[r].status === "running" ? "idle" : state[r].status, output: state[r].output, warnings: state[r].warnings, error: state[r].error, stale: state[r].stale }])) }),
        });
        setSaveNote(res.ok ? "حُفظ تلقائياً." : "تعذّر الحفظ التلقائي. نزّل الخطة المجمّعة للاحتفاظ بنسخة.");
      } catch {
        setSaveNote("تعذّر الحفظ التلقائي. نزّل الخطة المجمّعة للاحتفاظ بنسخة.");
      }
    }, 1500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, intake]);

  async function removeSaved() {
    try {
      const token = await getToken();
      const res = await fetch("/api/company/workspace", { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      setSaveNote(res.ok ? "حُذفت مساحة العمل المحفوظة. ما في هذه الصفحة باقٍ حتى تغلقها." : "تعذّر الحذف.");
    } catch {
      setSaveNote("تعذّر الحذف.");
    }
  }

  async function call(role: string): Promise<Result> {
    const st = latest.current;
    try {
      const context: Record<string, unknown> = {};
      for (const dep of DEPENDS_ON[role] ?? []) {
        const d = st[dep];
        if (d && (d.status === "done" || d.status === "approved") && d.output != null) context[dep] = d.output;
      }
      const token = guest ? null : await getToken();
      const res = await fetch("/api/company/role", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ role, plan, constraints: { budgetEgp, days: 30 }, intake, context }),
      });
      if (res.status === 429) {
        if (guest) {
          setNote("وصلنا للحد اليومي أو المؤقت للتجربة المجانية. سجّل الدخول أو حاول لاحقاً.");
          return { ok: false, rate: false };
        }
        return { ok: false, rate: true };
      }
      if (!res.ok) return { ok: false, rate: false };
      const d = await res.json();
      return { ok: true, output: d.output, warnings: (d.issues ?? []).map((i: { message: string }) => i.message) };
    } catch {
      return { ok: false, rate: false };
    }
  }

  async function runRole(role: string) {
    dispatch({ type: "start", role });
    for (let attempt = 0; attempt < 3; attempt++) {
      const r = await call(role);
      if (r.ok) {
        dispatch({ type: "done", role, output: r.output, warnings: r.warnings });
        setOpen(role);
        return true;
      }
      if (!r.rate) break;
      setNote("وصلنا للحد المؤقت للطلبات. ننتظر دقيقة ثم نكمل.");
      await new Promise((res) => setTimeout(res, 62_000));
      if (stop.current) break;
    }
    dispatch({ type: "fail", role, error: "تعذّر الإعداد. حاول مرة أخرى." });
    return false;
  }

  function download() {
    const md = consolidatedMarkdown(plan, intake, state, ROLES);
    const url = URL.createObjectURL(new Blob([md], { type: "text/markdown;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "kalmeron-plan.md";
    a.click();
    URL.revokeObjectURL(url);
  }

  const stage = currentStage(state, ROLES);
  const anyRunning = ROLES.some((r) => state[r]?.status === "running");
  const sum = summary(state, ROLES);
  return (
    <section className="mt-8 rounded-2xl border border-white/10 bg-white/[0.02] p-5 print:hidden" aria-label="لوحة الشركة">
      <h3 className="font-bold text-white mb-1">لوحة الشركة: فريق من الأدوار الآلية</h3>
      <p className="text-sm text-neutral-400 mb-3">
        {guest && <strong className="block mb-1 text-amber-300">تجربة بدون تسجيل: دور التسويق فقط، بنموذج أخف وبحد يومي عام. التسجيل يفتح بقية الأدوار.</strong>}
        كل دور يُعدّ خطة ومسودات فقط، ولا ينفّذ شيئاً خارج هذه الصفحة. المخرجات مولَّدة بالذكاء الاصطناعي وغير مراجَعة؛ الاعتماد هنا علامة مراجعة محلية ولا يُحفظ.
      </p>
      <IntakeForm value={intake} onChange={setIntake} />
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <span className="text-xs text-neutral-500">جاهز {sum.done + sum.approved} من {ROLES.length}، معتمد {sum.approved}</span>
        <button onClick={download} className="text-sm text-cyan-300 underline">نزّل الخطة المجمّعة (Markdown)</button>
        {!guest && <button onClick={removeSaved} className="text-sm text-rose-300 underline">احذف مساحة العمل المحفوظة</button>}
        {saveNote && <span className="text-xs text-neutral-400">{saveNote}</span>}
      </div>
      <p className="mb-3 text-xs text-neutral-400">
        المراحل بالترتيب. تُحفظ مساحة عمل واحدة لحسابك تلقائياً (البدء بخطة جديدة يستبدلها). لا يُفتح الدور التالي قبل أن تراجع الدور الحالي وتعتمده. إن أعدت توليد دور سابق صارت الأدوار اللاحقة قديمة وتحتاج إعادة توليد واعتماد.
        {plan.verdict === "stop" && " حكم التحقق كان «توقف»: راجع أسباب الحكم قبل المتابعة."}
      </p>
      {note && <p className="mb-3 text-sm text-amber-300">{note}</p>}
      <ul className="space-y-2">
        {ROLES.map((r) => {
          const st = state[r];
          const blocker = blockedBy(state, ROLES, r);
          const locked = !ready || blocker !== null;
          return (
            <li key={r} className="rounded-xl border border-white/10 p-3">
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-semibold text-white">{ROLE_LABELS_AR[r] ?? r}{stage === r ? " (المرحلة الحالية)" : ""}</span>
                <span className="text-xs text-neutral-400">{STATUS_AR[st.status]}</span>
                {st.stale && <span className="text-xs text-amber-300">قديم: تغيّر دور سابق بعد إعداده، أعد التوليد</span>}
                <span className="flex-1" />
                {(st.status === "done" || st.status === "approved") && (
                  <button onClick={() => setOpen(open === r ? null : r)} className="text-sm text-cyan-300 underline">{open === r ? "أخفِ" : "اعرض"}</button>
                )}
                {st.status === "done" && !st.stale && (
                  <button onClick={() => dispatch({ type: "approve", role: r })} className="text-sm text-emerald-300 underline">اعتمد</button>
                )}
                {st.status === "approved" && (
                  <button onClick={() => dispatch({ type: "unapprove", role: r })} className="text-sm text-neutral-400 underline">ألغِ الاعتماد</button>
                )}
                {st.status !== "running" && (
                  <button onClick={() => runRole(r)} disabled={anyRunning || locked} title={!ready ? "أجب عن الأسئلة المطلوبة أولاً" : blocker ? `اعتمد دور ${ROLE_LABELS_AR[blocker] ?? blocker} أولاً` : undefined} className="text-sm text-neutral-200 underline disabled:opacity-40">
                    {st.status === "idle" || st.status === "failed" ? "شغّل" : "أعد التوليد"}
                  </button>
                )}
              </div>
              {st.error && <p className="mt-2 text-sm text-rose-300">{st.error}</p>}
              {open === r && st.output != null && (
                <div className="mt-3">
                  {st.warnings.length > 0 && (
                    <ul className="mb-3 list-disc pr-5 text-sm text-amber-300">
                      {st.warnings.map((w, i) => (
                        <li key={i}>{w}</li>
                      ))}
                    </ul>
                  )}
                  {r === "marketing" ? <MarketingView plan={st.output as MarketingPlan} warnings={[]} /> : <RoleOutputView output={st.output} />}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
