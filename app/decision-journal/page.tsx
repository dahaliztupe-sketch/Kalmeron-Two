"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { BookOpen, Plus, Calendar, CheckCircle2, AlertCircle, ArrowLeft, Trash2, Sparkles } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";

type Decision = {
  id: string;
  title: string;
  context: string;
  options: string;
  chosen: string;
  reasoning: string;
  expectedOutcome: string;
  createdAt: number;
  reviewedAt?: number;
  outcome?: "great" | "okay" | "regret";
  lesson?: string;
};

const STORAGE_KEY = "kalmeron-decision-journal-v1";

function loadDecisions(): Decision[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveDecisions(d: Decision[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(d));
}

const daysSince = (ts: number) => Math.floor((Date.now() - ts) / 86400000);

export default function DecisionJournalPage() {
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [reviewing, setReviewing] = useState<string | null>(null);

  useEffect(() => {
    // Defer setState off the effect body to satisfy
    // react-hooks/set-state-in-effect; localStorage requires the client.
    const id = setTimeout(() => setDecisions(loadDecisions()), 0);
    return () => clearTimeout(id);
  }, []);

  const persist = (d: Decision[]) => { setDecisions(d); saveDecisions(d); };

  const addDecision = (data: Omit<Decision, "id" | "createdAt">) => {
    persist([{ ...data, id: crypto.randomUUID(), createdAt: Date.now() }, ...decisions]);
    setShowForm(false);
  };

  const reviewDecision = (id: string, outcome: Decision["outcome"], lesson: string) => {
    persist(decisions.map((d) => d.id === id ? { ...d, outcome, lesson, reviewedAt: Date.now() } : d));
    setReviewing(null);
  };

  const deleteDecision = (id: string) => {
    if (!confirm("حذف هذا القرار نهائيّاً؟")) return;
    persist(decisions.filter((d) => d.id !== id));
  };

  const dueForReview = decisions.filter((d) => !d.reviewedAt && daysSince(d.createdAt) >= 30);
  const reviewed = decisions.filter((d) => d.reviewedAt);
  const stats = {
    total: decisions.length,
    great: reviewed.filter((d) => d.outcome === "great").length,
    okay: reviewed.filter((d) => d.outcome === "okay").length,
    regret: reviewed.filter((d) => d.outcome === "regret").length,
  };

  return (
    <AppShell>
      <div dir="rtl" className="max-w-5xl mx-auto space-y-8 pb-12">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="w-4 h-4 text-violet-400" />
              <span className="text-xs text-violet-400 font-medium uppercase tracking-wide">Decision Journal</span>
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-extrabold text-white mb-2">دفتر القرارات</h1>
            <p className="text-text-secondary max-w-2xl">
              سجّل كل قرار مهم — السياق، الخيارات، السبب، التوقّع. راجعه بعد ٣٠ يوماً وابنِ &laquo;حدساً مدعوماً بالبيانات&raquo; بدل التخمين.
            </p>
          </div>
          <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-violet-500/20 hover:bg-violet-500/30 text-violet-200 border border-violet-500/40 text-sm transition-colors">
            <Plus className="w-4 h-4" /> قرار جديد
          </button>
        </div>

        {decisions.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatTile label="إجمالي القرارات" value={stats.total} color="text-white" />
            <StatTile label="نجح" value={stats.great} color="text-emerald-300" />
            <StatTile label="مقبول" value={stats.okay} color="text-cyan-300" />
            <StatTile label="ندمت" value={stats.regret} color="text-red-300" />
          </div>
        )}

        {dueForReview.length > 0 && (
          <div className="rounded-xl p-4 bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-amber-100 block mb-1">{dueForReview.length} قرار جاهز للمراجعة</strong>
              <p className="text-xs text-amber-200/80">مرّ ٣٠ يوماً أو أكثر — راجعها لاستخراج الدروس.</p>
            </div>
          </div>
        )}

        {decisions.length === 0 ? (
          <div className="text-center py-20 rounded-2xl border border-dashed border-white/10 bg-white/[0.02]">
            <BookOpen className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
            <h3 className="text-white font-bold mb-2">ابدأ سجلّك الأوّل</h3>
            <p className="text-sm text-neutral-400 max-w-sm mx-auto mb-6">القرار غير المُسجَّل = درس مفقود. كل قرار تسجّله الآن يُحسّن قراراتك القادمة.</p>
            <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-500/20 hover:bg-violet-500/30 text-violet-200 border border-violet-500/40 text-sm transition-colors">
              <Plus className="w-4 h-4" /> أضف القرار الأوّل
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {decisions.map((d) => {
              const days = daysSince(d.createdAt);
              const reviewable = !d.reviewedAt && days >= 30;
              return (
                <motion.div
                  key={d.id}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className={`rounded-xl border p-5 ${d.reviewedAt ? "border-white/5 bg-white/[0.02]" : reviewable ? "border-amber-500/30 bg-amber-500/5" : "border-white/10 bg-white/[0.03]"}`}
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-bold mb-1">{d.title}</h3>
                      <div className="flex items-center gap-3 text-xs text-neutral-400">
                        <span className="inline-flex items-center gap-1"><Calendar className="w-3 h-3" /> منذ {days} يوماً</span>
                        {d.reviewedAt && d.outcome && (
                          <span className={`inline-flex items-center gap-1 ${d.outcome === "great" ? "text-emerald-300" : d.outcome === "okay" ? "text-cyan-300" : "text-red-300"}`}>
                            <CheckCircle2 className="w-3 h-3" /> {d.outcome === "great" ? "نجح" : d.outcome === "okay" ? "مقبول" : "ندمت"}
                          </span>
                        )}
                      </div>
                    </div>
                    <button onClick={() => deleteDecision(d.id)} className="text-neutral-500 hover:text-red-400 p-1"><Trash2 className="w-4 h-4" /></button>
                  </div>

                  <div className="grid md:grid-cols-2 gap-3 text-sm mb-3">
                    <Field label="السياق">{d.context}</Field>
                    <Field label="الخيارات المتاحة">{d.options}</Field>
                    <Field label="ما اخترت">{d.chosen}</Field>
                    <Field label="السبب">{d.reasoning}</Field>
                    <Field label="التوقّع" full>{d.expectedOutcome}</Field>
                  </div>

                  {d.reviewedAt && d.lesson && (
                    <div className="mt-3 p-3 rounded-lg bg-violet-500/10 border border-violet-500/30">
                      <div className="text-xs text-violet-300 mb-1 font-semibold">📚 الدرس المستخلَص</div>
                      <p className="text-sm text-neutral-200">{d.lesson}</p>
                    </div>
                  )}

                  {reviewable && (
                    <button onClick={() => setReviewing(d.id)} className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-200 border border-amber-500/40 text-xs transition-colors">
                      <Sparkles className="w-3.5 h-3.5" /> مراجعة الآن
                    </button>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}

        <AnimatePresence>
          {showForm && <DecisionForm onSubmit={addDecision} onClose={() => setShowForm(false)} />}
          {reviewing && <ReviewForm decision={decisions.find((d) => d.id === reviewing)!} onSubmit={(o, l) => reviewDecision(reviewing, o, l)} onClose={() => setReviewing(null)} />}
        </AnimatePresence>
      </div>
    </AppShell>
  );
}

function Field({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <div className={full ? "md:col-span-2" : ""}>
      <div className="text-xs text-neutral-500 mb-0.5">{label}</div>
      <div className="text-sm text-neutral-200">{children}</div>
    </div>
  );
}

function StatTile({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <div className={`text-2xl font-black ${color}`}>{value}</div>
      <div className="text-xs text-neutral-400 mt-1">{label}</div>
    </div>
  );
}

function DecisionForm({ onSubmit, onClose }: { onSubmit: (d: Omit<Decision, "id" | "createdAt">) => void; onClose: () => void }) {
  const [title, setTitle] = useState("");
  const [context, setContext] = useState("");
  const [options, setOptions] = useState("");
  const [chosen, setChosen] = useState("");
  const [reasoning, setReasoning] = useState("");
  const [expectedOutcome, setExpectedOutcome] = useState("");

  const valid = title && chosen && reasoning && expectedOutcome;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-auto" onClick={onClose}>
      <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} onClick={(e) => e.stopPropagation()} className="bg-[#0a0d14] border border-white/10 rounded-2xl p-6 max-w-2xl w-full my-auto" dir="rtl">
        <h3 className="text-xl font-bold text-white mb-1">قرار جديد</h3>
        <p className="text-xs text-neutral-400 mb-5">سجّل كل ما تستطيع تذكّره الآن — ستشكر نفسك بعد ٣٠ يوماً.</p>
        <div className="space-y-3">
          <FormField label="عنوان مختصر للقرار *"><input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="مثال: توظيف مطوّر full-time أم contractor" className="form-input" /></FormField>
          <FormField label="السياق (لماذا الآن؟)"><textarea value={context} onChange={(e) => setContext(e.target.value)} rows={2} placeholder="ما الموقف الذي أوصلك لاتّخاذ هذا القرار؟" className="form-input" /></FormField>
          <FormField label="الخيارات التي درستها"><textarea value={options} onChange={(e) => setOptions(e.target.value)} rows={2} placeholder="عدّ كل البدائل التي فكّرت بها" className="form-input" /></FormField>
          <FormField label="ما اخترت *"><input value={chosen} onChange={(e) => setChosen(e.target.value)} className="form-input" /></FormField>
          <FormField label="لماذا اخترت هذا الخيار تحديداً؟ *"><textarea value={reasoning} onChange={(e) => setReasoning(e.target.value)} rows={3} className="form-input" /></FormField>
          <FormField label="ما تتوقّع أن يحدث؟ *"><textarea value={expectedOutcome} onChange={(e) => setExpectedOutcome(e.target.value)} rows={2} placeholder="كن دقيقاً — هذا ما ستقارنه بالواقع لاحقاً" className="form-input" /></FormField>
        </div>
        <div className="flex gap-2 mt-6">
          <button onClick={() => valid && onSubmit({ title, context, options, chosen, reasoning, expectedOutcome })} disabled={!valid} className="flex-1 px-4 py-2.5 rounded-lg bg-violet-500/20 hover:bg-violet-500/30 text-violet-200 border border-violet-500/40 text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
            حفظ القرار
          </button>
          <button onClick={onClose} className="px-4 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-white border border-white/10 text-sm transition-colors">إلغاء</button>
        </div>
        <style jsx>{`
          :global(.form-input) {
            width: 100%;
            background: rgba(255, 255, 255, 0.04);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 0.5rem;
            padding: 0.625rem 0.875rem;
            color: white;
            font-size: 0.875rem;
            outline: none;
          }
          :global(.form-input:focus) { border-color: rgba(139, 92, 246, 0.5); }
        `}</style>
      </motion.div>
    </motion.div>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs text-neutral-400 mb-1.5">{label}</span>
      {children}
    </label>
  );
}

function ReviewForm({ decision, onSubmit, onClose }: { decision: Decision; onSubmit: (o: Decision["outcome"], lesson: string) => void; onClose: () => void }) {
  const [outcome, setOutcome] = useState<Decision["outcome"]>("okay");
  const [lesson, setLesson] = useState("");

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} onClick={(e) => e.stopPropagation()} className="bg-[#0a0d14] border border-white/10 rounded-2xl p-6 max-w-lg w-full" dir="rtl">
        <h3 className="text-xl font-bold text-white mb-1">مراجعة القرار</h3>
        <p className="text-sm text-neutral-300 mb-1">{decision.title}</p>
        <p className="text-xs text-neutral-500 mb-5">كنت توقّعت: {decision.expectedOutcome}</p>
        <div className="grid grid-cols-3 gap-2 mb-4">
          {(["great", "okay", "regret"] as const).map((o) => (
            <button key={o} onClick={() => setOutcome(o)} className={`p-3 rounded-lg border text-sm transition-colors ${outcome === o ? (o === "great" ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-200" : o === "okay" ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-200" : "bg-red-500/20 border-red-500/50 text-red-200") : "bg-white/[0.02] border-white/10 text-neutral-400"}`}>
              {o === "great" ? "نجح" : o === "okay" ? "مقبول" : "ندمت"}
            </button>
          ))}
        </div>
        <FormField label="ما الدرس الذي تعلّمته؟">
          <textarea value={lesson} onChange={(e) => setLesson(e.target.value)} rows={4} placeholder="ما الذي ستفعله بشكل مختلف في القرار التالي المشابه؟" className="w-full bg-white/[0.04] border border-white/10 rounded-lg p-3 text-sm text-white outline-none focus:border-violet-500/50" />
        </FormField>
        <div className="flex gap-2 mt-5">
          <button onClick={() => onSubmit(outcome, lesson)} className="flex-1 px-4 py-2.5 rounded-lg bg-violet-500/20 hover:bg-violet-500/30 text-violet-200 border border-violet-500/40 text-sm transition-colors">حفظ المراجعة</button>
          <button onClick={onClose} className="px-4 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-white border border-white/10 text-sm transition-colors">لاحقاً</button>
        </div>
      </motion.div>
    </motion.div>
  );
}
