"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  LayoutTemplate, Sparkles, ArrowLeft, Loader2,
  CheckCircle2, Download, RefreshCw, Info,
} from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/contexts/AuthContext";

interface CanvasSection {
  key: string;
  label: string;
  sub: string;
  placeholder: string;
  color: string;
  gridArea: string;
}

const CANVAS_SECTIONS: CanvasSection[] = [
  {
    key: "segments", label: "شرائح العملاء", sub: "من هم عملاؤك؟",
    placeholder: "مثال: أصحاب المطاعم الصغيرة (٥-٢٠ طاولة) في القاهرة الكبرى...",
    color: "from-violet-500/20 to-purple-500/10 border-violet-500/25",
    gridArea: "col-span-2 sm:col-span-1",
  },
  {
    key: "valueProposition", label: "عرض القيمة", sub: "ما الذي تقدمه؟",
    placeholder: "مثال: نظام إدارة مخزون سحابي يوفر ٢ ساعة يومياً ويقلل الهدر ٣٠٪...",
    color: "from-cyan-500/20 to-blue-500/10 border-cyan-500/25",
    gridArea: "col-span-2",
  },
  {
    key: "channels", label: "قنوات الوصول", sub: "كيف تصل لعملائك؟",
    placeholder: "مثال: فريق مبيعات ميداني، شراكات مع موردي المطاعم، Google Ads...",
    color: "from-amber-500/20 to-orange-500/10 border-amber-500/25",
    gridArea: "col-span-2 sm:col-span-1",
  },
  {
    key: "relationships", label: "علاقات العملاء", sub: "كيف تبني العلاقة؟",
    placeholder: "مثال: دعم على مدار الساعة، مدير حساب مخصص للعملاء الكبار...",
    color: "from-emerald-500/20 to-teal-500/10 border-emerald-500/25",
    gridArea: "col-span-2 sm:col-span-1",
  },
  {
    key: "revenueStreams", label: "مصادر الإيراد", sub: "كيف تجني المال؟",
    placeholder: "مثال: اشتراك شهري ٢٩٩ ج.م، رسوم إعداد ٥٠٠ ج.م، عمولة موردين...",
    color: "from-rose-500/20 to-pink-500/10 border-rose-500/25",
    gridArea: "col-span-2 sm:col-span-1",
  },
  {
    key: "keyResources", label: "الموارد الجوهرية", sub: "ما تحتاجه لتعمل؟",
    placeholder: "مثال: فريق التطوير، قاعدة بيانات العملاء، شبكة الشراكات...",
    color: "from-indigo-500/20 to-blue-500/10 border-indigo-500/25",
    gridArea: "col-span-2 sm:col-span-1",
  },
  {
    key: "keyActivities", label: "الأنشطة الجوهرية", sub: "ماذا يجب أن تفعل؟",
    placeholder: "مثال: تطوير البرمجيات، بناء شراكات، دعم العملاء...",
    color: "from-fuchsia-500/20 to-purple-500/10 border-fuchsia-500/25",
    gridArea: "col-span-2 sm:col-span-1",
  },
  {
    key: "keyPartners", label: "الشراكات الجوهرية", sub: "من تحتاج كشريك؟",
    placeholder: "مثال: موردو المعدات، منصات الدفع، موزعو البرمجيات...",
    color: "from-teal-500/20 to-cyan-500/10 border-teal-500/25",
    gridArea: "col-span-2 sm:col-span-1",
  },
  {
    key: "costStructure", label: "هيكل التكاليف", sub: "ما أهم تكاليفك؟",
    placeholder: "مثال: رواتب الفريق ٦٠٪، استضافة سحابية ١٥٪، تسويق ٢٠٪...",
    color: "from-orange-500/20 to-red-500/10 border-orange-500/25",
    gridArea: "col-span-2 sm:col-span-1",
  },
];

type CanvasData = Partial<Record<string, string>>;

export default function ValueCanvasPage() {
  const { user } = useAuth();
  const [canvasData, setCanvasData] = useState<CanvasData>({});
  const [businessName, setBusinessName] = useState("");
  const [aiAnalysis, setAiAnalysis] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mode, setMode] = useState<"canvas" | "analysis">("canvas");

  const filledCount = Object.values(canvasData).filter(v => v?.trim()).length;
  const canAnalyze = filledCount >= 3 && !loading;

  const updateSection = (key: string, val: string) => setCanvasData(prev => ({ ...prev, [key]: val }));

  const handleAnalyze = useCallback(async () => {
    if (!canAnalyze) return;
    setLoading(true);
    setAiAnalysis("");
    setError("");
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (user) headers["Authorization"] = `Bearer ${await user.getIdToken()}`;

      const canvasSummary = CANVAS_SECTIONS
        .filter(s => canvasData[s.key]?.trim())
        .map(s => `${s.label}: ${canvasData[s.key]}`)
        .join("\n");

      const res = await fetch("/api/ideas/analyze", {
        method: "POST",
        headers,
        body: JSON.stringify({
          ideaDesc: `تحليل نموذج الأعمال لـ "${businessName || "الشركة"}"\n\n${canvasSummary}`,
          industry: "متعدد",
          startup_stage: "canvas_analysis",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "خطأ");
      setAiAnalysis(data.result ?? "");
      setMode("analysis");
    } catch (e) {
      setError(e instanceof Error ? e.message : "حدث خطأ");
    } finally {
      setLoading(false);
    }
  }, [canvasData, businessName, user, canAnalyze]);

  const handleExport = useCallback(() => {
    const lines = [`# Business Model Canvas — ${businessName || "شركتي"}`, ""];
    CANVAS_SECTIONS.forEach(s => {
      lines.push(`## ${s.label}`);
      lines.push(canvasData[s.key] || "—");
      lines.push("");
    });
    if (aiAnalysis) { lines.push("## تحليل AI"); lines.push(aiAnalysis); }
    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "business-canvas.txt"; a.click();
    URL.revokeObjectURL(url);
  }, [canvasData, businessName, aiAnalysis]);

  return (
    <AppShell>
      <div dir="rtl" className="max-w-6xl mx-auto space-y-6 pb-16">
        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <LayoutTemplate className="w-4 h-4 text-fuchsia-400" />
              <span className="text-xs text-fuchsia-400 font-medium uppercase tracking-wide">Business Model Canvas</span>
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-extrabold text-white mb-2">قنواس نموذج الأعمال</h1>
            <p className="text-white/50 max-w-xl text-sm">صمّم نموذج عملك كاملاً في صفحة واحدة — ثم احصل على تحليل AI للثغرات والفرص.</p>
          </div>
          <div className="flex items-center gap-3">
            {(filledCount > 0 || aiAnalysis) && (
              <button onClick={handleExport}
                className="flex items-center gap-1.5 text-xs text-white/50 hover:text-white/80 border border-white/10 rounded-lg px-3 py-1.5 transition-colors">
                <Download className="w-3 h-3" /> تصدير
              </button>
            )}
            <Link href="/ideas/analyze" className="flex items-center gap-1.5 text-sm text-white/40 hover:text-white/70 transition-colors">
              <ArrowLeft className="w-4 h-4" /> مختبر الأفكار
            </Link>
          </div>
        </div>

        {/* Mode Tabs */}
        {aiAnalysis && (
          <div className="flex gap-1 p-1 rounded-xl bg-white/[0.04] border border-white/[0.07] w-fit">
            {[
              { key: "canvas" as const, label: "الكانفاس" },
              { key: "analysis" as const, label: "تحليل AI" },
            ].map(({ key, label }) => (
              <button key={key} onClick={() => setMode(key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${mode === key ? "bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30" : "text-white/40 hover:text-white/70"}`}>
                {label}
              </button>
            ))}
          </div>
        )}

        <AnimatePresence mode="wait">
          {mode === "canvas" && (
            <motion.div key="canvas" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              {/* Business Name */}
              <input value={businessName} onChange={e => setBusinessName(e.target.value)}
                placeholder="اسم الشركة أو المنتج (اختياري)"
                className="w-full rounded-xl bg-white/[0.04] border border-white/[0.07] text-white placeholder:text-white/20 px-4 py-3 text-sm focus:outline-none focus:border-fuchsia-500/40 transition-colors" />

              {/* Canvas Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {CANVAS_SECTIONS.map(section => (
                  <div key={section.key} className={`relative rounded-2xl border bg-gradient-to-br ${section.color} p-4 space-y-2`}>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-sm font-bold text-white">{section.label}</h3>
                        <p className="text-[11px] text-white/50">{section.sub}</p>
                      </div>
                      {canvasData[section.key]?.trim() && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      )}
                    </div>
                    <textarea
                      value={canvasData[section.key] || ""}
                      onChange={e => updateSection(section.key, e.target.value)}
                      placeholder={section.placeholder}
                      rows={4}
                      className="w-full bg-white/[0.06] rounded-xl border border-white/[0.08] text-white/80 placeholder:text-white/20 p-2.5 text-xs resize-none focus:outline-none focus:border-white/25 transition-colors leading-relaxed"
                    />
                  </div>
                ))}
              </div>

              {/* Progress + Actions */}
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-32 rounded-full bg-white/10 overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-fuchsia-500 to-purple-500 transition-all duration-500"
                        style={{ width: `${(filledCount / CANVAS_SECTIONS.length) * 100}%` }} />
                    </div>
                    <span className="text-xs text-white/40">{filledCount}/{CANVAS_SECTIONS.length} مكتمل</span>
                  </div>
                  {filledCount < 3 && (
                    <div className="flex items-center gap-1 text-xs text-white/30">
                      <Info className="w-3 h-3" />
                      أكمل ٣ أقسام على الأقل للتحليل
                    </div>
                  )}
                </div>
                <button onClick={handleAnalyze} disabled={!canAnalyze}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-fuchsia-500 to-purple-500 text-white text-sm font-bold hover:opacity-90 disabled:opacity-40 transition-all shadow-lg shadow-fuchsia-500/20">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  {loading ? "يحلل النموذج..." : "حلّل نموذج الأعمال بالذكاء الاصطناعي"}
                </button>
              </div>

              {error && <p className="text-rose-400 text-sm rounded-xl border border-rose-500/20 bg-rose-500/5 p-3">{error}</p>}
            </motion.div>
          )}

          {mode === "analysis" && aiAnalysis && (
            <motion.div key="analysis" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-fuchsia-400" />
                  <span className="text-sm font-semibold text-white">تحليل AI لنموذج الأعمال</span>
                </div>
                <button onClick={() => { setMode("canvas"); setAiAnalysis(""); }}
                  className="flex items-center gap-1.5 text-xs text-fuchsia-400 hover:text-fuchsia-300 border border-fuchsia-500/20 rounded-lg px-3 py-1.5 transition-colors">
                  <RefreshCw className="w-3 h-3" /> تحليل جديد
                </button>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                <div className="prose prose-invert prose-sm max-w-none text-white/80 leading-relaxed whitespace-pre-wrap">{aiAnalysis}</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppShell>
  );
}
