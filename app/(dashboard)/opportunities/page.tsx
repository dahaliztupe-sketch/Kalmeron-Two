"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Radar, Sparkles, ArrowLeft, Loader2, RefreshCw,
  DollarSign, Calendar, Globe, Award, Zap, ExternalLink,
  CheckCircle2, Copy, Check, Filter,
} from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/contexts/AuthContext";

type Category = "all" | "funding" | "accelerator" | "competition" | "grant";

interface Opportunity {
  id: string;
  title: string;
  provider: string;
  category: Category;
  amount?: string;
  deadline?: string;
  region: string;
  description: string;
  url?: string;
  tags: string[];
}

const STATIC_OPPORTUNITIES: Opportunity[] = [
  {
    id: "1",
    title: "مسرّع Flat6Labs القاهرة",
    provider: "Flat6Labs",
    category: "accelerator",
    amount: "٣٠,٠٠٠ دولار",
    deadline: "متجدد كل 6 أشهر",
    region: "مصر",
    description: "برنامج تسريع مدته 4 أشهر مع تمويل أولي، إرشاد متخصص، وشبكة مستثمرين عالمية.",
    url: "https://flat6labs.com",
    tags: ["seed", "mentorship", "network"],
  },
  {
    id: "2",
    title: "صندوق ريادة البنك الأهلي",
    provider: "البنك الأهلي المصري",
    category: "funding",
    amount: "حتى ٥٠٠,٠٠٠ جنيه",
    deadline: "مستمر",
    region: "مصر",
    description: "تمويل ميسر للشركات الناشئة المصرية مع فترة سماح ودعم فني.",
    tags: ["loan", "SME", "egypt"],
  },
  {
    id: "3",
    title: "MIT Enterprise Forum Arab Startup Competition",
    provider: "MIT",
    category: "competition",
    amount: "١٠٠,٠٠٠ دولار",
    deadline: "يونيو سنوياً",
    region: "MENA",
    description: "مسابقة سنوية لأفضل الشركات الناشئة في العالم العربي مع جوائز ودعم تقني.",
    url: "https://mitarabcompetition.com",
    tags: ["competition", "prize", "MENA"],
  },
  {
    id: "4",
    title: "منحة GSMA Innovation Fund",
    provider: "GSMA",
    category: "grant",
    amount: "٢٥٠,٠٠٠ دولار",
    deadline: "أبريل سنوياً",
    region: "أفريقيا",
    description: "منح للتقنيات المحمولة الابتكارية في أسواق النمو — مفتوحة للشركات المصرية.",
    tags: ["grant", "mobile", "Africa"],
  },
  {
    id: "5",
    title: "برنامج Google for Startups",
    provider: "Google",
    category: "accelerator",
    amount: "حتى ٢٠٠,٠٠٠ دولار كريديت سحابي",
    deadline: "متجدد",
    region: "عالمي",
    description: "دعم تقني وكريديت Google Cloud وورش عمل مع خبراء Google.",
    url: "https://startup.google.com",
    tags: ["cloud", "tech", "global"],
  },
  {
    id: "6",
    title: "مسابقة RiseUp Summit",
    provider: "RiseUp",
    category: "competition",
    amount: "١٥,٠٠٠ دولار",
    deadline: "أكتوبر سنوياً",
    region: "مصر & MENA",
    description: "أكبر قمة ريادية في الشرق الأوسط مع مسابقة للشركات الناشئة وعرض أمام مستثمرين.",
    url: "https://riseupsummit.com",
    tags: ["event", "pitch", "MENA"],
  },
  {
    id: "7",
    title: "مبادرة التحول الرقمي — وزارة الاتصالات",
    provider: "وزارة الاتصالات المصرية",
    category: "grant",
    amount: "دعم فني + منحة",
    deadline: "مستمر",
    region: "مصر",
    description: "دعم الشركات الناشئة التقنية المصرية بالبنية التحتية والإرشاد والحوافز الضريبية.",
    tags: ["govtech", "digital", "egypt"],
  },
  {
    id: "8",
    title: "Seedstars World Competition",
    provider: "Seedstars",
    category: "competition",
    amount: "٥٠٠,٠٠٠ دولار (سهم)",
    deadline: "سبتمبر سنوياً",
    region: "عالمي",
    description: "مسابقة عالمية للأسواق الناشئة — مصر من الدول المشاركة بشكل منتظم.",
    url: "https://seedstars.com",
    tags: ["global", "equity", "emerging"],
  },
];

const CATEGORY_LABELS: Record<Category, string> = {
  all: "الكل",
  funding: "تمويل",
  accelerator: "مسرّع",
  competition: "مسابقة",
  grant: "منحة",
};

const CATEGORY_COLORS: Record<Category, string> = {
  all: "from-slate-500 to-gray-500",
  funding: "from-emerald-500 to-green-500",
  accelerator: "from-violet-500 to-purple-500",
  competition: "from-amber-500 to-orange-500",
  grant: "from-cyan-500 to-blue-500",
};

export default function OpportunitiesPage() {
  const { user } = useAuth();
  const [category, setCategory] = useState<Category>("all");
  const [aiQuery, setAiQuery] = useState("");
  const [aiResult, setAiResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const filtered = category === "all"
    ? STATIC_OPPORTUNITIES
    : STATIC_OPPORTUNITIES.filter(o => o.category === category);

  const handleAiSearch = useCallback(async () => {
    if (!aiQuery.trim() || loading) return;
    setLoading(true);
    setError("");
    setAiResult("");
    try {
      const token = await user?.getIdToken();
      const res = await fetch("/api/opportunities", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ query: aiQuery }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "حدث خطأ");
      setAiResult(data.result);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "حدث خطأ غير متوقع");
    } finally {
      setLoading(false);
    }
  }, [aiQuery, loading, user]);

  const handleCopy = useCallback(() => {
    if (!aiResult) return;
    navigator.clipboard.writeText(aiResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [aiResult]);

  return (
    <AppShell>
      <div className="min-h-screen bg-[#0a0a0f] text-white" dir="rtl">
        <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4"
          >
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
          </motion.div>

          {/* AI Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 border border-slate-700/50 rounded-2xl p-6 space-y-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="text-cyan-400" size={18} />
              <span className="font-semibold text-cyan-400">ابحث بالذكاء الاصطناعي</span>
            </div>
            <p className="text-slate-400 text-sm">
              أخبرني عن شركتك وسأجد لك أنسب الفرص المتاحة
            </p>
            <textarea
              value={aiQuery}
              onChange={e => setAiQuery(e.target.value)}
              placeholder="مثال: شركة SaaS في مرحلة pre-seed، قطاع التعليم، فريق من شخصين، تبحث عن تمويل أولي..."
              rows={3}
              className="w-full bg-slate-900/70 border border-slate-700/50 rounded-xl px-4 py-3 text-white placeholder-slate-500 resize-none focus:outline-none focus:border-cyan-500/50 text-sm"
            />
            <button
              onClick={handleAiSearch}
              disabled={loading || !aiQuery.trim()}
              className="flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Radar size={16} />}
              {loading ? "جاري البحث..." : "ابحث عن فرص مناسبة"}
            </button>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="bg-red-900/30 border border-red-500/30 rounded-xl p-4 text-red-300 text-sm"
                >
                  {error}
                </motion.div>
              )}
              {aiResult && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="bg-slate-900/50 border border-cyan-500/20 rounded-xl p-5 space-y-3"
                >
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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="flex items-center gap-2 flex-wrap"
          >
            <Filter size={16} className="text-slate-400" />
            {(Object.keys(CATEGORY_LABELS) as Category[]).map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  category === cat
                    ? "bg-gradient-to-r " + CATEGORY_COLORS[cat] + " text-white shadow-lg"
                    : "bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-700/60"
                }`}
              >
                {CATEGORY_LABELS[cat]}
              </button>
            ))}
          </motion.div>

          {/* Opportunities Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((opp, i) => (
              <motion.div
                key={opp.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.05 }}
                className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-5 hover:border-slate-600/60 transition-all group space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium bg-gradient-to-r ${CATEGORY_COLORS[opp.category]} text-white`}>
                        {CATEGORY_LABELS[opp.category]}
                      </span>
                      <span className="text-slate-500 text-xs flex items-center gap-1">
                        <Globe size={10} /> {opp.region}
                      </span>
                    </div>
                    <h3 className="font-semibold text-white group-hover:text-cyan-300 transition-colors">
                      {opp.title}
                    </h3>
                    <p className="text-slate-400 text-xs">{opp.provider}</p>
                  </div>
                  {opp.url && (
                    <a
                      href={opp.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-500 hover:text-cyan-400 transition-colors"
                    >
                      <ExternalLink size={16} />
                    </a>
                  )}
                </div>

                <p className="text-slate-300 text-sm leading-relaxed">{opp.description}</p>

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

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {opp.tags.map(tag => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 bg-slate-700/50 rounded text-slate-400 text-xs"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Stats Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="grid grid-cols-3 gap-4"
          >
            {[
              { icon: Award, label: "فرصة متاحة", value: STATIC_OPPORTUNITIES.length.toString(), color: "text-cyan-400" },
              { icon: Zap, label: "مسرّعات نشطة", value: "٢", color: "text-violet-400" },
              { icon: DollarSign, label: "إجمالي التمويل المتاح", value: "+١M$", color: "text-emerald-400" },
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-4 text-center">
                <Icon size={20} className={`${color} mx-auto mb-1`} />
                <div className={`text-xl font-bold ${color}`}>{value}</div>
                <div className="text-slate-400 text-xs">{label}</div>
              </div>
            ))}
          </motion.div>

        </div>
      </div>
    </AppShell>
  );
}
