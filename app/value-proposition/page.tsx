"use client";

import { useState, useMemo } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import { Target, Plus, X, Sparkles, ArrowLeft, Copy, Check, Lightbulb } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";

type Item = { id: string; text: string };

function newItem(text = ""): Item { return { id: crypto.randomUUID(), text }; }

export default function ValuePropositionPage() {
  // Customer Profile
  const [jobs, setJobs] = useState<Item[]>([newItem(""), newItem("")]);
  const [pains, setPains] = useState<Item[]>([newItem(""), newItem("")]);
  const [gains, setGains] = useState<Item[]>([newItem(""), newItem("")]);

  // Value Map
  const [products, setProducts] = useState<Item[]>([newItem("")]);
  const [painRelievers, setPainRelievers] = useState<Item[]>([newItem("")]);
  const [gainCreators, setGainCreators] = useState<Item[]>([newItem("")]);

  const [copied, setCopied] = useState(false);

  const fitScore = useMemo(() => {
    const filledJobs = jobs.filter((j) => j.text.trim()).length;
    const filledPains = pains.filter((p) => p.text.trim()).length;
    const filledGains = gains.filter((g) => g.text.trim()).length;
    const filledProducts = products.filter((p) => p.text.trim()).length;
    const filledRelievers = painRelievers.filter((p) => p.text.trim()).length;
    const filledCreators = gainCreators.filter((g) => g.text.trim()).length;

    const customerSide = filledJobs + filledPains + filledGains;
    const valueSide = filledProducts + filledRelievers + filledCreators;
    if (customerSide === 0) return 0;

    const ratio = Math.min(valueSide / customerSide, 1);
    const completeness = Math.min((customerSide + valueSide) / 12, 1);
    return Math.round(ratio * completeness * 100);
  }, [jobs, pains, gains, products, painRelievers, gainCreators]);

  const fitLabel = fitScore < 30 ? "ضعيف" : fitScore < 60 ? "متوسّط" : fitScore < 80 ? "قوي" : "ممتاز";
  const fitColor = fitScore < 30 ? "red" : fitScore < 60 ? "amber" : fitScore < 80 ? "cyan" : "emerald";

  const exportJSON = async () => {
    const data = {
      customerProfile: {
        jobs: jobs.map((i) => i.text).filter(Boolean),
        pains: pains.map((i) => i.text).filter(Boolean),
        gains: gains.map((i) => i.text).filter(Boolean),
      },
      valueMap: {
        products: products.map((i) => i.text).filter(Boolean),
        painRelievers: painRelievers.map((i) => i.text).filter(Boolean),
        gainCreators: gainCreators.map((i) => i.text).filter(Boolean),
      },
      fitScore,
    };
    await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AppShell>
      <div dir="rtl" className="max-w-7xl mx-auto space-y-8 pb-12">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-amber-400" />
              <span className="text-xs text-amber-400 font-medium uppercase tracking-wide">Value Proposition Canvas</span>
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-extrabold text-white mb-2">قماش عرض القيمة</h1>
            <p className="text-text-secondary max-w-2xl">
              ٤٢٪ من الستارت أبس تفشل لأنّها تبني شيئاً لا يريده أحد. هذا القماش يجبرك على فهم العميل أوّلاً قبل رسم المنتج.
            </p>
          </div>
          <div className={`rounded-xl border-2 px-4 py-3 text-center bg-${fitColor}-500/10 border-${fitColor}-500/40`}>
            <div className="text-xs text-neutral-400 mb-0.5">Product-Market Fit</div>
            <div className={`text-3xl font-black text-${fitColor}-300`}>{fitScore}٪</div>
            <div className={`text-xs text-${fitColor}-300 font-semibold`}>{fitLabel}</div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Customer Profile */}
          <div className="rounded-2xl border-2 border-cyan-500/30 bg-gradient-to-br from-cyan-500/5 to-cyan-900/0 p-6 space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-white/10">
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <h2 className="text-lg font-bold text-white">ملف العميل (يبدأ من هنا)</h2>
            </div>
            <Section
              title="مهامّ العميل (Jobs)"
              hint="ما الذي يحاول العميل إنجازه؟ (وظيفي، اجتماعي، عاطفي)"
              items={jobs}
              setItems={setJobs}
              placeholder="مثال: زيادة مبيعاتي بدون توظيف فريق تسويق"
              accent="cyan"
            />
            <Section
              title="الآلام (Pains)"
              hint="ما يزعج العميل في طريقة حلّها الحاليّة؟"
              items={pains}
              setItems={setPains}
              placeholder="مثال: الإعلانات غالية وما بترجع نفس استثمارها"
              accent="red"
            />
            <Section
              title="المكاسب (Gains)"
              hint="ما الذي سيُسعد العميل لو تحقّق؟"
              items={gains}
              setItems={setGains}
              placeholder="مثال: نموّ شهري ٢٠٪ بدون إجهاد"
              accent="emerald"
            />
          </div>

          {/* Value Map */}
          <div className="rounded-2xl border-2 border-violet-500/30 bg-gradient-to-br from-violet-500/5 to-violet-900/0 p-6 space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-white/10">
              <div className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
              <h2 className="text-lg font-bold text-white">خريطة القيمة (منتجك)</h2>
            </div>
            <Section
              title="المنتجات والخدمات"
              hint="ما الذي تقدّمه فعليّاً؟"
              items={products}
              setItems={setProducts}
              placeholder="مثال: منصّة AI لإدارة الستارت أب"
              accent="violet"
            />
            <Section
              title="مسكّنات الآلام (Pain Relievers)"
              hint="كيف يحلّ منتجك الآلام التي ذكرتها؟ (لكل ألم، حلّ)"
              items={painRelievers}
              setItems={setPainRelievers}
              placeholder="مثال: ١٦ وكيل AI يقوم بمهمّات الفريق بـ ١٠٪ من التكلفة"
              accent="amber"
            />
            <Section
              title="صانعات المكاسب (Gain Creators)"
              hint="كيف يخلق منتجك المكاسب التي يبحث عنها العميل؟"
              items={gainCreators}
              setItems={setGainCreators}
              placeholder="مثال: نموّ ROI ٣x في ٩٠ يوماً مع تتبّع شفّاف"
              accent="emerald"
            />
          </div>
        </div>

        {/* Insights */}
        <div className="rounded-xl p-5 bg-amber-500/5 border border-amber-500/20">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-5 h-5 text-amber-400" />
            <h3 className="text-white font-bold">قراءة سريعة لقماشك</h3>
          </div>
          <ul className="space-y-2 text-sm text-neutral-300">
            <li className="flex items-start gap-2"><span className="text-amber-400 mt-1">●</span> كل &laquo;ألم&raquo; يجب أن يقابله &laquo;مسكّن ألم&raquo; واحد على الأقلّ. عدّ كم ألم بدون حلّ.</li>
            <li className="flex items-start gap-2"><span className="text-amber-400 mt-1">●</span> كل &laquo;مكسب&raquo; يجب أن يقابله &laquo;صانع مكسب&raquo;. الفجوات هنا = فرص ميزات جديدة.</li>
            <li className="flex items-start gap-2"><span className="text-amber-400 mt-1">●</span> لو منتجك يقدّم أشياء لا يحتاجها العميل (في يمين بدون يسار) — هذا overengineering.</li>
            <li className="flex items-start gap-2"><span className="text-amber-400 mt-1">●</span> اطلب من ٥ عملاء حقيقيّين تقييم الجانب الأيسر قبل بناء الأيمن.</li>
          </ul>
        </div>

        <div className="flex flex-wrap gap-3">
          <button onClick={exportJSON} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-200 border border-amber-500/30 text-sm transition-colors">
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            {copied ? "تمّ النسخ" : "نسخ القماش (JSON)"}
          </button>
          <Link href="/ideas/analyze" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 text-sm transition-colors">
            <Sparkles className="w-4 h-4" /> حلّل فكرتك بعمق
          </Link>
          <Link href="/cash-runway" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-white border border-white/10 text-sm transition-colors">
            احسب ميزانيّتك <ArrowLeft className="w-4 h-4 icon-flip" />
          </Link>
        </div>
      </div>
    </AppShell>
  );
}

function Section({ title, hint, items, setItems, placeholder, accent }: {
  title: string;
  hint: string;
  items: Item[];
  setItems: (x: Item[]) => void;
  placeholder: string;
  accent: "cyan" | "red" | "emerald" | "violet" | "amber";
}) {
  const ringColor: Record<string, string> = {
    cyan: "focus:border-cyan-500/50",
    red: "focus:border-red-500/50",
    emerald: "focus:border-emerald-500/50",
    violet: "focus:border-violet-500/50",
    amber: "focus:border-amber-500/50",
  };
  const dotColor: Record<string, string> = {
    cyan: "bg-cyan-400", red: "bg-red-400", emerald: "bg-emerald-400", violet: "bg-violet-400", amber: "bg-amber-400",
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <div className={`w-1.5 h-1.5 rounded-full ${dotColor[accent]}`} />
        <h3 className="text-sm font-bold text-white">{title}</h3>
      </div>
      <p className="text-xs text-neutral-500 mb-2">{hint}</p>
      <div className="space-y-1.5">
        {items.map((item, i) => (
          <div key={item.id} className="flex items-center gap-2">
            <input
              value={item.text}
              onChange={(e) => setItems(items.map((it) => it.id === item.id ? { ...it, text: e.target.value } : it))}
              placeholder={placeholder}
              className={`flex-1 bg-white/[0.03] border border-white/10 rounded-md px-3 py-2 text-sm text-white outline-none transition-colors ${ringColor[accent]}`}
            />
            {items.length > 1 && (
              <button onClick={() => setItems(items.filter((it) => it.id !== item.id))} className="text-neutral-500 hover:text-red-400 p-1">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
        <button onClick={() => setItems([...items, newItem()])} className="inline-flex items-center gap-1 text-xs text-neutral-400 hover:text-white px-2 py-1">
          <Plus className="w-3 h-3" /> إضافة
        </button>
      </div>
    </div>
  );
}
