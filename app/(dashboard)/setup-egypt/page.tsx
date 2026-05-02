"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  MapPin, Sparkles, ArrowLeft, Loader2, CheckCircle2,
  Copy, Check, Building2, FileText, DollarSign, Clock,
  Shield, AlertTriangle, ChevronDown, ChevronUp,
} from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/contexts/AuthContext";

interface Step {
  id: number;
  title: string;
  duration: string;
  cost: string;
  description: string;
  tips: string[];
  warnings: string[];
}

const SETUP_STEPS: Step[] = [
  {
    id: 1,
    title: "اختيار الشكل القانوني",
    duration: "يوم واحد",
    cost: "مجاني",
    description: "اختر بين شركة ذات مسؤولية محدودة (LLC)، شركة مساهمة (JSC)، أو مؤسسة فردية. الـ LLC هي الأنسب لغالبية الشركات الناشئة.",
    tips: [
      "الـ LLC تحتاج ٢ مساهمين على الأقل",
      "رأس المال الأدنى ١٠٠٠ جنيه للـ LLC",
      "الـ JSC للشركات التي تريد الطرح في البورصة مستقبلاً",
    ],
    warnings: ["تجنب المؤسسة الفردية إن كنت تخطط لجلب مستثمرين"],
  },
  {
    id: 2,
    title: "حجز الاسم التجاري",
    duration: "١-٣ أيام",
    cost: "٥٠٠-١٠٠٠ جنيه",
    description: "تقديم طلب حجز الاسم عبر الجهاز المصري لتنشيط المشروعات الخاصة (GAFI) أو مراكز خدمة المستثمرين.",
    tips: [
      "جهّز ٣ أسماء بديلة في حال رفض الأول",
      "تحقق من الاسم على بوابة GAFI قبل التقديم",
      "الاسم الإنجليزي مطلوب أيضاً",
    ],
    warnings: ["تجنب أسماء مشابهة لشركات مسجّلة مسبقاً"],
  },
  {
    id: 3,
    title: "تجهيز عقد التأسيس",
    duration: "٣-٧ أيام",
    cost: "٢٠٠٠-٥٠٠٠ جنيه",
    description: "إعداد عقد التأسيس مع محامٍ معتمد أو عبر نموذج GAFI الجاهز. يحدد العقد حصص المساهمين والإدارة.",
    tips: [
      "نماذج GAFI الجاهزة أرخص وأسرع",
      "حدد توزيع الحصص بدقة من البداية",
      "اتفق على آليات خروج الشركاء مسبقاً",
    ],
    warnings: ["لا تترك توزيع الحصص غامضاً — يسبب نزاعات لاحقاً"],
  },
  {
    id: 4,
    title: "الإيداع لدى GAFI وسداد الرسوم",
    duration: "١-٢ يوم",
    cost: "رسوم حكومية ١٠٠٠-٣٠٠٠ جنيه",
    description: "تقديم الأوراق لمركز خدمات GAFI وسداد رسوم التسجيل. يمكن الآن إتمام معظم الإجراءات إلكترونياً عبر بوابة الاستثمار.",
    tips: [
      "المنصة الإلكترونية: invest.gafi.gov.eg",
      "احتفظ بنسخ من كل الأوراق المقدمة",
      "رقم الحجز مهم — احتفظ به",
    ],
    warnings: ["تأكد من صحة جميع البيانات قبل التقديم — التعديل يستغرق وقتاً"],
  },
  {
    id: 5,
    title: "فتح الحساب البنكي وإيداع رأس المال",
    duration: "٣-٧ أيام",
    cost: "حسب الحد الأدنى للبنك",
    description: "فتح حساب شركة في بنك مصري وإيداع رأس المال. تحتاج شهادة إيداع لإتمام التسجيل.",
    tips: [
      "البنك الأهلي وبنك مصر الأشهر للشركات الناشئة",
      "CIB و QNB أسرع في الإجراءات",
      "رأس المال لا يُسحب حتى اكتمال التسجيل",
    ],
    warnings: ["بعض البنوك تطلب مقر ثابت للشركة قبل فتح الحساب"],
  },
  {
    id: 6,
    title: "التسجيل الضريبي",
    duration: "٣-٥ أيام",
    cost: "مجاني",
    description: "التسجيل في مصلحة الضرائب المصرية للحصول على البطاقة الضريبية ورقم التسجيل الضريبي.",
    tips: [
      "التسجيل الإلكتروني أسرع عبر موقع مصلحة الضرائب",
      "نظام الفاتورة الإلكترونية إلزامي الآن",
      "احتفظ بكل الفواتير والمستندات من اليوم الأول",
    ],
    warnings: ["التأخر في التسجيل الضريبي يعرضك لغرامات"],
  },
  {
    id: 7,
    title: "التسجيل في التأمينات الاجتماعية",
    duration: "١-٢ يوم",
    cost: "مجاني (التسجيل)",
    description: "تسجيل الشركة وموظفيها في الهيئة القومية للتأمين الاجتماعي. إلزامي لأي موظف منذ اليوم الأول.",
    tips: [
      "يمكن التسجيل إلكترونياً عبر بوابة التأمينات",
      "اشتراك صاحب العمل ١٨.٧٥% من الراتب",
      "احتفظ بسجلات الموظفين بدقة",
    ],
    warnings: ["عدم التسجيل يعرضك لغرامات مضاعفة"],
  },
  {
    id: 8,
    title: "الحصول على السجل التجاري",
    duration: "٣-٥ أيام",
    cost: "٥٠٠-١٠٠٠ جنيه",
    description: "الحصول على السجل التجاري من سجل التجارة بعد استيفاء باقي الخطوات.",
    tips: [
      "السجل التجاري ضروري لعقد أي اتفاقيات رسمية",
      "تجديده سنوياً",
      "يمكن الحصول عليه عبر GAFI One-Stop-Shop",
    ],
    warnings: ["بعض الأنشطة تحتاج تراخيص إضافية قبل السجل التجاري"],
  },
];

export default function SetupEgyptPage() {
  const { user } = useAuth();
  const [expandedStep, setExpandedStep] = useState<number | null>(null);
  const [aiQuestion, setAiQuestion] = useState("");
  const [aiAnswer, setAiAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const totalCost = "٥,٠٠٠ – ١٥,٠٠٠ جنيه";
  const totalDuration = "٢ – ٦ أسابيع";

  const handleAskAi = useCallback(async () => {
    if (!aiQuestion.trim() || loading) return;
    setLoading(true);
    setError("");
    setAiAnswer("");
    try {
      const token = await user?.getIdToken();
      const res = await fetch("/api/setup-egypt", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ question: aiQuestion }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "حدث خطأ");
      setAiAnswer(data.result);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "حدث خطأ غير متوقع");
    } finally {
      setLoading(false);
    }
  }, [aiQuestion, loading, user]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(aiAnswer);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [aiAnswer]);

  return (
    <AppShell>
      <div className="min-h-screen bg-[#0a0a0f] text-white" dir="rtl">
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">

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
                <MapPin className="text-emerald-400" size={24} />
                التأسيس في مصر
              </h1>
              <p className="text-slate-400 text-sm mt-1">
                دليل خطوة بخطوة لتأسيس شركتك الناشئة في مصر
              </p>
            </div>
          </motion.div>

          {/* Summary Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-3 gap-4"
          >
            {[
              { icon: Building2, label: "عدد الخطوات", value: `${SETUP_STEPS.length} خطوات`, color: "text-emerald-400" },
              { icon: Clock, label: "المدة الإجمالية", value: totalDuration, color: "text-amber-400" },
              { icon: DollarSign, label: "التكلفة التقريبية", value: totalCost, color: "text-cyan-400" },
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-4 text-center">
                <Icon size={20} className={`${color} mx-auto mb-1`} />
                <div className={`text-sm font-bold ${color}`}>{value}</div>
                <div className="text-slate-400 text-xs mt-0.5">{label}</div>
              </div>
            ))}
          </motion.div>

          {/* AI Q&A */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 border border-slate-700/50 rounded-2xl p-6 space-y-4"
          >
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="text-emerald-400" size={18} />
              <span className="font-semibold text-emerald-400">اسأل مستشار التأسيس</span>
            </div>
            <textarea
              value={aiQuestion}
              onChange={e => setAiQuestion(e.target.value)}
              placeholder="مثال: ما الفرق بين الـ LLC والـ JSC؟ أو: كيف أسجل شركة تقنية في مصر؟"
              rows={2}
              className="w-full bg-slate-900/70 border border-slate-700/50 rounded-xl px-4 py-3 text-white placeholder-slate-500 resize-none focus:outline-none focus:border-emerald-500/50 text-sm"
            />
            <button
              onClick={handleAskAi}
              disabled={loading || !aiQuestion.trim()}
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
              {loading ? "جاري الإجابة..." : "اسأل"}
            </button>

            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="bg-red-900/30 border border-red-500/30 rounded-xl p-4 text-red-300 text-sm">
                  {error}
                </motion.div>
              )}
              {aiAnswer && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="bg-slate-900/50 border border-emerald-500/20 rounded-xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-emerald-400 text-sm font-medium flex items-center gap-1">
                      <CheckCircle2 size={14} /> إجابة المستشار
                    </span>
                    <button onClick={handleCopy} className="text-slate-400 hover:text-white transition-colors">
                      {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                    </button>
                  </div>
                  <p className="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">{aiAnswer}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Steps */}
          <div className="space-y-3">
            {SETUP_STEPS.map((step, i) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.05 }}
                className="bg-slate-800/40 border border-slate-700/50 rounded-2xl overflow-hidden"
              >
                <button
                  onClick={() => setExpandedStep(expandedStep === step.id ? null : step.id)}
                  className="w-full text-right px-5 py-4 flex items-center gap-4 hover:bg-slate-700/20 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-sm font-bold text-white shrink-0">
                    {step.id}
                  </div>
                  <div className="flex-1 text-right">
                    <div className="font-semibold text-white">{step.title}</div>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-slate-400 text-xs flex items-center gap-1">
                        <Clock size={11} /> {step.duration}
                      </span>
                      <span className="text-emerald-400 text-xs flex items-center gap-1">
                        <DollarSign size={11} /> {step.cost}
                      </span>
                    </div>
                  </div>
                  {expandedStep === step.id
                    ? <ChevronUp size={16} className="text-slate-400 shrink-0" />
                    : <ChevronDown size={16} className="text-slate-400 shrink-0" />
                  }
                </button>

                <AnimatePresence>
                  {expandedStep === step.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border-t border-slate-700/50 px-5 py-4 space-y-4"
                    >
                      <p className="text-slate-300 text-sm leading-relaxed">{step.description}</p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <h4 className="text-emerald-400 text-xs font-semibold flex items-center gap-1">
                            <Shield size={12} /> نصائح مهمة
                          </h4>
                          <ul className="space-y-1">
                            {step.tips.map(tip => (
                              <li key={tip} className="flex items-start gap-2 text-slate-300 text-sm">
                                <CheckCircle2 size={13} className="text-emerald-400 mt-0.5 shrink-0" />
                                {tip}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {step.warnings.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="text-amber-400 text-xs font-semibold flex items-center gap-1">
                              <AlertTriangle size={12} /> تحذيرات
                            </h4>
                            <ul className="space-y-1">
                              {step.warnings.map(warn => (
                                <li key={warn} className="flex items-start gap-2 text-slate-300 text-sm">
                                  <AlertTriangle size={13} className="text-amber-400 mt-0.5 shrink-0" />
                                  {warn}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>

          {/* Disclaimer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="bg-amber-900/20 border border-amber-500/20 rounded-xl p-4 flex gap-3"
          >
            <AlertTriangle size={16} className="text-amber-400 mt-0.5 shrink-0" />
            <p className="text-amber-200/80 text-xs leading-relaxed">
              هذا الدليل لأغراض توعوية فقط. قوانين التأسيس تتغير — تحقق دائماً مع محامٍ مرخّص أو بوابة GAFI الرسمية قبل اتخاذ أي قرار قانوني.
            </p>
          </motion.div>

        </div>
      </div>
    </AppShell>
  );
}
