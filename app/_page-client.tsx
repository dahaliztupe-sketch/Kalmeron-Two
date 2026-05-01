"use client";

import React, { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { motion, useScroll, useTransform, AnimatePresence, useReducedMotion } from "motion/react";
import {
  ArrowLeft, Sparkles, LogIn, Menu, X,
  ChevronDown, Search, ShieldCheck, Globe2, TrendingUp, Zap, Rocket,
} from "lucide-react";
import Link from "next/link";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { useAuth } from "@/contexts/AuthContext";

const HomeBelowFold = dynamic(() => import("@/components/landing/HomeBelowFold"), {
  ssr: false,
  loading: () => <div className="h-32" aria-hidden />,
});

const SUGGESTION_KEYS = ["platform", "ecommerce", "healthtech", "cloudKitchen"] as const;

function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) return;
    if (typeof window === "undefined") return;
    const isMobile = window.matchMedia("(max-width: 767px)").matches;
    if (isMobile) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let animId = 0;
    let running = true;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const particles: { x: number; y: number; vx: number; vy: number; size: number; opacity: number; color: string }[] = [];
    const colors = ["56,189,248", "79,70,229", "139,92,246"];

    const resize = () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener("resize", resize);

    for (let i = 0; i < 30; i++) {
      particles.push({
        x: Math.random() * canvas.offsetWidth,
        y: Math.random() * canvas.offsetHeight,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        size: Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.4 + 0.15,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    const onVis = () => { running = !document.hidden; if (running) draw(); };
    document.addEventListener("visibilitychange", onVis);

    const draw = () => {
      if (!running) return;
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      ctx.clearRect(0, 0, w, h);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = w;
        else if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        else if (p.y > h) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color},${p.opacity})`;
        ctx.fill();
      }
      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [reduce]);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />;
}

function TopNav() {
  const t = useTranslations("Landing.topNav");
  const tCommon = useTranslations("Common");
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user } = useAuth();
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { href: "#departments", label: t("links.departments") },
    { href: "#compare", label: t("links.compare") },
    { href: "#testimonials", label: t("links.demo") },
    { href: "/pricing", label: t("links.pricing") },
  ];

  return (
    <header className={`fixed top-0 inset-x-0 z-50 transition-colors duration-300 ${scrolled ? "backdrop-blur-2xl bg-[#05070D]/80 border-b border-white/[0.06]" : "bg-transparent"}`}>
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
        <BrandLogo size={38} glow iconOnly />
        <nav className="hidden md:flex items-center gap-7">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="text-sm text-neutral-300 hover:text-white transition-colors">
              {l.label}
            </a>
          ))}
        </nav>
        <div className="hidden md:flex items-center gap-2">
          {user ? (
            <Link href="/dashboard" className="btn-primary text-sm font-bold px-5 py-2.5 rounded-full flex items-center gap-2">
              <Rocket className="w-4 h-4" /> {t("openDashboard")}
            </Link>
          ) : (
            <>
              <Link href="/auth/login" className="text-sm text-neutral-300 hover:text-white px-4 py-2 rounded-full transition-colors flex items-center gap-2">
                <LogIn className="w-4 h-4" /> {t("login")}
              </Link>
              <Link href="/auth/signup" prefetch className="text-sm font-bold text-white btn-primary px-5 py-2.5 rounded-full flex items-center gap-2">
                {t("signupFree")} <ArrowLeft className="w-4 h-4" />
              </Link>
            </>
          )}
        </div>
        <button onClick={() => setOpen(true)} className="md:hidden p-2 rounded-xl bg-white/5 border border-white/10 active:scale-95" aria-label={tCommon("openMenu")}>
          <Menu className="w-5 h-5 text-white" />
        </button>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 md:hidden">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ y: "-100%" }} animate={{ y: 0 }} exit={{ y: "-100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className="absolute top-0 inset-x-0 bg-[#0B1020] border-b border-white/10 p-6 rounded-b-3xl shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <BrandLogo size={38} iconOnly />
                <button onClick={() => setOpen(false)} className="p-2 rounded-xl bg-white/5 border border-white/10">
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
              <nav className="flex flex-col gap-1 mb-4">
                {links.map((l) => (
                  <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="text-base text-neutral-200 hover:text-white px-4 py-3 rounded-xl hover:bg-white/5 transition-colors">
                    {l.label}
                  </a>
                ))}
              </nav>
              <div className="flex flex-col gap-2 pt-4 border-t border-white/10">
                <Link href="/auth/login" prefetch className="text-center text-base text-white px-5 py-3 rounded-xl border border-white/10 hover:bg-white/5">{t("loginCta")}</Link>
                <Link href="/auth/signup" prefetch className="btn-primary text-center text-base font-bold px-5 py-3 rounded-xl">{t("signupFree")}</Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function Hero() {
  const t = useTranslations("Landing.hero");
  const tBadges = useTranslations("Landing.trustBadges");
  const tSugg = useTranslations("Landing.suggestions");
  const tCommon = useTranslations("Common");
  const [query, setQuery] = useState("");
  const router = useRouter();
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 500], reduce ? [1, 1] : [1, 0.4]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) router.push(`/chat?q=${encodeURIComponent(query)}`);
  };

  return (
    <motion.section
      style={{ opacity: heroOpacity }}
      className="relative min-h-screen flex flex-col pt-16"
      aria-label={t("eyebrow")}
    >
      {/* Background — luminous, restrained */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <ParticleField />
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-gradient-to-b from-indigo-500/20 via-fuchsia-500/10 to-transparent blur-[120px] opacity-70 mix-blend-screen" />
        <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[460px] h-[460px] rounded-full bg-gradient-to-b from-cyan-400/20 to-transparent blur-[80px] opacity-60 mix-blend-screen" />
      </div>

      {/* Centered content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 sm:px-6 max-w-5xl mx-auto w-full text-center">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] backdrop-blur-md mb-6 sm:mb-8"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-300 shrink-0" />
          <span className="text-[11px] sm:text-xs font-medium text-white/80 tracking-wide truncate">{t("eyebrow")}</span>
        </motion.div>

        <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="font-display font-bold tracking-tight leading-[1.08] mb-5 sm:mb-6 break-words [text-wrap:balance]"
          style={{ fontSize: "clamp(2rem, 1rem + 6vw, 5.5rem)" }}
        >
          <span className="block text-white mb-1">{t("titleLine1")}</span>
          <span className="block brand-gradient-text pb-2">{t("titleLine2")}</span>
        </motion.h1>

        <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="text-base sm:text-lg md:text-xl text-white/75 max-w-3xl mx-auto mb-10 sm:mb-12 leading-[1.8] font-medium px-2 [text-wrap:pretty]"
        >
          {t("subtitleLead")}
          {" "}
          <bdi className="text-white/85 font-semibold">{t("subtitleHighlight")}</bdi>
          {" "}
          {t("subtitleTail")}
        </motion.p>

        {/* Single focal CTA — chat-style input */}
        <motion.form initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, ease: "easeOut" }}
          onSubmit={submit} className="relative w-full max-w-2xl group"
        >
          <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-cyan-500/25 via-indigo-500/25 to-fuchsia-500/25 opacity-0 group-focus-within:opacity-100 blur-xl transition-opacity duration-500" />
          <div className="relative flex items-center bg-[#0A0D14]/85 backdrop-blur-xl border border-white/[0.08] rounded-3xl p-2 shadow-2xl focus-within:border-indigo-400/40 focus-within:bg-[#0A0D14] transition-all">
            <div className="ps-3 pe-2 text-white/60 shrink-0">
              <Search className="w-5 h-5" aria-hidden="true" />
            </div>
            <input
              value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder={t("inputPlaceholder")}
              className="flex-1 min-w-0 bg-transparent border-none outline-none text-white text-base md:text-lg py-3 placeholder:text-white/55"
              aria-label={tCommon("yourIdea")}
            />
            <button type="submit" disabled={!query.trim()}
              className="shrink-0 btn-primary rounded-2xl px-4 sm:px-6 py-3 sm:py-3.5 disabled:opacity-40 text-sm font-bold flex items-center gap-2"
            >
              <span className="hidden sm:inline">{t("submitLabel")}</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>
        </motion.form>

        {/* Suggestion chips — minimal pill outlines */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          className="flex flex-wrap items-center justify-center gap-2 mt-6 max-w-3xl"
          aria-label={t("eyebrow")}
        >
          {SUGGESTION_KEYS.map((key) => {
            const text = tSugg(key);
            return (
              <button key={key} type="button" onClick={() => router.push(`/chat?q=${encodeURIComponent(text)}`)}
                className="text-xs md:text-sm border border-white/15 text-white/75 px-3.5 py-2 rounded-full hover:text-white hover:border-white/30 hover:bg-white/[0.05] focus-visible:ring-2 focus-visible:ring-indigo-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#04060B] transition-all"
              >
                {text}
              </button>
            );
          })}
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}
          className="flex flex-col items-center gap-2 mt-12 sm:mt-16 text-white/65 text-xs"
        >
          <a
            href="#departments"
            className="flex flex-col items-center gap-1.5 hover:text-white focus-visible:text-white focus-visible:ring-2 focus-visible:ring-indigo-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#04060B] rounded transition-colors"
          >
            <span>{t("scrollHint")}</span>
            <ChevronDown className="w-4 h-4 animate-bounce" aria-hidden="true" />
          </a>
        </motion.div>
      </div>

      {/* Trust badges — WCAG-AA compliant contrast (≥4.5:1 on #04060B) */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
        className="relative z-10 w-full pb-8 sm:pb-10 pt-6 flex justify-center"
      >
        <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 sm:gap-x-10 px-4 list-none" role="list">
          <li className="flex items-center gap-2 text-white/70 hover:text-white transition-colors text-xs sm:text-sm font-medium">
            <ShieldCheck className="w-4 h-4 shrink-0 text-cyan-300/80" aria-hidden="true" /> {tBadges("lawCompliant")}
          </li>
          <li className="flex items-center gap-2 text-white/70 hover:text-white transition-colors text-xs sm:text-sm font-medium">
            <Globe2 className="w-4 h-4 shrink-0 text-indigo-300/80" aria-hidden="true" /> {tBadges("arabicNative")}
          </li>
          <li className="flex items-center gap-2 text-white/70 hover:text-white transition-colors text-xs sm:text-sm font-medium">
            <TrendingUp className="w-4 h-4 shrink-0 text-fuchsia-300/80" aria-hidden="true" /> {tBadges("founderCount")}
          </li>
          <li className="flex items-center gap-2 text-white/70 hover:text-white transition-colors text-xs sm:text-sm font-medium">
            <Zap className="w-4 h-4 shrink-0 text-amber-300/80" aria-hidden="true" /> {tBadges("freeStart")}
          </li>
        </ul>
      </motion.div>
    </motion.section>
  );
}

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#05070D] text-white overflow-x-hidden" dir="rtl">
      <TopNav />
      <Hero />
      <HomeBelowFold />
    </main>
  );
}
