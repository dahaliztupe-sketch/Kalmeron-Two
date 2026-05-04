import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import {
  Megaphone, TrendingUp, Settings, Wallet, Users, Heart, Scale,
  Activity, Bot, FileText, ArrowLeft, Lightbulb, MessageSquare,
  Link2,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/src/lib/utils";

const DEPARTMENTS = {
  marketing: {
    name: "التسويق",
    icon: Megaphone,
    color: "from-pink-500 to-rose-500",
    description: "يبني هوية علامتك التجارية ويجذب عملاءك المثاليين.",
    agents: [
      { id: "market_research",        name: "باحث السوق",          role: "تحليل السوق والمنافسين" },
      { id: "customer_profiling",     name: "محلل شخصيات العملاء", role: "بناء بروفايلات العملاء" },
      { id: "acquisition_strategist", name: "استراتيجي الاكتساب",  role: "خطط جذب العملاء" },
      { id: "ads_campaign_manager",   name: "مدير الحملات",         role: "إدارة الحملات الإعلانية" },
      { id: "content_creator",        name: "صانع المحتوى",         role: "كتابة وإنتاج المحتوى" },
      { id: "seo_manager",            name: "مدير السيو",           role: "تحسين محركات البحث" },
    ],
    useCases: [
      { icon: "📣", title: "حملة إطلاق منتج جديد", desc: "يضع استراتيجية كاملة — قنوات، رسائل، جدول زمني، وميزانية مبدئية.", prompt: "ساعدني في تخطيط حملة إطلاق لمنتجي الجديد" },
      { icon: "🎯", title: "تعريف العميل المثالي (ICP)", desc: "يبني بروفايل دقيق لعميلك المثالي من بيانات السوق المصري والخليجي.", prompt: "حلّل وعرّف العميل المثالي لشركتي" },
      { icon: "📝", title: "محتوى يولّد عملاء", desc: "يكتب مقالات، منشورات، وسكريبتات فيديو تحوّل الزوار لعملاء.", prompt: "اكتب محتوى تسويقي لمنتجي يولّد عملاء جدد" },
    ],
    integrations: ["Meta Ads", "Google Analytics", "LinkedIn"],
  },
  sales: {
    name: "المبيعات",
    icon: TrendingUp,
    color: "from-emerald-500 to-teal-500",
    description: "يحوّل الزائرين إلى عملاء يدفعون.",
    agents: [
      { id: "sales_strategy_developer", name: "مطوّر استراتيجية المبيعات", role: "بناء قمع المبيعات" },
      { id: "founder_led_sales_coach",  name: "مدرب مبيعات المؤسس",        role: "إرشاد المؤسس في البيع" },
      { id: "lead_qualifier",           name: "مؤهل العملاء المحتملين",    role: "تصنيف العملاء" },
      { id: "sales_pitch_deck_creator", name: "مصمم العرض البيعي",          role: "صنع عروض احترافية" },
      { id: "sales_pipeline_analyst",   name: "محلل خط المبيعات",           role: "تتبع الصفقات" },
    ],
    useCases: [
      { icon: "📞", title: "سكريبت مكالمة مبيعات", desc: "يكتب سكريبت محادثة احترافي يعالج أبرز الاعتراضات في السوق المصري.", prompt: "اكتب لي سكريبت مبيعات لمنتجي" },
      { icon: "💼", title: "عرض تقديمي للعميل", desc: "يبني Pitch Deck مخصّصاً لكل عميل محتمل بدراسة احتياجاته مسبقاً.", prompt: "ساعدني في بناء عرض تقديمي بيعي لعميل محتمل" },
      { icon: "🔍", title: "تأهيل وفلترة الليدز", desc: "يصمّم معايير BANT مخصصة ويصنّف الليدز حسب الأولوية.", prompt: "ساعدني في تأهيل وترتيب الليدز حسب الأولوية" },
    ],
    integrations: ["HubSpot", "Google Sheets", "WhatsApp Business"],
  },
  operations: {
    name: "العمليات",
    icon: Settings,
    color: "from-cyan-500 to-blue-500",
    description: "يبني المنتج ويدير العمليات اليومية.",
    agents: [
      { id: "product_manager",   name: "مدير المنتج",        role: "إدارة المنتج وخارطة الطريق" },
      { id: "system_architect",  name: "مهندس النظام",       role: "تصميم البنية التقنية" },
      { id: "mvp_developer",     name: "مطور MVP",           role: "بناء النموذج الأولي" },
      { id: "devops_engineer",   name: "مهندس DevOps",       role: "النشر والبنية التحتية" },
      { id: "qa_manager",        name: "مدير الجودة",         role: "اختبار وضمان الجودة" },
      { id: "ux_optimization",   name: "محسّن تجربة المستخدم", role: "تحسين الـ UX" },
    ],
    useCases: [
      { icon: "🗺️", title: "خارطة طريق المنتج", desc: "يبني Roadmap واضح مع أولويات ومبررات تقنية وتجارية.", prompt: "ساعدني في بناء خارطة طريق لمنتجي" },
      { icon: "⚙️", title: "تصميم عمليات الشركة", desc: "يوثّق ويحسّن الإجراءات التشغيلية ويقترح أدوات للأتمتة.", prompt: "ساعدني في تصميم وتوثيق العمليات التشغيلية" },
      { icon: "🧪", title: "خطة اختبار MVP", desc: "يصمّم خطة اختبار شاملة وأسئلة Validation للمستخدمين الأوائل.", prompt: "ساعدني في وضع خطة اختبار لـ MVP الخاص بي" },
    ],
    integrations: ["Notion", "Jira", "GitHub"],
  },
  finance: {
    name: "المالية",
    icon: Wallet,
    color: "from-yellow-500 to-amber-500",
    description: "يبني نموذجك المالي ويدير علاقات المستثمرين.",
    agents: [
      { id: "financial_modeling",      name: "نمذجة مالية",            role: "بناء النماذج المالية" },
      { id: "investor_relations",      name: "علاقات المستثمرين",       role: "إدارة العلاقة مع المستثمرين" },
      { id: "valuation_expert",        name: "خبير التقييم",           role: "تقييم الشركة" },
      { id: "legal_compliance",        name: "الامتثال القانوني المالي", role: "ضوابط مالية وتنظيمية" },
      { id: "equity_manager",          name: "مدير الأسهم",            role: "إدارة هيكل الملكية" },
    ],
    useCases: [
      { icon: "📊", title: "نموذج مالي لـ ١٨ شهر", desc: "يبني P&L و Cash Flow و Break-Even مع سيناريوهات متفائل/محافظ.", prompt: "ابنِ لي نموذج مالي لمشروعي للـ ١٨ شهر القادمة" },
      { icon: "💰", title: "تقييم شركتك الناشئة", desc: "يحسب Valuation بـ ٣ طرق (DCF, Comparables, Berkus) ويبرر الرقم.", prompt: "ساعدني في تقييم شركتي الناشئة" },
      { icon: "📋", title: "Term Sheet Analysis", desc: "يشرح بنود Term Sheet بالعربية ويحدّد البنود القابلة للتفاوض.", prompt: "فسّر لي هذا الـ Term Sheet وما يجب التفاوض عليه" },
    ],
    integrations: ["QuickBooks", "Excel", "Fawry"],
  },
  hr: {
    name: "الموارد البشرية",
    icon: Users,
    color: "from-indigo-500 to-purple-500",
    description: "يبني فريقك ويصمم ثقافة الشركة.",
    agents: [
      { id: "org_structure_designer",   name: "مصمم الهيكل التنظيمي", role: "بناء هيكل الفريق" },
      { id: "job_description_writer",   name: "كاتب الوصف الوظيفي",   role: "إعداد التوصيفات" },
      { id: "company_culture_expert",   name: "خبير ثقافة الشركة",    role: "تطوير القيم والثقافة" },
      { id: "operations_manager",       name: "مدير العمليات",         role: "تنسيق العمليات اليومية" },
      { id: "process_optimizer",        name: "محسّن العمليات",        role: "تحسين الإنتاجية" },
    ],
    useCases: [
      { icon: "👤", title: "وصف وظيفي جاذب للمواهب", desc: "يكتب JD احترافي يستقطب الكفاءات المناسبة بلغة واضحة.", prompt: "اكتب لي وصف وظيفي جذاب لوظيفة في شركتي" },
      { icon: "🏢", title: "هيكل تنظيمي للمرحلة القادمة", desc: "يقترح الهيكل المناسب لمرحلة نموّك مع خطة التوظيف.", prompt: "ساعدني في تصميم الهيكل التنظيمي لشركتي" },
      { icon: "✨", title: "ثقافة وقيم الشركة", desc: "يصيغ القيم الجوهرية والثقافة بطريقة قابلة للتطبيق لا للاقتباس.", prompt: "ساعدني في صياغة قيم وثقافة شركتي" },
    ],
    integrations: ["Bayt.com", "LinkedIn Jobs", "Slack"],
  },
  support: {
    name: "خدمة العملاء",
    icon: Heart,
    color: "from-rose-500 to-pink-500",
    description: "يحافظ على رضا عملائك ويبني قاعدة المعرفة.",
    agents: [
      { id: "support_identity_expert", name: "خبير هوية الدعم",  role: "صياغة نبرة الدعم" },
      { id: "knowledge_base_builder",  name: "بناء قاعدة المعرفة", role: "كتابة المقالات والأدلة" },
      { id: "ticket_manager",          name: "مدير التذاكر",      role: "تصنيف وحل التذاكر" },
      { id: "csat_analyst",            name: "محلل رضا العملاء",   role: "قياس CSAT/NPS" },
    ],
    useCases: [
      { icon: "📚", title: "قاعدة معرفة من صفر", desc: "يبني هيكل قاعدة المعرفة ويكتب أول ١٠ مقالات بناءً على أكثر الأسئلة تكراراً.", prompt: "ساعدني في بناء قاعدة معرفة لخدمة العملاء" },
      { icon: "💬", title: "ردود جاهزة للشكاوى", desc: "يكتب مكتبة ردود احترافية للحالات الأكثر شيوعاً بنبرة إيجابية.", prompt: "اكتب لي ردوداً جاهزة للشكاوى الشائعة" },
      { icon: "📈", title: "مقاييس رضا العملاء", desc: "يصمّم نظام CSAT/NPS مناسب لحجم شركتك ويفسّر النتائج.", prompt: "ساعدني في قياس وتحليل رضا عملائي" },
    ],
    integrations: ["Zendesk", "WhatsApp Business", "Freshdesk"],
  },
  legal: {
    name: "القانونية",
    icon: Scale,
    color: "from-slate-400 to-slate-600",
    description: "يحمي شركتك ويتعامل مع الجوانب القانونية.",
    agents: [
      { id: "founders_agreement_advisor",     name: "مستشار اتفاقية المؤسسين", role: "صياغة اتفاقيات المؤسسين" },
      { id: "ip_protection_expert",           name: "حماية الملكية الفكرية",   role: "تسجيل وحماية IP" },
      { id: "data_privacy_compliance_auditor", name: "مدقق خصوصية البيانات",   role: "مطابقة قانون 151" },
      { id: "contract_drafter",               name: "صياغة العقود",            role: "إعداد ومراجعة العقود" },
      { id: "investment_agreement_specialist", name: "متخصص اتفاقيات الاستثمار", role: "صياغة عقود الاستثمار" },
    ],
    useCases: [
      { icon: "🤝", title: "اتفاقية المؤسسين", desc: "يبني اتفاقية شاملة (Vesting، IP، Exit، Dispute) تحمي كل الأطراف.", prompt: "ساعدني في صياغة اتفاقية مؤسسين لشركتي" },
      { icon: "📜", title: "مراجعة عقد تجاري", desc: "يحلّل العقد، يستخرج البنود الخطرة، ويقترح تعديلات.", prompt: "راجع هذا العقد واستخرج البنود الخطرة" },
      { icon: "🔒", title: "الامتثال لقانون ١٥١", desc: "يحدّد متطلبات حماية البيانات الواجبة على شركتك في مصر.", prompt: "ما متطلبات الامتثال لقانون ١٥١ لشركتي؟" },
    ],
    integrations: ["قانون ١٥١", "PDPL", "حماية الملكية الفكرية"],
  },
} as const;

type Slug = keyof typeof DEPARTMENTS;

export function generateStaticParams() {
  return Object.keys(DEPARTMENTS).map((department) => ({ department }));
}

export default async function DepartmentPage({ params }: { params: Promise<{ department: string }> }) {
  const { department } = await params;
  const dep = DEPARTMENTS[department as Slug];
  if (!dep) notFound();
  const Icon = dep.icon;

  return (
    <AppShell>
      <div dir="rtl" className="max-w-6xl mx-auto space-y-6">

        {/* Department Header */}
        <div className="glass-panel rounded-3xl p-8 relative overflow-hidden">
          <div className={`absolute -top-20 -right-20 w-72 h-72 rounded-full blur-3xl opacity-20 bg-gradient-to-br ${dep.color}`} />
          <div className="relative flex items-start gap-5">
            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${dep.color} flex items-center justify-center shrink-0`}>
              <Icon className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="font-display text-4xl font-extrabold text-white">{dep.name}</h1>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> نشط
                </span>
              </div>
              <p className="text-text-secondary leading-relaxed">{dep.description}</p>
              <div className="mt-4 flex items-center gap-4 text-xs text-text-secondary flex-wrap">
                <span className="flex items-center gap-1.5">
                  <Bot className="w-3.5 h-3.5" /> {dep.agents.length} مساعدين متخصصون
                </span>
                <span className="flex items-center gap-1.5">
                  <Link2 className="w-3.5 h-3.5" /> متكامل مع: {dep.integrations.join(" · ")}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Use Cases */}
        <section>
          <h2 className="text-sm font-semibold text-neutral-400 mb-3 flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-amber-400" /> سيناريوهات استخدام
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {dep.useCases.map((uc) => (
              <Link
                key={uc.prompt}
                href={`/chat?q=${encodeURIComponent(uc.prompt)}`}
                className="group glass-panel rounded-2xl p-5 hover:border-white/20 transition-all flex flex-col gap-3"
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl shrink-0">{uc.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white leading-snug mb-1">{uc.title}</p>
                    <p className="text-xs text-text-secondary leading-relaxed">{uc.desc}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-brand-cyan font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  <MessageSquare className="w-3.5 h-3.5" /> افتح في المحادثة
                  <ArrowLeft className="w-3 h-3" />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Members */}
        <section>
          <h2 className="text-sm font-semibold text-neutral-400 mb-3 flex items-center gap-2">
            <Users className="w-4 h-4 text-brand-cyan" /> الأعضاء
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 auto-rows-[140px] gap-4">
            {dep.agents.map((agent, i) => {
              const isLead = i === 0;
              const isWide = i % 5 === 3;
              return (
                <Link
                  key={agent.id}
                  href={`/chat?q=${encodeURIComponent(`تحدث مع ${agent.name} — ${agent.role}`)}`}
                  className={cn(
                    "glass-panel rounded-2xl p-5 hover:border-white/20 transition-all relative overflow-hidden flex flex-col group",
                    isLead && "col-span-2 row-span-2",
                    isWide && "col-span-2"
                  )}
                >
                  {isLead && (
                    <div className={`absolute -top-16 -left-16 w-48 h-48 rounded-full blur-3xl opacity-20 bg-gradient-to-br ${dep.color}`} />
                  )}
                  <div className="relative flex items-start gap-3 mb-3">
                    <div className={cn(
                      "rounded-xl bg-gradient-to-br opacity-80 flex items-center justify-center shrink-0",
                      dep.color,
                      isLead ? "w-14 h-14" : "w-10 h-10"
                    )}>
                      <Bot className={isLead ? "w-7 h-7 text-white" : "w-5 h-5 text-white"} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={cn("font-bold text-white truncate", isLead ? "text-base" : "text-sm")}>
                          {agent.name}
                        </p>
                        {isLead && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-brand-cyan/15 text-brand-cyan border border-brand-cyan/30 shrink-0">
                            قائد القسم
                          </span>
                        )}
                      </div>
                      <p className={cn("text-text-secondary leading-relaxed", isLead ? "text-sm mt-1" : "text-xs mt-0.5")}>
                        {agent.role}
                      </p>
                    </div>
                  </div>
                  <div className="mt-auto flex items-center justify-between">
                    <span className="text-[10px] text-text-secondary/50 font-mono uppercase tracking-wider">{agent.id}</span>
                    <span className="text-[10px] text-brand-cyan opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" /> محادثة
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* CTA Strip */}
        <section className="glass-panel rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Activity className="w-5 h-5 text-brand-blue" />
            <div>
              <p className="text-white font-bold">ابدأ مهمة لقسم {dep.name}</p>
              <p className="text-xs text-text-secondary">سيتولى منسق القسم توزيع العمل على المساعدين المتخصصين.</p>
            </div>
          </div>
          <Link
            href="/chat"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-brand-cyan to-brand-blue text-white font-bold px-5 py-2.5 rounded-xl text-sm hover:opacity-90 transition-opacity shrink-0"
          >
            <FileText className="w-4 h-4" /> تكليف القسم بمهمة
          </Link>
        </section>

      </div>
    </AppShell>
  );
}
