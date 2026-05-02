"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/contexts/AuthContext";
import { Users, Play, Loader2, CheckCircle2, Lightbulb, Clock, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/src/lib/utils";
import { toast } from "sonner";

interface Meeting {
  id: string;
  topic: string;
  departmentIds?: string[];
  synthesis?: string;
  decisions?: string[];
  createdAt?: string | { seconds: number };
}

interface Opportunity {
  departments?: string[];
  reason?: string;
}

const DEPARTMENTS: { id: string; label: string; color: string }[] = [
  { id: "marketing",  label: "التسويق",           color: "bg-pink-500/20 text-pink-300 border-pink-500/30 hover:border-pink-400/60" },
  { id: "product",    label: "المنتج",             color: "bg-violet-500/20 text-violet-300 border-violet-500/30 hover:border-violet-400/60" },
  { id: "finance",    label: "المالية",            color: "bg-amber-500/20 text-amber-300 border-amber-500/30 hover:border-amber-400/60" },
  { id: "sales",      label: "المبيعات",           color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30 hover:border-emerald-400/60" },
  { id: "support",    label: "خدمة العملاء",       color: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30 hover:border-cyan-400/60" },
  { id: "hr",         label: "الموارد البشرية",    color: "bg-blue-500/20 text-blue-300 border-blue-500/30 hover:border-blue-400/60" },
  { id: "legal",      label: "القانوني",           color: "bg-rose-500/20 text-rose-300 border-rose-500/30 hover:border-rose-400/60" },
  { id: "monitoring", label: "المراقبة",           color: "bg-neutral-500/20 text-neutral-300 border-neutral-500/30 hover:border-neutral-400/60" },
];

function deptLabel(id: string) {
  return DEPARTMENTS.find((d) => d.id === id)?.label || id;
}

function formatDate(v: Meeting["createdAt"]): string {
  if (!v) return "";
  const d = typeof v === "object" && "seconds" in v
    ? new Date(v.seconds * 1000)
    : new Date(v as string);
  return isNaN(d.getTime()) ? "" : d.toLocaleDateString("ar-EG");
}

export default function MeetingsPage() {
  const { user } = useAuth();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [topic, setTopic] = useState("");
  const [selected, setSelected] = useState<string[]>(["marketing", "product"]);
  const [running, setRunning] = useState(false);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      const token = user ? await user.getIdToken().catch(() => null) : null;
      const r = await fetch("/api/meetings", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        cache: "no-store",
      });
      const j = await r.json();
      setMeetings(j.meetings || []);
      setOpportunities(j.opportunities || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  function toggle(d: string) {
    setSelected((s) => (s.includes(d) ? s.filter((x) => x !== d) : [...s, d]));
  }

  async function convene() {
    if (!topic.trim() || selected.length === 0 || running) return;
    setRunning(true);
    try {
      const token = user ? await user.getIdToken().catch(() => null) : null;
      const res = await fetch("/api/meetings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ topic, departmentIds: selected }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setTopic("");
      toast.success("اكتمل الاجتماع الافتراضي!");
      await load();
    } catch {
      toast.error("تعذّر عقد الاجتماع. حاول مجدداً.");
    } finally {
      setRunning(false);
    }
  }

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto px-4 py-8" dir="rtl">
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-500/[0.06] px-3 py-1 text-[11px] text-indigo-200 mb-3">
            <Users className="w-3.5 h-3.5" />
            الاجتماعات الافتراضية · AI Council
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-2">الاجتماعات الافتراضية</h1>
          <p className="text-sm text-neutral-400 max-w-xl">
            عقد اجتماع يجمع مساعدي الأقسام المختلفة حول موضوع محدد — يتداولون ويصلون إلى قرارات موحّدة.
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <div className="bg-neutral-900/60 border border-neutral-700/50 rounded-2xl p-5 mb-6">
            <h2 className="text-sm font-semibold text-neutral-300 mb-4 flex items-center gap-2">
              <Play className="w-4 h-4 text-indigo-400" />
              عقد اجتماع جديد
            </h2>
            <div className="mb-4">
              <label className="block text-xs text-neutral-500 mb-1.5">موضوع الاجتماع</label>
              <input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && convene()}
                placeholder="مثال: مراجعة استراتيجية التسعير للربع القادم..."
                className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
            <div className="mb-4">
              <label className="block text-xs text-neutral-500 mb-2">الأقسام المشاركة ({selected.length} محدد)</label>
              <div className="flex flex-wrap gap-2">
                {DEPARTMENTS.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => toggle(d.id)}
                    className={cn(
                      "text-xs px-3 py-1.5 rounded-xl border font-medium transition-all",
                      selected.includes(d.id) ? d.color : "text-neutral-500 border-neutral-700/50 hover:border-neutral-600"
                    )}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={convene}
                disabled={running || !topic.trim() || selected.length === 0}
                className="h-9 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold disabled:opacity-40 transition-all flex items-center gap-2"
              >
                {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                {running ? "جارٍ الاجتماع..." : "عقد الاجتماع"}
              </button>
            </div>
          </div>
        </motion.div>

        <AnimatePresence>
          {opportunities.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mb-5 bg-amber-900/20 border border-amber-500/20 rounded-2xl p-4"
            >
              <h3 className="text-xs font-semibold text-amber-300 flex items-center gap-1.5 mb-2">
                <Lightbulb className="w-3.5 h-3.5" />
                فرص تعاون مكتشفة
              </h3>
              <ul className="space-y-1">
                {opportunities.map((o, i) => (
                  <li key={i} className="text-xs text-amber-200/80">
                    • {o.reason || "فرصة تعاون"}
                    {(o.departments || []).length > 0 && (
                      <span className="text-amber-400/60 mr-1">({(o.departments || []).map(deptLabel).join("، ")})</span>
                    )}
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-neutral-300">سجل الاجتماعات</h3>
          <button
            onClick={load}
            className="text-xs text-neutral-500 hover:text-white flex items-center gap-1 transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            تحديث
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-5 h-5 animate-spin text-neutral-500" />
          </div>
        ) : meetings.length === 0 ? (
          <div className="text-center py-12 text-neutral-500">
            <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">لا توجد اجتماعات بعد. عقد أول اجتماع أعلاه.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {meetings.map((m, i) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="bg-neutral-900/60 border border-neutral-700/50 rounded-2xl p-5"
              >
                <div className="flex items-start justify-between mb-3">
                  <h4 className="text-sm font-bold text-white">{m.topic}</h4>
                  {m.createdAt && (
                    <span className="flex items-center gap-1 text-xs text-neutral-500 shrink-0">
                      <Clock className="w-3 h-3" />
                      {formatDate(m.createdAt)}
                    </span>
                  )}
                </div>
                {(m.departmentIds || []).length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {(m.departmentIds || []).map((d) => (
                      <span key={d} className="text-[10px] bg-neutral-800 border border-neutral-700 px-2 py-0.5 rounded-full text-neutral-400">
                        {deptLabel(d)}
                      </span>
                    ))}
                  </div>
                )}
                {m.synthesis && (
                  <p className="text-xs text-neutral-400 leading-relaxed mb-3">{m.synthesis}</p>
                )}
                {(m.decisions || []).length > 0 && (
                  <div className="space-y-1.5">
                    <p className="text-xs font-semibold text-neutral-300 mb-1.5">القرارات:</p>
                    {(m.decisions || []).map((d, j) => (
                      <div key={j} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span className="text-xs text-neutral-300">{d}</span>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
