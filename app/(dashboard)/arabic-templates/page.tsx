"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  BookOpen, ArrowLeft, Loader2, CheckCircle2, Copy, Check,
  AlertCircle, RefreshCw, Download, FileText, Shield,
  Users, Briefcase, Star,
} from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/contexts/AuthContext";
import ReactMarkdown from "react-markdown";

interface Template {
  id: string;
  title: string;
  desc: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
  bg: string;
  fields: FieldDef[];
  category: string;
  popular?: boolean;
}

interface FieldDef {
  key: string;
  label: string;
  placeholder: string;
  required?: boolean;
}

const TEMPLATES: Template[] = [
  {
    id: "employment",
    title: "عقد العمل",
    desc: "عقد عمل احترافي وفق قانون العمل المصري رقم 12 لسنة 2003",
    icon: Briefcase,
    color: "text-blue-400",
    bg: "bg-blue-500/10 border-blue-500/30",
    category: "توظيف",
    popular: true,
    fields: [
      { key: "partyA", label: "اسم صاحب العمل / الشركة", placeholder: "مثال: شركة كلميرون لتقنية المعلومات" },
      { key: "partyB", label: "اسم الموظف", placeholder: "مثال: أحمد محمد علي" },
      { key: "role", label: "المسمى الوظيفي", placeholder: "مثال: مهندس برمجيات أول" },
      { key: "salary", label: "الراتب الأساسي", placeholder: "مثال: 15,000 جنيه شهرياً" },
      { key: "duration", label: "مدة العقد", placeholder: "مثال: سنة قابلة للتجديد / غير محددة المدة" },
      { key: "location", label: "مكان العمل", placeholder: "مثال: القاهرة — العمل من المكتب" },
      { key: "extra", label: "بنود إضافية (اختياري)", placeholder: "مثال: بدل مواصلات، ساعات عمل مرنة، حظر منافسة..." },
    ],
  },
  {
    id: "nda",
    title: "اتفاقية عدم إفصاح (NDA)",
    desc: "اتفاقية سرية شاملة لحماية المعلومات التجارية الحساسة",
    icon: Shield,
    color: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/30",
    category: "قانوني",
    popular: true,
    fields: [
      { key: "partyA", label: "الطرف المُفصِح (صاحب المعلومات)", placeholder: "مثال: شركة X للتقنية" },
      { key: "partyB", label: "الطرف المُتلقّي", placeholder: "مثال: مستشار / شريك محتمل" },
      { key: "purpose", label: "الغرض من الاتفاقية", placeholder: "مثال: بحث إمكانية تعاون استراتيجي" },
      { key: "duration", label: "مدة السرية", placeholder: "مثال: سنتان من تاريخ التوقيع" },
      { key: "extra", label: "بنود إضافية (اختياري)", placeholder: "مثال: تحديد نطاق جغرافي، استثناءات..." },
    ],
  },
  {
    id: "cofounder",
    title: "اتفاقية المؤسسين",
    desc: "اتفاقية شاملة تنظّم العلاقة بين المؤسسين والحصص والأدوار",
    icon: Users,
    color: "text-violet-400",
    bg: "bg-violet-500/10 border-violet-500/30",
    category: "تأسيس",
    popular: true,
    fields: [
      { key: "companyName", label: "اسم الشركة", placeholder: "مثال: شركة نوفا للتقنية" },
      { key: "founders", label: "المؤسسون وحصصهم", placeholder: "مثال: أحمد (CEO) 40٪، سارة (CTO) 35٪، محمد (COO) 25٪" },
      { key: "sector", label: "قطاع الشركة", placeholder: "مثال: SaaS للتعليم" },
      { key: "extra", label: "بنود خاصة (اختياري)", placeholder: "مثال: Vesting 4 سنوات، Cliff سنة، آلية حل النزاعات..." },
    ],
  },
  {
    id: "investment",
    title: "نموذج عرض الاستثمار",
    desc: "مستند عرض استثمار احترافي لاستهداف المستثمرين الملائكيين والصناديق",
    icon: Star,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/30",
    category: "استثمار",
    fields: [
      { key: "companyName", label: "اسم الشركة", placeholder: "مثال: شركة كلميرون" },
      { key: "sector", label: "القطاع والنموذج", placeholder: "مثال: SaaS لإدارة الشركات الناشئة" },
      { key: "amount", label: "المبلغ المطلوب", placeholder: "مثال: 500,000 دولار (جولة Seed)" },
      { key: "description", label: "وصف الشركة والمشكلة التي تحلّها", placeholder: "مثال: نحل مشكلة X التي تواجه Y..." },
      { key: "extra", label: "معلومات إضافية (اختياري)", placeholder: "مثال: ARR حالي، عدد العملاء، الفريق..." },
    ],
  },
  {
    id: "business-plan",
    title: "خطة العمل (Business Plan)",
    desc: "خطة عمل احترافية وشاملة تغطي جميع أقسام الخطة التنفيذية للشركات الناشئة",
    icon: BookOpen,
    color: "text-rose-400",
    bg: "bg-rose-500/10 border-rose-500/30",
    category: "أعمال",
    popular: true,
    fields: [
      { key: "companyName", label: "اسم الشركة", placeholder: "مثال: شركة نوفا للتقنية" },
      { key: "sector", label: "القطاع والنموذج التجاري", placeholder: "مثال: SaaS لإدارة المخزون للمطاعم — B2B" },
      { key: "problem", label: "المشكلة التي تحلّها", placeholder: "مثال: أصحاب المطاعم يفقدون 20% من إيراداتهم بسبب سوء إدارة المخزون" },
      { key: "solution", label: "الحل والمنتج", placeholder: "مثال: منصة إدارة مخزون ذكية تتنبأ بالطلب وتُقلّل الهدر" },
      { key: "target", label: "الشريحة المستهدفة", placeholder: "مثال: مطاعم صغيرة ومتوسطة في مصر (500-5000 موظف)" },
      { key: "traction", label: "الزخم الحالي (Traction)", placeholder: "مثال: 30 عميل تجريبي، MRR 25,000 جنيه، نمو 15% شهرياً" },
      { key: "team", label: "الفريق المؤسس", placeholder: "مثال: أحمد (CEO) — 8 سنوات F&B، سارة (CTO) — مطوّرة SAP سابقاً" },
      { key: "financials", label: "التوقعات المالية (اختياري)", placeholder: "مثال: ARR مستهدف 2M جنيه خلال 12 شهر" },
      { key: "extra", label: "معلومات إضافية (اختياري)", placeholder: "مثال: منافسون، شراكات، احتياج تمويلي..." },
    ],
  },
  {
    id: "service",
    title: "عقد خدمات / Freelance",
    desc: "عقد خدمات مرن للمستقلين والوكالات وشركات الاستشارات",
    icon: FileText,
    color: "text-cyan-400",
    bg: "bg-cyan-500/10 border-cyan-500/30",
    category: "أعمال",
    fields: [
      { key: "partyA", label: "مزود الخدمة", placeholder: "مثال: أحمد للاستشارات التقنية" },
      { key: "partyB", label: "العميل", placeholder: "مثال: شركة X للتطوير العقاري" },
      { key: "role", label: "نوع الخدمة", placeholder: "مثال: تطوير تطبيق جوال iOS وAndroid" },
      { key: "salary", label: "الأتعاب الإجمالية", placeholder: "مثال: 50,000 جنيه (30% مقدماً)" },
      { key: "duration", label: "مدة التنفيذ", placeholder: "مثال: 4 أشهر من تاريخ التعاقد" },
      { key: "extra", label: "بنود إضافية (اختياري)", placeholder: "مثال: عدد مراحل التسليم، غرامة تأخير..." },
    ],
  },
];

const CATEGORY_COLORS: Record<string, string> = {
  توظيف: "text-blue-400 bg-blue-500/10",
  قانوني: "text-amber-400 bg-amber-500/10",
  تأسيس: "text-violet-400 bg-violet-500/10",
  استثمار: "text-emerald-400 bg-emerald-500/10",
  أعمال: "text-cyan-400 bg-cyan-500/10",
};

export default function ArabicTemplatesPage() {
  const { user } = useAuth();
  const [selected, setSelected] = useState<Template | null>(null);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const handleSelectTemplate = (t: Template) => {
    setSelected(t);
    setFields({});
    setResult("");
    setError("");
  };

  const handleGenerate = useCallback(async () => {
    if (!selected || loading) return;
    setLoading(true); setError(""); setResult("");
    try {
      const token = await user?.getIdToken();
      const res = await fetch("/api/arabic-templates", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ templateType: selected.id, ...fields }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "حدث خطأ");
      setResult(data.result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "حدث خطأ غير متوقع");
    } finally {
      setLoading(false);
    }
  }, [selected, fields, loading, user]);

  const handleDownload = () => {
    if (!result || !selected) return;
    const blob = new Blob([result], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selected.title}-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const inputClass = "w-full bg-slate-900/70 border border-slate-700/50 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 text-sm";

  return (
    <AppShell>
      <div className="min-h-screen bg-[#0a0a0f] text-white" dir="rtl">
        <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">

          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4">
            <Link href="/dashboard" className="text-slate-400 hover:text-white transition-colors">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <BookOpen className="text-emerald-400" size={24} />
                مكتبة النماذج القانونية والتجارية العربية
              </h1>
              <p className="text-slate-400 text-sm mt-1">نماذج احترافية جاهزة وقابلة للتخصيص بالذكاء الاصطناعي</p>
            </div>
          </motion.div>

          {!selected ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {TEMPLATES.map((t, i) => (
                <motion.button key={t.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  onClick={() => handleSelectTemplate(t)}
                  className={`text-right p-5 rounded-2xl border transition-all hover:scale-[1.02] relative ${t.bg} hover:shadow-lg`}>
                  {t.popular && (
                    <span className="absolute top-3 left-3 text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-full px-2 py-0.5">
                      الأكثر استخداماً
                    </span>
                  )}
                  <t.icon size={22} className={`${t.color} mb-3`} />
                  <div className="font-bold text-white mb-1">{t.title}</div>
                  <div className="text-slate-400 text-xs leading-relaxed">{t.desc}</div>
                  <div className={`mt-3 text-xs font-medium rounded-full px-2 py-0.5 inline-block ${CATEGORY_COLORS[t.category]}`}>
                    {t.category}
                  </div>
                </motion.button>
              ))}
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 space-y-5">

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <selected.icon size={20} className={selected.color} />
                  <span className="font-bold text-white">{selected.title}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${CATEGORY_COLORS[selected.category]}`}>{selected.category}</span>
                </div>
                <button onClick={() => { setSelected(null); setResult(""); setError(""); }}
                  className="text-sm text-slate-400 hover:text-white transition-colors flex items-center gap-1">
                  <RefreshCw size={13} /> تغيير النموذج
                </button>
              </div>

              {!result ? (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    {selected.fields.map(f => (
                      <div key={f.key} className={f.key === "extra" || f.key === "description" ? "col-span-2" : ""}>
                        <label className="text-slate-400 text-xs block mb-1.5">
                          {f.label} {f.required && <span className="text-red-400">*</span>}
                        </label>
                        {f.key === "extra" || f.key === "description" ? (
                          <textarea value={fields[f.key] ?? ""} onChange={e => setFields(fv => ({ ...fv, [f.key]: e.target.value }))}
                            placeholder={f.placeholder} rows={2}
                            className="w-full bg-slate-900/70 border border-slate-700/50 rounded-xl px-4 py-3 text-white placeholder-slate-500 resize-none focus:outline-none focus:border-emerald-500/50 text-sm" />
                        ) : (
                          <input value={fields[f.key] ?? ""} onChange={e => setFields(fv => ({ ...fv, [f.key]: e.target.value }))}
                            placeholder={f.placeholder} className={inputClass} />
                        )}
                      </div>
                    ))}
                  </div>

                  {error && (
                    <div className="bg-red-900/30 border border-red-500/30 rounded-xl p-3 text-red-300 text-sm flex gap-2">
                      <AlertCircle size={14} className="mt-0.5 shrink-0" /> {error}
                    </div>
                  )}

                  <button onClick={handleGenerate} disabled={loading}
                    className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                    {loading ? <Loader2 size={16} className="animate-spin" /> : <BookOpen size={16} />}
                    {loading ? "جاري إنشاء النموذج..." : "أنشئ النموذج بالذكاء الاصطناعي"}
                  </button>
                </>
              ) : (
                <AnimatePresence>
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-slate-900/50 border border-emerald-500/20 rounded-xl p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-emerald-400 text-sm font-medium flex items-center gap-1">
                        <CheckCircle2 size={14} /> {selected.title} — جاهز للتنزيل
                      </span>
                      <div className="flex items-center gap-2">
                        <button onClick={handleDownload}
                          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white border border-slate-700 rounded-lg px-3 py-1.5 transition-colors">
                          <Download size={12} /> تحميل .md
                        </button>
                        <button onClick={() => { navigator.clipboard.writeText(result); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white border border-slate-700 rounded-lg px-3 py-1.5 transition-colors">
                          {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                          {copied ? "تم النسخ" : "نسخ"}
                        </button>
                        <button onClick={() => setResult("")}
                          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white border border-slate-700 rounded-lg px-3 py-1.5 transition-colors">
                          <RefreshCw size={12} /> تعديل
                        </button>
                      </div>
                    </div>
                    <div className="text-sm leading-relaxed prose prose-invert prose-neutral max-w-none
                      prose-headings:text-emerald-400 prose-headings:font-bold prose-strong:text-white
                      prose-li:text-slate-300 prose-p:text-slate-300" dir="auto">
                      <ReactMarkdown>{result}</ReactMarkdown>
                    </div>
                    <div className="text-xs text-amber-400/70 border-t border-slate-700 pt-3">
                      ⚠️ هذا النموذج للإرشاد العام. يُنصح بمراجعة محامٍ متخصص قبل الاستخدام الرسمي.
                    </div>
                  </motion.div>
                </AnimatePresence>
              )}
            </motion.div>
          )}

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
            className="grid grid-cols-3 gap-3">
            {[
              { href: "/legal-ai", label: "المستشار القانوني", icon: "⚖️" },
              { href: "/contract-review", label: "مراجع العقود", icon: "📜" },
              { href: "/founder-agreement", label: "اتفاقية المؤسسين", icon: "🤝" },
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
