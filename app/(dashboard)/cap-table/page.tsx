"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  PieChart, ArrowLeft, Loader2, CheckCircle2, Copy, Check,
  Plus, Trash2, AlertCircle, TrendingDown, RefreshCw, Users,
  Building2, Briefcase, DollarSign, Save, RotateCcw, History,
} from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/contexts/AuthContext";
import ReactMarkdown from "react-markdown";

type ShareholderType = "founder" | "investor" | "esop" | "advisor";

interface Shareholder {
  id: string;
  name: string;
  role: string;
  shares: number;
  type: ShareholderType;
}

interface NewRound {
  amount: number;
  valuation: number;
  investorName: string;
}

interface DilutionResult {
  newSharesIssued: number;
  postMoneyValuation: number;
  pricePerShare: number;
  investorOwnershipPct: number;
  existingDilutionPct: number;
  newCapTable: Array<{ id: string; name: string; role: string; type: ShareholderType; sharesBefore: number; sharesAfter: number; pctBefore: number; pctAfter: number; dilutedBy: number }>;
  totalSharesAfter: number;
}

const TYPE_CONFIG: Record<ShareholderType, { label: string; color: string; bg: string; icon: React.ComponentType<{ size?: number; className?: string }> }> = {
  founder: { label: "مؤسس", color: "text-violet-400", bg: "bg-violet-500/10 border-violet-500/30", icon: Users },
  investor: { label: "مستثمر", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/30", icon: DollarSign },
  esop: { label: "ESOP موظفون", color: "text-cyan-400", bg: "bg-cyan-500/10 border-cyan-500/30", icon: Briefcase },
  advisor: { label: "مستشار", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/30", icon: Building2 },
};

const PIE_COLORS = ["#8b5cf6", "#10b981", "#06b6d4", "#f59e0b", "#ef4444", "#ec4899", "#84cc16"];

function mkId() { return Math.random().toString(36).slice(2, 9); }

function computeDilution(shareholders: Shareholder[], round: NewRound): DilutionResult {
  const preMoneyValuation = round.valuation;
  const investmentAmount = round.amount;
  const postMoneyValuation = preMoneyValuation + investmentAmount;

  const totalSharesBefore = shareholders.reduce((s, h) => s + Number(h.shares), 0);
  const pricePerShare = totalSharesBefore > 0 ? preMoneyValuation / totalSharesBefore : 1;
  const newSharesIssued = Math.round(investmentAmount / pricePerShare);
  const totalSharesAfter = totalSharesBefore + newSharesIssued;

  const investorOwnershipPct = (newSharesIssued / totalSharesAfter) * 100;
  const existingDilutionPct = (newSharesIssued / totalSharesAfter) * 100;

  const newCapTable = shareholders.map(h => {
    const pctBefore = totalSharesBefore > 0 ? (h.shares / totalSharesBefore) * 100 : 0;
    const pctAfter = totalSharesAfter > 0 ? (h.shares / totalSharesAfter) * 100 : 0;
    return {
      id: h.id,
      name: h.name,
      role: h.role,
      type: h.type,
      sharesBefore: h.shares,
      sharesAfter: h.shares,
      pctBefore: Math.round(pctBefore * 100) / 100,
      pctAfter: Math.round(pctAfter * 100) / 100,
      dilutedBy: Math.round((pctBefore - pctAfter) * 100) / 100,
    };
  });

  newCapTable.push({
    id: mkId(),
    name: round.investorName || "المستثمر الجديد",
    role: "Investor",
    type: "investor",
    sharesBefore: 0,
    sharesAfter: newSharesIssued,
    pctBefore: 0,
    pctAfter: Math.round(investorOwnershipPct * 100) / 100,
    dilutedBy: 0,
  });

  return {
    newSharesIssued,
    postMoneyValuation,
    pricePerShare: Math.round(pricePerShare * 100) / 100,
    investorOwnershipPct: Math.round(investorOwnershipPct * 100) / 100,
    existingDilutionPct: Math.round(existingDilutionPct * 100) / 100,
    newCapTable,
    totalSharesAfter,
  };
}

export default function CapTablePage() {
  const { user } = useAuth();
  const [companyName, setCompanyName] = useState("");
  const [shareholders, setShareholders] = useState<Shareholder[]>([
    { id: mkId(), name: "المؤسس الأول", role: "CEO", shares: 500000, type: "founder" },
    { id: mkId(), name: "المؤسس الثاني", role: "CTO", shares: 300000, type: "founder" },
    { id: mkId(), name: "مجموعة ESOP", role: "موظفون", shares: 100000, type: "esop" },
  ]);
  const [showNewRound, setShowNewRound] = useState(false);
  const [newRound, setNewRound] = useState<NewRound>({ amount: 0, valuation: 0, investorName: "" });
  const [dilutionResult, setDilutionResult] = useState<DilutionResult | null>(null);
  const [aiCommentary, setAiCommentary] = useState("");
  const [loadingAI, setLoadingAI] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<Array<{ ts: number; label: string; shareholders: Shareholder[]; companyName: string }>>([]);

  const totalShares = useMemo(() => shareholders.reduce((s, h) => s + Number(h.shares), 0), [shareholders]);

  useEffect(() => {
    if (!user) return;
    let mounted = true;
    async function loadCapTable() {
      setLoadingData(true);
      try {
        const token = await user!.getIdToken();
        const r = await fetch("/api/cap-table/save", { headers: { Authorization: `Bearer ${token}` } });
        const data = await r.json();
        if (mounted && data.capTable) {
          const ct = data.capTable;
          setCompanyName(ct.companyName ?? "");
          if (Array.isArray(ct.shareholders) && ct.shareholders.length > 0) {
            setShareholders(ct.shareholders);
          }
          if (Array.isArray(ct.history)) {
            setHistory(ct.history);
          }
        }
      } catch { /* silent */ } finally {
        if (mounted) setLoadingData(false);
      }
    }
    void loadCapTable();
    return () => { mounted = false; };
  }, [user]);

  const addShareholder = () => setShareholders(s => [...s, { id: mkId(), name: "", role: "", shares: 0, type: "founder" }]);
  const removeShareholder = (id: string) => setShareholders(s => s.filter(h => h.id !== id));
  const updateShareholder = (id: string, field: keyof Shareholder, value: string | number) =>
    setShareholders(s => s.map(h => h.id === id ? { ...h, [field]: value } : h));

  const handleCalculate = useCallback(() => {
    if (!showNewRound || !newRound.amount || !newRound.valuation) {
      setDilutionResult(null);
      return;
    }
    const result = computeDilution(shareholders, newRound);
    setDilutionResult(result);
    setAiCommentary("");
  }, [shareholders, newRound, showNewRound]);

  const handleAIAnalysis = useCallback(async () => {
    if (shareholders.length === 0 || loadingAI) return;
    setLoadingAI(true);
    setError("");
    setAiCommentary("");
    try {
      const token = await user?.getIdToken();
      const res = await fetch("/api/cap-table", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({
          companyName: companyName || "شركتي",
          shareholders,
          newRound: showNewRound && newRound.amount ? newRound : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "حدث خطأ");
      setAiCommentary(data.result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "حدث خطأ غير متوقع");
    } finally {
      setLoadingAI(false);
    }
  }, [shareholders, companyName, showNewRound, newRound, loadingAI, user]);

  const handleSave = useCallback(async () => {
    if (!user) return;
    setSaving(true);
    setSaveMsg("");
    try {
      const token = await user.getIdToken();
      const newHistory = [
        { ts: Date.now(), label: companyName || "نسخة", shareholders, companyName },
        ...history.slice(0, 9),
      ];
      const res = await fetch("/api/cap-table/save", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ companyName, shareholders, history: newHistory }),
      });
      if (!res.ok) throw new Error("فشل الحفظ");
      setHistory(newHistory);
      setSaveMsg("تم الحفظ");
      setTimeout(() => setSaveMsg(""), 2000);
    } catch {
      setSaveMsg("فشل الحفظ");
    } finally {
      setSaving(false);
    }
  }, [user, companyName, shareholders, history]);

  const loadHistorySnapshot = (snap: { shareholders: Shareholder[]; companyName: string }) => {
    setShareholders(snap.shareholders);
    setCompanyName(snap.companyName);
    setShowHistory(false);
    setDilutionResult(null);
    setAiCommentary("");
  };

  const inputClass = "w-full bg-slate-900/70 border border-slate-700/50 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/50 text-sm";

  return (
    <AppShell>
      <div className="min-h-screen bg-[#0a0a0f] text-white" dir="rtl">
        <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">

          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="text-slate-400 hover:text-white transition-colors">
                <ArrowLeft size={20} />
              </Link>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <PieChart className="text-violet-400" size={24} />
                  إدارة الحصص (Cap Table)
                </h1>
                <p className="text-slate-400 text-sm mt-1">تتبع ملكية الشركة واحسب التخفيف بدقة عند جولات الاستثمار</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {history.length > 0 && (
                <button onClick={() => setShowHistory(!showHistory)}
                  className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white border border-slate-700/50 rounded-xl px-3 py-2 transition-colors">
                  <History size={14} /> السجل
                </button>
              )}
              {user && (
                <button onClick={handleSave} disabled={saving}
                  className="flex items-center gap-1.5 text-sm bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white px-4 py-2 rounded-xl transition-colors">
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  {saveMsg || "حفظ"}
                </button>
              )}
            </div>
          </motion.div>

          {loadingData && (
            <div className="flex items-center gap-2 text-slate-400 text-sm">
              <Loader2 size={14} className="animate-spin" /> جاري تحميل البيانات...
            </div>
          )}

          <AnimatePresence>
            {showHistory && history.length > 0 && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4 space-y-2">
                <div className="text-sm font-semibold text-slate-300 mb-3">نسخ محفوظة سابقة</div>
                {history.map((snap, i) => (
                  <button key={i} onClick={() => loadHistorySnapshot(snap)}
                    className="w-full text-right flex items-center justify-between p-3 rounded-xl bg-slate-900/50 hover:bg-slate-900/80 border border-slate-700/30 transition-colors">
                    <span className="text-sm text-slate-300">{snap.companyName || "بدون اسم"}</span>
                    <span className="text-xs text-slate-500">{new Date(snap.ts).toLocaleDateString("ar-EG")}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-5 space-y-4">

            <div>
              <label className="text-slate-400 text-xs block mb-1.5">اسم الشركة</label>
              <input value={companyName} onChange={e => setCompanyName(e.target.value)}
                placeholder="مثال: شركة كلميرون للتقنية" className={inputClass} />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-300">المساهمون</span>
                <span className="text-xs text-slate-500">إجمالي الأسهم: {totalShares.toLocaleString("ar-EG")}</span>
              </div>

              <div className="grid grid-cols-12 gap-2 px-3 pb-1">
                <div className="col-span-3 text-xs text-slate-500">الاسم</div>
                <div className="col-span-2 text-xs text-slate-500">الدور</div>
                <div className="col-span-2 text-xs text-slate-500 text-center">الأسهم</div>
                <div className="col-span-2 text-xs text-slate-500">النوع</div>
                <div className="col-span-2 text-xs text-slate-500 text-center">النسبة</div>
                <div className="col-span-1" />
              </div>

              {shareholders.map((h, i) => {
                const pct = totalShares > 0 ? ((h.shares / totalShares) * 100).toFixed(1) : "0";
                const cfg = TYPE_CONFIG[h.type];
                const barWidth = totalShares > 0 ? (h.shares / totalShares) * 100 : 0;
                return (
                  <motion.div key={h.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                    className="rounded-xl bg-slate-900/50 border border-slate-700/30 overflow-hidden">
                    <div className="grid grid-cols-12 gap-2 items-center p-3">
                      <div className="col-span-3">
                        <input value={h.name} onChange={e => updateShareholder(h.id, "name", e.target.value)}
                          placeholder="الاسم" className="w-full bg-transparent text-white text-sm placeholder-slate-500 focus:outline-none" />
                      </div>
                      <div className="col-span-2">
                        <input value={h.role} onChange={e => updateShareholder(h.id, "role", e.target.value)}
                          placeholder="الدور" className="w-full bg-transparent text-slate-300 text-sm placeholder-slate-500 focus:outline-none" />
                      </div>
                      <div className="col-span-2">
                        <input type="number" value={h.shares || ""} onChange={e => updateShareholder(h.id, "shares", Number(e.target.value))}
                          className="w-full bg-transparent text-white text-sm focus:outline-none text-center" />
                      </div>
                      <div className="col-span-2">
                        <select value={h.type} onChange={e => updateShareholder(h.id, "type", e.target.value as ShareholderType)}
                          className={`w-full text-xs rounded-lg px-2 py-1 border ${cfg.bg} ${cfg.color} focus:outline-none`}>
                          {Object.entries(TYPE_CONFIG).map(([v, c]) => (
                            <option key={v} value={v} style={{ background: "#1e293b", color: "white" }}>{c.label}</option>
                          ))}
                        </select>
                      </div>
                      <div className="col-span-2 text-center">
                        <span className="text-sm font-bold" style={{ color: PIE_COLORS[i % PIE_COLORS.length] }}>{pct}٪</span>
                      </div>
                      <div className="col-span-1 text-left">
                        {shareholders.length > 1 && (
                          <button onClick={() => removeShareholder(h.id)} className="text-slate-600 hover:text-rose-400 transition-colors">
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="h-0.5 bg-slate-800">
                      <div className="h-full transition-all duration-500 rounded-full"
                        style={{ width: `${barWidth}%`, backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                    </div>
                  </motion.div>
                );
              })}

              <button onClick={addShareholder} className="flex items-center gap-2 text-sm text-violet-400 hover:text-violet-300 transition-colors">
                <Plus size={14} /> إضافة مساهم
              </button>
            </div>

            <div className="border-t border-slate-700/50 pt-4 space-y-3">
              <button onClick={() => { setShowNewRound(!showNewRound); setDilutionResult(null); }}
                className={`flex items-center gap-2 text-sm font-medium transition-colors ${showNewRound ? "text-emerald-400" : "text-slate-400 hover:text-emerald-400"}`}>
                <TrendingDown size={14} />
                {showNewRound ? "إخفاء" : "إضافة"} جولة استثمار جديدة (حساب التخفيف)
              </button>

              <AnimatePresence>
                {showNewRound && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                    className="space-y-3">
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="text-slate-400 text-xs block mb-1">مبلغ الاستثمار ($)</label>
                        <input type="number" value={newRound.amount || ""} onChange={e => setNewRound(r => ({ ...r, amount: Number(e.target.value) }))}
                          placeholder="500000" className={inputClass} />
                      </div>
                      <div>
                        <label className="text-slate-400 text-xs block mb-1">تقييم Pre-Money ($)</label>
                        <input type="number" value={newRound.valuation || ""} onChange={e => setNewRound(r => ({ ...r, valuation: Number(e.target.value) }))}
                          placeholder="2000000" className={inputClass} />
                      </div>
                      <div>
                        <label className="text-slate-400 text-xs block mb-1">اسم المستثمر</label>
                        <input value={newRound.investorName} onChange={e => setNewRound(r => ({ ...r, investorName: e.target.value }))}
                          placeholder="صندوق X" className={inputClass} />
                      </div>
                    </div>
                    <button onClick={handleCalculate} disabled={!newRound.amount || !newRound.valuation}
                      className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all">
                      <PieChart size={14} />
                      احسب التخفيف الآن
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          <AnimatePresence>
            {dilutionResult && (
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="bg-slate-800/40 border border-emerald-500/30 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-bold text-emerald-400 flex items-center gap-2">
                    <CheckCircle2 size={16} /> نتائج حساب التخفيف
                  </h2>
                  <button onClick={() => setDilutionResult(null)} className="text-slate-500 hover:text-white">
                    <RefreshCw size={14} />
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: "Post-Money Valuation", value: `$${dilutionResult.postMoneyValuation.toLocaleString()}` },
                    { label: "سعر السهم الجديد", value: `$${dilutionResult.pricePerShare.toLocaleString()}` },
                    { label: "أسهم المستثمر الجديد", value: dilutionResult.newSharesIssued.toLocaleString() },
                    { label: "نسبة المستثمر الجديد", value: `${dilutionResult.investorOwnershipPct}٪` },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-slate-900/60 rounded-xl p-3 text-center">
                      <div className="text-xs text-slate-500 mb-1">{label}</div>
                      <div className="text-sm font-bold text-white">{value}</div>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-semibold text-slate-300 mb-2">جدول الحصص بعد الجولة</div>
                  <div className="grid grid-cols-12 gap-2 px-3 pb-1 text-xs text-slate-500">
                    <div className="col-span-3">المساهم</div>
                    <div className="col-span-2 text-center">قبل</div>
                    <div className="col-span-2 text-center">بعد</div>
                    <div className="col-span-2 text-center">التخفيف</div>
                    <div className="col-span-3 text-center">الأسهم</div>
                  </div>
                  {dilutionResult.newCapTable.map((row, i) => {
                    const cfg = TYPE_CONFIG[row.type];
                    return (
                      <div key={row.id} className="grid grid-cols-12 gap-2 items-center p-3 rounded-xl bg-slate-900/50 border border-slate-700/20">
                        <div className="col-span-3">
                          <div className="text-sm text-white">{row.name}</div>
                          <div className={`text-xs ${cfg.color}`}>{cfg.label}</div>
                        </div>
                        <div className="col-span-2 text-center text-sm text-slate-400">{row.pctBefore.toFixed(1)}٪</div>
                        <div className="col-span-2 text-center text-sm font-bold" style={{ color: PIE_COLORS[i % PIE_COLORS.length] }}>
                          {row.pctAfter.toFixed(1)}٪
                        </div>
                        <div className="col-span-2 text-center text-xs">
                          {row.dilutedBy > 0 ? (
                            <span className="text-rose-400">-{row.dilutedBy.toFixed(1)}٪</span>
                          ) : row.type === "investor" ? (
                            <span className="text-emerald-400">جديد</span>
                          ) : (
                            <span className="text-slate-500">—</span>
                          )}
                        </div>
                        <div className="col-span-3 text-center text-xs text-slate-500">
                          {row.sharesAfter.toLocaleString()}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-300">تحليل AI لهيكل الملكية</h2>
              <button onClick={handleAIAnalysis} disabled={loadingAI || shareholders.length === 0}
                className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all">
                {loadingAI ? <Loader2 size={14} className="animate-spin" /> : <PieChart size={14} />}
                {loadingAI ? "جاري التحليل..." : "احصل على توصيات AI"}
              </button>
            </div>
            <p className="text-xs text-slate-500">يُحلل AI هيكل الملكية ويقدّم توصيات استراتيجية مبنية على معايير السوق المصري والعربي.</p>

            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="bg-red-900/30 border border-red-500/30 rounded-xl p-3 text-red-300 text-sm flex gap-2">
                  <AlertCircle size={14} className="mt-0.5 shrink-0" /> {error}
                </motion.div>
              )}
              {aiCommentary && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="bg-slate-900/50 border border-violet-500/20 rounded-xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-violet-400 text-sm font-medium flex items-center gap-1">
                      <CheckCircle2 size={14} /> تحليل الحصص
                    </span>
                    <button onClick={() => { navigator.clipboard.writeText(aiCommentary); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                      className="text-slate-400 hover:text-white transition-colors">
                      {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    </button>
                  </div>
                  <div className="text-sm leading-relaxed prose prose-invert prose-neutral max-w-none
                    prose-headings:text-violet-400 prose-headings:font-bold prose-strong:text-white
                    prose-li:text-slate-300 prose-p:text-slate-300 prose-table:text-slate-300" dir="auto">
                    <ReactMarkdown>{aiCommentary}</ReactMarkdown>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            className="grid grid-cols-3 gap-3">
            {[
              { href: "/cofounder-health", label: "صحة الفريق", icon: "🤝" },
              { href: "/term-sheet-analyzer", label: "محلل Term Sheet", icon: "📋" },
              { href: "/financial-model", label: "النموذج المالي", icon: "📊" },
            ].map(({ href, label, icon }) => (
              <Link key={href} href={href}
                className="bg-slate-800/40 border border-slate-700/30 hover:border-slate-600/50 rounded-xl p-4 text-center transition-all group">
                <div className="text-2xl mb-1">{icon}</div>
                <div className="text-slate-300 text-sm font-medium group-hover:text-white transition-colors">{label}</div>
              </Link>
            ))}
          </motion.div>

        </div>
      </div>
    </AppShell>
  );
}
