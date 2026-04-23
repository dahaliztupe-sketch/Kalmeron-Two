import type { Metadata } from "next";
import Link from "next/link";
import { TEMPLATES } from "@/src/lib/seo/templates";
import { SeoLandingShell } from "@/components/seo/SeoLandingShell";
import { FileText, Clock, Award } from "lucide-react";

export const metadata: Metadata = {
  title: "مكتبة قوالب لرواد الأعمال | كلميرون",
  description:
    "أكثر من 25 قالب احترافي: خطط عمل، نماذج مالية، عقود قانونية، pitch decks، خطط تسويق، وأكثر. جاهز للتنزيل والتعديل.",
  alternates: { canonical: "/templates" },
  openGraph: {
    title: "مكتبة قوالب لرواد الأعمال",
    description: "قوالب احترافية لكل احتياجاتك: مالية، قانون، تسويق، عمليات.",
    images: [{ url: "/api/og?title=مكتبة%20القوالب&type=templates" }],
  },
};

const CATEGORY_AR: Record<string, string> = {
  "business-plan": "خطط عمل",
  "financial-model": "نماذج مالية",
  "pitch-deck": "Pitch Decks",
  legal: "قانوني",
  marketing: "تسويق",
  sales: "مبيعات",
  hr: "موارد بشرية",
  operations: "عمليات",
};

const DIFFICULTY_AR: Record<string, string> = {
  beginner: "مبتدئ",
  intermediate: "متوسط",
  advanced: "متقدم",
};

export default function TemplatesIndexPage() {
  const grouped = TEMPLATES.reduce<Record<string, typeof TEMPLATES>>((acc, t) => {
    (acc[t.category] ||= []).push(t);
    return acc;
  }, {});

  return (
    <SeoLandingShell
      eyebrow={`${TEMPLATES.length} قالب احترافي`}
      title="مكتبة القوالب"
      description="قوالب جاهزة، قابلة للتعديل، بمعايير عالمية. وفّر أسابيع من العمل."
      breadcrumbs={[{ label: "القوالب" }]}
    >
      {Object.entries(grouped).map(([cat, items]) => (
        <section key={cat} className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">{CATEGORY_AR[cat] || cat}</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((t) => (
              <Link
                key={t.slug}
                href={`/templates/${t.slug}`}
                className="group rounded-2xl bg-white/[0.03] border border-white/10 p-5 hover:bg-white/[0.06] hover:border-cyan-500/30 transition-all"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-indigo-600/20 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-cyan-400" />
                  </div>
                  <span className="text-[10px] uppercase tracking-wider text-zinc-500 mt-2">
                    {t.format}
                  </span>
                </div>
                <h3 className="text-base font-semibold text-white mb-2 group-hover:text-cyan-300">
                  {t.titleAr}
                </h3>
                <p className="text-sm text-zinc-400 mb-4 line-clamp-2">{t.metaDescriptionAr}</p>
                <div className="flex items-center gap-3 text-xs text-zinc-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {t.estimatedTimeMinutes} د
                  </span>
                  <span className="flex items-center gap-1">
                    <Award className="w-3 h-3" /> {DIFFICULTY_AR[t.difficulty]}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </SeoLandingShell>
  );
}
