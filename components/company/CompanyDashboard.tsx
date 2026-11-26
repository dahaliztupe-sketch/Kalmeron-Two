"use client";
import { useEffect, useReducer, useRef, useState } from "react";
import type { ValidatedPlan } from "@/src/lib/plan/validated-plan";
import { MarketingView } from "@/components/plan/MarketingView";
import type { MarketingPlan } from "@/src/lib/company/roles/marketing";
import { RoleOutputView } from "./RoleOutputView";
import { DEPENDS_ON, GUEST_ROLES, ROLE_LABELS_AR, initState, nextPending, orderedRoles, reduce, summary } from "@/src/lib/company/orchestrator";

const ALL_ROLES = orderedRoles(["marketing", "sales", "finance", "product", "legal", "ops"]);
const STATUS_AR = { idle: "لم يبدأ", running: "جارٍ", done: "جاهز للمراجعة", failed: "فشل", approved: "اعتمدته (مراجعة محلية)" } as const;

type Result = { ok: true; output: unknown; warnings: string[] } | { ok: false; rate: boolean };

export function CompanyDashboard({ plan, getToken, budgetEgp, guest = false }: { plan: ValidatedPlan; getToken: () => Promise<string>; budgetEgp: number | null; guest?: boolean }) {
  const ROLES = guest ? ALL_ROLES.filter((r) => GUEST_ROLES.includes(r)) : ALL_ROLES;
  const [state, dispatch] = useReducer(reduce, ROLES, initState);
  const [open, setOpen] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [busyAll, setBusyAll] = useState(false);
  const stop = useRef(false);
  const latest = useRef(state);
  useEffect(() => {
    latest.current = state;
  }, [state]);

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
        body: JSON.stringify({ role, plan, constraints: { budgetEgp, days: 30 }, context }),
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

  async function runAll() {
    if (busyAll) return;
    setBusyAll(true);
    stop.current = false;
    setNote(null);
    let cur = nextPending(state, ROLES);
    const seen = new Set<string>();
    while (cur && !stop.current && !seen.has(cur)) {
      seen.add(cur);
      await runRole(cur);
      cur = ROLES.find((r) => !seen.has(r) && latest.current[r].status !== "done" && latest.current[r].status !== "approved") ?? null;
    }
    setNote(null);
    setBusyAll(false);
  }

  const sum = summary(state, ROLES);
  return (
    <section className="mt-8 rounded-2xl border border-white/10 bg-white/[0.02] p-5 print:hidden" aria-label="لوحة الشركة">
      <h3 className="font-bold text-white mb-1">لوحة الشركة: فريق من الأدوار الآلية</h3>
      <p className="text-sm text-neutral-400 mb-3">
        {guest && <strong className="block mb-1 text-amber-300">تجربة بدون تسجيل: دور التسويق فقط، بنموذج أخف وبحد يومي عام. التسجيل يفتح بقية الأدوار.</strong>}
        كل دور يُعدّ خطة ومسودات فقط، ولا ينفّذ شيئاً خارج هذه الصفحة. المخرجات مولَّدة بالذكاء الاصطناعي وغير مراجَعة؛ الاعتماد هنا علامة مراجعة محلية ولا يُحفظ.
      </p>
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <button onClick={runAll} disabled={busyAll} className="rounded-xl bg-white text-black px-4 py-2 text-sm font-semibold disabled:opacity-50">
          {busyAll ? "جارٍ تشغيل الأدوار بالترتيب..." : "شغّل كل الأدوار بالترتيب"}
        </button>
        {busyAll && (
          <button onClick={() => (stop.current = true)} className="text-sm text-neutral-300 underline">أوقف بعد الدور الحالي</button>
        )}
        <span className="text-xs text-neutral-500">جاهز {sum.done + sum.approved} من {ROLES.length}</span>
      </div>
      {note && <p className="mb-3 text-sm text-amber-300">{note}</p>}
      <ul className="space-y-2">
        {ROLES.map((r) => {
          const st = state[r];
          return (
            <li key={r} className="rounded-xl border border-white/10 p-3">
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-semibold text-white">{ROLE_LABELS_AR[r] ?? r}</span>
                <span className="text-xs text-neutral-400">{STATUS_AR[st.status]}</span>
                {st.stale && <span className="text-xs text-amber-300">قديم: تغيّر دور سابق بعد إعداده، أعد التوليد</span>}
                <span className="flex-1" />
                {(st.status === "done" || st.status === "approved") && (
                  <button onClick={() => setOpen(open === r ? null : r)} className="text-sm text-cyan-300 underline">{open === r ? "أخفِ" : "اعرض"}</button>
                )}
                {st.status === "done" && (
                  <button onClick={() => dispatch({ type: "approve", role: r })} className="text-sm text-emerald-300 underline">اعتمد</button>
                )}
                {st.status === "approved" && (
                  <button onClick={() => dispatch({ type: "unapprove", role: r })} className="text-sm text-neutral-400 underline">ألغِ الاعتماد</button>
                )}
                {st.status !== "running" && (
                  <button onClick={() => runRole(r)} disabled={busyAll} className="text-sm text-neutral-200 underline disabled:opacity-40">
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
