import Link from "next/link";
import { ArrowLeft, Sparkles, CheckCircle2, ChevronRight } from "lucide-react";
import { BrandLogo } from "@/components/brand/BrandLogo";

interface SeoLandingShellProps {
  eyebrow: string;
  title: string;
  description: string;
  ctaHref?: string;
  ctaLabel?: string;
  children: React.ReactNode;
  breadcrumbs?: { label: string; href?: string }[];
}

export function SeoLandingShell({
  eyebrow,
  title,
  description,
  ctaHref = "/auth/signup",
  ctaLabel = "ابدأ مجاناً مع كلميرون",
  children,
  breadcrumbs = [],
}: SeoLandingShellProps) {
  return (
    <div dir="rtl" className="min-h-screen bg-[#080C14] text-[#F1F5F9]">
      {/* Aurora background */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(56,189,248,0.12),transparent_55%)]" />
        <div className="absolute top-[-15%] right-[-10%] w-[55vw] h-[55vw] rounded-full bg-cyan-500/15 blur-[140px]" />
        <div className="absolute bottom-[-15%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-indigo-600/15 blur-[140px]" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-[#080C14]/70 border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <BrandLogo size={32} showWordmark href={null} />
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm text-zinc-400">
            <Link href="/use-cases" className="hover:text-white transition">حالات الاستخدام</Link>
            <Link href="/industries" className="hover:text-white transition">الصناعات</Link>
            <Link href="/pricing" className="hover:text-white transition">الأسعار</Link>
            <Link href="/blog" className="hover:text-white transition">المدونة</Link>
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
        <nav aria-label="مسار التنقل" className="max-w-6xl mx-auto px-4 pt-4 text-xs text-zinc-500">
          <ol className="flex items-center gap-2 flex-wrap">
            <li>
              <Link href="/" className="hover:text-zinc-300">الرئيسية</Link>
            </li>
            {breadcrumbs.map((b, i) => (
              <li key={i} className="flex items-center gap-2">
                <ChevronRight className="w-3 h-3 rotate-180" />
                {b.href ? (
                  <Link href={b.href} className="hover:text-zinc-300">{b.label}</Link>
                ) : (
                  <span className="text-zinc-400">{b.label}</span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 pt-12 pb-16 md:pt-20 md:pb-24">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-cyan-300 mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          {eyebrow}
        </div>
        <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6 bg-gradient-to-br from-white to-zinc-400 bg-clip-text text-transparent">
          {title}
        </h1>
        <p className="text-lg md:text-xl text-zinc-300 max-w-3xl leading-relaxed mb-8">
          {description}
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href={ctaHref}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-medium hover:opacity-90 transition shadow-lg shadow-cyan-500/20"
          >
            {ctaLabel}
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-zinc-200 hover:bg-white/10 transition"
          >
            عرض الأسعار
          </Link>
        </div>
      </section>

      {/* Body */}
      <main className="max-w-6xl mx-auto px-4 pb-24">{children}</main>

      {/* Final CTA */}
      <section className="max-w-6xl mx-auto px-4 pb-24">
        <div className="rounded-3xl bg-gradient-to-br from-cyan-500/10 to-indigo-600/10 border border-white/10 p-8 md:p-12 text-center">
          <h2 className="text-2xl md:text-4xl font-bold mb-4">جاهز للبدء؟</h2>
          <p className="text-zinc-300 mb-6 max-w-2xl mx-auto">
            انضم لآلاف رواد الأعمال الذين يبنون شركاتهم مع كلميرون. ابدأ مجاناً، بدون بطاقة ائتمان.
          </p>
          <Link
            href={ctaHref}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-semibold text-lg hover:opacity-90 transition shadow-xl shadow-cyan-500/30"
          >
            {ctaLabel}
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 mt-12">
        <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-4 gap-8 text-sm">
          <div>
            <BrandLogo size={28} showWordmark href={null} />
            <p className="text-zinc-500 mt-3 text-xs leading-relaxed">
              نظام تشغيل لرواد الأعمال يضم 7 أقسام و50+ وكيلاً ذكياً.
            </p>
          </div>
          <div>
            <div className="text-zinc-300 font-medium mb-3">المنتج</div>
            <ul className="space-y-2 text-zinc-500">
              <li><Link href="/pricing" className="hover:text-zinc-300">الأسعار</Link></li>
              <li><Link href="/use-cases" className="hover:text-zinc-300">حالات الاستخدام</Link></li>
              <li><Link href="/industries" className="hover:text-zinc-300">الصناعات</Link></li>
            </ul>
          </div>
          <div>
            <div className="text-zinc-300 font-medium mb-3">المقارنات</div>
            <ul className="space-y-2 text-zinc-500">
              <li><Link href="/compare/chatgpt" className="hover:text-zinc-300">vs ChatGPT</Link></li>
              <li><Link href="/compare/claude" className="hover:text-zinc-300">vs Claude</Link></li>
              <li><Link href="/compare/microsoft-copilot" className="hover:text-zinc-300">vs Copilot</Link></li>
            </ul>
          </div>
          <div>
            <div className="text-zinc-300 font-medium mb-3">القانوني</div>
            <ul className="space-y-2 text-zinc-500">
              <li><Link href="/privacy" className="hover:text-zinc-300">الخصوصية</Link></li>
              <li><Link href="/terms" className="hover:text-zinc-300">الشروط</Link></li>
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
      <span className="text-zinc-300">{children}</span>
    </li>
  );
}
