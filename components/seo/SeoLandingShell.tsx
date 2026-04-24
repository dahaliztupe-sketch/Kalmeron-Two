import Link from "next/link";
import { CheckCircle2, ChevronRight, Sparkles } from "lucide-react";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { NewsletterCapture } from "@/components/marketing/NewsletterCapture";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { PrimaryCTA, SecondaryCTA } from "@/components/ui/PrimaryCTA";
import { TrustBar } from "@/components/ui/TrustBar";
import { CTA } from "@/src/lib/copy/microcopy";

interface SeoLandingShellProps {
  /** الإيبرو القصير فوق العنوان */
  eyebrow: string;
  /** العنوان الرئيسي للصفحة */
  title: string;
  /** فقرة وصف موجزة (≤ 28 كلمة) */
  description: string;
  /** رابط الـ CTA الرئيسي (افتراضي: التسجيل) */
  ctaHref?: string;
  /** نص الـ CTA الرئيسي (افتراضي: «جرّب كلميرون مجاناً ...») */
  ctaLabel?: string;
  /** نص الـ CTA الثانوي (افتراضي: «اطّلع على الأسعار») */
  secondaryCtaLabel?: string;
  /** رابط الـ CTA الثانوي */
  secondaryCtaHref?: string;
  children: React.ReactNode;
  breadcrumbs?: { label: string; href?: string }[];
}

/**
 * هيكل صفحات الهبوط الـ SEO.
 * مبادئ التصميم المطبَّقة:
 * - Hick's Law: 4 روابط فقط في الـ nav العلوي + footer من 3 أعمدة (كان 5)
 * - Fitts's Law: PrimaryCTA كبير ومميّز عن الثانوي
 * - Social Proof: TrustBar مباشرة تحت الـ hero (فوق الـ fold)
 * - Cognitive Load: تقليل المسافات والحدود غير الضرورية
 */
export function SeoLandingShell({
  eyebrow,
  title,
  description,
  ctaHref = "/auth/signup",
  ctaLabel = CTA.primarySignup,
  secondaryCtaLabel = CTA.viewPricing,
  secondaryCtaHref = "/pricing",
  children,
  breadcrumbs = [],
}: SeoLandingShellProps) {
  return (
    <div dir="rtl" className="min-h-screen bg-[#080C14] text-[#F1F5F9]">
      {/* Aurora background */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(56,189,248,0.10),transparent_55%)]" />
        <div className="absolute top-[-15%] right-[-10%] w-[55vw] h-[55vw] rounded-full bg-cyan-500/12 blur-[140px]" />
        <div className="absolute bottom-[-15%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-indigo-600/12 blur-[140px]" />
      </div>

      {/* Header — 4 nav items max (Hick's Law) */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-[#080C14]/70 border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <BrandLogo size={32} showWordmark href={null} />
          </Link>
          <nav className="hidden md:flex items-center gap-7 text-sm text-zinc-400">
            <Link href="/use-cases" className="hover:text-white transition-colors">
              حالات الاستخدام
            </Link>
            <Link href="/ai-experts" className="hover:text-white transition-colors">
              مساعدوك الأذكياء
            </Link>
            <Link href="/pricing" className="hover:text-white transition-colors">
              الأسعار
            </Link>
            <Link href="/blog" className="hover:text-white transition-colors">
              المدوّنة
            </Link>
          </nav>
          <Link
            href={ctaHref}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white text-sm font-medium hover:opacity-90 transition"
          >
            ابدأ مجاناً
          </Link>
        </div>
      </header>

      {/* Breadcrumbs */}
      {breadcrumbs.length > 0 && (
        <nav
          aria-label="مسار التنقل"
          className="max-w-6xl mx-auto px-4 pt-4 text-xs text-zinc-500"
        >
          <ol className="flex items-center gap-2 flex-wrap">
            <li>
              <Link href="/" className="hover:text-zinc-300">
                الرئيسية
              </Link>
            </li>
            {breadcrumbs.map((b, i) => (
              <li key={i} className="flex items-center gap-2">
                <ChevronRight className="w-3 h-3 rotate-180" />
                {b.href ? (
                  <Link href={b.href} className="hover:text-zinc-300">
                    {b.label}
                  </Link>
                ) : (
                  <span className="text-zinc-400">{b.label}</span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}

      {/* Hero — single focal point + dual-CTA + Trust Bar */}
      <section className="max-w-6xl mx-auto px-4 pt-12 pb-12 md:pt-20 md:pb-16">
        <Eyebrow icon={Sparkles}>{eyebrow}</Eyebrow>
        <h1 className="text-4xl md:text-6xl font-bold leading-[1.1] mt-6 mb-6 bg-gradient-to-br from-white to-zinc-400 bg-clip-text text-transparent">
          {title}
        </h1>
        <p className="text-lg md:text-xl text-zinc-300 max-w-3xl leading-relaxed mb-8">
          {description}
        </p>
        <div className="flex flex-wrap gap-3 mb-8">
          <PrimaryCTA href={ctaHref} size="lg">
            {ctaLabel}
          </PrimaryCTA>
          <SecondaryCTA href={secondaryCtaHref} size="lg">
            {secondaryCtaLabel}
          </SecondaryCTA>
        </div>
        <TrustBar compact />
      </section>

      {/* Body */}
      <main className="max-w-6xl mx-auto px-4 pb-24">{children}</main>

      {/* Final CTA — Goal-Gradient framing */}
      <section className="max-w-6xl mx-auto px-4 pb-24">
        <div className="rounded-3xl bg-gradient-to-br from-cyan-500/10 to-indigo-600/10 border border-white/10 p-8 md:p-14 text-center">
          <h2 className="text-2xl md:text-4xl font-bold mb-4 text-white">
            ابنِ قسمك الأوّل خلال 5 دقائق
          </h2>
          <p className="text-zinc-300 mb-8 max-w-2xl mx-auto leading-relaxed">
            انضمّ لمئات المؤسّسين الذين يبنون شركاتهم مع كلميرون.
            مجاناً، بدون بطاقة ائتمان، وبخصوصية كاملة لبياناتك.
          </p>
          <PrimaryCTA href={ctaHref} size="lg">
            {ctaLabel}
          </PrimaryCTA>
        </div>
      </section>

      {/* Newsletter */}
      <section className="max-w-6xl mx-auto px-4 mt-16">
        <NewsletterCapture variant="card" source="seo-footer" />
      </section>

      {/* Footer — 3 columns max (was 5) */}
      <footer className="border-t border-white/5 py-12 mt-12">
        <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-4 gap-8 text-sm">
          <div className="md:col-span-1">
            <BrandLogo size={28} showWordmark href={null} />
            <p className="text-zinc-500 mt-3 text-xs leading-relaxed">
              مقرّ عمليات شركتك الذكي. سبعة أقسام، خمسون مساعداً، فريق
              متكامل لرائد الأعمال العربي.
            </p>
          </div>
          <div>
            <div className="text-zinc-300 font-medium mb-3">المنتج</div>
            <ul className="space-y-2 text-zinc-500">
              <li>
                <Link href="/pricing" className="hover:text-zinc-300">
                  الأسعار
                </Link>
              </li>
              <li>
                <Link href="/use-cases" className="hover:text-zinc-300">
                  حالات الاستخدام
                </Link>
              </li>
              <li>
                <Link href="/industries" className="hover:text-zinc-300">
                  الصناعات
                </Link>
              </li>
              <li>
                <Link href="/templates" className="hover:text-zinc-300">
                  القوالب الجاهزة
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <div className="text-zinc-300 font-medium mb-3">المعرفة</div>
            <ul className="space-y-2 text-zinc-500">
              <li>
                <Link href="/blog" className="hover:text-zinc-300">
                  المدوّنة
                </Link>
              </li>
              <li>
                <Link href="/glossary" className="hover:text-zinc-300">
                  قاموس ريادة الأعمال
                </Link>
              </li>
              <li>
                <Link href="/ai-experts" className="hover:text-zinc-300">
                  مساعدوك الأذكياء
                </Link>
              </li>
              <li>
                <Link href="/cities" className="hover:text-zinc-300">
                  مدن MENA
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <div className="text-zinc-300 font-medium mb-3">القانوني</div>
            <ul className="space-y-2 text-zinc-500">
              <li>
                <Link href="/privacy" className="hover:text-zinc-300">
                  الخصوصية
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-zinc-300">
                  الشروط
                </Link>
              </li>
              <li>
                <Link href="/api-docs" className="hover:text-zinc-300">
                  للمطوّرين
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-4 mt-8 pt-6 border-t border-white/5 text-xs text-zinc-600 text-center">
          © {new Date().getFullYear()} Kalmeron AI. جميع الحقوق محفوظة.
        </div>
      </footer>
    </div>
  );
}

export function FeatureCheck({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
      <span className="text-zinc-300 leading-relaxed">{children}</span>
    </li>
  );
}
