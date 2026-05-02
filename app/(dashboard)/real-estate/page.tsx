'use client';

import React, { useState } from 'react';
import { Home, Search, Loader2, Copy, Check, Download, TrendingUp, Calculator, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "motion/react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import { cn } from "@/src/lib/utils";

const LOCATION_EXAMPLES = [
  "القاهرة الجديدة — شقة 120م²",
  "التجمع الخامس — فيلا 300م²",
  "الإسكندرية — شقة ساحلية 150م²",
  "المعادي — عمارة استثمارية 8 طوابق",
  "6 أكتوبر — محل تجاري 60م²",
];

interface AnalysisResult {
  text: string;
  location: string;
}

export default function RealEstateAnalyzer() {
  const { user } = useAuth();
  const [location, setLocation] = useState('');
  const [price, setPrice] = useState('');
  const [size, setSize] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [copied, setCopied] = useState(false);

  const analyzeDeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!location.trim() || !user) return;
    setAnalyzing(true);
    setResult(null);

    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          messages: [{
            content: `أنت خبير عقاري مصري محترف. حلّل الصفقة العقارية التالية بشكل تفصيلي:

الموقع: ${location}
${price ? `السعر المطلوب: ${price} جنيه مصري` : ''}
${size ? `المساحة: ${size} م²` : ''}

قدّم تحليلاً شاملاً يشمل:
1. **تقييم الموقع** — جودة الحي، البنية التحتية، مستقبل المنطقة
2. **التحليل المالي** — ROI المتوقع، معدل العائد (Cap Rate)، قاعدة الـ 1%
3. **مقارنة السوق** — أسعار مماثلة في المنطقة
4. **مخاطر الاستثمار** — العوامل السلبية والتحديات
5. **توصية نهائية** — هل تستحق الصفقة؟ وما الخطوة التالية؟

استخدم أرقاماً تقديرية واقعية للسوق المصري الحالي.`,
          }],
          isGuest: false,
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const parsed = JSON.parse(line.slice(6));
                if (parsed.delta) fullText += parsed.delta;
                if (parsed.content) fullText = parsed.content;
              } catch { /* skip */ }
            }
          }
        }
      }

      if (!fullText) {
        const data = await res.json().catch(() => ({})) as { result?: string };
        fullText = (data as { result?: string }).result || 'تعذّر الحصول على التحليل.';
      }

      setResult({ text: fullText, location });
      toast.success('اكتمل التحليل العقاري!');
    } catch {
      toast.error('تعذّر التحليل. تأكد من اتصالك وحاول مجدداً.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleCopy = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!result) return;
    const blob = new Blob([`# تحليل عقاري: ${result.location}\n\n${result.text}`], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `real-estate-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto px-4 py-8 text-white" dir="rtl">
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/[0.06] px-3 py-1 text-[11px] text-blue-200 mb-3">
            <Home className="w-3.5 h-3.5" />
            تحليل عقاري · Investra AI
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold mb-2">مُحلل الصفقات العقارية</h1>
          <p className="text-neutral-400 text-sm max-w-xl">
            أدخل تفاصيل العقار واحصل على تحليل مالي كامل — ROI، Cap Rate، ومقارنة السوق — من خبير ذكاء اصطناعي متخصص في السوق المصري.
          </p>
        </motion.div>

        {/* Form */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <form onSubmit={analyzeDeal} className="bg-neutral-900/60 border border-neutral-700/50 rounded-2xl p-6 mb-6">
            <div className="space-y-4 mb-4">
              <div>
                <label className="block text-xs text-neutral-400 mb-1.5">وصف العقار والموقع</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="مثال: شقة 120م² في التجمع الخامس..."
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-blue-500 transition-colors"
                  required
                />
                {/* Quick examples */}
                <div className="flex flex-wrap gap-2 mt-2">
                  {LOCATION_EXAMPLES.map((ex) => (
                    <button
                      key={ex}
                      type="button"
                      onClick={() => setLocation(ex)}
                      className="text-xs text-neutral-500 hover:text-neutral-300 border border-neutral-700/50 hover:border-neutral-600 rounded-lg px-2.5 py-1 transition-colors"
                    >
                      {ex}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-neutral-400 mb-1.5">السعر (اختياري)</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="مثال: 4,500,000"
                      className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-blue-500 transition-colors"
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-neutral-500">EGP</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-neutral-400 mb-1.5">المساحة (اختياري)</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={size}
                      onChange={(e) => setSize(e.target.value)}
                      placeholder="120"
                      className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-blue-500 transition-colors"
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-neutral-500">م²</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={analyzing || !location.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-2.5 px-6 rounded-xl flex items-center gap-2 text-sm transition-all"
              >
                {analyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                {analyzing ? 'جاري التحليل المعمق...' : 'تحليل الصفقة'}
              </button>
            </div>
          </form>
        </motion.div>

        {/* Result */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-neutral-900/60 border border-blue-500/20 rounded-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between px-5 py-3 border-b border-neutral-800">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm font-semibold text-neutral-200">التحليل العقاري: {result.location}</span>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={handleCopy} className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition-colors">
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'تم' : 'نسخ'}
                  </button>
                  <button onClick={handleDownload} className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition-colors">
                    <Download className="w-3.5 h-3.5" />
                    تحميل
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="prose prose-invert prose-sm max-w-none prose-headings:text-blue-300 prose-strong:text-white prose-li:text-neutral-300" dir="auto">
                  <ReactMarkdown>{result.text}</ReactMarkdown>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Info Cards */}
        {!result && !analyzing && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
            {[
              { icon: TrendingUp, title: "ROI & Cap Rate", desc: "احسب العائد السنوي ومعدلات الرسملة بدقة", color: "text-emerald-400" },
              { icon: Calculator, title: "نمذجة التدفق النقدي", desc: "توقع الدخل الإيجاري والمصروفات التشغيلية", color: "text-blue-400" },
              { icon: AlertTriangle, title: "تحليل المخاطر", desc: "تحديد العوامل السلبية قبل اتخاذ القرار", color: "text-amber-400" },
            ].map((card, i) => {
              const Icon = card.icon;
              return (
                <div key={i} className={cn("bg-neutral-900/40 border border-neutral-700/30 rounded-2xl p-5")}>
                  <Icon className={cn("w-5 h-5 mb-3", card.color)} />
                  <h3 className="text-sm font-bold text-white mb-1">{card.title}</h3>
                  <p className="text-xs text-neutral-500">{card.desc}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
