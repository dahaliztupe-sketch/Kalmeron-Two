"use client";

import { useState, useEffect, useCallback } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Loader2, Lightbulb, CheckCircle2, Copy, Check,
  Download, History, ChevronDown, BarChart3, Shield,
  Target, Rocket, Plus, Clock, Trash2, Users, AlertCircle, RefreshCw,
} from "lucide-react";
import { db } from "@/src/lib/firebase";
import {
  collection, addDoc, serverTimestamp,
  query, orderBy, limit, getDocs, deleteDoc, doc
} from "firebase/firestore";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/src/lib/utils";

type PageTab = "analyze" | "first100";

const INDUSTRIES = [
  "تقنية المعلومات والبرمجيات",
  "التجارة الإلكترونية والتجزئة",
  "الصحة والرعاية الطبية",
  "التعليم والتدريب",
  "التمويل والتقنية المالية",
  "العقارات والبناء",
  "الغذاء والمشروبات",
  "الإعلام والترفيه",
  "الخدمات اللوجستية والتوصيل",
  "الزراعة والتقنية الزراعية",
  "السياحة والضيافة",
  "أخرى",
];

const STAGES = [
  { value: "idea", label: "مجرد فكرة" },
  { value: "validation", label: "مرحلة التحقق" },
  { value: "mvp", label: "نموذج أولي (MVP)" },
  { value: "seed", label: "Pre-Seed / Seed" },
  { value: "growth", label: "نمو وتوسع" },
];

const ANALYSIS_TABS = [
  { id: "swot", label: "SWOT", icon: BarChart3 },
  { id: "market", label: "السوق", icon: Target },
  { id: "shield", label: "المخاطر", icon: Shield },
  { id: "mvp", label: "خطة MVP", icon: Rocket },
];

interface IdeaRecord {
  id: string;
  title: string;
  swot_analysis: string;
  created_at: { seconds: number } | null;
}

function parseAnalysisTabs(text: string): Record<string, string> {
  const sections: Record<string, string> = { swot: "", market: "", shield: "", mvp: "" };
  const lower = text.toLowerCase();

  const swotIdx = lower.indexOf("swot") !== -1 ? lower.indexOf("swot") : 0;
  const marketIdx = lower.search(/حجم السوق|market fit|السوق المصري/);
  const riskIdx = lower.search(/منافس|منافسين|مخاطر|تهديد/);
  const mvpIdx = lower.search(/توصية|خلاصة|خطوة|mvp|النموذج/);

  const points = [
    { key: "swot", idx: swotIdx },
    { key: "market", idx: marketIdx !== -1 ? marketIdx : text.length },
    { key: "shield", idx: riskIdx !== -1 ? riskIdx : text.length },
    { key: "mvp", idx: mvpIdx !== -1 ? mvpIdx : text.length },
  ].sort((a, b) => a.idx - b.idx);

  for (let i = 0; i < points.length; i++) {
    const start = points[i].idx;
    const end = i + 1 < points.length ? points[i + 1].idx : text.length;
    sections[points[i].key] = text.slice(start, end).trim();
  }

  if (!sections.swot && !sections.market && !sections.shield && !sections.mvp) {
    sections.swot = text;
  }

  return sections;
}

export default function IdeaValidationPage() {
  const { user, dbUser } = useAuth();
  const [pageTab, setPageTab] = useState<PageTab>("analyze");

  // Analyze state
  const [ideaDesc, setIdeaDesc] = useState("");
  const [industry, setIndustry] = useState("");
  const [stage, setStage] = useState("idea");
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("swot");
  const [copied, setCopied] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<IdeaRecord[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [tabs, setTabs] = useState<Record<string, string>>({});

  // First 100 state
  const [f100Product, setF100Product] = useState("");
  const [f100Segment, setF100Segment] = useState("");
  const [f100Budget, setF100Budget] = useState("");
  const [f100Stage, setF100Stage] = useState("pre-product");
  const [f100Loading, setF100Loading] = useState(false);
  const [f100Result, setF100Result] = useState("");
  const [f100Error, setF100Error] = useState("");
  const [f100Copied, setF100Copied] = useState(false);

  useEffect(() => {
    if (dbUser?.industry) setIndustry(dbUser.industry);
    if (dbUser?.startup_stage) setStage(dbUser.startup_stage);
  }, [dbUser]);

  const loadHistory = useCallback(async () => {
    if (!user) return;
    setLoadingHistory(true);
    try {
      const q = query(
        collection(db, "users", user.uid, "ideas"),
        orderBy("created_at", "desc"),
        limit(10)
      );
      const snap = await getDocs(q);
      setHistory(
        snap.docs.map((d) => ({ id: d.id, ...d.data() } as IdeaRecord))
      );
    } catch {
      // Firestore may not be available in all envs
    } finally {
      setLoadingHistory(false);
    }
  }, [user]);

  const handleValidate = async () => {
    if (!ideaDesc.trim() || !user) return;
    setIsValidating(true);
    setValidationResult(null);
    setTabs({});

    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/ideas/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ideaDesc, industry, startup_stage: stage }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const resultText: string = data.result || "";
      setValidationResult(resultText);
      setTabs(parseAnalysisTabs(resultText));
      setActiveTab("swot");

      try {
        await addDoc(collection(db, "users", user.uid, "ideas"), {
          userId: user.uid,
          title: ideaDesc.slice(0, 60),
          description: ideaDesc,
          swot_analysis: resultText,
          industry,
          stage,
          created_at: serverTimestamp(),
        });
      } catch {
        // Firestore optional
      }

      toast.success("تم التحليل! اطّلع على التقرير أدناه.");
    } catch (error) {
      console.error(error);
      toast.error("تعذّر التحليل. حاول مجدداً.");
    } finally {
      setIsValidating(false);
    }
  };

  const handleCopy = async () => {
    if (!validationResult) return;
    await navigator.clipboard.writeText(validationResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!validationResult) return;
    const blob = new Blob([`# تحليل الفكرة — كلميرون\n\n${validationResult}`], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `idea-analysis-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDeleteHistory = async (id: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, "users", user.uid, "ideas", id));
      setHistory((h) => h.filter((x) => x.id !== id));
      toast.success("تم الحذف");
    } catch {
      toast.error("تعذّر الحذف");
    }
  };

  const restoreFromHistory = (item: IdeaRecord) => {
    setValidationResult(item.swot_analysis);
    setTabs(parseAnalysisTabs(item.swot_analysis));
    setActiveTab("swot");
    setShowHistory(false);
    toast.success("تم استعادة التحليل");
  };

  const handleFirst100 = useCallback(async () => {
    if (!f100Product.trim() || f100Loading) return;
    setF100Loading(true);
    setF100Error("");
    setF100Result("");
    try {
      const token = await user?.getIdToken();
      const res = await fetch("/api/first-100", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ product: f100Product, segment: f100Segment, budget: f100Budget, stage: f100Stage }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "حدث خطأ");
      setF100Result(data.result);
    } catch (e: unknown) {
      setF100Error(e instanceof Error ? e.message : "حدث خطأ غير متوقع");
    } finally {
      setF100Loading(false);
    }
  }, [f100Product, f100Segment, f100Budget, f100Stage, f100Loading, user]);

  const tabContent = activeTab === "swot"
    ? (tabs.swot || validationResult || "")
    : (tabs[activeTab] || validationResult || "");

  const inputCls = "w-full bg-neutral-800/60 border border-neutral-700 text-white text-sm rounded-xl px-3 py-2.5 outline-none focus:border-[rgb(var(--brand-cyan))] transition-colors placeholder:text-neutral-600";

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-6 px-4 py-6" dir="rtl">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-3xl font-black tracking-tight flex items-center gap-2 text-[rgb(var(--brand-cyan))]">
                <Lightbulb className="w-8 h-8" />
                مختبر الأفكار
              </h1>
              <p className="text-neutral-400 mt-1 text-sm max-w-xl">
                تحليل SWOT كامل + ملاءمة السوق المصري + خطة أول 100 عميل
              </p>
            </div>
            <button
              onClick={() => { setShowHistory(!showHistory); if (!showHistory) loadHistory(); }}
              className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white border border-neutral-700 hover:border-neutral-500 rounded-lg px-3 py-2 transition-colors"
            >
              <History className="w-3.5 h-3.5" />
              التحليلات السابقة
              <ChevronDown className={cn("w-3 h-3 transition-transform", showHistory && "rotate-180")} />
            </button>
          </div>
        </motion.div>

        {/* Page Tab Switcher */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="flex gap-2">
          {[
            { id: "analyze" as PageTab, label: "تحليل الفكرة", icon: Lightbulb },
            { id: "first100" as PageTab, label: "أول 100 عميل", icon: Users },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setPageTab(id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all",
                pageTab === id
                  ? "bg-[rgb(var(--brand-cyan))]/20 text-[rgb(var(--brand-cyan))] border border-[rgb(var(--brand-cyan))]/30"
                  : "bg-neutral-800/60 text-neutral-400 hover:text-white hover:bg-neutral-700/60"
              )}
            >
              <Icon className="w-3.5 h-3.5" /> {label}
            </button>
          ))}
        </motion.div>

        {/* History Panel */}
        <AnimatePresence>
          {showHistory && pageTab === "analyze" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <Card className="bg-neutral-900/60 border-neutral-700/50 rounded-2xl">
                <CardHeader className="pb-2 pt-4 px-5">
                  <CardTitle className="text-sm text-neutral-300 font-medium">آخر 10 تحليلات</CardTitle>
                </CardHeader>
                <CardContent className="px-5 pb-4">
                  {loadingHistory ? (
                    <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin text-neutral-500" /></div>
                  ) : history.length === 0 ? (
                    <p className="text-neutral-500 text-sm py-2">لا توجد تحليلات سابقة بعد.</p>
                  ) : (
                    <div className="space-y-2">
                      {history.map((item) => (
                        <div key={item.id} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-neutral-800/50 hover:bg-neutral-800 transition-colors group">
                          <button
                            onClick={() => restoreFromHistory(item)}
                            className="flex-1 text-right"
                          >
                            <p className="text-sm text-white font-medium line-clamp-1">{item.title}</p>
                            <p className="text-xs text-neutral-500 flex items-center gap-1 mt-0.5">
                              <Clock className="w-3 h-3" />
                              {item.created_at?.seconds
                                ? new Date(item.created_at.seconds * 1000).toLocaleDateString("ar-EG")
                                : "—"}
                            </p>
                          </button>
                          <button
                            onClick={() => handleDeleteHistory(item.id)}
                            className="opacity-0 group-hover:opacity-100 text-rose-500 hover:text-rose-400 transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── First 100 Customers Tab ── */}
        {pageTab === "first100" && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <Card className="bg-neutral-900/60 border-neutral-700/50 rounded-2xl overflow-hidden">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="w-5 h-5 text-cyan-400" />
                  <span className="font-semibold text-cyan-400">استراتيجية أول 100 عميل</span>
                </div>
                <p className="text-neutral-400 text-sm">أخبرني عن منتجك وسأبني لك خطة اكتساب العملاء الأوائل خطوة بخطوة.</p>

                <div className="space-y-3">
                  <div>
                    <Label className="text-neutral-300 font-semibold text-sm">وصف المنتج/الخدمة *</Label>
                    <Textarea
                      value={f100Product}
                      onChange={e => setF100Product(e.target.value)}
                      placeholder="مثال: منصة SaaS تساعد المطاعم الصغيرة على إدارة الطلبات والمخزون..."
                      className="min-h-[90px] resize-none text-sm p-4 rounded-xl bg-neutral-800/60 text-white border-neutral-700 focus-visible:ring-cyan-500 placeholder:text-neutral-600 mt-1.5"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <Label className="text-neutral-300 font-semibold text-sm">العميل المستهدف</Label>
                      <input value={f100Segment} onChange={e => setF100Segment(e.target.value)}
                        placeholder="مثال: مطاعم 5-20 طاولة في القاهرة" className={cn(inputCls, "mt-1.5")} />
                    </div>
                    <div>
                      <Label className="text-neutral-300 font-semibold text-sm">مرحلة الشركة</Label>
                      <select value={f100Stage} onChange={e => setF100Stage(e.target.value)} className={cn(inputCls, "mt-1.5")}>
                        <option value="pre-product">قبل المنتج (Idea)</option>
                        <option value="MVP">MVP جاهز</option>
                        <option value="early-traction">بداية المبيعات</option>
                        <option value="growth">نمو</option>
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <Label className="text-neutral-300 font-semibold text-sm">الميزانية التسويقية</Label>
                      <input value={f100Budget} onChange={e => setF100Budget(e.target.value)}
                        placeholder="مثال: 5000 جنيه شهرياً، أو صفر" className={cn(inputCls, "mt-1.5")} />
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleFirst100}
                  disabled={f100Loading || !f100Product.trim()}
                  className="w-full h-12 text-sm rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition-all disabled:opacity-50"
                >
                  {f100Loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> جاري البناء...</> : <><Target className="h-4 w-4 mr-2" /> ابنِ استراتيجيتي</>}
                </Button>

                <AnimatePresence>
                  {f100Error && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="bg-red-900/30 border border-red-500/30 rounded-xl p-4 text-red-300 text-sm flex gap-2">
                      <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" /> {f100Error}
                    </motion.div>
                  )}
                  {f100Result && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      className="bg-neutral-900/50 border border-cyan-500/20 rounded-xl p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-cyan-400 text-sm font-medium flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> خطة الـ 100 عميل الأولى
                        </span>
                        <div className="flex gap-3">
                          <button onClick={() => { setF100Result(""); setF100Product(""); setF100Segment(""); setF100Budget(""); }}
                            className="text-neutral-400 hover:text-white transition-colors text-xs flex items-center gap-1">
                            <RefreshCw className="w-3.5 h-3.5" /> جديد
                          </button>
                          <button onClick={() => { navigator.clipboard.writeText(f100Result); setF100Copied(true); setTimeout(() => setF100Copied(false), 2000); }}
                            className="text-neutral-400 hover:text-white transition-colors text-xs flex items-center gap-1">
                            {f100Copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            {f100Copied ? "تم" : "نسخ"}
                          </button>
                        </div>
                      </div>
                      <div className="text-sm leading-relaxed prose prose-invert prose-neutral max-w-none
                        prose-headings:text-cyan-400 prose-headings:font-bold prose-strong:text-white
                        prose-li:text-neutral-300 prose-p:text-neutral-300" dir="auto">
                        <ReactMarkdown>{f100Result}</ReactMarkdown>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* ── Analyze Tab ── */}
        {pageTab === "analyze" && (
        <>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <Card className="bg-neutral-900/60 border-neutral-700/50 rounded-2xl overflow-hidden">
            <CardContent className="p-6 space-y-5">
              {/* Idea Description */}
              <div className="space-y-2">
                <Label className="text-neutral-300 font-semibold text-sm">وصف الفكرة</Label>
                <Textarea
                  value={ideaDesc}
                  onChange={(e) => setIdeaDesc(e.target.value)}
                  placeholder="مثال: تطبيق يسهّل توصيل الفواكه الطازجة من المزارعين للمطاعم مباشرةً في 4 ساعات..."
                  className="min-h-[120px] resize-none text-sm p-4 rounded-xl bg-neutral-800/60 text-white border-neutral-700 focus-visible:ring-[rgb(var(--brand-cyan))] placeholder:text-neutral-600"
                  maxLength={3000}
                />
                <p className="text-xs text-neutral-600 text-left ltr">{ideaDesc.length}/3000</p>
              </div>

              {/* Selectors Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-neutral-300 font-semibold text-sm">القطاع</Label>
                  <select
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full bg-neutral-800/60 border border-neutral-700 text-white text-sm rounded-xl px-3 py-2.5 outline-none focus:border-[rgb(var(--brand-cyan))] transition-colors"
                  >
                    <option value="">اختر القطاع...</option>
                    {INDUSTRIES.map((ind) => (
                      <option key={ind} value={ind}>{ind}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label className="text-neutral-300 font-semibold text-sm">مرحلة المشروع</Label>
                  <select
                    value={stage}
                    onChange={(e) => setStage(e.target.value)}
                    className="w-full bg-neutral-800/60 border border-neutral-700 text-white text-sm rounded-xl px-3 py-2.5 outline-none focus:border-[rgb(var(--brand-cyan))] transition-colors"
                  >
                    {STAGES.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Analyze Button */}
              <Button
                onClick={handleValidate}
                disabled={!ideaDesc.trim() || isValidating}
                className="w-full h-12 text-sm rounded-xl bg-[rgb(var(--brand-cyan))] text-black hover:bg-[#d9a31a] font-bold shadow-lg transition-all disabled:opacity-50"
              >
                {isValidating ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> جاري التحليل الاستراتيجي...</>
                ) : (
                  <><CheckCircle2 className="h-4 w-4 mr-2" /> بدء التحليل الشامل</>
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Result Tabs */}
        <AnimatePresence>
          {validationResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="bg-neutral-900/60 border-[rgba(var(--brand-cyan),0.25)] rounded-2xl overflow-hidden">
                {/* Tab Bar + Actions */}
                <div className="flex items-center justify-between border-b border-neutral-800 px-4 py-2 gap-2 flex-wrap">
                  <div className="flex gap-1">
                    {ANALYSIS_TABS.map((tab) => {
                      const Icon = tab.icon;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={cn(
                            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                            activeTab === tab.id
                              ? "bg-[rgb(var(--brand-cyan))]/20 text-[rgb(var(--brand-cyan))] border border-[rgb(var(--brand-cyan))]/30"
                              : "text-neutral-400 hover:text-white hover:bg-neutral-800"
                          )}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          {tab.label}
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopy}
                      className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition-colors"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      {copied ? "تم" : "نسخ"}
                    </button>
                    <button
                      onClick={handleDownload}
                      className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      تحميل
                    </button>
                    <button
                      onClick={() => { setValidationResult(null); setTabs({}); setIdeaDesc(""); }}
                      className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      جديد
                    </button>
                  </div>
                </div>

                {/* Content */}
                <CardContent className="p-6">
                  <div
                    className="markdown-body text-sm leading-relaxed prose prose-invert prose-neutral max-w-none
                      prose-headings:text-[rgb(var(--brand-cyan))] prose-headings:font-bold
                      prose-strong:text-white prose-a:text-blue-400 prose-li:text-neutral-300
                      prose-p:text-neutral-300"
                    dir="auto"
                  >
                    <ReactMarkdown>
                      {tabContent || validationResult || ""}
                    </ReactMarkdown>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
        </>
        )} {/* end pageTab === "analyze" */}

      </div>
    </AppShell>
  );
}
