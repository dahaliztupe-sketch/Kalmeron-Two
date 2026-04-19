"use client";

import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="fixed inset-0 bg-[#0A0A0F] flex flex-col items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center gap-6"
      >
        <div className="relative">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Loader2 className="w-16 h-16 text-[rgb(var(--gold))]" />
          </motion.div>
          <motion.div
            className="absolute inset-0 blur-xl bg-[rgb(var(--gold))]/20 rounded-full"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
        <div className="flex flex-col items-center">
            <h2 className="text-white text-2xl font-black tracking-widest uppercase">Kalmeron Two</h2>
            <p className="text-neutral-500 mt-2 font-medium">جاري تحضير ذكاء شريكك المؤسس...</p>
        </div>
      </motion.div>
    </div>
  );
}
