"use client";

import { motion } from "motion/react";
import { AnimatedBrandMark } from "@/components/brand/AnimatedBrandMark";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-[#04060B]">
      {/* Premium ambient backdrop */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-80"
        style={{
          background:
            "radial-gradient(ellipse at 28% 18%, rgba(56,189,248,0.20), transparent 55%), " +
            "radial-gradient(ellipse at 72% 82%, rgba(232,121,249,0.18), transparent 55%), " +
            "radial-gradient(ellipse at 50% 50%, rgba(79,70,229,0.14), transparent 60%)",
        }}
      />
      {/* Subtle dot grid */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.04] mix-blend-screen"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }}
      />
      {/* Drifting starfield */}
      <div className="absolute inset-0 starfield opacity-40 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 flex flex-col items-center gap-8"
      >
        {/* Logo with refined halo */}
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-500/40 via-indigo-500/40 to-fuchsia-500/40 blur-3xl logo-halo" />
          <div className="relative">
            <AnimatedBrandMark size={140} loop halo glow />
          </div>
        </div>

        <div className="flex flex-col items-center">
          <motion.h2
            initial={{ opacity: 0, letterSpacing: "0.05em" }}
            animate={{ opacity: 1, letterSpacing: "0.38em" }}
            transition={{ duration: 1.4, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="font-display text-2xl font-black uppercase text-white"
          >
            KALMERON
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.6 }}
            className="mt-2.5 text-[11px] font-bold text-cyan-300/80 tracking-[0.32em] uppercase"
          >
            AI&nbsp;·&nbsp;Studio
          </motion.p>
        </div>

        {/* Refined progress bar with gradient sweep */}
        <div className="relative h-[3px] w-60 overflow-hidden rounded-full bg-white/[0.05] border border-white/[0.04]">
          <motion.div
            className="absolute inset-y-0 w-1/3 rounded-full bg-gradient-to-r from-cyan-400 via-indigo-500 to-fuchsia-500 shadow-[0_0_12px_rgb(99_102_241/0.6)]"
            initial={{ x: "-110%" }}
            animate={{ x: "320%" }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="text-neutral-500 text-[13px] font-medium leading-relaxed"
          dir="rtl"
        >
          جارٍ تحضير ذكاء شريكك المؤسس<span className="inline-flex">
            <span className="typing-dot mx-0.5">.</span>
            <span className="typing-dot mx-0.5">.</span>
            <span className="typing-dot mx-0.5">.</span>
          </span>
        </motion.p>
      </motion.div>
    </div>
  );
}
