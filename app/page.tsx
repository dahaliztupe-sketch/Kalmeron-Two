"use client";

import React, { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { motion, useScroll, useTransform, AnimatePresence, useReducedMotion } from "motion/react";
import {
  ArrowLeft, Sparkles, LogIn, Menu, X,
  ChevronDown, Play, ShieldCheck, Globe2, TrendingUp, Zap, Rocket,
} from "lucide-react";
import Link from "next/link";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { AnimatedBrandMark } from "@/components/brand/AnimatedBrandMark";
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
    { href: "#demo", label: t("links.demo") },
    { href: "#compare", label: t("links.compare") },
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
  const [suggestionIdx, setSuggestionIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setSuggestionIdx((i) => (i + 1) % SUGGESTION_KEYS.length), 4000);
    return () => clearInterval(id);
  }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) router.push(`/chat?q=${encodeURIComponent(query)}`);
  };

  return (
    <motion.section style={{ opacity: heroOpacity }} className="relative min-h-screen flex flex-col justify-center pt-16">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <ParticleField />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(79,70,229,0.22),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_80%_60%,rgba(56,189,248,0.10),transparent)]" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12 pb-16 sm:pb-20 text-center">
        <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, ease: "circOut" }}
          className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 mx-auto mb-6 sm:mb-8"
        >
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-cyan-500/40 via-indigo-500/40 to-fuchsia-500/40 blur-2xl" />
          <div className="relative w-full h-full rounded-3xl border border-white/10 shadow-2xl bg-[#070A18]/80 backdrop-blur-md flex items-center justify-center overflow-hidden">
            <AnimatedBrandMark size={110} halo={false} glow />
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="inline-flex max-w-full items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 rounded-full border border-cyan-400/25 bg-cyan-500/10 text-[10px] sm:text-[11px] md:text-xs font-semibold uppercase tracking-[0.12em] sm:tracking-[0.18em] text-cyan-200 mb-5 sm:mb-6"
        >
          <Sparkles className="w-3 h-3 text-cyan-300 shrink-0" />
          <span className="truncate">{t("eyebrow")}</span>
        </motion.div>

        <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="font-display font-extrabold tracking-tight leading-[1.1] mb-4 sm:mb-5 break-words [text-wrap:balance]"
          style={{ fontSize: "clamp(1.6rem, 1rem + 4.2vw, 5rem)" }}
        >
          <span className="block text-white">{t("titleLine1")}</span>
          <span className="block brand-gradient-text pb-2">{t("titleLine2")}</span>
        </motion.h1>

        <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="text-sm sm:text-[17px] md:text-lg text-neutral-300 max-w-2xl mx-auto mb-6 leading-[1.8] sm:leading-[1.85] px-4 sm:px-2 break-words [overflow-wrap:anywhere] [word-break:normal] [text-wrap:pretty]"
        >
          {t("subtitleLead")}
          {" "}
          <bdi className="text-white font-bold">{t("subtitleHighlight")}</bdi>
          {" "}
          {t("subtitleTail")}
        </motion.p>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-x-2.5 gap-y-2 sm:gap-x-5 text-[11px] sm:text-[12px] font-medium text-neutral-400 mb-7 sm:mb-8 px-2"
        >
          <span className="flex items-center gap-1.5 whitespace-nowrap"><ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> {tBadges("lawCompliant")}</span>
          <span className="hidden sm:inline-block w-1 h-1 rounded-full bg-white/15" />
          <span className="flex items-center gap-1.5 whitespace-nowrap"><Globe2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" /> {tBadges("arabicNative")}</span>
          <span className="hidden sm:inline-block w-1 h-1 rounded-full bg-white/15" />
          <span className="flex items-center gap-1.5 whitespace-nowrap"><TrendingUp className="w-3.5 h-3.5 text-fuchsia-400 shrink-0" /> {tBadges("founderCount")}</span>
          <span className="hidden sm:inline-block w-1 h-1 rounded-full bg-white/15" />
          <span className="flex items-center gap-1.5 whitespace-nowrap"><Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" /> {tBadges("freeStart")}</span>
        </motion.div>

        <motion.form initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, ease: "easeOut" }}
          onSubmit={submit} className="relative max-w-2xl mx-auto group mb-5"
        >
          <div className="absolute -inset-[1.5px] rounded-3xl bg-gradient-to-r from-cyan-500/60 via-indigo-500/60 to-fuchsia-500/60 opacity-0 group-focus-within:opacity-100 blur-lg transition-opacity duration-300" />
          <div className="relative flex items-center bg-[#0B1020]/90 backdrop-blur-xl border border-white/10 rounded-3xl p-2 shadow-2xl focus-within:border-white/25 transition-colors">
            <input
              value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder={t("inputPlaceholder")}
              className="flex-1 bg-transparent border-none outline-none text-white px-5 py-4 text-base md:text-lg placeholder:text-neutral-500"
              aria-label={tCommon("yourIdea")}
            />
            <button type="submit" disabled={!query.trim()}
              className="shrink-0 btn-primary rounded-2xl px-5 py-3.5 md:px-7 md:py-4 disabled:opacity-40 text-sm font-bold flex items-center gap-2"
            >
              <span className="hidden sm:inline">{t("submitLabel")}</span>
              <ArrowLeft className="w-5 h-5" />
            </button>
          </div>
        </motion.form>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }}
          className="flex flex-wrap items-center justify-center gap-2 max-w-3xl mx-auto"
        >
          {SUGGESTION_KEYS.map((key, i) => {
            const text = tSugg(key);
            return (
              <button key={key} type="button" onClick={() => router.push(`/chat?q=${encodeURIComponent(text)}`)}
                className={`text-xs md:text-sm border text-neutral-200 px-3.5 py-2 rounded-full transition-colors ${i === suggestionIdx ? "bg-indigo-500/20 border-indigo-400/40 text-white" : "bg-white/5 border-white/10 hover:bg-white/10"}`}
              >
                {text}
              </button>
            );
          })}
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }}
          className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 mt-8 max-w-md sm:max-w-none mx-auto"
        >
          <Link href="/auth/signup" prefetch className="btn-primary flex items-center justify-center gap-2 text-base font-bold px-6 sm:px-8 py-3.5 sm:py-4 rounded-full">
            {t("primaryCta")} <ArrowLeft className="w-5 h-5" />
          </Link>
          <a href="#demo" className="btn-ghost flex items-center justify-center gap-2 text-base px-6 sm:px-8 py-3.5 sm:py-4 rounded-full">
            <Play className="w-4 h-4 text-cyan-400" /> {t("secondaryCta")}
          </a>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
          className="flex justify-center mt-14"
        >
          <a href="#departments" className="flex flex-col items-center gap-2 text-neutral-500 text-xs hover:text-neutral-300 transition-colors">
            <span>{t("scrollHint")}</span>
            <ChevronDown className="w-4 h-4 animate-bounce" />
          </a>
        </motion.div>
      </div>
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
