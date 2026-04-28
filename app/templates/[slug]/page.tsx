import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  TEMPLATES,
  getTemplateBySlug,
  getAllTemplateSlugs,
} from "@/src/lib/seo/templates";
import { SeoLandingShell } from "@/components/seo/SeoLandingShell";
import { howToSchema, breadcrumbSchema } from "@/src/lib/seo/schema";
import { Clock, Award, FileText, Download, ArrowLeft } from "lucide-react";
import { safeJsonLd } from "@/src/lib/security/safe-json-ld";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllTemplateSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const t = getTemplateBySlug(slug);
  if (!t) return { title: "قالب غير موجود" };
  return {
    title: `${t.titleAr} | قالب جاهز للتنزيل`,
    description: t.metaDescriptionAr,
    keywords: t.keywords,
    alternates: { canonical: `/templates/${slug}` },
    openGraph: {
      title: t.titleAr,
      description: t.metaDescriptionAr,
      images: [{ url: `/api/og?title=${encodeURIComponent(t.titleAr)}&type=template` }],
    },
  };
}

const DIFFICULTY_AR: Record<string, string> = {
  beginner: "مبتدئ",
  intermediate: "متوسط",
  advanced: "متقدم",
};

export default async function TemplatePage({ params }: PageProps) {
  const { slug } = await params;
  const t = getTemplateBySlug(slug);
  if (!t) notFound();

  const related = TEMPLATES.filter((x) => x.slug !== slug && x.category === t.category).slice(0, 3);

  const jsonLd = [
    howToSchema({
      name: t.titleAr,
      description: t.metaDescriptionAr,
      totalTimeMinutes: t.estimatedTimeMinutes,
      steps: t.sections,
    }),
    breadcrumbSchema([
      { name: "الرئيسية", url: "https://kalmeron.com/" },
      { name: "القوالب", url: "https://kalmeron.com/templates" },
      { name: t.titleAr, url: `https://kalmeron.com/templates/${slug}` },
    ]),
  ];

  return (
    <>
      <script
        type="application/ld+json"
        // nosemgrep: typescript.react.security.audit.react-dangerouslysetinnerhtml.react-dangerouslysetinnerhtml -- safeJsonLd escapes </script and HTML entities; required for SEO JSON-LD per schema.org guidelines
        dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }}
      />
      <SeoLandingShell
        eyebrow={`قالب ${t.format.toUpperCase()} · ${DIFFICULTY_AR[t.difficulty]}`}
        title={t.titleAr}
        description={t.metaDescriptionAr}
        breadcrumbs={[
          { label: "القوالب", href: "/templates" },
          { label: t.titleAr },
        ]}
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <div className="rounded-xl bg-white/[0.03] border border-white/10 p-4">
            <Clock className="w-5 h-5 text-cyan-400 mb-2" />
            <div className="text-xs text-zinc-500">المدة</div>
            <div className="text-lg font-semibold text-white">{t.estimatedTimeMinutes} دقيقة</div>
          </div>
          <div className="rounded-xl bg-white/[0.03] border border-white/10 p-4">
            <FileText className="w-5 h-5 text-indigo-400 mb-2" />
            <div className="text-xs text-zinc-500">الصيغة</div>
            <div className="text-lg font-semibold text-white">{t.format.toUpperCase()}</div>
          </div>
          <div className="rounded-xl bg-white/[0.03] border border-white/10 p-4">
            <Award className="w-5 h-5 text-amber-400 mb-2" />
            <div className="text-xs text-zinc-500">المستوى</div>
            <div className="text-lg font-semibold text-white">{DIFFICULTY_AR[t.difficulty]}</div>
          </div>
          <div className="rounded-xl bg-white/[0.03] border border-white/10 p-4">
            <Download className="w-5 h-5 text-emerald-400 mb-2" />
            <div className="text-xs text-zinc-500">الأقسام</div>
            <div className="text-lg font-semibold text-white">{t.sections.length}</div>
          </div>
        </div>

        <section className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-6">ما يحتويه القالب</h2>
          <div className="space-y-3">
            {t.sections.map((s, i) => (
              <div key={i} className="flex gap-4 rounded-xl bg-white/[0.03] border border-white/10 p-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                  {i + 1}
                </div>
                <div>
                  <div className="text-base font-semibold text-white mb-1">{s.title}</div>
                  <div className="text-sm text-zinc-400">{s.description}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-4">المخرجات</h2>
          <ul className="space-y-2">
            {t.outcomes.map((o, i) => (
              <li key={i} className="text-zinc-300 flex gap-2">
                <span className="text-cyan-400">✓</span>
                {o}
              </li>
            ))}
          </ul>
        </section>

        <div className="rounded-2xl bg-gradient-to-br from-cyan-500/10 to-indigo-600/10 border border-cyan-500/20 p-8 text-center mb-12">
          <h3 className="text-2xl font-bold text-white mb-2">احصل على القالب الآن</h3>
          <p className="text-zinc-400 mb-6">
            ابدأ مع كلميرون مجاناً واستخدم مساعد {t.agentSlug} لبناء نسخة مخصصة لشركتك.
          </p>
          <Link
            href={`/auth/signup?template=${slug}`}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-medium hover:opacity-90 transition"
          >
            ابدأ مجاناً
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </div>

        {related.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-white mb-6">قوالب ذات صلة</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  href={`/templates/${r.slug}`}
                  className="rounded-xl bg-white/[0.03] border border-white/10 p-5 hover:border-cyan-500/30 transition"
                >
                  <div className="text-sm font-semibold text-white mb-2">{r.titleAr}</div>
                  <div className="text-xs text-zinc-500">{r.estimatedTimeMinutes} دقيقة · {r.format}</div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </SeoLandingShell>
    </>
  );
}
