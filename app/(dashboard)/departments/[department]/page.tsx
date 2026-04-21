import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { Megaphone, TrendingUp, Settings, Wallet, Users, Heart, Scale, Activity, Bot, FileText } from "lucide-react";
import Link from "next/link";

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
      <div dir="rtl" className="max-w-6xl mx-auto space-y-8">
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
              <div className="mt-4 flex items-center gap-2 text-xs text-text-secondary">
                <Bot className="w-3.5 h-3.5" /> {dep.agents.length} وكلاء متخصصون
              </div>
            </div>
          </div>
        </div>

        {/* Members */}
        <section>
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-brand-gold" /> الأعضاء
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {dep.agents.map((agent) => (
              <div key={agent.id} className="glass-panel rounded-2xl p-5 hover:border-white/20 transition-all">
                <div className="flex items-start gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${dep.color} opacity-80 flex items-center justify-center shrink-0`}>
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-white text-sm truncate">{agent.name}</p>
                    <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">{agent.role}</p>
                  </div>
                </div>
                <div className="text-[10px] text-text-secondary/60 font-mono uppercase tracking-wider">
                  {agent.id}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Strip */}
        <section className="glass-panel rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Activity className="w-5 h-5 text-brand-blue" />
            <div>
              <p className="text-white font-bold">ابدأ مهمة لقسم {dep.name}</p>
              <p className="text-xs text-text-secondary">سيتولى منسق القسم توزيع العمل على الوكلاء.</p>
            </div>
          </div>
          <Link
            href="/chat"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-brand-gold to-brand-blue text-white font-bold px-5 py-2.5 rounded-xl text-sm hover:opacity-90 transition-opacity"
          >
            <FileText className="w-4 h-4" /> تكليف القسم بمهمة
          </Link>
        </section>
      </div>
    </AppShell>
  );
}
