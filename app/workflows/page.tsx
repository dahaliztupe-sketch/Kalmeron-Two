import type { Metadata } from "next";
import Link from "next/link";
import { SeoLandingShell, FeatureCheck } from "@/components/seo/SeoLandingShell";
import { Workflow, Zap, GitBranch, Repeat } from "lucide-react";

export const metadata: Metadata = {
  title: "Workflow Templates | كلميرون",
  description:
    "أكثر من 50 workflow جاهز: from idea to MVP، fundraising، launch، hiring، compliance. شغّل بنقرة واحدة.",
  alternates: { canonical: "/workflows" },
};

const WORKFLOWS = [
  { slug: "idea-to-mvp", title: "من الفكرة إلى MVP", desc: "10 خطوات: validation، wireframes، tech stack، MVP scope.", agents: 6 },
  { slug: "fundraise-seed", title: "جمع تمويل Seed", desc: "Pitch، investor list، outreach، DD prep، negotiation.", agents: 8 },
  { slug: "product-launch", title: "إطلاق منتج جديد", desc: "Positioning، PR، launch day، post-launch optimization.", agents: 7 },
  { slug: "compliance-egypt", title: "Compliance للسوق المصري", desc: "PDPL، ضرائب، تراخيص، عقود الموظفين.", agents: 5 },
  { slug: "hire-first-engineer", title: "تعيين أول مهندس", desc: "JD، sourcing، screening، interview، offer، onboarding.", agents: 6 },
  { slug: "saas-pricing", title: "تسعير SaaS", desc: "Market research، tier design، pricing tests، rollout.", agents: 4 },
  { slug: "expand-saudi", title: "التوسع للسعودية", desc: "Setup، PIF intros، localization، GTM، compliance.", agents: 9 },
  { slug: "weekly-investor-update", title: "Investor Update أسبوعي", desc: "Metrics aggregation، wins، asks، draft، send.", agents: 3 },
  { slug: "content-engine", title: "محرك المحتوى", desc: "Topic research، outline، draft، optimize، schedule.", agents: 5 },
  { slug: "annual-tax-egypt", title: "الضرائب السنوية مصر", desc: "Compile records، calculate، file، monitor.", agents: 4 },
];

export default function WorkflowsPage() {
  return (
    <SeoLandingShell
      eyebrow={`${WORKFLOWS.length}+ workflow جاهز`}
      title="Workflow Templates"
      description="بدلاً من تشغيل وكلاء فردياً، شغّل workflow كامل بنقرة. كل workflow ينسق عدة وكلاء لحل مشكلة معقدة."
      breadcrumbs={[{ label: "Workflows" }]}
    >
      <section className="grid md:grid-cols-2 gap-6 mb-16">
        {[
          { icon: Workflow, title: "Multi-Agent Orchestration", desc: "Workflow ينسق 5-10 وكلاء، كل واحد متخصص في خطوة." },
          { icon: Zap, title: "نقرة واحدة", desc: "اضغط Run، أدخل سياقك، استلم النتائج. لا code لا تعقيد." },
          { icon: GitBranch, title: "قابل للتعديل", desc: "كل workflow يمكن نسخه وتعديل خطواته. اصنع نسختك." },
          { icon: Repeat, title: "Recurring", desc: "جدول workflow يشتغل أسبوعياً (مثلاً investor update)." },
        ].map((f) => (
          <div key={f.title} className="rounded-2xl bg-white/[0.03] border border-white/10 p-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-indigo-600/20 flex items-center justify-center mb-4">
              <f.icon className="w-6 h-6 text-cyan-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">{f.title}</h3>
            <p className="text-zinc-400">{f.desc}</p>
          </div>
        ))}
      </section>

      <section className="mb-16">
        <h2 className="text-3xl font-bold text-white mb-6">Workflows شائعة</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {WORKFLOWS.map((w) => (
            <div key={w.slug} className="rounded-xl bg-white/[0.03] border border-white/10 p-5 hover:border-cyan-500/30 transition">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-lg font-semibold text-white">{w.title}</h3>
                <span className="text-xs text-cyan-400 bg-cyan-500/10 px-2 py-1 rounded">
                  {w.agents} وكلاء
                </span>
              </div>
              <p className="text-sm text-zinc-400">{w.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-16">
        <h2 className="text-3xl font-bold text-white mb-6">المزايا</h2>
        <ul className="space-y-3">
          <FeatureCheck>50+ workflow جاهز للسوق العربي</FeatureCheck>
          <FeatureCheck>إنشاء workflows مخصصة بـ visual builder</FeatureCheck>
          <FeatureCheck>جدولة workflows recurring (يومي/أسبوعي/شهري)</FeatureCheck>
          <FeatureCheck>Triggers من webhooks (Stripe، Slack، email)</FeatureCheck>
          <FeatureCheck>Conditional logic (if/else، loops، branches)</FeatureCheck>
          <FeatureCheck>Workflow marketplace: شارك و use community workflows</FeatureCheck>
        </ul>
      </section>

      <div className="rounded-2xl bg-gradient-to-br from-cyan-500/10 to-indigo-600/10 border border-cyan-500/20 p-8 text-center">
        <h3 className="text-2xl font-bold text-white mb-3">جرب أول workflow الآن</h3>
        <Link
          href="/auth/signup"
          className="inline-block px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-medium hover:opacity-90"
        >
          ابدأ مجاناً
        </Link>
      </div>
    </SeoLandingShell>
  );
}
