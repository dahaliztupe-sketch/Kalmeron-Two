import Link from "next/link";
import { ArrowRight, Brain, Shield, FlaskConical, Briefcase, Scale, Radar, CheckCircle2 } from "lucide-react";
import { BrandLogo } from "@/components/brand/BrandLogo";

export const metadata = {
  title: "Kalmeron — The AI Operating System for Arab Entrepreneurs",
  description:
    "16 specialized AI agents (CFO, Legal, Marketing, Operations) speaking authentic Arabic — built for the Egyptian and Gulf markets. PDPL & Egyptian Law 151 compliant.",
  alternates: {
    canonical: "/en",
    languages: {
      ar: "/",
      en: "/en",
    },
  },
  openGraph: {
    title: "Kalmeron — The AI Operating System for Arab Entrepreneurs",
    description:
      "16 specialized AI agents speaking authentic Arabic — for SMBs in Egypt, Saudi Arabia, and the Gulf.",
    locale: "en_US",
    alternateLocale: "ar_EG",
  },
};

/**
 * English landing page — P0-5 from the 45-expert business audit (QW-5).
 * Lightweight LTR mirror of the AR landing, focused on:
 *   - Hreflang for SEO discoverability
 *   - Conversion for MENA expats / English-speaking Gulf operators
 *   - Backlink magnet from EN media
 */
export default function EnglishLanding() {
  const features = [
    { icon: Brain, title: "Shared Brain", desc: "Long-term memory that learns your company context across every conversation." },
    { icon: Briefcase, title: "AI CFO", desc: "Financial models, cash-flow projections, and scenario analysis in minutes." },
    { icon: Scale, title: "Legal Guide", desc: "Arabic-first contracts compliant with Egyptian Law 151 and Saudi PDPL." },
    { icon: FlaskConical, title: "Market Lab", desc: "Test ideas with simulated Egyptian customers before spending a pound." },
    { icon: Radar, title: "Opportunity Radar", desc: "Real-time alerts for funding rounds, hackathons, and accelerators in MENA." },
    { icon: Shield, title: "Mistake Shield", desc: "Warns you about fatal early-stage mistakes based on hundreds of past startups." },
  ];

  const proof = [
    "16 production agents across 7 departments",
    "Authentic Egyptian Arabic — not a translation",
    "PDPL & Egyptian Law 151 compliant by design",
    "From 9 USD/month — vs 800+ USD/month for human consultants",
  ];

  return (
    <div dir="ltr" lang="en" className="min-h-screen bg-[#05070D] text-white">
      {/* Header */}
      <header className="border-b border-white/[0.05] px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <BrandLogo size={36} iconOnly />
          <nav className="flex items-center gap-6 text-sm">
            <Link href="/" className="text-neutral-400 hover:text-white">العربية</Link>
            <Link href="/auth/signup" className="rounded-full bg-white text-black px-4 py-2 font-semibold hover:bg-neutral-200">
              Start free
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6">
        {/* Hero */}
        <section className="py-16 md:py-24 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 text-cyan-300 text-xs font-semibold mb-6">
            <CheckCircle2 className="w-3.5 h-3.5" />
            16 production agents — built for the Arab world
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-[1.1] mb-6">
            <span className="bg-gradient-to-r from-cyan-300 via-indigo-300 to-violet-300 bg-clip-text text-transparent">
              The AI operating system
            </span>
            <br />
            for Arab entrepreneurs.
          </h1>
          <p className="text-neutral-300 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            A team of 16 specialized AI agents — CFO, Legal, Marketing, Operations — that speaks <strong className="text-white">authentic Arabic</strong> and understands the Egyptian and Gulf SMB context. Replace 800 USD/month of consultants with 9 USD/month.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
            <Link
              href="/auth/signup"
              className="rounded-full bg-gradient-to-r from-cyan-500 to-violet-500 px-8 py-4 text-white font-semibold inline-flex items-center gap-2 hover:opacity-90"
            >
              Start free for 14 days <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/compare" className="rounded-full border border-white/[0.1] px-8 py-4 text-white font-medium hover:bg-white/[0.04]">
              See vs ChatGPT / consultants
            </Link>
          </div>
          <p className="text-neutral-500 text-xs mt-4">No credit card required · Cancel anytime · Arabic UI</p>
        </section>

        {/* Why */}
        <section className="py-12 border-t border-white/[0.05]">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">Why Kalmeron beats global tools in MENA</h2>
          <div className="grid sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
            {proof.map((p) => (
              <div key={p} className="flex items-start gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-neutral-200 text-sm">{p}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="py-16 border-t border-white/[0.05]">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">Your AI operations team</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 hover:border-white/[0.12] transition">
                  <div className="rounded-xl bg-gradient-to-br from-cyan-500/15 to-violet-500/15 p-2.5 w-fit text-cyan-300 mb-4">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-lg text-white">{f.title}</h3>
                  <p className="text-neutral-400 text-sm mt-2 leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 border-t border-white/[0.05] text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to meet your AI team?</h2>
          <p className="text-neutral-400 max-w-xl mx-auto mb-8">
            Join the first 100 companies adopting Kalmeron — lifetime pricing at 9 USD/month for early supporters.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/first-100" className="rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-8 py-4 text-white font-semibold hover:opacity-90">
              Claim a Founders seat
            </Link>
            <Link href="/auth/signup" className="rounded-full border border-white/[0.1] px-8 py-4 text-white font-medium hover:bg-white/[0.04]">
              Start free trial
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/[0.05] mt-12 py-8 px-6 text-center text-neutral-500 text-xs">
        <p>Kalmeron AI © {new Date().getFullYear()} — Built for Arab entrepreneurs.</p>
        <p className="mt-2">
          <Link href="/" className="hover:text-white">العربية</Link> · <Link href="/privacy" className="hover:text-white">Privacy</Link> · <Link href="/terms" className="hover:text-white">Terms</Link> · <Link href="/trust" className="hover:text-white">Trust</Link>
        </p>
      </footer>
    </div>
  );
}
