'use client';

import { useState } from 'react';
import { Package, Truck, Activity, ArrowRightLeft, Play, Loader2, Copy, Check, Download } from 'lucide-react';
import { AppShell } from "@/components/layout/AppShell";
import { DocumentUploader } from "@/components/rag/DocumentUploader";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "motion/react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import { cn } from "@/src/lib/utils";

interface AnalysisResult {
  demand?: string;
  inventory?: string;
  logistics?: string;
}

const AGENT_CARDS = [
  {
    icon: Activity,
    color: 'text-indigo-400',
    border: 'border-neutral-700/50',
    glow: 'border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.2)]',
    title: 'التنبؤ بالطلب',
    desc: 'يراجع الأنماط الموسمية ويتوقع الطلب على المنتجات للربع القادم.',
    key: 'demand' as const,
    resultColor: 'text-emerald-400',
  },
  {
    icon: Package,
    color: 'text-amber-400',
    border: 'border-neutral-700/50',
    glow: 'border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.2)]',
    title: 'موازنة المخزون',
    desc: 'يراقب النواقص ويوازن مستويات المخزون لتحقيق خدمة أفضل من 98%.',
    key: 'inventory' as const,
    resultColor: 'text-amber-400',
  },
  {
    icon: ArrowRightLeft,
    color: 'text-rose-400',
    border: 'border-neutral-700/50',
    glow: 'border-rose-500/50 shadow-[0_0_15px_rgba(244,63,94,0.2)]',
    title: 'مسارات التتبع',
    desc: 'يتعقب الشحنات ويقترح مسارات بديلة عند حدوث تعطيلات.',
    key: 'logistics' as const,
    resultColor: 'text-rose-400',
  },
];

export default function SupplyChainDashboard() {
  const { user } = useAuth();
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [activeAgent, setActiveAgent] = useState<string | null>(null);
  const [productDesc, setProductDesc] = useState('');
  const [copied, setCopied] = useState(false);

  const runAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productDesc.trim() || !user) return;
    setAnalyzing(true);
    setResult(null);

    try {
      const token = await user.getIdToken();

      const callAgent = async (agentKey: 'demand' | 'inventory' | 'logistics'): Promise<string> => {
        setActiveAgent(agentKey);
        const res = await fetch('/api/supply-chain', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ product: productDesc, analysisType: agentKey }),
        });
        if (!res.ok) return '';
        const data = await res.json() as { result?: string; analysis?: string };
        return data.result || data.analysis || '';
      };

      setActiveAgent('demand');
      const demand = await callAgent('demand');

      setActiveAgent('inventory');
      const inventory = await callAgent('inventory');

      setActiveAgent('logistics');
      const logistics = await callAgent('logistics');

      setResult({ demand, inventory, logistics });
      setActiveAgent(null);
      toast.success('اكتمل تحليل سلسلة الإمداد!');
    } catch {
      toast.error('تعذّر التحليل. حاول مجدداً.');
      setActiveAgent(null);
    } finally {
      setAnalyzing(false);
    }
  };

  const fullText = result
    ? `## التنبؤ بالطلب\n\n${result.demand || ''}\n\n---\n\n## موازنة المخزون\n\n${result.inventory || ''}\n\n---\n\n## مسارات التتبع\n\n${result.logistics || ''}`
    : '';

  const handleCopy = async () => {
    if (!fullText) return;
    await navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!fullText) return;
    const blob = new Blob([`# تحليل سلسلة الإمداد — كلميرون\n\n${fullText}`], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `supply-chain-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto px-4 py-8 text-white" dir="rtl">
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-400/20 bg-teal-500/[0.06] px-3 py-1 text-[11px] text-teal-200 mb-3">
            <Truck className="w-3.5 h-3.5" />
            سرب الإمداد · Supply Chain AI
          </div>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold mb-2">سرب الإمداد واللوجستيات</h1>
              <p className="text-neutral-400 text-sm max-w-xl">
                مساعدو ذكاء اصطناعي يتعاونون لتحسين المخزون، توقّع الطلبات، وتتبّع الشحنات — كل ذلك بضغطة واحدة.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Input Form */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <form onSubmit={runAnalysis} className="bg-neutral-900/60 border border-neutral-700/50 rounded-2xl p-5 mb-6">
            <div className="flex flex-wrap gap-3 items-end">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-xs text-neutral-500 mb-1.5">المنتج / الخدمة المراد تحليل سلسلة إمدادها</label>
                <input
                  value={productDesc}
                  onChange={(e) => setProductDesc(e.target.value)}
                  placeholder="مثال: ملابس أطفال مستوردة من الصين — توصيل للقاهرة"
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-teal-500 transition-colors"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={analyzing || !productDesc.trim()}
                className="h-10 px-5 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-sm font-bold transition-all flex items-center gap-2 shrink-0"
              >
                {analyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                {analyzing ? 'جارٍ التحليل...' : 'تشغيل السرب'}
              </button>
            </div>
          </form>
        </motion.div>

        {/* Agent Cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          {AGENT_CARDS.map((card) => {
            const Icon = card.icon;
            const isActive = activeAgent === card.key;
            const isDone = result && result[card.key];
            return (
              <div
                key={card.key}
                className={cn(
                  "bg-neutral-900/60 border rounded-2xl p-5 transition-all duration-300",
                  isActive ? card.glow : card.border
                )}
              >
                <div className="flex items-center gap-3 mb-3">
                  {isActive
                    ? <Loader2 className={cn("w-5 h-5 animate-spin", card.color)} />
                    : <Icon className={cn("w-5 h-5", card.color)} />
                  }
                  <h3 className="font-bold text-sm">{card.title}</h3>
                  {isDone && !isActive && (
                    <span className="mr-auto text-emerald-400 text-xs font-semibold">✓</span>
                  )}
                </div>
                <p className="text-xs text-neutral-400 mb-3">{card.desc}</p>
                {isDone && !isActive && (
                  <div className={cn("bg-neutral-950 rounded-lg p-2.5 text-xs font-mono line-clamp-2 leading-relaxed", card.resultColor)}>
                    {(result[card.key] || '').slice(0, 120)}...
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Full Result */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-neutral-900/60 border border-teal-500/20 rounded-2xl overflow-hidden mb-6"
            >
              <div className="flex items-center justify-between px-5 py-3 border-b border-neutral-800">
                <span className="text-sm font-semibold text-neutral-200">التقرير الكامل</span>
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
                <div className="prose prose-invert prose-sm max-w-none prose-headings:text-teal-300 prose-strong:text-white" dir="auto">
                  <ReactMarkdown>{fullText}</ReactMarkdown>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Document Upload */}
        <div className="bg-neutral-900/40 border border-neutral-700/30 rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-neutral-300 mb-3">مستندات سلسلة الإمداد</h3>
          <DocumentUploader title="قوائم موردين، عقود، فواتير شحن" />
          <p className="text-xs text-neutral-500 mt-2">
            ارفع بيانات المخزون والموردين ليستشهد بها سرب الإمداد عند توصياته.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
