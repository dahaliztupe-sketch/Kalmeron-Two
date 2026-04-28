"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import { Building2, CheckCircle2, Circle, ExternalLink, ArrowLeft, Wallet, FileText, ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";

type Step = {
  id: string;
  phase: "تحضير" | "تأسيس" | "تشغيل" | "نموّ";
  title: string;
  desc: string;
  estimatedDays: number;
  estimatedCost: number;
  authority: string;
  link?: string;
  tips: string[];
};

const STEPS: Step[] = [
  {
    id: "name",
    phase: "تحضير",
    title: "حجز الاسم التجاري",
    desc: "ابحث عن اسم متاح وسجّله في السجلّ التجاري عبر الهيئة العامّة للاستثمار (GAFI).",
    estimatedDays: 1, estimatedCost: 250, authority: "GAFI",
    link: "https://www.gafi.gov.eg",
    tips: [".com متاح؟ تحقّق قبل الحجز", "حضّر ٣ أسماء بديلة", "تجنّب الأسماء العامّة جدّاً"],
  },
  {
    id: "structure",
    phase: "تحضير",
    title: "اختيار الكيان القانوني",
    desc: "ش.م.م (LLC) هي الأنسب للستارت أب — مرونة، حماية محدودة، حدّ أدنى ١٠٠٠ ج.م رأس مال.",
    estimatedDays: 0, estimatedCost: 0, authority: "GAFI",
    tips: ["ش.م.م = LLC: الأكثر شيوعاً", "ش.م.ك مناسبة لو لديك ٣+ مساهمين كبار", "Free Zone للتصدير فقط"],
  },
  {
    id: "founders-agreement",
    phase: "تحضير",
    title: "اتّفاقيّة المؤسّسين الموقّعة",
    desc: "قبل إيداع أيّ ورقة رسميّة، يجب أن يكون لديك اتّفاقيّة موقّعة (vesting، IP، حصص).",
    estimatedDays: 3, estimatedCost: 0, authority: "داخلي",
    link: "/founder-agreement",
    tips: ["استخدم معالج الاتّفاقيّة في كلميرون", "Vesting ٤ سنوات + cliff سنة", "نقل IP للشركة من اليوم الأوّل"],
  },
  {
    id: "incorporation",
    phase: "تأسيس",
    title: "إيداع عقد التأسيس في GAFI",
    desc: "تقديم النظام الأساسي + بيانات المؤسّسين + توكيلات (إن لزم) + إيصال رأس المال.",
    estimatedDays: 7, estimatedCost: 2500, authority: "GAFI",
    link: "https://www.gafi.gov.eg",
    tips: ["كل المؤسّسين يجب حضورهم أو وكلاؤهم", "صورة بطاقة + صحيفة جنائيّة لكل مؤسّس", "خدمة One-Stop Shop تختصر الوقت"],
  },
  {
    id: "tax-card",
    phase: "تأسيس",
    title: "البطاقة الضريبيّة",
    desc: "خلال ٣٠ يوماً من تأسيس الشركة، يجب التسجيل في مصلحة الضرائب المصريّة.",
    estimatedDays: 3, estimatedCost: 200, authority: "ETA",
    link: "https://www.eta.gov.eg",
    tips: ["إلزامي قبل أيّ نشاط تجاري", "بدونها لا تستطيع إصدار فاتورة ضريبيّة", "مكتب الضرائب حسب موقع الشركة"],
  },
  {
    id: "vat",
    phase: "تأسيس",
    title: "تسجيل ضريبة القيمة المضافة (VAT)",
    desc: "إلزامي إذا تجاوزت إيراداتك ٥٠٠٬٠٠٠ ج.م سنويّاً. القيمة ١٤٪ على معظم السلع/الخدمات.",
    estimatedDays: 5, estimatedCost: 0, authority: "ETA",
    link: "https://www.eta.gov.eg",
    tips: ["استخدم حاسبة الضرائب في كلميرون", "للخدمات الرقميّة: ١٤٪", "تقديم إقرار شهري إلزامي"],
  },
  {
    id: "e-invoicing",
    phase: "تأسيس",
    title: "التسجيل في منظومة الفاتورة الإلكترونيّة",
    desc: "إلزامي على جميع الشركات منذ ٢٠٢٢. يحتاج توقيع إلكتروني + ربط بالـ ERP/POS.",
    estimatedDays: 14, estimatedCost: 1500, authority: "ETA",
    link: "https://www.eta.gov.eg/ar/services/e-invoice",
    tips: ["شراء توكن E-Signature من شركة معتمدة", "Misr Digital Innovation أو eFinance", "غرامة ٥٠٬٠٠٠ ج لو لم تسجّل"],
  },
  {
    id: "bank",
    phase: "تأسيس",
    title: "فتح حساب بنكي للشركة",
    desc: "اختر بنكاً يدعم الستارت أبس — CIB، Banque Misr، QNB من الأكثر شيوعاً.",
    estimatedDays: 7, estimatedCost: 0, authority: "البنك",
    tips: ["بطاقة ضريبيّة + سجلّ تجاري + عقد إيجار", "اطلب Internet Banking + بطاقة شركة", "CIB يدعم Stripe atlas/Paymob"],
  },
  {
    id: "labor",
    phase: "تشغيل",
    title: "التسجيل في مكتب العمل + التأمينات",
    desc: "خلال أوّل ٣٠ يوماً من توظيف أيّ موظّف. التأمينات ~٢٧٪ على الراتب الإجمالي.",
    estimatedDays: 5, estimatedCost: 0, authority: "وزارة العمل",
    link: "https://www.manpower.gov.eg",
    tips: ["التهرّب يكلّف غرامات ضخمة", "حدّ أدنى راتب ٧٬٠٠٠ ج (٢٠٢٥)", "التأمينات إلزاميّة من اليوم الأوّل"],
  },
  {
    id: "trademark",
    phase: "نموّ",
    title: "تسجيل العلامة التجاريّة",
    desc: "حماية اسم الشركة/المنتج محلّياً (وأهمّ، عالميّاً عبر Madrid Protocol لاحقاً).",
    estimatedDays: 180, estimatedCost: 5000, authority: "ITDA",
    link: "https://www.tmda.gov.eg",
    tips: ["ابحث عن تشابه قبل الإيداع", "تسجيل في Class الخاصّ بنشاطك", "حماية ١٠ سنوات قابلة للتجديد"],
  },
  {
    id: "ip",
    phase: "نموّ",
    title: "حماية الملكيّة الفكريّة (IP)",
    desc: "براءات اختراع، حقوق ملكيّة الكود/المحتوى، اتّفاقيّات NDA مع الموظّفين والشركاء.",
    estimatedDays: 30, estimatedCost: 3000, authority: "وزارة الدولة للبحث العلمي",
    link: "/legal-templates",
    tips: ["كل موظّف يوقّع IP Assignment", "احفظ نسخ Source Code في مستودع آمن", "اعتبر تسجيل دولي عبر WIPO"],
  },
];

const STORAGE_KEY = "kalmeron-egypt-setup-v1";

export default function SetupEgyptPage() {
  const [done, setDone] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Defer setState off the effect body to satisfy
    // react-hooks/set-state-in-effect; localStorage is only available
    // client-side so we cannot use a lazy initializer in useState.
    const id = setTimeout(() => {
      try {
        setDone(JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"));
      } catch {
        /* ignore malformed storage payload */
      }
    }, 0);
    return () => clearTimeout(id);
  }, []);

  const toggle = (id: string) => {
    const next = { ...done, [id]: !done[id] };
    setDone(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const completed = Object.values(done).filter(Boolean).length;
  const totalCost = STEPS.reduce((s, st) => s + st.estimatedCost, 0);
  const remainingCost = STEPS.filter((s) => !done[s.id]).reduce((sum, s) => sum + s.estimatedCost, 0);
  const totalDays = STEPS.reduce((s, st) => s + st.estimatedDays, 0);

  const phases = ["تحضير", "تأسيس", "تشغيل", "نموّ"] as const;

  return (
    <AppShell>
      <div dir="rtl" className="max-w-5xl mx-auto space-y-8 pb-12">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Building2 className="w-4 h-4 text-cyan-400" />
            <span className="text-xs text-cyan-400 font-medium uppercase tracking-wide">Egypt Company Setup</span>
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-extrabold text-white mb-2">دليل تأسيس شركتك في مصر</h1>
          <p className="text-text-secondary max-w-2xl">
            ١١ خطوة عمليّة موثّقة من GAFI ومصلحة الضرائب — التكلفة الكاملة، المدّة المتوقّعة، وروابط مباشرة لكل جهة. اشطب وأنت تتقدّم.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Tile icon={<CheckCircle2 className="w-4 h-4" />} label="مكتمل" value={`${completed} / ${STEPS.length}`} accent="emerald" />
          <Tile icon={<Wallet className="w-4 h-4" />} label="التكلفة المتبقّية" value={`${remainingCost.toLocaleString("ar-EG")} ج`} accent="amber" />
          <Tile icon={<Wallet className="w-4 h-4" />} label="التكلفة الإجماليّة" value={`${totalCost.toLocaleString("ar-EG")} ج`} accent="cyan" />
          <Tile icon={<FileText className="w-4 h-4" />} label="إجمالي المدّة" value={`${totalDays} يوم`} accent="violet" />
        </div>

        <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-cyan-500 to-violet-500"
            initial={{ width: 0 }}
            animate={{ width: `${(completed / STEPS.length) * 100}%` }}
          />
        </div>

        {phases.map((phase) => {
          const items = STEPS.filter((s) => s.phase === phase);
          return (
            <div key={phase} className="space-y-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="w-1 h-6 bg-cyan-400 rounded-full" /> {phase}
                <span className="text-xs text-neutral-500 font-normal">{items.length} خطوات</span>
              </h2>
              {items.map((s, idx) => (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className={`rounded-xl border p-5 transition-colors ${done[s.id] ? "border-emerald-500/30 bg-emerald-500/5" : "border-white/10 bg-white/[0.03]"}`}
                >
                  <div className="flex items-start gap-4">
                    <button onClick={() => toggle(s.id)} className="flex-shrink-0 mt-0.5">
                      {done[s.id]
                        ? <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                        : <Circle className="w-6 h-6 text-neutral-600 hover:text-neutral-400 transition-colors" />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <h3 className={`font-bold ${done[s.id] ? "text-emerald-300 line-through" : "text-white"}`}>{s.title}</h3>
                        <div className="flex items-center gap-3 text-xs text-neutral-400 flex-shrink-0">
                          <span>{s.estimatedDays} يوم</span>
                          <span>·</span>
                          <span>{s.estimatedCost.toLocaleString("ar-EG")} ج</span>
                          <span>·</span>
                          <span className="text-cyan-300">{s.authority}</span>
                        </div>
                      </div>
                      <p className="text-sm text-neutral-300 mt-1.5 leading-relaxed">{s.desc}</p>
                      <ul className="mt-3 space-y-1">
                        {s.tips.map((t, i) => (
                          <li key={i} className="text-xs text-neutral-400 flex items-start gap-2">
                            <span className="text-amber-400 mt-1">•</span> {t}
                          </li>
                        ))}
                      </ul>
                      {s.link && (
                        s.link.startsWith("/") ? (
                          <Link href={s.link} className="inline-flex items-center gap-1 mt-3 text-xs text-cyan-300 hover:text-cyan-200">
                            افتح الأداة <ArrowLeft className="w-3 h-3 icon-flip" />
                          </Link>
                        ) : (
                          <a href={s.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 mt-3 text-xs text-cyan-300 hover:text-cyan-200">
                            الموقع الرسمي <ExternalLink className="w-3 h-3" />
                          </a>
                        )
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          );
        })}

        <div className="rounded-xl p-4 bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-200">
            <strong className="block mb-1 text-amber-100">تنويه مهمّ</strong>
            الأرقام والإجراءات استرشاديّة وقد تتغيّر. تحقّق من الموقع الرسمي لكل جهة قبل التقديم. للحالات الخاصّة (شركة أجنبيّة، Free Zone، فروع)، استشر محاسب قانوني.
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function Tile({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: string; accent: "emerald" | "amber" | "cyan" | "violet" }) {
  const colors = {
    emerald: "text-emerald-300 bg-emerald-500/5 border-emerald-500/20",
    amber: "text-amber-300 bg-amber-500/5 border-amber-500/20",
    cyan: "text-cyan-300 bg-cyan-500/5 border-cyan-500/20",
    violet: "text-violet-300 bg-violet-500/5 border-violet-500/20",
  };
  return (
    <div className={`rounded-xl border p-4 ${colors[accent]}`}>
      <div className="flex items-center gap-1.5 text-xs opacity-80 mb-1.5">{icon}{label}</div>
      <div className="text-xl font-black">{value}</div>
    </div>
  );
}
