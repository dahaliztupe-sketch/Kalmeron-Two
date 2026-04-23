import type { Metadata } from "next";
import Link from "next/link";
import { COMPARISONS } from "@/src/lib/seo/comparisons";
import { SeoLandingShell } from "@/components/seo/SeoLandingShell";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "مقارنات | كلميرون vs أبرز منصات AI",
  description: "مقارنة تفصيلية بين كلميرون وأشهر منصات AI: ChatGPT, Claude, Microsoft Copilot, Manus AI, Lovable.",
  alternates: { canonical: "/compare" },
};

export default function ComparePage() {
  return (
    <SeoLandingShell
      eyebrow="مقارنات تفصيلية"
      title="كلميرون vs العمالقة"
      description="نقارن أنفسنا بصدق مع أبرز منصات AI في العالم. لكي تختار الأنسب لاحتياجاتك."
      breadcrumbs={[{ label: "مقارنات" }]}
    >
      <div className="grid md:grid-cols-2 gap-6">
        {COMPARISONS.map((c) => (
          <Link
            key={c.slug}
            href={`/compare/${c.slug}`}
            className="group rounded-2xl bg-white/[0.03] border border-white/10 p-6 hover:bg-white/[0.06] hover:border-cyan-500/30 transition-all"
          >
            <div className="text-xs text-zinc-500 uppercase tracking-wide mb-2">
              {c.category}
            </div>
            <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-cyan-300 transition">
              كلميرون vs {c.competitorName}
            </h3>
            <p className="text-sm text-zinc-400 mb-4 line-clamp-2">{c.metaDescriptionAr}</p>
            <span className="text-cyan-400 inline-flex items-center gap-1 text-sm group-hover:translate-x-[-4px] transition-transform">
              عرض المقارنة
              <ArrowLeft className="w-4 h-4" />
            </span>
          </Link>
        ))}
      </div>
    </SeoLandingShell>
  );
}
