import type { Metadata } from "next";
import Link from "next/link";
import { USE_CASES } from "@/src/lib/seo/use-cases";
import { SeoLandingShell } from "@/components/seo/SeoLandingShell";
import { ArrowLeft, Clock, Zap } from "lucide-react";

export const metadata: Metadata = {
  title: "حالات الاستخدام | دليل عملي لكل مرحلة من رحلتك",
  description: "أكثر من 10 حالة استخدام تفصيلية: من إطلاق مطعم سحابي إلى الحصول على تمويل seed، إلى التوسع للسوق الخليجي.",
  alternates: { canonical: "/use-cases" },
};

const DIFFICULTY_LABELS: Record<string, string> = {
  beginner: "مبتدئ",
  intermediate: "متوسط",
  advanced: "متقدم",
};

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
  intermediate: "bg-amber-500/10 text-amber-300 border-amber-500/20",
  advanced: "bg-rose-500/10 text-rose-300 border-rose-500/20",
};

export default function UseCasesIndexPage() {
  return (
    <SeoLandingShell
      eyebrow="حالات استخدام"
      title="دليلك العملي لكل مرحلة من رحلتك الريادية"
      description={`اختر من ${USE_CASES.length}+ حالة استخدام تفصيلية. كل حالة تشمل خطوات عملية، المساعدين المناسبين، والنتائج المتوقعة.`}
      breadcrumbs={[{ label: "حالات الاستخدام" }]}
    >
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {USE_CASES.map((uc) => (
          <Link
            key={uc.slug}
            href={`/use-cases/${uc.slug}`}
            className="group rounded-2xl bg-white/[0.03] border border-white/10 p-6 hover:bg-white/[0.06] hover:border-cyan-500/30 transition-all"
          >
            <div className="flex items-start justify-between gap-2 mb-3">
              <span className={`text-xs px-2 py-1 rounded-md border ${DIFFICULTY_COLORS[uc.difficulty]}`}>
                {DIFFICULTY_LABELS[uc.difficulty]}
              </span>
              <span className="text-xs text-zinc-500 inline-flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {uc.estimatedTimeMinutes} دقيقة
              </span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-cyan-300 transition">
              {uc.titleAr}
            </h3>
            <p className="text-sm text-zinc-400 leading-relaxed mb-4 line-clamp-3">
              {uc.metaDescriptionAr}
            </p>
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-500 inline-flex items-center gap-1">
                <Zap className="w-3 h-3" />
                {uc.primaryAgents.length} مساعدين
              </span>
              <span className="text-cyan-400 inline-flex items-center gap-1 group-hover:translate-x-[-4px] transition-transform">
                اقرأ التفاصيل
                <ArrowLeft className="w-3 h-3" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </SeoLandingShell>
  );
}
