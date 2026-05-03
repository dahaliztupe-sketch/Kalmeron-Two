"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Radar, Sparkles, ArrowLeft, Loader2, RefreshCw,
  DollarSign, Calendar, Globe, Award, Zap, ExternalLink,
  CheckCircle2, Copy, Check, Filter, AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/contexts/AuthContext";

type Category = "all" | "funding" | "accelerator" | "competition" | "grant";

interface Opportunity {
  id: string;
  title: string;
  provider?: string;
  organizer?: string;
  category?: Category;
  type?: string;
  amount?: string;
  deadline?: string;
  region?: string;
  countries?: string[];
  description?: string;
  url?: string;
  link?: string;
  tags?: string[];
}

const CATEGORY_LABELS: Record<string, string> = {
  all: "الكل",
  funding: "تمويل",
  accelerator: "مسرّع",
  competition: "مسابقة",
  grant: "منحة",
};

const CATEGORY_COLORS: Record<string, string> = {
  all: "from-slate-500 to-gray-500",
  funding: "from-emerald-500 to-green-500",
  accelerator: "from-violet-500 to-purple-500",
  competition: "from-amber-500 to-orange-500",
  grant: "from-cyan-500 to-blue-500",
};

function typeToCategory(type?: string): string {
  if (!type) return "funding";
  const map: Record<string, string> = {
    grant: "grant",
    accelerator: "accelerator",
    competition: "competition",
    funding: "funding",
    loan: "funding",
    incubator: "accelerator",
  };
  return map[type.toLowerCase()] || "funding";
}

export default function OpportunitiesPage() {
  const { user } = useAuth();
  const [category, setCategory] = useState<Category>("all");
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiQuery, setAiQuery] = useState("");
  const [aiResult, setAiResult] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  // ── Fetch from real API ───────────────────────────────────────────────────
  const fetchOpportunities = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const headers: Record<string, string> = {};
      if (user) {
        const token = await user.getIdToken().catch(() => null);
        if (token) headers["Authorization"] = `Bearer ${token}`;
      }
      const params = new URLSearchParams({ limit: "30" });
      const res = await fetch(`/api/opportunities?${params}`, { headers, cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json() as { opportunities: Opportunity[]; status?: string };
      setOpportunities(data.opportunities || []);
      if (data.status === "unavailable") {
        setError("لا توجد فرص منشورة حالياً في قاعدة البيانات");
      }
    } catch {
      setError("تعذّر تحميل الفرص");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchOpportunities();
  }, [fetchOpportunities]);

  const filtered = category === "all"
    ? opportunities
    : opportunities.filter(o => typeToCategory(o.type || o.category as string) === category);

  const handleAiSearch = useCallback(async () => {
    if (!aiQuery.trim() || aiLoading) return;
    setAiLoading(true);
    setError("");
    setAiResult("");
    try {
      const token = await user?.getIdToken();
      const res = await fetch("/api/opportunities", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ query: aiQuery }),
      });
      const data = await res.json() as { result?: string; error?: string };
      if (!res.ok) throw new Error(data.error || "حدث خطأ");
      setAiResult(data.result || "");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "حدث خطأ غير متوقع");
    } finally {
      setAiLoading(false);
    }
  }, [aiQuery, aiLoading, user]);

  const handleCopy = useCallback(() => {
    if (!aiResult) return;
    navigator.clipboard.writeText(aiResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [aiResult]);

  const totalFunding = opportunities.filter(o =>
    typeToCategory(o.type || o.category as string) === "funding"
  ).length;
  const totalAccelerators = opportunities.filter(o =>
    typeToCategory(o.type || o.category as string) === "accelerator"
  ).length;

  return (
    <AppShell>
      <div className="min-h-screen bg-[#0a0a0f] text-white" dir="rtl">
        <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="text-slate-400 hover:text-white transition-colors">
                <ArrowLeft size={20} />
              </Link>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <Radar className="text-cyan-400" size={24} />
                  رادار الفرص
                </h1>
                <p className="text-slate-400 text-sm mt-1">
                  تمويل، مسرّعات، مسابقات ومنح للشركات الناشئة المصرية والعربية
                </p>
              </div>
            </div>
            <button onClick={fetchOpportunities} disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700/40 hover:bg-slate-600/40 text-slate-300 rounded-lg text-sm transition-colors">
              <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
              تحديث
            </button>
          </motion.div>

          {/* AI Search */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 border border-slate-700/50 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="text-cyan-400" size={18} />
              <span className="font-semibold text-cyan-400">ابحث بالذكاء الاصطناعي</span>
            </div>
            <p className="text-slate-400 text-sm">أخبرني عن شركتك وسأجد لك أنسب الفرص المتاحة</p>
            <textarea value={aiQuery} onChange={e => setAiQuery(e.target.value)}
              placeholder="مثال: شركة SaaS في مرحلة pre-seed، قطاع التعليم، فريق من شخصين، تبحث عن تمويل أولي..."
              rows={3}
              className="w-full bg-slate-900/70 border border-slate-700/50 rounded-xl px-4 py-3 text-white placeholder-slate-500 resize-none focus:outline-none focus:border-cyan-500/50 text-sm" />
            <button onClick={handleAiSearch} disabled={aiLoading || !aiQuery.trim()}
              className="flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              {aiLoading ? <Loader2 size={16} className="animate-spin" /> : <Radar size={16} />}
              {aiLoading ? "جاري البحث..." : "ابحث عن فرص مناسبة"}
            </button>

            <AnimatePresence>
              {error && !loading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="bg-red-900/30 border border-red-500/30 rounded-xl p-4 text-red-300 text-sm flex items-start gap-2">
                  <AlertCircle size={14} className="mt-0.5 shrink-0" />
                  {error}
                </motion.div>
              )}
              {aiResult && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="bg-slate-900/50 border border-cyan-500/20 rounded-xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-cyan-400 text-sm font-medium flex items-center gap-1">
                      <CheckCircle2 size={14} /> تحليل الفرص المناسبة
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

          {/* Filters */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="flex items-center gap-2 flex-wrap">
            <Filter size={16} className="text-slate-400" />
            {(Object.keys(CATEGORY_LABELS) as Category[]).map(cat => (
              <button key={cat} onClick={() => setCategory(cat)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  category === cat
                    ? "bg-gradient-to-r " + CATEGORY_COLORS[cat] + " text-white shadow-lg"
                    : "bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-700/60"
                }`}>
                {CATEGORY_LABELS[cat]}
              </button>
            ))}
          </motion.div>

          {/* Loading state */}
          {loading && (
            <div className="flex items-center justify-center py-16 text-slate-500 gap-2">
              <Loader2 size={20} className="animate-spin" />
              <span>جاري تحميل الفرص...</span>
            </div>
          )}

          {/* Opportunities Grid */}
          {!loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filtered.map((opp, i) => {
                const cat = typeToCategory(opp.type || opp.category as string);
                const href = opp.url || opp.link;
                return (
                  <motion.div key={opp.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + i * 0.05 }}
                    className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-5 hover:border-slate-600/60 transition-all group space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium bg-gradient-to-r ${CATEGORY_COLORS[cat] || CATEGORY_COLORS.funding} text-white`}>
                            {CATEGORY_LABELS[cat] || "فرصة"}
                          </span>
                          {(opp.countries || []).length > 0 && (
                            <span className="text-slate-500 text-xs flex items-center gap-1">
                              <Globe size={10} /> {opp.countries?.slice(0, 2).join(", ")}
                            </span>
                          )}
                        </div>
                        <h3 className="font-semibold text-white group-hover:text-cyan-300 transition-colors">
                          {opp.title}
                        </h3>
                        <p className="text-slate-400 text-xs">{opp.provider || opp.organizer}</p>
                      </div>
                      {href && (
                        <a href={href} target="_blank" rel="noopener noreferrer"
                          className="text-slate-500 hover:text-cyan-400 transition-colors shrink-0 mt-1">
                          <ExternalLink size={16} />
                        </a>
                      )}
                    </div>

                    {opp.description && (
                      <p className="text-slate-300 text-sm leading-relaxed">{opp.description}</p>
                    )}

                    <div className="flex items-center gap-4 pt-1">
                      {opp.amount && (
                        <span className="flex items-center gap-1 text-emerald-400 text-sm font-medium">
                          <DollarSign size={13} /> {opp.amount}
                        </span>
                      )}
                      {opp.deadline && (
                        <span className="flex items-center gap-1 text-slate-400 text-xs">
                          <Calendar size={12} /> {opp.deadline}
                        </span>
                      )}
                    </div>

                    {(opp.tags || []).length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {(opp.tags || []).map(tag => (
                          <span key={tag} className="px-2 py-0.5 bg-slate-700/50 rounded text-slate-400 text-xs">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </motion.div>
                );
              })}

              {!loading && filtered.length === 0 && (
                <div className="col-span-2 text-center py-12 text-slate-500">
                  <Radar size={40} className="mx-auto mb-3 opacity-40" />
                  <p>لا توجد فرص في هذه الفئة حالياً</p>
                </div>
              )}
            </div>
          )}

          {/* Stats Footer */}
          {!loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
              className="grid grid-cols-3 gap-4">
              {[
                { icon: Award, label: "فرصة متاحة", value: opportunities.length.toString(), color: "text-cyan-400" },
                { icon: Zap, label: "مسرّعات نشطة", value: totalAccelerators.toString(), color: "text-violet-400" },
                { icon: DollarSign, label: "فرص تمويل", value: totalFunding.toString(), color: "text-emerald-400" },
              ].map(({ icon: Icon, label, value, color }) => (
                <div key={label} className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-4 text-center">
                  <Icon size={20} className={`${color} mx-auto mb-1`} />
                  <div className={`text-xl font-bold ${color}`}>{value}</div>
                  <div className="text-slate-400 text-xs">{label}</div>
                </div>
              ))}
            </motion.div>
          )}

        </div>
      </div>
    </AppShell>
  );
}
