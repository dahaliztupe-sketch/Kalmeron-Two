"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { AppShell } from "@/components/layout/AppShell";
import {
  Search, Sparkles, Filter, ArrowLeft, Star, CheckCircle2,
  Brain, FlaskConical, Scale, Radar, Shield, MessageSquare,
  TrendingUp, BarChart3, PieChart, Lightbulb, Target, Zap,
  Users, Globe2, FileText, Calculator, Rocket, BookOpen,
  Building2, Briefcase, Coins, Lock, Clock, Award, Cpu,
  ShoppingCart, HeartPulse, GraduationCap, Leaf, Home,
  Phone, Mail, Package, Truck, Megaphone, LineChart,
  CreditCard, Receipt, Banknote, ClipboardList, Camera,
  Database, Code, Wifi, Monitor, PenLine, ChevronDown,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Dept = "all" | "idea" | "cfo" | "legal" | "market" | "radar" | "shield" | "brain";

interface Agent {
  id: string;
  name: string;
  nameEn: string;
  dept: Dept;
  desc: string;
  capabilities: string[];
  icon: any;
  color: string;
  popular?: boolean;
  new?: boolean;
}

const DEPARTMENTS: { id: Dept; label: string; icon: any; color: string; desc: string }[] = [
  { id: "all", label: "جميع الوكلاء", icon: Sparkles, color: "white", desc: "عرض الكل" },
  { id: "idea", label: "مُحقّق الأفكار", icon: Lightbulb, color: "cyan", desc: "تحليل وتقييم الفكرة" },
  { id: "cfo", label: "المدير المالي", icon: BarChart3, color: "emerald", desc: "النمذجة المالية" },
  { id: "legal", label: "المرشد القانوني", icon: Scale, color: "amber", desc: "الامتثال القانوني" },
  { id: "market", label: "مختبر السوق", icon: FlaskConical, color: "fuchsia", desc: "بحث وتجارب سوقية" },
  { id: "radar", label: "رادار الفرص", icon: Radar, color: "indigo", desc: "فرص التمويل والنمو" },
  { id: "shield", label: "درع الأخطاء", icon: Shield, color: "rose", desc: "مخاطر ووقاية" },
  { id: "brain", label: "الدماغ المشترك", icon: Brain, color: "violet", desc: "ذاكرة وتنسيق" },
];

const AGENTS: Agent[] = [
  // Idea Validator
  { id: "idea-1", name: "مقيّم الفكرة", nameEn: "Idea Scorer", dept: "idea", icon: Star, color: "cyan",
    desc: "يعطيك نقطة من 100 لفكرتك مع تحليل تفصيلي لنقاط القوة والضعف وفرص التحسين.",
    capabilities: ["تقييم رقمي للفكرة", "تحليل نقاط القوة والضعف", "تقديم توصيات التحسين", "مقارنة بالسوق الحالي"],
    popular: true },
  { id: "idea-2", name: "محلل المنافسين", nameEn: "Competitor Intel", dept: "idea", icon: Target, color: "cyan",
    desc: "يحلل المنافسين في سوقك ويجد لك الفجوة التي يجب أن تملأها أنت.",
    capabilities: ["تحليل المنافسين المباشرين", "اكتشاف الفجوات السوقية", "تحليل نقاط الضعف لدى المنافسين", "اقتراح نقطة التميز"] },
  { id: "idea-3", name: "صانع العرض التقديمي", nameEn: "Pitch Builder", dept: "idea", icon: Rocket, color: "cyan",
    desc: "يبني لك عرضاً تقديمياً احترافياً جاهزاً للمستثمرين خلال دقائق.",
    capabilities: ["هيكل Pitch Deck متكامل", "قصة مقنعة للمستثمر", "عرض الفرصة والسوق والنمو", "توقعات مالية مبسطة"],
    popular: true },
  { id: "idea-4", name: "محلل الجمهور المستهدف", nameEn: "Persona Analyzer", dept: "idea", icon: Users, color: "cyan",
    desc: "يبني شخصية العميل المثالي (Persona) بعمق — ديموغرافياً، نفسياً، وسلوكياً.",
    capabilities: ["بناء Buyer Persona تفصيلية", "تحليل احتياجات العميل", "تحديد نقاط الألم", "خريطة رحلة العميل"] },
  { id: "idea-5", name: "مُختبر الافتراضات", nameEn: "Assumption Tester", dept: "idea", icon: FlaskConical, color: "cyan",
    desc: "يحدد افتراضاتك الخطيرة ويصمم أبسط تجربة لاختبارها قبل الاستثمار.",
    capabilities: ["تحديد الافتراضات الجوهرية", "تصميم تجارب الاختبار", "تفسير النتائج", "قرار المضي أو التوقف"] },
  { id: "idea-6", name: "مُصمّم النموذج التجاري", nameEn: "Business Model Designer", dept: "idea", icon: PieChart, color: "cyan",
    desc: "يُساعدك في بناء نموذج عمل مستدام من خلال Business Model Canvas تفاعلي.",
    capabilities: ["Business Model Canvas كامل", "تحليل مصادر الإيرادات", "تحديد الشركاء الرئيسيين", "تقييم قابلية التوسع"],
    new: true },

  // CFO
  { id: "cfo-1", name: "نمذجة التدفق النقدي", nameEn: "Cash Flow Modeler", dept: "cfo", icon: LineChart, color: "emerald",
    desc: "يبني نموذج تدفق نقدي لـ 12 و36 شهراً بناءً على افتراضاتك — ويحذرك من نقطة الانهيار.",
    capabilities: ["توقعات Cash Flow 3 سنوات", "تحليل Break-even", "سيناريوهات متعددة", "تنبيه نقطة الخطر"],
    popular: true },
  { id: "cfo-2", name: "محلل الميزانية", nameEn: "Budget Analyzer", dept: "cfo", icon: Calculator, color: "emerald",
    desc: "يحلل ميزانيتك ويقترح توزيعاً مثالياً للمصروفات حسب مرحلتك وقطاعك.",
    capabilities: ["تحليل البنود المالية", "مقارنة بالمعايير الصناعية", "اقتراح توزيع مثالي", "تحديد التسريبات المالية"] },
  { id: "cfo-3", name: "حاسبة الوحدة الاقتصادية", nameEn: "Unit Economics", dept: "cfo", icon: Receipt, color: "emerald",
    desc: "يحسب LTV وCAC وPayback Period ويقارنها بالمعايير العالمية لقطاعك.",
    capabilities: ["حساب LTV/CAC", "تحليل Payback Period", "مقارنة بالمعيار الصناعي", "توصيات تحسين الربحية"],
    popular: true },
  { id: "cfo-4", name: "مُقيّم سعر الحصة", nameEn: "Equity Valuator", dept: "cfo", icon: PieChart, color: "emerald",
    desc: "يُقدّر قيمة شركتك باستخدام 3 طرق مختلفة ويشرح لك كيف تتفاوض على حصتك.",
    capabilities: ["تقييم DCF وComps والمضاعفات", "شرح طرق التقييم", "نصائح التفاوض مع المستثمر", "حساب الحصة المثالية"] },
  { id: "cfo-5", name: "مُعد الخطة المالية للمستثمر", nameEn: "Investor Financial Pack", dept: "cfo", icon: FileText, color: "emerald",
    desc: "يُعد الملف المالي الكامل للمستثمر: P&L متوقع، ميزانية عمومية، وجدول cap table.",
    capabilities: ["P&L توقعي 3 سنوات", "ميزانية عمومية", "Cap Table جاهز", "نموذج Term Sheet"],
    new: true },
  { id: "cfo-6", name: "مُحلل الفجوة التمويلية", nameEn: "Funding Gap Analyzer", dept: "cfo", icon: Banknote, color: "emerald",
    desc: "يحدد بدقة كم تحتاج من تمويل ولأي غرض، ويُنظّم لك جدول الإنفاق.",
    capabilities: ["حساب الاحتياج التمويلي", "تفصيل بنود الإنفاق", "توقيت جولات التمويل", "أولويات الصرف"] },

  // Legal
  { id: "legal-1", name: "دليل التأسيس القانوني", nameEn: "Legal Formation Guide", dept: "legal", icon: Building2, color: "amber",
    desc: "يُرشدك خطوة بخطوة لتأسيس شركتك في مصر: نوع الكيان، الأوراق المطلوبة، والتكاليف.",
    capabilities: ["اختيار نوع الكيان القانوني", "قائمة الأوراق المطلوبة", "خطوات التسجيل في GAFI", "تقدير التكاليف والوقت"],
    popular: true },
  { id: "legal-2", name: "مُدقّق العقود", nameEn: "Contract Reviewer", dept: "legal", icon: FileText, color: "amber",
    desc: "يقرأ عقودك ويُنبّهك على البنود الخطيرة والحقوق الضائعة بلغة مبسطة.",
    capabilities: ["مراجعة بنود العقد", "تحديد المخاطر القانونية", "اقتراح تعديلات", "شرح بلغة مبسطة"] },
  { id: "legal-3", name: "باحث براءات الاختراع", nameEn: "IP Researcher", dept: "legal", icon: Lock, color: "amber",
    desc: "يُساعدك في حماية ملكيتك الفكرية وفهم كيفية تسجيل العلامة التجارية في مصر والخليج.",
    capabilities: ["فهم أنواع الحماية الفكرية", "خطوات تسجيل العلامة التجارية", "حماية البرمجيات والمحتوى", "الفرق بين مصر والدول المختلفة"] },
  { id: "legal-4", name: "مُعد اتفاقية المساهمين", nameEn: "SHA Drafter", dept: "legal", icon: ClipboardList, color: "amber",
    desc: "يُساعدك في صياغة اتفاقية المساهمين (SHA) بأحكام واضحة تحمي حصتك.",
    capabilities: ["هيكل اتفاقية المساهمين", "بنود Vesting وأحكام الخروج", "آليات حل النزاعات", "حقوق التصويت والإدارة"] },
  { id: "legal-5", name: "مُرشد قانون العمل", nameEn: "Labor Law Guide", dept: "legal", icon: Users, color: "amber",
    desc: "يشرح قانون العمل المصري بالعامية ويُساعدك في صياغة عقود موظفين سليمة.",
    capabilities: ["شرح قانون العمل المصري", "نماذج عقود موظفين", "الأحكام الإلزامية", "كيفية إنهاء العقود بشكل قانوني"] },
  { id: "legal-6", name: "مُدقّق الامتثال الضريبي", nameEn: "Tax Compliance Checker", dept: "legal", icon: Receipt, color: "amber",
    desc: "يُساعدك في فهم التزاماتك الضريبية في مصر: ضريبة الدخل، الأرباح، وضريبة القيمة المضافة.",
    capabilities: ["حساب الالتزامات الضريبية", "مواعيد تقديم الإقرارات", "اشتراطات ضريبة القيمة المضافة", "نصائح التخطيط الضريبي"],
    new: true },

  // Market Lab
  { id: "market-1", name: "مُصمّم شخصيات العملاء", nameEn: "Persona Designer", dept: "market", icon: Users, color: "fuchsia",
    desc: "يبني 5-20 شخصية عميل افتراضية واقعية تمثل شرائح السوق المختلفة لمنتجك.",
    capabilities: ["بناء شخصيات عميل واقعية", "تحليل الديموغرافيات والسلوكيات", "محاكاة ردود الفعل", "مقارنة الشرائح"],
    popular: true },
  { id: "market-2", name: "مُجري المقابلات الافتراضية", nameEn: "Virtual Interviewer", dept: "market", icon: MessageSquare, color: "fuchsia",
    desc: "يُجري مقابلات عمق مع عملاء افتراضيين يُجيبون كما لو أنهم عملاء حقيقيون في السوق.",
    capabilities: ["مقابلات عمق افتراضية", "أسئلة مخصصة لمنتجك", "ردود واقعية ومفصلة", "استخلاص الأنماط المشتركة"] },
  { id: "market-3", name: "محلل رؤى السوق", nameEn: "Insight Analyst", dept: "market", icon: Lightbulb, color: "fuchsia",
    desc: "يُحول بيانات التجارب والمقابلات إلى رؤى استراتيجية وقرارات واضحة.",
    capabilities: ["تحليل نتائج التجارب", "استخلاص الأنماط المهمة", "توصيات استراتيجية", "قرار Pivot أو Persevere"] },
  { id: "market-4", name: "باحث حجم السوق", nameEn: "TAM/SAM/SOM Researcher", dept: "market", icon: Globe2, color: "fuchsia",
    desc: "يُحسب حجم السوق الكلي والقابل للخدمة والمستهدف لمشروعك بطرق منهجية.",
    capabilities: ["حساب TAM/SAM/SOM", "مصادر بيانات السوق", "طرق Bottom-up وTop-down", "مقارنة بالأسواق المماثلة"],
    new: true },
  { id: "market-5", name: "مُصمّم اختبار A/B", nameEn: "A/B Test Designer", dept: "market", icon: FlaskConical, color: "fuchsia",
    desc: "يُصمّم لك اختبارات A/B دقيقة لتسعيرك ورسائلك وأفكارك التسويقية.",
    capabilities: ["تصميم اختبارات A/B", "تحديد المتغيرات المُختبَرة", "حجم العينة الكافي", "قراءة نتائج الاختبار"] },

  // Radar
  { id: "radar-1", name: "ماسح فرص التمويل", nameEn: "Funding Scanner", dept: "radar", icon: Coins, color: "indigo",
    desc: "يبحث عن فرص التمويل المناسبة لمرحلتك وقطاعك — منح، قروض، مستثمرين ملائكيين.",
    capabilities: ["قاعدة بيانات فرص التمويل", "تطابق مع مرحلتك وقطاعك", "خطوات التقديم", "نصائح زيادة فرص القبول"],
    popular: true },
  { id: "radar-2", name: "باحث الشركاء الاستراتيجيين", nameEn: "Partner Finder", dept: "radar", icon: Building2, color: "indigo",
    desc: "يُحدد الشركاء الاستراتيجيين الأنسب لمشروعك وكيف تصل إليهم.",
    capabilities: ["تحديد الشركاء المحتملين", "استراتيجية التواصل", "نموذج اتفاقية الشراكة", "معايير تقييم الشراكة"] },
  { id: "radar-3", name: "مُتتبع الاتجاهات", nameEn: "Trend Tracker", dept: "radar", icon: TrendingUp, color: "indigo",
    desc: "يتابع أحدث اتجاهات السوق في قطاعك ويُخبرك بالتوقيت الأمثل للتحرك.",
    capabilities: ["رصد اتجاهات السوق", "تحليل التوقيت", "فرص التبكير", "تحليل Emerging Technologies"] },
  { id: "radar-4", name: "مُحلل مسرّعات الأعمال", nameEn: "Accelerator Matcher", dept: "radar", icon: Rocket, color: "indigo",
    desc: "يقارن برامج التسريع والحاضنات المتاحة ويُنصحك بالأنسب لمرحلتك.",
    capabilities: ["قاعدة بيانات الحاضنات والمسرّعات", "معايير القبول", "مقارنة البرامج", "خطة التقديم الناجحة"] },
  { id: "radar-5", name: "مُرشد علاقات المستثمرين", nameEn: "Investor Relations Guide", dept: "radar", icon: Briefcase, color: "indigo",
    desc: "يُعلّمك كيف تبني علاقة طويلة الأمد مع المستثمرين قبل وبعد جولة التمويل.",
    capabilities: ["استراتيجية بناء علاقات المستثمرين", "متى وكيف تتواصل", "نموذج تقرير شهري للمستثمر", "إدارة توقعات المستثمرين"],
    new: true },

  // Shield
  { id: "shield-1", name: "محلل المخاطر", nameEn: "Risk Analyzer", dept: "shield", icon: Shield, color: "rose",
    desc: "يُحلل المخاطر الأعلى احتمالاً في مشروعك ويُقدّم خطة وقاية لكل منها.",
    capabilities: ["تحديد المخاطر الجوهرية", "تقييم احتمالية وأثر كل خطر", "خطة التخفيف لكل مخاطرة", "مصفوفة المخاطر"],
    popular: true },
  { id: "shield-2", name: "مُتحدي الافتراضات الخطيرة", nameEn: "Assumption Challenger", dept: "shield", icon: AlertTriangle, color: "rose",
    desc: "يُجادلك في كل افتراض تبنيه عن السوق والعملاء — ليُقوّي فكرتك قبل الإطلاق.",
    capabilities: ["تحديد الافتراضات المخفية", "مجادلة كل افتراض", "اختبارات للتحقق السريع", "قائمة الأسئلة الصعبة"] },
  { id: "shield-3", name: "مُراقب التدفق النقدي", nameEn: "Cash Burn Monitor", dept: "shield", icon: Calculator, color: "rose",
    desc: "يحسب Runway الحالي ويُنذرك مبكراً عند اقتراب نفاد السيولة.",
    capabilities: ["حساب Cash Burn Rate", "توقع Runway", "إنذار مبكر", "سيناريوهات توفير التكاليف"] },
  { id: "shield-4", name: "محلل فجوات الامتثال", nameEn: "Compliance Gap Analyzer", dept: "shield", icon: CheckCircle2, color: "rose",
    desc: "يُراجع امتثالك القانوني والتنظيمي ويُحدد الفجوات قبل أن تُكلّفك غرامات.",
    capabilities: ["قائمة متطلبات الامتثال", "تحديد الفجوات", "أولويات المعالجة", "جدول زمني للامتثال"] },

  // Brain
  { id: "brain-1", name: "ذاكرة المشروع", nameEn: "Project Memory", dept: "brain", icon: Brain, color: "violet",
    desc: "يحفظ كل شيء عن مشروعك ويُذكّرك بالقرارات السابقة في كل محادثة جديدة.",
    capabilities: ["حفظ سياق المشروع", "ربط المحادثات السابقة", "استرجاع القرارات", "تتبع التطور عبر الزمن"],
    popular: true },
  { id: "brain-2", name: "مُلخّص الاجتماعات", nameEn: "Meeting Summarizer", dept: "brain", icon: FileText, color: "violet",
    desc: "يُلخّص اجتماعاتك ويستخلص action items ومواعيدها ومسؤوليها.",
    capabilities: ["تلخيص اجتماعات تفصيلي", "استخلاص Action Items", "تعيين المسؤوليات", "متابعة التنفيذ"] },
  { id: "brain-3", name: "مُنسّق فريق العمل", nameEn: "Team Coordinator", dept: "brain", icon: Users, color: "violet",
    desc: "يُساعد في تنسيق مهام الفريق وتوزيع المسؤوليات بشكل واضح وقابل للقياس.",
    capabilities: ["هيكلة مهام الفريق", "توزيع المسؤوليات", "متابعة التقدم", "حل تعارضات الأولويات"] },
  { id: "brain-4", name: "مُرتّب استراتيجية الأهداف", nameEn: "OKR Builder", dept: "brain", icon: Target, color: "violet",
    desc: "يُساعدك في بناء OKRs واضحة وقابلة للقياس لربعك القادم.",
    capabilities: ["صياغة Objectives وKey Results", "مؤشرات قياس الأداء", "ربط OKRs بالاستراتيجية", "متابعة شهرية"],
    new: true },
];

export default function AgentsPage() {
  const [activeDept, setActiveDept] = useState<Dept>("all");
  const [search, setSearch] = useState("");
  const [showAll, setShowAll] = useState(false);

  const filtered = useMemo(() => {
    return AGENTS.filter((a) => {
      const matchDept = activeDept === "all" || a.dept === activeDept;
      const matchSearch = !search || a.name.includes(search) || a.desc.includes(search) || a.nameEn.toLowerCase().includes(search.toLowerCase());
      return matchDept && matchSearch;
    });
  }, [activeDept, search]);

  const displayed = showAll ? filtered : filtered.slice(0, 12);

  const colorMap: Record<string, string> = {
    cyan: "from-cyan-500 to-indigo-500",
    emerald: "from-emerald-500 to-teal-500",
    amber: "from-amber-500 to-orange-500",
    fuchsia: "from-fuchsia-500 to-pink-500",
    indigo: "from-indigo-500 to-violet-500",
    rose: "from-rose-500 to-red-500",
    violet: "from-violet-500 to-purple-500",
    white: "from-white/20 to-white/10",
  };

  const bgColorMap: Record<string, string> = {
    cyan: "bg-cyan-500/10 border-cyan-500/20 hover:border-cyan-400/40",
    emerald: "bg-emerald-500/10 border-emerald-500/20 hover:border-emerald-400/40",
    amber: "bg-amber-500/10 border-amber-500/20 hover:border-amber-400/40",
    fuchsia: "bg-fuchsia-500/10 border-fuchsia-500/20 hover:border-fuchsia-400/40",
    indigo: "bg-indigo-500/10 border-indigo-500/20 hover:border-indigo-400/40",
    rose: "bg-rose-500/10 border-rose-500/20 hover:border-rose-400/40",
    violet: "bg-violet-500/10 border-violet-500/20 hover:border-violet-400/40",
  };

  const textColorMap: Record<string, string> = {
    cyan: "text-cyan-400", emerald: "text-emerald-400", amber: "text-amber-400",
    fuchsia: "text-fuchsia-400", indigo: "text-indigo-400", rose: "text-rose-400", violet: "text-violet-400",
  };

  return (
    <AppShell>
      <div dir="rtl" className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-2 mb-2">
            <Cpu className="w-4 h-4 text-brand-cyan" />
            <span className="text-xs text-brand-cyan font-medium uppercase tracking-wide">AI Agents</span>
          </div>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl md:text-4xl font-extrabold text-white mb-1.5">
                عرض الوكلاء الذكيين
              </h1>
              <p className="text-text-secondary max-w-xl">
                <span className="brand-gradient-text font-bold">{AGENTS.length}+ وكيل ذكي</span> متخصص في 7 أقسام — جاهزون لمساعدتك في كل جانب من رحلتك الريادية.
              </p>
            </div>
            <Link href="/chat"
              className="btn-primary flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold shrink-0"
            >
              <MessageSquare className="w-4 h-4" /> تحدث مع وكيل الآن
            </Link>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { v: `${AGENTS.length}+`, l: "وكيل ذكي" },
            { v: "7", l: "أقسام متخصصة" },
            { v: AGENTS.filter(a => a.popular).length + "+", l: "وكيل شائع" },
            { v: AGENTS.filter(a => a.new).length + "+", l: "وكيل جديد" },
          ].map((s, i) => (
            <motion.div key={s.l} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              className="glass-panel rounded-2xl p-4 text-center"
            >
              <div className="font-display text-2xl font-extrabold brand-gradient-text">{s.v}</div>
              <div className="text-[11px] text-text-secondary mt-0.5">{s.l}</div>
            </motion.div>
          ))}
        </div>

        {/* Department Filter */}
        <div className="space-y-3">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {DEPARTMENTS.map((dept) => {
              const Icon = dept.icon;
              const deptColor = textColorMap[dept.color] || "text-white";
              return (
                <button key={dept.id} onClick={() => setActiveDept(dept.id)}
                  className={cn(
                    "flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border whitespace-nowrap transition-all shrink-0",
                    activeDept === dept.id
                      ? "bg-white/10 border-white/25 text-white"
                      : "bg-white/5 border-white/10 text-neutral-300 hover:border-white/20"
                  )}
                >
                  <Icon className={cn("w-3.5 h-3.5", activeDept === dept.id ? deptColor : "text-neutral-400")} />
                  {dept.label}
                  <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded-full">
                    {dept.id === "all" ? AGENTS.length : AGENTS.filter(a => a.dept === dept.id).length}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث عن وكيل بالاسم أو الوظيفة..."
              className="w-full bg-white/[0.04] border border-white/10 rounded-2xl pr-10 pl-4 py-3 text-sm text-white placeholder-neutral-600 outline-none focus:border-white/20 transition-all"
            />
          </div>
        </div>

        {/* Agents Grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-text-secondary">عرض <span className="text-white font-bold">{filtered.length}</span> وكيل</p>
            {activeDept !== "all" && (
              <button onClick={() => setActiveDept("all")} className="text-xs text-brand-cyan hover:underline">
                عرض الكل
              </button>
            )}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeDept + search}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {displayed.map((agent, i) => {
                const Icon = agent.icon;
                const deptInfo = DEPARTMENTS.find(d => d.id === agent.dept)!;
                return (
                  <motion.div key={agent.id}
                    initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                  >
                    <Link href={`/chat?q=${encodeURIComponent(`تحدث معي كوكيل ${agent.name}: ${agent.desc}`)}`}
                      className={cn("block glass-panel rounded-3xl p-5 h-full border transition-all card-lift group", bgColorMap[agent.color] || "border-white/10 hover:border-white/20")}
                    >
                      {/* Top row */}
                      <div className="flex items-start justify-between mb-3">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colorMap[agent.color]} flex items-center justify-center shadow-md shrink-0`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex items-center gap-1.5">
                          {agent.new && <span className="text-[9px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-1.5 py-0.5 rounded-full font-bold uppercase">جديد</span>}
                          {agent.popular && <span className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded-full font-bold flex items-center gap-0.5"><Star className="w-2.5 h-2.5" />شائع</span>}
                        </div>
                      </div>

                      {/* Dept label */}
                      <div className={cn("text-[10px] font-medium mb-1.5 flex items-center gap-1", textColorMap[agent.color])}>
                        <deptInfo.icon className="w-3 h-3" />
                        {deptInfo.label}
                      </div>

                      <h3 className="font-bold text-white text-base mb-1.5 leading-snug group-hover:text-brand-cyan transition-colors">
                        {agent.name}
                      </h3>
                      <p className="text-xs text-text-secondary leading-relaxed mb-4 line-clamp-2">{agent.desc}</p>

                      {/* Capabilities */}
                      <ul className="space-y-1 mb-4">
                        {agent.capabilities.slice(0, 3).map((cap) => (
                          <li key={cap} className="flex items-center gap-1.5 text-[11px] text-neutral-400">
                            <CheckCircle2 className="w-3 h-3 text-emerald-500/60 shrink-0" />
                            {cap}
                          </li>
                        ))}
                      </ul>

                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-neutral-600 font-mono">{agent.nameEn}</span>
                        <span className={cn("flex items-center gap-1 text-xs font-medium", textColorMap[agent.color])}>
                          استخدم الوكيل
                          <ArrowLeft className="w-3 h-3 group-hover:translate-x-[-3px] transition-transform" />
                        </span>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </motion.div>
          </AnimatePresence>

          {/* Show more */}
          {!showAll && filtered.length > 12 && (
            <div className="text-center mt-6">
              <button onClick={() => setShowAll(true)}
                className="flex items-center gap-2 mx-auto px-6 py-3 rounded-full border border-white/15 bg-white/5 text-sm text-neutral-300 hover:bg-white/10 hover:text-white transition-all"
              >
                عرض {filtered.length - 12} وكيل إضافي
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          )}

          {filtered.length === 0 && (
            <div className="glass-panel rounded-3xl p-12 text-center">
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="text-white font-bold mb-2">لا توجد نتائج</h3>
              <p className="text-text-secondary text-sm">جرّب بحثاً مختلفاً أو اختر قسماً آخر</p>
            </div>
          )}
        </div>

        {/* CTA */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          className="glass-panel rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-5 justify-between border-brand-cyan/20 bg-cyan-500/5"
        >
          <div>
            <h3 className="text-xl font-bold text-white mb-1.5">مش عارف من أين تبدأ؟</h3>
            <p className="text-text-secondary text-sm">اسأل كلميرون مباشرة وهو يختار لك الوكيل الأنسب لمشكلتك.</p>
          </div>
          <Link href="/chat"
            className="btn-primary flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold shrink-0"
          >
            <Sparkles className="w-4 h-4" /> تحدث مع كلميرون الآن
          </Link>
        </motion.div>
      </div>
    </AppShell>
  );
}
