'use client';

import { useState } from 'react';
import { Package, Truck, Activity, ArrowRightLeft, Play, Loader2, Copy, Check, Download, Plus, Trash2 } from 'lucide-react';
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "motion/react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import { cn } from "@/src/lib/utils";

interface SupplierEntry { id: string; name: string; country: string; product: string; leadDays: string; cost: string; }
interface AnalysisResult { demand?: string; inventory?: string; logistics?: string; }

const AGENT_CARDS = [
  { icon: Activity,       color: 'text-indigo-400', glow: 'border-indigo-500/50', title: 'التنبؤ بالطلب',   key: 'demand'    as const },
  { icon: Package,        color: 'text-amber-400',  glow: 'border-amber-500/50',  title: 'موازنة المخزون', key: 'inventory' as const },
  { icon: ArrowRightLeft, color: 'text-rose-400',   glow: 'border-rose-500/50',   title: 'تحسين اللوجستيات', key: 'logistics' as const },
];

const EGYPT_LOGISTICS = ['القاهرة', 'الإسكندرية', 'الإسماعيلية', 'بورسعيد', 'السويس', 'أسوان'];

export default function SupplyChainDashboard() {
  const { user } = useAuth();
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [activeAgent, setActiveAgent] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const [productName, setProductName] = useState('');
  const [industry, setIndustry] = useState('تجارة تجزئة');
  const [location, setLocation] = useState('القاهرة');
  const [monthlyVolume, setMonthlyVolume] = useState('');
  const [storageType, setStorageType] = useState('مستودع خاص');
  const [suppliers, setSuppliers] = useState<SupplierEntry[]>([
    { id: '1', name: '', country: 'الصين', product: '', leadDays: '45', cost: '' },
  ]);

  const addSupplier = () => setSuppliers(prev => [...prev, { id: crypto.randomUUID(), name: '', country: '', product: '', leadDays: '', cost: '' }]);
  const removeSupplier = (id: string) => setSuppliers(prev => prev.filter(s => s.id !== id));
  const updateSupplier = (id: string, field: keyof SupplierEntry, val: string) =>
    setSuppliers(prev => prev.map(s => s.id === id ? { ...s, [field]: val } : s));

  const runAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName.trim() || !user) return;
    setAnalyzing(true);
    setResult(null);

    const context = `
المنتج: ${productName}
القطاع: ${industry}
الموقع الجغرافي: ${location}
الحجم الشهري: ${monthlyVolume || 'غير محدد'}
نوع التخزين: ${storageType}
الموردون:
${suppliers.filter(s => s.name || s.product).map(s =>
  `- ${s.name || 'مورد'} (${s.country}): ${s.product} — مهلة التسليم ${s.leadDays} يوم — تكلفة الوحدة ${s.cost || 'غير محددة'}`
).join('\n') || '— لم يُدخل بيانات مورّدين'}
`.trim();

    try {
      const token = await user.getIdToken();

      const callAgent = async (agentKey: 'demand' | 'inventory' | 'logistics'): Promise<string> => {
        setActiveAgent(agentKey);
        const res = await fetch('/api/supply-chain', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ product: productName, context, analysisType: agentKey, industry }),
        });
        if (!res.ok) return '';
        const data = await res.json() as { result?: string; analysis?: string };
        return data.result || data.analysis || '';
      };

      const demand    = await callAgent('demand');
      const inventory = await callAgent('inventory');
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
    ? `## التنبؤ بالطلب\n\n${result.demand || ''}\n\n---\n\n## موازنة المخزون\n\n${result.inventory || ''}\n\n---\n\n## تحسين اللوجستيات\n\n${result.logistics || ''}`
    : '';

  const inputCls = 'w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-teal-500 transition-colors';

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto px-4 py-8 text-white" dir="rtl">
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-400/20 bg-teal-500/[0.06] px-3 py-1 text-[11px] text-teal-200 mb-3">
            <Truck className="w-3.5 h-3.5" />سلسلة الإمداد · Supply Chain AI
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold mb-2">تحليل سلسلة الإمداد</h1>
          <p className="text-neutral-400 text-sm max-w-xl">أدخل منتجاتك وموردّيك وتكاليف اللوجستيات — Gemini يحلل نقاط الضعف ويقترح بدائل محلية ويُحسّن التكاليف.</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <form onSubmit={runAnalysis} className="bg-neutral-900/60 border border-neutral-700/50 rounded-2xl p-6 mb-6 space-y-5">

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-neutral-400 mb-1.5">المنتج أو الخدمة *</label>
                <input value={productName} onChange={e => setProductName(e.target.value)}
                  placeholder="مثال: ملابس أطفال مستوردة" className={inputCls} required />
              </div>
              <div>
                <label className="block text-xs text-neutral-400 mb-1.5">القطاع</label>
                <select value={industry} onChange={e => setIndustry(e.target.value)} className={inputCls}>
                  {['تجارة تجزئة', 'تصنيع', 'غذاء ومشروبات', 'إلكترونيات', 'مستلزمات طبية', 'مواد بناء', 'ملابس وأزياء', 'أخرى'].map(v => (
                    <option key={v}>{v}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-neutral-400 mb-1.5">موقع العمليات</label>
                <select value={location} onChange={e => setLocation(e.target.value)} className={inputCls}>
                  {EGYPT_LOGISTICS.map(v => <option key={v}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-neutral-400 mb-1.5">الحجم الشهري التقريبي</label>
                <input value={monthlyVolume} onChange={e => setMonthlyVolume(e.target.value)}
                  placeholder="مثال: 500 وحدة أو 200,000 جنيه" className={inputCls} />
              </div>
              <div>
                <label className="block text-xs text-neutral-400 mb-1.5">نوع التخزين</label>
                <select value={storageType} onChange={e => setStorageType(e.target.value)} className={inputCls}>
                  {['مستودع خاص', 'مستودع مشترك (3PL)', 'منزلي/صغير', 'تخزين بارد', 'بدون مخزون (Drop Shipping)'].map(v => (
                    <option key={v}>{v}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Suppliers */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs text-neutral-400">الموردون الحاليون</label>
                <button type="button" onClick={addSupplier}
                  className="flex items-center gap-1 text-xs text-teal-400 hover:text-teal-300 transition-colors">
                  <Plus className="w-3.5 h-3.5" />إضافة مورّد
                </button>
              </div>
              <div className="space-y-2">
                {suppliers.map((s, idx) => (
                  <div key={s.id} className="grid grid-cols-6 gap-2 items-center">
                    <input value={s.name} onChange={e => updateSupplier(s.id, 'name', e.target.value)}
                      placeholder={`مورّد ${idx + 1}`} className={cn(inputCls, 'col-span-2 text-xs py-1.5')} />
                    <input value={s.country} onChange={e => updateSupplier(s.id, 'country', e.target.value)}
                      placeholder="الدولة" className={cn(inputCls, 'text-xs py-1.5')} />
                    <input value={s.leadDays} onChange={e => updateSupplier(s.id, 'leadDays', e.target.value)}
                      placeholder="مهلة (يوم)" className={cn(inputCls, 'text-xs py-1.5')} />
                    <input value={s.cost} onChange={e => updateSupplier(s.id, 'cost', e.target.value)}
                      placeholder="تكلفة/وحدة" className={cn(inputCls, 'text-xs py-1.5')} />
                    {suppliers.length > 1 ? (
                      <button type="button" onClick={() => removeSupplier(s.id)}
                        className="text-neutral-600 hover:text-rose-400 transition-colors flex justify-center">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    ) : <div />}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <button type="submit" disabled={analyzing || !productName.trim()}
                className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold py-2.5 px-6 rounded-xl text-sm transition-all">
                {analyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                {analyzing ? 'جارٍ التحليل...' : 'تحليل سلسلة الإمداد'}
              </button>
            </div>
          </form>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-4 mb-6">
          {AGENT_CARDS.map(card => {
            const Icon = card.icon;
            const isActive = activeAgent === card.key;
            const isDone = result?.[card.key];
            return (
              <div key={card.key} className={cn(
                'bg-neutral-900/60 border rounded-2xl p-5 transition-all duration-300',
                isActive ? `${card.glow} shadow-lg` : 'border-neutral-700/50',
              )}>
                <div className="flex items-center gap-3 mb-3">
                  {isActive
                    ? <Loader2 className={cn('w-5 h-5 animate-spin', card.color)} />
                    : <Icon className={cn('w-5 h-5', card.color)} />}
                  <h3 className="font-bold text-sm">{card.title}</h3>
                  {isDone && !isActive && <span className="mr-auto text-emerald-400 text-xs">✓</span>}
                </div>
                {isDone && !isActive && (
                  <p className="text-xs text-neutral-400 line-clamp-3">{(result?.[card.key] ?? '').slice(0, 120)}...</p>
                )}
              </div>
            );
          })}
        </div>

        <AnimatePresence>
          {result && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              className="bg-neutral-900/60 border border-teal-500/20 rounded-2xl overflow-hidden mb-6">
              <div className="flex items-center justify-between px-5 py-3 border-b border-neutral-800">
                <span className="text-sm font-semibold text-neutral-200">التقرير الكامل</span>
                <div className="flex items-center gap-3">
                  <button onClick={async () => { await navigator.clipboard.writeText(fullText); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                    className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition-colors">
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'تم' : 'نسخ'}
                  </button>
                  <button onClick={() => { const b = new Blob([fullText], { type: 'text/markdown' }); const u = URL.createObjectURL(b); const a = document.createElement('a'); a.href = u; a.download = `supply-chain-${Date.now()}.md`; a.click(); URL.revokeObjectURL(u); }}
                    className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition-colors">
                    <Download className="w-3.5 h-3.5" />تحميل
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

      </div>
    </AppShell>
  );
}
