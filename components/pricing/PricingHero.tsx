"use client";

import React from "react";
import { motion } from "motion/react";
import Image from "next/image";
import { Sparkles, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BillingCycle } from "@/app/pricing/page";

interface Props {
  billing: BillingCycle;
  setBilling: (b: BillingCycle) => void;
}

export function PricingHero({ billing, setBilling }: Props) {
  return (
    <section className="relative overflow-hidden mesh-gradient starfield pt-12 md:pt-20 pb-32 md:pb-40">
      {/* Glow orbs */}
      <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-brand-gold/10 blur-[120px]" />
      <div className="pointer-events-none absolute top-40 right-0 w-[400px] h-[400px] rounded-full bg-brand-blue/10 blur-[100px]" />

      <div className="relative max-w-6xl mx-auto px-4 md:px-8 text-center">
        {/* Logo mark with halo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="inline-flex relative mb-8"
        >
          <div className="absolute inset-0 bg-brand-gold/30 blur-2xl rounded-full glow-pulse" />
          <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-2xl border border-brand-gold/30 bg-dark-surface/60 backdrop-blur-xl p-3 flex items-center justify-center">
            <Image
              src="/brand/logo-mark.svg"
              alt="Kalmeron"
              width={96}
              height={96}
              className="w-full h-full object-contain"
              priority
            />
          </div>
        </motion.div>

        {/* Eyebrow chip */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="inline-flex items-center gap-2 rounded-full border border-brand-gold/30 bg-brand-gold/[0.08] backdrop-blur-md px-4 py-1.5 text-[11px] font-bold text-brand-gold uppercase tracking-[0.2em] mb-6"
        >
          <Sparkles className="h-3 w-3" />
          خطط Kalmeron Two
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="font-display text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.05] mb-6"
        >
          ابنِ شركتك القادمة
          <br />
          <span className="shimmer-text">بسعر يناسب طموحك</span>
        </motion.h1>

        {/* Sub */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="text-base md:text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed mb-10"
        >
          ابدأ مجاناً مع رصيد يكفيك لتختبر كل وكلاء كلميرون الـ 50+. ارتقِ في أي وقت — بدون عقود، بدون مفاجآت.
        </motion.p>

        {/* Billing toggle */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.55 }}
          className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-dark-surface/60 backdrop-blur-xl p-1 shadow-2xl"
        >
          <ToggleButton
            active={billing === "monthly"}
            onClick={() => setBilling("monthly")}
            label="شهري"
          />
          <ToggleButton
            active={billing === "annual"}
            onClick={() => setBilling("annual")}
            label="سنوي"
            badge="وفّر 20%"
          />
        </motion.div>

        {/* Trust micro-bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-text-secondary"
        >
          <span className="flex items-center gap-1.5">
            <Zap className="h-3.5 w-3.5 text-brand-gold" /> إلغاء في أي وقت
          </span>
          <span className="flex items-center gap-1.5">
            <Zap className="h-3.5 w-3.5 text-brand-gold" /> دعم باللغة العربية
          </span>
          <span className="flex items-center gap-1.5">
            <Zap className="h-3.5 w-3.5 text-brand-gold" /> تشفير E2E
          </span>
        </motion.div>
      </div>
    </section>
  );
}

function ToggleButton({
  active,
  onClick,
  label,
  badge,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  badge?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative px-5 md:px-7 py-2.5 rounded-full text-sm font-bold transition-all flex items-center gap-2",
        active
          ? "bg-brand-gold text-black shadow-lg shadow-brand-gold/20"
          : "text-text-secondary hover:text-white"
      )}
    >
      {label}
      {badge && (
        <span
          className={cn(
            "text-[9px] font-extrabold uppercase tracking-widest px-1.5 py-0.5 rounded-full",
            active
              ? "bg-black/20 text-black"
              : "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
          )}
        >
          {badge}
        </span>
      )}
    </button>
  );
}
