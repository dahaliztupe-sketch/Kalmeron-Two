"use client";

import { motion } from "motion/react";
import { AnimatedBrandMark } from "@/components/brand/AnimatedBrandMark";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-[#05070D]">
      {/* ambient backdrop */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(ellipse at 30% 20%, rgba(56,189,248,0.18), transparent 55%), radial-gradient(ellipse at 70% 80%, rgba(232,121,249,0.16), transparent 55%), radial-gradient(ellipse at 50% 50%, rgba(79,70,229,0.12), transparent 60%)",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.05] mix-blend-screen"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.4) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 flex flex-col items-center gap-8"
      >
        <AnimatedBrandMark size={140} loop halo glow />

        <div className="flex flex-col items-center">
          <motion.h2
            initial={{ opacity: 0, letterSpacing: "0.05em" }}
            animate={{ opacity: 1, letterSpacing: "0.35em" }}
            transition={{ duration: 1.4, delay: 0.4, ease: "easeOut" }}
            className="font-display text-2xl font-black uppercase text-white"
          >
            KALMERON
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.6 }}
            className="mt-2 text-sm text-cyan-300/80 tracking-[0.3em] uppercase"
          >
            AI&nbsp;·&nbsp;Studio
          </motion.p>
        </div>

        {/* shimmer progress bar */}
        <div className="relative h-[3px] w-56 overflow-hidden rounded-full bg-white/[0.06]">
          <motion.div
            className="absolute inset-y-0 w-1/3 rounded-full bg-gradient-to-r from-cyan-400 via-indigo-500 to-fuchsia-500"
            initial={{ x: "-110%" }}
            animate={{ x: "320%" }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="text-neutral-500 text-sm font-medium"
          dir="rtl"
        >
          جاري تحضير ذكاء شريكك المؤسس...
        </motion.p>
      </motion.div>
    </div>
  );
}
