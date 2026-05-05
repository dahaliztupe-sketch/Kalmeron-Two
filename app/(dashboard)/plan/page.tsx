"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Target, Sparkles, ArrowLeft, Loader2, Plus, Trash2,
  CheckCircle2, Copy, Check, Calendar, BarChart3,
  TrendingUp, Flag, AlertCircle, Save, RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface OKR {
  id: string;
  objective: string;
  keyResults: { id: string; text: string; progress: number }[];
  quarter: string;
  status: "on-track" | "at-risk" | "off-track" | "completed";
}

const STATUS_CONFIG = {
  "on-track": { label: "على المسار", color: "text-emerald-400", bg: "bg-emerald-900/20 border-emerald-500/30" },
  "at-risk": { label: "في خطر", color: "text-amber-400", bg: "bg-amber-900/20 border-amber-500/30" },
  "off-track": { label: "خارج المسار", color: "text-red-400", bg: "bg-red-900/20 border-red-500/30" },
  "completed": { label: "مكتمل", color: "text-cyan-400", bg: "bg-cyan-900/20 border-cyan-500/30" },
};

const CURRENT_QUARTER = `Q${Math.ceil((new Date().getMonth() + 1) / 3)} ${new Date().getFullYear()}`;

export default function PlanPage() {
  const { user } = useAuth();
  const [okrs, setOkrs] = useState<OKR[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newObjective, setNewObjective] = useState("");
  const [newKRs, setNewKRs] = useState(["", ""]);
  const [newQuarter, setNewQuarter] = useState(CURRENT_QUARTER);
  const [aiGoal, setAiGoal] = useState("");
  const [aiResult, setAiResult] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [pendingUpdates, setPendingUpdates] = useState<Set<string>>(new Set());

  // ── Fetch OKRs from Firestore ──────────────────────────────────────────────
  const fetchOkrs = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/plan", {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json() as { okrs: OKR[] };
      setOkrs(data.okrs || []);
    } catch {
      setError("تعذّر تحميل الأهداف");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    async function run() { await fetchOkrs(); }
    void run();
  }, [fetchOkrs]);

  // ── Add new OKR ────────────────────────────────────────────────────────────
  const handleAddOKR = useCallback(async () => {
    if (!newObjective.trim() || !user || saving) return;
    setSaving(true);
    try {
      const token = await user.getIdToken();
      const newOKR: Omit<OKR, "id"> = {
        objective: newObjective.trim(),
        quarter: newQuarter,
        status: "on-track",
        keyResults: newKRs.filter(Boolean).map((kr, i) => ({
          id: `kr-${Date.now()}-${i}`,
          text: kr,
          progress: 0,
        })),
      };
      const res = await fetch("/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(newOKR),
      });
      if (!res.ok) throw new Error("فشل الحفظ");
      const { id } = await res.json() as { id: string; ok: boolean };
      setOkrs(prev => [{ ...newOKR, id }, ...prev]);
      setNewObjective(""); setNewKRs(["", ""]); setShowAddForm(false);
      toast.success("تم حفظ الهدف في Firestore");
    } catch {
      toast.error("تعذّر حفظ الهدف");
    } finally {
      setSaving(false);
    }
  }, [newObjective, newQuarter, newKRs, user, saving]);

  // ── Delete OKR ─────────────────────────────────────────────────────────────
  const handleDeleteOKR = useCallback(async (okrId: string) => {
    if (!user) return;
    setOkrs(prev => prev.filter(o => o.id !== okrId));
    try {
      const token = await user.getIdToken();
      await fetch(`/api/plan?id=${okrId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      toast.error("تعذّر حذف الهدف");
      fetchOkrs();
    }
  }, [user, fetchOkrs]);

  // ── Update Key Result progress (debounced save) ────────────────────────────
  const handleUpdateProgress = useCallback((okrId: string, krId: string, progress: number) => {
    setOkrs(prev => prev.map(okr => okr.id !== okrId ? okr : {
      ...okr,
      keyResults: okr.keyResults.map(kr => kr.id !== krId ? kr : { ...kr, progress }),
    }));
    setPendingUpdates(prev => new Set(prev).add(okrId));
  }, []);

  // Auto-save pending updates after 1.5 seconds of inactivity
  useEffect(() => {
    if (pendingUpdates.size === 0 || !user) return;
    const timer = setTimeout(async () => {
      const token = await user.getIdToken();
      await Promise.all(
        [...pendingUpdates].map(async okrId => {
          const okr = okrs.find(o => o.id === okrId);
          if (!okr) return;
          await fetch("/api/plan", {
            method: "PUT",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ id: okrId, keyResults: okr.keyResults, status: okr.status }),
          });
        })
      );
      setPendingUpdates(new Set());
    }, 1500);
    return () => clearTimeout(timer);
  }, [pendingUpdates, okrs, user]);

  // ── AI OKR Generator ───────────────────────────────────────────────────────
  const handleAiOKR = useCallback(async () => {
    if (!aiGoal.trim() || aiLoading) return;
    setAiLoading(true);
    setError("");
    setAiResult("");
    try {
      const token = await user?.getIdToken();
      const res = await fetch("/api/okr/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ goal: aiGoal, quarter: CURRENT_QUARTER }),
      });
      const data = await res.json() as { result?: string; error?: string };
      if (!res.ok) throw new Error(data.error || "حدث خطأ");
      setAiResult(data.result || JSON.stringify(data, null, 2));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "حدث خطأ غير متوقع");
    } finally {
      setAiLoading(false);
    }
  }, [aiGoal, aiLoading, user]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(aiResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [aiResult]);

  const overallProgress = okrs.length > 0
    ? Math.round(okrs.reduce((sum, okr) => {
        const avg = okr.keyResults.length > 0
          ? okr.keyResults.reduce((s, kr) => s + kr.progress, 0) / okr.keyResults.length
          : 0;
        return sum + avg;
      }, 0) / okrs.length)
    : 0;

  return (
    <AppShell>
      <div className="min-h-screen bg-[#0a0a0f] text-white" dir="rtl">
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="text-slate-400 hover:text-white transition-colors">
                <ArrowLeft size={20} />
              </Link>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <Target className="text-violet-400" size={24} />
                  الأهداف والخطة
                </h1>
                <p className="text-slate-400 text-sm mt-1">تتبّع OKRs شركتك وأهدافها الفصلية — محفوظة تلقائياً</p>
              </div>
            </div>
            <button
              onClick={fetchOkrs}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700/40 hover:bg-slate-600/40 text-slate-300 rounded-lg text-sm transition-colors"
            >
              <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
              تحديث
            </button>
          </motion.div>

          {/* Summary Stats */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="grid grid-cols-3 gap-4">
            {[
              { icon: Target, label: "إجمالي الأهداف", value: loading ? "..." : okrs.length.toString(), color: "text-violet-400" },
              { icon: TrendingUp, label: "متوسط التقدم", value: loading ? "..." : `${overallProgress}%`, color: "text-emerald-400" },
              { icon: CheckCircle2, label: "مكتملة", value: loading ? "..." : okrs.filter(o => o.status === "completed").length.toString(), color: "text-cyan-400" },
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-4 text-center">
                <Icon size={18} className={`${color} mx-auto mb-1`} />
                <div className={`text-xl font-bold ${color}`}>{value}</div>
                <div className="text-slate-400 text-xs">{label}</div>
              </div>
            ))}
          </motion.div>

          {/* AI OKR Generator */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 border border-slate-700/50 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="text-violet-400" size={18} />
              <span className="font-semibold text-violet-400">إنشاء OKR بالذكاء الاصطناعي</span>
            </div>
            <textarea
              value={aiGoal}
              onChange={e => setAiGoal(e.target.value)}
              placeholder="مثال: أريد أن أزيد مبيعاتي بنسبة 50% هذا الفصل من خلال التسويق الرقمي وبناء فريق مبيعات..."
              rows={2}
              className="w-full bg-slate-900/70 border border-slate-700/50 rounded-xl px-4 py-3 text-white placeholder-slate-500 resize-none focus:outline-none focus:border-violet-500/50 text-sm"
            />
            <button
              onClick={handleAiOKR}
              disabled={aiLoading || !aiGoal.trim()}
              className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {aiLoading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
              {aiLoading ? "جاري الإنشاء..." : "أنشئ OKR ذكياً"}
            </button>

            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="bg-red-900/30 border border-red-500/30 rounded-xl p-3 text-red-300 text-sm flex items-start gap-2">
                  <AlertCircle size={14} className="mt-0.5 shrink-0" /> {error}
                </motion.div>
              )}
              {aiResult && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="bg-slate-900/50 border border-violet-500/20 rounded-xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-violet-400 text-sm font-medium flex items-center gap-1">
                      <CheckCircle2 size={14} /> OKR مقترح
                    </span>
                    <button onClick={handleCopy} className="text-slate-400 hover:text-white transition-colors">
                      {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                    </button>
                  </div>
                  <p className="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">{aiResult}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* OKR List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-slate-200 flex items-center gap-2">
                <BarChart3 size={16} className="text-violet-400" /> الأهداف الفصلية
                {pendingUpdates.size > 0 && (
                  <span className="text-xs text-amber-400 flex items-center gap-1">
                    <Save size={11} className="animate-pulse" /> حفظ تلقائي...
                  </span>
                )}
              </h2>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-600/20 hover:bg-violet-600/30 text-violet-300 rounded-lg text-sm transition-colors"
              >
                <Plus size={14} /> إضافة هدف
              </button>
            </div>

            <AnimatePresence>
              {showAddForm && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                  className="bg-slate-800/40 border border-violet-500/30 rounded-2xl p-5 space-y-3">
                  <input value={newObjective} onChange={e => setNewObjective(e.target.value)}
                    placeholder="الهدف: مثال — بناء قاعدة مستخدمين مخلصين"
                    className="w-full bg-slate-900/70 border border-slate-700/50 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/50 text-sm" />
                  <select value={newQuarter} onChange={e => setNewQuarter(e.target.value)}
                    className="w-full bg-slate-900/70 border border-slate-700/50 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-violet-500/50 text-sm">
                    {["Q1", "Q2", "Q3", "Q4"].map(q => (
                      <option key={q} value={`${q} ${new Date().getFullYear()}`}>{q} {new Date().getFullYear()}</option>
                    ))}
                  </select>
                  <div className="space-y-2">
                    {newKRs.map((kr, i) => (
                      <input key={i} value={kr} onChange={e => {
                        const n = [...newKRs]; n[i] = e.target.value; setNewKRs(n);
                      }}
                        placeholder={`النتيجة الرئيسية ${i + 1}`}
                        className="w-full bg-slate-900/70 border border-slate-700/50 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/50 text-sm" />
                    ))}
                    <button onClick={() => setNewKRs(prev => [...prev, ""])}
                      className="text-violet-400 hover:text-violet-300 text-sm flex items-center gap-1 transition-colors">
                      <Plus size={13} /> إضافة نتيجة رئيسية
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={handleAddOKR} disabled={!newObjective.trim() || saving}
                      className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2">
                      {saving && <Loader2 size={13} className="animate-spin" />}
                      حفظ الهدف
                    </button>
                    <button onClick={() => setShowAddForm(false)}
                      className="px-4 py-2 bg-slate-700/60 hover:bg-slate-600/60 text-slate-300 rounded-lg text-sm transition-colors">
                      إلغاء
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center py-12 text-slate-500 gap-2">
                <Loader2 size={20} className="animate-spin" />
                <span>جاري تحميل الأهداف من Firestore...</span>
              </div>
            )}

            {/* Empty State */}
            {!loading && okrs.length === 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="text-center py-12 space-y-3">
                <Target size={40} className="text-slate-600 mx-auto" />
                <p className="text-slate-400">لا توجد أهداف بعد — ابدأ بإضافة هدفك الأول أو اطلب من الذكاء الاصطناعي إنشاء OKR مناسب</p>
                <button onClick={() => setShowAddForm(true)}
                  className="px-4 py-2 bg-violet-600/20 hover:bg-violet-600/30 text-violet-300 rounded-lg text-sm transition-colors">
                  <Plus size={14} className="inline ml-1" />
                  أضف هدفك الأول
                </button>
              </motion.div>
            )}

            {okrs.map((okr, i) => {
              const avg = okr.keyResults.length > 0
                ? Math.round(okr.keyResults.reduce((s, kr) => s + kr.progress, 0) / okr.keyResults.length)
                : 0;
              const cfg = STATUS_CONFIG[okr.status] ?? STATUS_CONFIG["on-track"];

              return (
                <motion.div key={okr.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-5 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Flag size={14} className="text-violet-400" />
                        <h3 className="font-semibold text-white">{okr.objective}</h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500 text-xs flex items-center gap-1"><Calendar size={10} /> {okr.quarter}</span>
                        <span className={`px-2 py-0.5 rounded text-xs border ${cfg.bg} ${cfg.color}`}>{cfg.label}</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="text-right">
                        <div className="text-2xl font-bold text-violet-400">{avg}%</div>
                        <div className="text-slate-500 text-xs">التقدم الكلي</div>
                      </div>
                      <button onClick={() => handleDeleteOKR(okr.id)}
                        className="text-slate-600 hover:text-red-400 transition-colors mt-1">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${avg}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full"
                    />
                  </div>

                  {/* Key Results */}
                  <div className="space-y-2">
                    {okr.keyResults.map(kr => (
                      <div key={kr.id} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-300 text-sm flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 shrink-0" />
                            {kr.text}
                          </span>
                          <span className="text-slate-400 text-xs tabular-nums">{kr.progress}%</span>
                        </div>
                        <input
                          type="range"
                          min={0} max={100} value={kr.progress}
                          onChange={e => handleUpdateProgress(okr.id, kr.id, Number(e.target.value))}
                          className="w-full h-1.5 accent-violet-500 cursor-pointer"
                        />
                      </div>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>

        </div>
      </div>
    </AppShell>
  );
}
